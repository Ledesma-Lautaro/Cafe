import { prisma, withRetry } from "@/lib/prisma";

const TOP_N = 10;

export type RankedBook = { id: string; title: string; author: string; count: number };
export type RankedProduct = { id: string; name: string; count: number };
export type RankedReader = { name: string; points: number };

export async function getTopBooks(): Promise<RankedBook[]> {
  const grouped = await withRetry(() =>
    prisma.reading.groupBy({
      by: ["bookId"],
      _count: { bookId: true },
      orderBy: { _count: { bookId: "desc" } },
      take: TOP_N,
    }),
  );

  if (grouped.length === 0) {
    return [];
  }

  const books = await withRetry(() =>
    prisma.book.findMany({
      where: { id: { in: grouped.map((g) => g.bookId) } },
      select: { id: true, title: true, author: true },
    }),
  );

  const byId = new Map(books.map((b) => [b.id, b]));
  return grouped.flatMap((g) => {
    const book = byId.get(g.bookId);
    return book ? [{ ...book, count: g._count.bookId }] : [];
  });
}

export async function getTopProducts(): Promise<RankedProduct[]> {
  const grouped = await withRetry(() =>
    prisma.purchase.groupBy({
      by: ["productId"],
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: TOP_N,
    }),
  );

  if (grouped.length === 0) {
    return [];
  }

  const products = await withRetry(() =>
    prisma.product.findMany({
      where: { id: { in: grouped.map((g) => g.productId) } },
      select: { id: true, name: true },
    }),
  );

  const byId = new Map(products.map((p) => [p.id, p]));

  return grouped.flatMap((g) => {
    const product = byId.get(g.productId);
    return product ? [{ ...product, count: g._count.productId }] : [];
  });
}

export async function getTopReaders(): Promise<RankedReader[]> {
  const grouped = await withRetry(() =>
    prisma.pointsLedger.groupBy({
      by: ["userId"],
      _sum: { points: true },
      orderBy: { _sum: { points: "desc" } },
      take: TOP_N,
    }),
  );

  if (grouped.length === 0) {
    return [];
  }

  const users = await withRetry(() =>
    prisma.user.findMany({
      where: { id: { in: grouped.map((g) => g.userId) } },

      select: { id: true, name: true },
    }),
  );

  const byId = new Map(users.map((u) => [u.id, u]));

  return grouped.flatMap((g) => {
    const user = byId.get(g.userId);
    if (!user) {
      return [];
    }
    return [
      {
        name: user.name?.trim() || "Lector anónimo",
        points: g._sum.points ?? 0,
      },
    ];
  });
}