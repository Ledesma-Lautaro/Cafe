import "./load-env";
import { prisma } from "../lib/prisma";
import {
  generateEmbedding,
  bookEmbeddingText,
  saveBookEmbedding,
} from "../lib/embeddings";

interface BookRow {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  synopsis: string | null;
}

async function main() {
  const books = await prisma.$queryRaw<BookRow[]>`
    SELECT id, title, author, genre, synopsis FROM "Book"
  `;

  console.log(`Regenerando embeddings de ${books.length} libros...`);
  for (const book of books) {
    const embedding = await generateEmbedding(bookEmbeddingText(book), {
      local: true,
    });
    await saveBookEmbedding(book.id, embedding);
  }
  console.log("Listo.");
}

main().finally(() => prisma.$disconnect());
