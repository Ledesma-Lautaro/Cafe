import { prisma } from "@/lib/prisma";

export const RECOMMENDATION_COUNT = 5;
const SIMILARITY_THRESHOLD = 0.95;

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

function parseVector(text: string): number[] {
  return text.slice(1, -1).split(",").map(Number);
}

function averageVectors(items: { embedding: number[]; weight: number }[]): number[] {
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

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

export async function getRecommendations(
  userId: string,
  opts: { limit?: number; excludeReadingIds?: string[] } = {},
): Promise<{ recommendations: Recommendation[]; coldStart: boolean }> {
  const limit = opts.limit ?? RECOMMENDATION_COUNT;
  const excluded = new Set(opts.excludeReadingIds ?? []);

  const allRead = await prisma.$queryRaw<ReadRow[]>`
    SELECT r.id as "readingId", b.id as "bookId", b.title,
           b.embedding::text as embedding, r.rating
    FROM "Reading" r
    JOIN "Book" b ON b.id = r."bookId"
    WHERE r."userId" = ${userId} AND b.embedding IS NOT NULL
  `;

  const history = allRead.filter((row) => !excluded.has(row.readingId));
  if (history.length === 0) {
    return { recommendations: [], coldStart: true };
  }

  const readVectors = history.map((row) => ({
    bookId: row.bookId,
    title: row.title,
    embedding: parseVector(row.embedding),
    weight: row.rating ?? 3,
  }));

  const readBookIds = new Set(readVectors.map((r) => r.bookId));
  const userVector = averageVectors(readVectors);
  const userVectorLiteral = `[${userVector.join(",")}]`;

  const candidates = await prisma.$queryRaw<CandidateRow[]>`
    SELECT id, title, author, embedding::text as embedding,
           embedding <=> ${userVectorLiteral}::vector AS distance
    FROM "Book"
    WHERE embedding IS NOT NULL
    ORDER BY distance ASC
  `;

  const recommendations: Recommendation[] = [];
  const acceptedVectors: number[][] = [];

  for (const candidate of candidates) {
    if (recommendations.length >= limit) break;
    if (readBookIds.has(candidate.id)) continue;

    const candidateVector = parseVector(candidate.embedding);

    let bestMatch = readVectors[0];
    let bestSimilarity = -Infinity;
    for (const read of readVectors) {
      const similarity = cosineSimilarity(candidateVector, read.embedding);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = read;
      }
    }
    if (bestSimilarity > SIMILARITY_THRESHOLD) continue;

    if (acceptedVectors.some((v) => cosineSimilarity(candidateVector, v) > SIMILARITY_THRESHOLD)) {
      continue;
    }

    acceptedVectors.push(candidateVector);
    recommendations.push({
      id: candidate.id,
      title: candidate.title,
      author: candidate.author,
      score: 1 - Number(candidate.distance),
      reason: `Similar a "${bestMatch.title}"`,
    });
  }

  return { recommendations, coldStart: false };
}