import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const SIMILARITY_THRESHOLD = 0.95; // por encima de esto, se considera "el mismo libro" (otra edición)
const RECOMMENDATION_COUNT = 5;
const CANDIDATE_POOL_SIZE = 15; // se piden de más porque algunos candidatos se van a descartar

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

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const readBooks = await prisma.$queryRaw<
    { bookId: string; title: string; embedding: string; rating: number | null }[]
  >`
    SELECT b.id as "bookId", b.title, b.embedding::text as embedding, r.rating
    FROM "Reading" r
    JOIN "Book" b ON b.id = r."bookId"
    WHERE r."userId" = ${session.user.id} AND b.embedding IS NOT NULL
  `;

  if (readBooks.length === 0) {
    return Response.json({ recommendations: [], coldStart: true });
  }

  const readVectors = readBooks.map((b) => ({
    title: b.title,
    embedding: parseVector(b.embedding),
    weight: b.rating ?? 3,
  }));

  const userVector = averageVectors(readVectors);
  const userVectorLiteral = `[${userVector.join(",")}]`;

  const candidates = await prisma.$queryRaw<
    { id: string; title: string; author: string; embedding: string; distance: number }[]
  >`
    SELECT id, title, author, embedding::text as embedding,
           embedding <=> ${userVectorLiteral}::vector AS distance
    FROM "Book"
    WHERE embedding IS NOT NULL
      AND id NOT IN (SELECT "bookId" FROM "Reading" WHERE "userId" = ${session.user.id})
    ORDER BY distance ASC
    LIMIT ${CANDIDATE_POOL_SIZE}
  `;

  const recommendations: {
    id: string;
    title: string;
    author: string;
    score: number;
    reason: string;
  }[] = [];
  const acceptedVectors: number[][] = [];

  for (const candidate of candidates) {
    if (recommendations.length >= RECOMMENDATION_COUNT) break;

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

    const isDuplicateOfAccepted = acceptedVectors.some(
      (accepted) => cosineSimilarity(candidateVector, accepted) > SIMILARITY_THRESHOLD,
    );
    if (isDuplicateOfAccepted) continue; 

    acceptedVectors.push(candidateVector);
    recommendations.push({
      id: candidate.id,
      title: candidate.title,
      author: candidate.author,
      score: 1 - candidate.distance,
      reason: `Similar a "${bestMatch.title}"`,
    });
  }

  return Response.json({ recommendations });
}