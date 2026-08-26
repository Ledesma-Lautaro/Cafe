import { BarChart3, BookOpen, Coffee, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getTopBooks, getTopProducts, getTopReaders } from "@/lib/stats";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Estadísticas" };

export const revalidate = 300;

type Row = { key: string; label: string; sub?: string; value: string };

function Ranking({
  icon: Icon,
  title,
  unit,
  rows,
  className,
}: {
  icon: LucideIcon;
  title: string;
  unit: string;
  rows: Row[];
  className?: string;
}) {
  return (
    <Card as="section" className={className}>
      <div className="flex items-center gap-2">
        <Icon size={20} strokeWidth={2.5} aria-hidden />
        <h2 className="text-heading">{title}</h2>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">Todavía no hay datos.</p>
      ) : (
        <ol className="mt-4 flex flex-col">
          {rows.map((row, i) => (
            <li
              key={row.key}
              className="flex items-center gap-3 py-2 not-last:border-b-2 not-last:border-ink"
            >
              <span
                aria-hidden
                className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-brand font-display text-sm text-on-accent"
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold">{row.label}</p>
                {row.sub && (
                  <p className="truncate text-sm text-ink-soft">{row.sub}</p>
                )}
              </div>
              <Badge className="ml-auto shrink-0 tabular-nums">
                {row.value} {unit}
              </Badge>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export default async function StatsPage() {
  const [books, products, readers] = await Promise.all([
    getTopBooks(),
    getTopProducts(),
    getTopReaders(),
  ]);

  const isEmpty =
    books.length === 0 && products.length === 0 && readers.length === 0;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-title">Estadísticas</h1>
        <p className="max-w-2xl text-ink-soft">
          Actividad agregada de todo el café: qué se lee, qué se consume y
          quiénes acumulan más puntos. Los datos se actualizan cada cinco
          minutos.
        </p>
      </header>

      {isEmpty ? (
        <EmptyState
          icon={BarChart3}
          title="Todavía no hay actividad"
          description="En cuanto se registren lecturas y compras, los rankings aparecen acá."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Ranking
            icon={BookOpen}
            title="Libros más leídos"
            unit="lecturas"
            className="md:col-span-2"
            rows={books.map((b) => ({
              key: b.id,
              label: b.title,
              sub: b.author,
              value: String(b.count),
            }))}
          />
          <Ranking
            icon={Coffee}
            title="Productos más comprados"
            unit="compras"
            rows={products.map((p) => ({
              key: p.id,
              label: p.name,
              value: String(p.count),
            }))}
          />
          <Ranking
            icon={Users}
            title="Lectores más activos"
            unit="pts"
            rows={readers.map((r, i) => ({
              key: `${r.name}-${i}`,
              label: r.name,
              value: String(r.points),
            }))}
          />
        </div>
      )}
    </main>
  );
}
