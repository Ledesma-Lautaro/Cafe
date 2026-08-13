import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function ReadingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    author?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { year, author } = await searchParams;

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

  return (
    <div className="mx-auto max-w-2xl py-16">
      <h1 className="text-2xl font-bold">Mis lecturas</h1>

      <form method="GET" className="mt-4 flex gap-2">
        <input
          type="number"
          name="year"
          placeholder="Año"
          defaultValue={year}
          className="rounded border px-3 py-2"
        />
        <input
          type="text"
          name="author"
          placeholder="Autor"
          defaultValue={author}
          className="rounded border px-3 py-2"
        />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Filtrar
        </button>
      </form>

      <ul className="mt-6 flex flex-col gap-3">
        {readings.map((reading) => (
          <li key={reading.id} className="rounded border p-3">
            <p className="font-semibold">{reading.book.title}</p>
            <p className="text-sm text-gray-500">{reading.book.author}</p>
            <p className="text-sm text-gray-500">
              {reading.date.toLocaleDateString("es-AR")}
            </p>
            {reading.rating && <p className="text-sm">⭐ {reading.rating}/5</p>}
            {reading.comment && (
              <p className="text-sm italic">&quot;{reading.comment}&quot;</p>
            )}
          </li>
        ))}
      </ul>

      {readings.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">
          No hay lecturas para mostrar.
        </p>
      )}
    </div>
  );    
}
