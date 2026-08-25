import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { getUserStats } from "@/lib/achievements";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Suspense } from "react";
import { Recommendations } from "@/components/reading/Recommendations";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  if (!user) {
    redirect("/login");
  }

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { date: "desc" },
  });

  const stats = await getUserStats(prisma, session.user.id);
  const [unlockedAchievements, allAchievements] = await Promise.all([
    prisma.userAchievements.findMany({
      where: { userId: session.user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    }),
    prisma.achievement.findMany(),
  ]);

  const unlockedIds = new Set(
    unlockedAchievements.map((ua) => ua.achievementId),
  );
  const pendingAchievements = allAchievements.filter(
    (a) => !unlockedIds.has(a.id),
  );

  function progressFor(achievement: {
    conditionType: string;
    threshold: number;
  }) {
    const current =
      achievement.conditionType === "TOTAL_POINTS"
        ? stats.totalPoints
        : achievement.conditionType === "BOOKS_READ"
          ? stats.booksRead
          : stats.purchaseCount;
    return Math.min(current, achievement.threshold);
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tu perfil</h1>
        <SignOutButton />
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Miembro desde {user.createdAt.toLocaleDateString("es-AR")}
      </p>
      <ProfileForm initialName={user.name} email={user.email} />
      <h2 className="mt-10 text-xl font-bold">Recomendado para vos</h2>
      <Suspense
        fallback={
          <p className="mt-4 text-sm text-gray-500">
            Buscando recomendaciones…
          </p>
        }
      >
        <Recommendations userId={session.user.id} />
      </Suspense>
      <h2 className="mt-10 text-xl font-bold">Historial de compras</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {purchases.map((purchase) => (
          <li key={purchase.id} className="rounded border p-3">
            <p className="font-semibold">{purchase.product.name}</p>
            <p className="text-sm text-gray-500">
              {purchase.date.toLocaleDateString("es-AR")} — $
              {purchase.amount.toString()}
            </p>
          </li>
        ))}
      </ul>

      {purchases.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">
          Todavía no tenés compras registradas.
        </p>
      )}

      <h2 className="mt-10 text-xl font-bold">Puntos y logros</h2>
      <p className="mt-2 text-lg">
        Puntos totales: <strong>{stats.totalPoints}</strong>
      </p>

      <h3 className="mt-6 font-semibold">Desbloqueados</h3>
      <ul className="mt-2 flex flex-col gap-2">
        {unlockedAchievements.map((ua) => (
          <li
            key={ua.id}
            className="rounded border border-green-200 bg-green-50 p-3"
          >
            <p className="font-semibold">{ua.achievement.name}</p>
            <p className="text-sm text-gray-600">
              {ua.achievement.rewardDescription}
            </p>
          </li>
        ))}
        {unlockedAchievements.length === 0 && (
          <p className="text-sm text-gray-500">
            Todavía no desbloqueaste ningún logro.
          </p>
        )}
      </ul>

      <h3 className="mt-6 font-semibold">Pendientes</h3>
      <ul className="mt-2 flex flex-col gap-2">
        {pendingAchievements.map((achievement) => (
          <li key={achievement.id} className="rounded border p-3">
            <p className="font-semibold">{achievement.name}</p>
            <p className="text-sm text-gray-500">
              {progressFor(achievement)} / {achievement.threshold}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
