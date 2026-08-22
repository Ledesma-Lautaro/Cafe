import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { awardReadingPoints } from "@/lib/points";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import {
  generateEmbedding,
  saveBookEmbedding,
  bookEmbeddingText,
} from "@/lib/embeddings";
import { findWikipediaPage } from "@/lib/wikipedia";

const createReadingSchema = z.object({
  title: z.string().trim().min(1, "El titulo es requerido"),
  author: z.string().trim().min(1, "El autor es requerido"),
  isbn: z.string().optional(),
  genre: z.string().optional(),
  synopsis: z.string().optional(),
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
    const wiki = await findWikipediaPage(parsed.data.title, parsed.data.author);

    book = await prisma.book.create({
      data: {
        title: parsed.data.title,
        author: parsed.data.author,
        isbn: parsed.data.isbn,
        genre: wiki?.description ?? parsed.data.genre,
        synopsis: wiki?.extract ?? parsed.data.synopsis,
        synopsisSource: wiki ? "wikipedia" : "google",
      },
    });

    try {
      const embedding = await generateEmbedding(bookEmbeddingText(book));
      await saveBookEmbedding(book.id, embedding);
    } catch (error) {
      console.error(
        `No se pudo generar el embedding de "${book.title}":`,
        error,
      );
    }
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
    await awardReadingPoints(tx, session.user.id, reading.id);
    await checkAndUnlockAchievements(tx, session.user.id);
    return reading;
  });

  return Response.json({ reading }, { status: 201 });
}
