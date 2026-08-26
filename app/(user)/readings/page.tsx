import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Calendar, SearchX, Star } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { controlClasses } from "@/components/ui/Field";
import { DeleteReadingButton } from "@/components/reading/DeleteReadingButton";

export const metadata = { title: "Mis lecturas" };

export default async function ReadingsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; author?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { year, author } = await searchParams;
  const hasFilters = Boolean(year || author);

  const readings = await prisma.reading.findMany({
    where: {
      userId: session.user.id,
      ...(year && {
        date: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${Number(year) + 1}-01-01`),
        },
      }),
      ...(author && {
        book: { author: { contains: author, mode: "insensitive" } },
      }),
    },
    include: { book: true },
    orderBy: { date: "desc" },
  });

  const totalCount = hasFilters
    ? await prisma.reading.count({ where: { userId: session.user.id } })
    : readings.length;

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-title">Mis lecturas</h1>
        <p className="text-sm font-bold text-ink-soft">
          {readings.length}
          {hasFilters && ` de ${totalCount}`}
        </p>
      </div>

      <Card tone="muted" as="section">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <Field id="year" label="Año">
            <input
              id="year"
              name="year"
              type="number"
              min="1900"
              max="2100"
              defaultValue={year}
              placeholder="2025"
              className={`${controlClasses} w-28`}
            />
          </Field>

          <Field id="author" label="Autor">
            <input
              id="author"
              name="author"
              type="text"
              defaultValue={author}
              placeholder="Borges"
              className={`${controlClasses} w-48`}
            />
          </Field>

          <div className="flex gap-2">
            <Button type="submit">Filtrar</Button>
            {hasFilters && (
              <Link href="/readings" className={buttonClasses({ variant: "ghost" })}>
                Limpiar
              </Link>
            )}
          </div>
        </form>
      </Card>

      {readings.length > 0 && (
        <ul className="flex flex-col gap-4">
          {readings.map((reading) => (
            <Card as="li" key={reading.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
          
                  <h2 className="text-heading">{reading.book.title}</h2>
                  <p className="text-sm text-ink-soft">{reading.book.author}</p>
                </div>
                {reading.rating !== null && (
                  <Badge tone="brand" className="shrink-0">
                    <Star size={12} strokeWidth={0} fill="currentColor" aria-hidden />
                    {reading.rating}/5
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge>
                  <Calendar size={12} strokeWidth={2.5} aria-hidden />
                  {reading.date.toLocaleDateString("es-AR")}
                </Badge>
                {reading.book.genre && <Badge tone="sky">{reading.book.genre}</Badge>}
              </div>

              {reading.comment && (
                <blockquote className="border-l-4 border-ink pl-3 text-sm italic">
                  {reading.comment}
                </blockquote>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 border-t-2 border-ink pt-3">
                <Link
                  href={`/readings/${reading.id}/edit`}
                  className={buttonClasses({ variant: "secondary", size: "sm" })}
                >
                  Editar
                </Link>
                <DeleteReadingButton id={reading.id} title={reading.book.title} />
              </div>
            </Card>
          ))}
        </ul>
      )}

      {readings.length === 0 &&
        (hasFilters ? (
          <EmptyState
            icon={SearchX}
            title="Sin resultados"
            description="Ninguna de tus lecturas coincide con ese filtro."
            action={
              <Link href="/readings" className={buttonClasses({ variant: "secondary" })}>
                Limpiar filtros
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Todavía no registraste lecturas"
            description="Cargá el primer libro y vas a empezar a sumar puntos y a recibir recomendaciones."
            action={
              <Link href="/readings/new" className={buttonClasses()}>
                Registrar mi primera lectura
              </Link>
            }
          />
        ))}
    </div>
  );
}