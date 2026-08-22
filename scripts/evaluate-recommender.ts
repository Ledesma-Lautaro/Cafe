import "./load-env";
import { prisma } from "../lib/prisma";
import {
  getRecommendations,
  parseVector,
  cosineSimilarity,
  RECOMMENDATION_COUNT,
  ProfileStrategy,
} from "../lib/recommendations";

const MIN_READINGS = 3;
const strategy = (process.argv[2] as ProfileStrategy) ?? "maxSimilarity";
const centered = process.argv[3] === "centered";

function intraListDiversity(vectors: number[][]): number {
  if (vectors.length < 2) {return 0;}

  let sum = 0;
  let pairs = 0;
  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      sum += 1 - cosineSimilarity(vectors[i], vectors[j]);
      pairs++;
    }
  }
  return sum / pairs;
}

async function main() {
  const vectorRows = await prisma.$queryRaw<
    { id: string; embedding: string }[]
  >`
    SELECT id, embedding::text as embedding FROM "Book" WHERE embedding IS NOT NULL
  `;
  const vectorById = new Map(
    vectorRows.map((r) => [r.id, parseVector(r.embedding)]),
  );
  const catalogSize = vectorById.size;

  const users = await prisma.user.findMany({
    include: { readings: { select: { id: true, bookId: true } } },
  });
  const evaluable = users.filter((u) => u.readings.length >= MIN_READINGS);

  let hits = 0;
  let total = 0;
  let reciprocalRankSum = 0;
  let percentileSum = 0;
  let diversitySum = 0;
  const perUser: Record<
    string,
    { hits: number; total: number; percentile: number }
  > = {};

  for (const user of evaluable) {
    perUser[user.email] = { hits: 0, total: 0, percentile: 0 };

    for (const heldOut of user.readings) {
      const { recommendations, rankedCandidateIds } = await getRecommendations(
        user.id,
        {
          excludeReadingIds: [heldOut.id],
          strategy,
          centered,
        },
      );

      total++;
      perUser[user.email].total++;

      const topRank = recommendations.findIndex((r) => r.id === heldOut.bookId);
      if (topRank !== -1) {
        hits++;
        perUser[user.email].hits++;
        reciprocalRankSum += 1 / (topRank + 1);
      }

      const fullRank = rankedCandidateIds.indexOf(heldOut.bookId);
      const percentile =
        fullRank === -1 ? 1 : fullRank / rankedCandidateIds.length;
      percentileSum += percentile;
      perUser[user.email].percentile += percentile;

      const topVectors = recommendations
        .map((r) => vectorById.get(r.id))
        .filter((v): v is number[] => Boolean(v));
      diversitySum += intraListDiversity(topVectors);
    }
  }

  const randomRecall = RECOMMENDATION_COUNT / Math.max(catalogSize - 1, 1);
  const recall = hits / total;

  console.log(`Catálogo: ${catalogSize} libros`);
  console.log(`Estrategia: ${strategy}${centered ? " + centrado" : ""}`);
  console.log(
    `Usuarios evaluados: ${evaluable.length} (>= ${MIN_READINGS} lecturas)`,
  );
  console.log(`Evaluaciones leave-one-out: ${total}\n`);

  console.log(
    `recall@${RECOMMENDATION_COUNT}: ${recall.toFixed(4)}  (${hits}/${total})`,
  );
  console.log(
    `  azar ${randomRecall.toFixed(4)}  ·  lift ${(recall / randomRecall).toFixed(2)}x`,
  );
  console.log(
    `MRR@${RECOMMENDATION_COUNT}: ${(reciprocalRankSum / total).toFixed(4)}`,
  );
  console.log(
    `Percentil promedio: ${(percentileSum / total).toFixed(4)}  (0 = perfecto, 0.5 = azar)`,
  );
  console.log(`Diversidad intra-lista: ${(diversitySum / total).toFixed(4)}`);

  console.log("\nPor usuario:");
  for (const [email, s] of Object.entries(perUser)) {
    console.log(
      `  ${email}: ${s.hits}/${s.total} · percentil ${(s.percentile / s.total).toFixed(3)}`,
    );
  }
}

main().finally(() => prisma.$disconnect());
