import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { awardReadingPoints } from "@/lib/points";

const createReadingSchema = z.object({
  title: z.string().trim().min(1, "El titulo es requerido"),
  author: z.string().trim().min(1, "El autor es requerido"),
  isbn: z.string().optional(),
  date: z.coerce.date(),
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createReadingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let book = parsed.data.isbn
    ? await prisma.book.findUnique({
        where: {
          isbn: parsed.data.isbn,
        },
      })
    : null;

  if (!book) {
    book = await prisma.book.findFirst({
      where: {
        title: { equals: parsed.data.title, mode: "insensitive" },
        author: { equals: parsed.data.author, mode: "insensitive" },
      },
    });
  }

  if (!book) {
    book = await prisma.book.create({
      data: {
        title: parsed.data.title,
        author: parsed.data.author,
        isbn: parsed.data.isbn,
      },
    });
  }

  const reading = await prisma.$transaction(async (tx) => {
    const reading = await tx.reading.create({
      data: {
        userId: session.user.id,
        bookId: book.id,
        date: parsed.data.date,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });
    await awardReadingPoints(tx, session.user.id, reading.id)
    return reading;
  });

  return Response.json({reading}, {status: 201})

}
