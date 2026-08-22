import { prisma } from "@/lib/prisma";

export const RECOMMENDATION_COUNT = 5;
const SIMILARITY_THRESHOLD = 0.95;
export type ProfileStrategy = "centroid" | "maxSimilarity";

function normalizeVector(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
  return norm === 0 ? v : v.map((x) => x / norm);
}

export interface RecommendationResult {
  recommendations: Recommendation[];
  coldStart: boolean;
  rankedCandidateIds: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  author: string;
  score: number;
  reason: string;
}

interface ReadRow {
  readingId: string;
  bookId: string;
  title: string;
  embedding: string;
  rating: number | null;
}

interface CandidateRow {
  id: string;
  title: string;
  author: string;
  embedding: string;
  distance: number;
}

export function parseVector(text: string): number[] {
  return text.slice(1, -1).split(",").map(Number);
}

function averageVectors(
  items: { embedding: number[]; weight: number }[],
): number[] {
  const dims = items[0].embedding.length;
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  const result = new Array(dims).fill(0);
  for (const { embedding, weight } of items) {
    for (let i = 0; i < dims; i++) {
      result[i] += (embedding[i] * weight) / totalWeight;
    }
  }
  return result;
}

async function getPopularBooks(userId: string, limit: number): Promise<Recommendation[]> {
   const rows = await prisma.$queryRaw<
    { id: string; title: string; author: string; readers: number; avg_rating: number | null }[]
  >`
    SELECT b.id, b.title, b.author,
           COUNT(r.id)::int as readers,
           AVG(r.rating)::float as avg_rating
    FROM "Book" b
    LEFT JOIN "Reading" r ON r."bookId" = b.id
    WHERE b.id NOT IN (SELECT "bookId" FROM "Reading" WHERE "userId" = ${userId})
    GROUP BY b.id, b.title, b.author
    ORDER BY readers DESC, avg_rating DESC NULLS LAST, b."createdAt" ASC
    LIMIT ${limit}
  `;

  const top = rows[0]?.readers ?? 0;

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    author: row.author,
    score: top > 0 ? row.readers / top : 0,
    reason:
      row.readers > 0
        ? `Leído por ${row.readers} ${row.readers === 1 ? "persona" : "personas"}` +
          (row.avg_rating ? ` · ${row.avg_rating.toFixed(1)}★` : "")
        : "Novedad en el catálogo",
  }));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {dot += a[i] * b[i];}
  return dot;
}

export async function getRecommendations(
  userId: string,
  opts: {
    limit?: number;
    excludeReadingIds?: string[];
    strategy?: ProfileStrategy;
    centered?: boolean;
  } = {},
): Promise<{
  recommendations: Recommendation[];
  coldStart: boolean;
  rankedCandidateIds: string[];
}> {
  const limit = opts.limit ?? RECOMMENDATION_COUNT;
  const strategy = opts.strategy ?? "centroid";
  const excluded = new Set(opts.excludeReadingIds ?? []);
  const centered = opts.centered ?? false;

  const allRead = await prisma.$queryRaw<ReadRow[]>`
    SELECT r.id as "readingId", b.id as "bookId", b.title,
           b.embedding::text as embedding, r.rating
    FROM "Reading" r
    JOIN "Book" b ON b.id = r."bookId"
    WHERE r."userId" = ${userId} AND b.embedding IS NOT NULL
  `;

  const history = allRead.filter((row) => !excluded.has(row.readingId));
   if (history.length === 0) {
    return {
      recommendations: await getPopularBooks(userId, limit),
      coldStart: true,
      rankedCandidateIds: [],
    };
  }

    const candidates = await prisma.$queryRaw<CandidateRow[]>`
    SELECT id, title, author, embedding::text as embedding
    FROM "Book"
    WHERE embedding IS NOT NULL
  `;

  const parsed = candidates.map((c) => ({ ...c, vector: parseVector(c.embedding) }));

  const corpusMean = averageVectors(parsed.map((c) => ({ embedding: c.vector, weight: 1 })));

  const adjust = (v: number[]): number[] =>
    centered ? normalizeVector(v.map((x, i) => x - corpusMean[i])) : v;

  const readVectors = history.map((row) => ({
    bookId: row.bookId,
    title: row.title,
    embedding: adjust(parseVector(row.embedding)),
    weight: row.rating ?? 3,
  }));

  const readBookIds = new Set(readVectors.map((r) => r.bookId));
  const userVector = normalizeVector(averageVectors(readVectors));

  const scored = parsed
    .filter((c) => !readBookIds.has(c.id))
    .map((candidate) => {
      const vector = adjust(candidate.vector);

      let bestMatch = readVectors[0];
      let bestSimilarity = -Infinity;
      for (const read of readVectors) {
        const similarity = cosineSimilarity(vector, read.embedding);
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = read;
        }
      }

      const score =
        strategy === "maxSimilarity" ? bestSimilarity : cosineSimilarity(vector, userVector);

      return { ...candidate, vector, bestMatch, bestSimilarity, score };
    })
    .sort((a, b) => b.score - a.score);

  const rankedCandidateIds = scored.map((c) => c.id);

  const recommendations: Recommendation[] = [];
  const acceptedVectors: number[][] = [];

  for (const candidate of scored) {
    if (recommendations.length >= limit) {break;}
    if (candidate.bestSimilarity > SIMILARITY_THRESHOLD) {continue;}
    if (
      acceptedVectors.some(
        (v) => cosineSimilarity(candidate.vector, v) > SIMILARITY_THRESHOLD,
      )
    ) {
      continue;
    }

    acceptedVectors.push(candidate.vector);
    recommendations.push({
      id: candidate.id,
      title: candidate.title,
      author: candidate.author,
      score: candidate.score,
      reason: `Similar a "${candidate.bestMatch.title}"`,
    });
  }

  return { recommendations, coldStart: false, rankedCandidateIds };
}
