import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Coffee, Lock, Receipt, Trophy } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserStats } from "@/lib/achievements";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Recommendations } from "@/components/reading/Recommendations";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";

export const metadata = { title: "Tu perfil" };

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

  // El logro más cerca de completarse, por proporción y no por valor
  // absoluto: 8 de 10 está más cerca que 80 de 500.
  const nextAchievement = pendingAchievements
    .map((achievement) => ({ achievement, current: progressFor(achievement) }))
    .sort(
      (a, b) =>
        b.current / b.achievement.threshold -
        a.current / a.achievement.threshold,
    )[0];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-title">{user.name ?? "Tu perfil"}</h1>
          <p className="text-sm text-ink-soft">
            Miembro desde {user.createdAt.toLocaleDateString("es-AR")}
          </p>
        </header>

        {/* md:auto-rows-fr iguala el alto de las dos filas para que la celda
            de puntos, con row-span-2, mida exactamente el doble. Va con
            prefijo md: porque en móvil hay tres filas de contenido
            desparejo y forzarlas a igual alto estira la de puntos de más. */}
        <section
          aria-label="Resumen"
          className="grid grid-cols-2 gap-3 tabular-nums md:auto-rows-fr md:grid-cols-4"
        >
          <Card
            tone="brand"
            className="col-span-2 flex flex-col items-center justify-center md:row-span-2"
          >
            <p className="font-display text-display">{stats.totalPoints}</p>
            <p className="text-sm font-bold">Puntos acumulados</p>
          </Card>

          <Card className="flex flex-col items-center justify-center">
            <p className="font-display text-title">{stats.booksRead}</p>
            <p className="text-xs font-bold">Libros</p>
          </Card>

          <Card className="flex flex-col items-center justify-center">
            <p className="font-display text-title">{stats.purchaseCount}</p>
            <p className="text-xs font-bold">Compras</p>
          </Card>

          {nextAchievement ? (
            <Card
              tone="sky"
              className="col-span-2 flex flex-col justify-center gap-2"
            >
              <p className="text-xs font-bold uppercase">Próximo logro</p>
              <p className="text-heading">
                {nextAchievement.achievement.name}
              </p>
              <div
                role="progressbar"
                aria-valuenow={nextAchievement.current}
                aria-valuemin={0}
                aria-valuemax={nextAchievement.achievement.threshold}
                aria-label={`Progreso de ${nextAchievement.achievement.name}`}
                className="h-4 overflow-hidden rounded-full border-2 border-ink bg-surface"
              >
                <div
                  className="h-full bg-brand"
                  style={{
                    width: `${Math.round(
                      (nextAchievement.current /
                        nextAchievement.achievement.threshold) *
                        100,
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs font-bold">
                {nextAchievement.current} de{" "}
                {nextAchievement.achievement.threshold}
              </p>
            </Card>
          ) : (
            <Card
              tone="leaf"
              className="col-span-2 flex flex-col justify-center gap-1"
            >
              <p className="text-heading">Todo desbloqueado</p>
              <p className="text-sm">No te queda ningún logro pendiente.</p>
            </Card>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading">Recomendado para vos</h2>
        <Suspense
          fallback={
            <div className="flex flex-col gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          }
        >
          <Recommendations userId={session.user.id} />
        </Suspense>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading">Logros</h2>

        {unlockedAchievements.length > 0 && (
          <ul className="grid gap-3 md:grid-cols-2">
            {unlockedAchievements.map((ua) => (
              <Card
                as="li"
                key={ua.id}
                tone="leaf"
                className="flex items-start gap-3"
              >
                <Trophy
                  size={20}
                  strokeWidth={2.5}
                  className="mt-0.5 shrink-0"
                  aria-hidden
                />
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-heading">{ua.achievement.name}</h3>
                    <Badge tone="leaf">Desbloqueado</Badge>
                  </div>
                  <p className="text-sm text-ink-soft">
                    {ua.achievement.rewardDescription}
                  </p>
                </div>
              </Card>
            ))}
          </ul>
        )}

        {pendingAchievements.length > 0 && (
          <ul className="grid gap-3 md:grid-cols-2">
            {pendingAchievements.map((achievement) => {
              const current = progressFor(achievement);
              const pct = Math.round((current / achievement.threshold) * 100);
              return (
                <Card
                  as="li"
                  key={achievement.id}
                  tone="muted"
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Lock
                      size={16}
                      strokeWidth={2.5}
                      className="shrink-0"
                      aria-hidden
                    />
                    <h3 className="text-heading">{achievement.name}</h3>
                    <span className="ml-auto text-sm font-bold">
                      {current}/{achievement.threshold}
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-valuenow={current}
                    aria-valuemin={0}
                    aria-valuemax={achievement.threshold}
                    aria-label={`Progreso de ${achievement.name}`}
                    className="h-4 overflow-hidden rounded-full border-2 border-ink bg-surface"
                  >
                    <div
                      className="h-full bg-brand"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Card>
              );
            })}
          </ul>
        )}

        {allAchievements.length === 0 && (
          <EmptyState icon={Trophy} title="No hay logros configurados" />
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading">Historial de compras</h2>
        {purchases.length > 0 ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {purchases.map((purchase) => (
              <Card
                as="li"
                key={purchase.id}
                className="flex items-center gap-3"
              >
                <Coffee
                  size={20}
                  strokeWidth={2.5}
                  className="shrink-0"
                  aria-hidden
                />
                <div>
                  <h3 className="text-heading">{purchase.product.name}</h3>
                  <p className="text-sm text-ink-soft">
                    {purchase.date.toLocaleDateString("es-AR")}
                  </p>
                </div>
                <Badge tone="brand" className="ml-auto">
                  ${purchase.amount.toString()}
                </Badge>
              </Card>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Receipt}
            title="Sin compras registradas"
            description="Las compras las carga el personal desde el mostrador y suman puntos automáticamente."
          />
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading">Datos de la cuenta</h2>
        <Card tone="muted">
          <ProfileForm initialName={user.name} email={user.email} />
        </Card>
      </section>
    </div>
  );
}