import type { Prisma } from "@/app/generated/prisma/client";

type TransactionCleint = Prisma.TransactionClient;

export async function checkAndUnlockAchievements(
  tx: TransactionCleint,
  userId: string,
) {
  const [
    booksRead,
    purchaseCount,
    pointsResult,
    alreadyUnlocked,
    achievements,
  ] = await Promise.all([
    tx.reading.count({ where: { userId } }),
    tx.purchase.count({ where: { userId } }),
    tx.pointsLedger.aggregate({ where: { userId }, _sum: { points: true } }),
    tx.userAchievements.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
    tx.achievement.findMany(),
  ]);

  const unlockedIds = new Set(alreadyUnlocked.map((u) => u.achievementId));
  const totalPoints = pointsResult._sum.points ?? 0;

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;
    const conditionMet =
      (achievement.conditionType === "BOOKS_READ" &&
        booksRead >= achievement.threshold) ||
      (achievement.conditionType === "PURCHASE_COUNT" &&
        purchaseCount >= achievement.threshold) ||
      (achievement.conditionType === "FIRST_PURCHASE" && purchaseCount >= 1) ||
      (achievement.conditionType === "TOTAL_POINTS" &&
        totalPoints >= achievement.threshold);

    if (conditionMet) {
      await tx.userAchievements.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });
    }
  }
}
