import "./load-env";
import { prisma } from "../lib/prisma";
import { getRecommendations, RECOMMENDATION_COUNT } from "../lib/recommendations";

const MIN_READINGS = 3;

async function main() {
  const users = await prisma.user.findMany({
    include: { readings: { select: { id: true, bookId: true } } },
  });

  const evaluable = users.filter((u) => u.readings.length >= MIN_READINGS);

  let hits = 0;
  let total = 0;
  let reciprocalRankSum = 0;
  const perUser: Record<string, { hits: number; total: number }> = {};

  for (const user of evaluable) {
    perUser[user.email] = { hits: 0, total: 0 };

    for (const heldOut of user.readings) {
      const { recommendations } = await getRecommendations(user.id, {
        excludeReadingIds: [heldOut.id],
      });

      const rank = recommendations.findIndex((r) => r.id === heldOut.bookId);
      total++;
      perUser[user.email].total++;

      if (rank !== -1) {
        hits++;
        perUser[user.email].hits++;
        reciprocalRankSum += 1 / (rank + 1);
      }
    }
  }

  console.log(`Usuarios evaluados: ${evaluable.length} (>= ${MIN_READINGS} lecturas)`);
  console.log(`Evaluaciones leave-one-out: ${total}`);
  console.log(`recall@${RECOMMENDATION_COUNT}: ${(hits / total).toFixed(4)}  (${hits}/${total})`);
  console.log(`MRR: ${(reciprocalRankSum / total).toFixed(4)}`);
  console.log("\nPor usuario:");
  for (const [email, s] of Object.entries(perUser)) {
    console.log(`  ${email}: ${s.hits}/${s.total}`);
  }
}

main().finally(() => prisma.$disconnect());