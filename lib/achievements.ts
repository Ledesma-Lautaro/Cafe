import type { Prisma } from "@/app/generated/prisma/client";

type TransactionClient = Prisma.TransactionClient;

export async function getUserStats(client: TransactionClient, userId: string) {
  const [booksRead, purchaseCount, pointsResult] = await Promise.all([
    client.reading.count({ where: { userId } }),
    client.purchase.count({ where: { userId } }),
    client.pointsLedger.aggregate({ where: { userId }, _sum: { points: true } }),
  ]);

  return {
    booksRead,
    purchaseCount,
    totalPoints: pointsResult._sum.points ?? 0,
  };
}

export async function checkAndUnlockAchievements(tx: TransactionClient, userId: string) {
  const [stats, alreadyUnlocked, achievements] = await Promise.all([
    getUserStats(tx, userId),
    tx.userAchievements.findMany({ where: { userId }, select: { achievementId: true } }),
    tx.achievement.findMany(),
  ]);

  const unlockedIds = new Set(alreadyUnlocked.map((u) => u.achievementId));

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;

    const conditionMet =
      (achievement.conditionType === "BOOKS_READ" && stats.booksRead >= achievement.threshold) ||
      (achievement.conditionType === "PURCHASE_COUNT" && stats.purchaseCount >= achievement.threshold) ||
      (achievement.conditionType === "FIRST_PURCHASE" && stats.purchaseCount >= 1) ||
      (achievement.conditionType === "TOTAL_POINTS" && stats.totalPoints >= achievement.threshold);

    if (conditionMet) {
      await tx.userAchievements.create({
        data: { userId, achievementId: achievement.id },
      });
    }
  }
}