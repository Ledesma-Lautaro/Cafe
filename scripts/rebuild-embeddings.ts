import "./load-env";
import { prisma } from "../lib/prisma";
import { generateEmbedding, bookEmbeddingText, saveBookEmbedding } from "../lib/embeddings";
import {
  splitSentences,
  scoreDistinctiveness,
  selectDistinctiveSentences,
  type BookSentences,
} from "../lib/boilerplate";

const budget = Number(process.argv[2] ?? 400);

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

  console.log(`Libros: ${books.length} · presupuesto: ${budget}`);

  const corpus: BookSentences[] = [];
  for (const book of books) {
    if (!book.synopsis) continue;

    const sentences = splitSentences(book.synopsis);
    const embeddings: number[][] = [];
    for (const sentence of sentences) {
      embeddings.push(await generateEmbedding(sentence));
    }
    corpus.push({ bookId: book.id, sentences, embeddings });
  }

  const totalSentences = corpus.reduce((n, b) => n + b.sentences.length, 0);
  console.log(`Oraciones embebidas: ${totalSentences}`);

  const scores = scoreDistinctiveness(corpus);

  const byId = new Map(corpus.map((c) => [c.bookId, c]));
  let totalKept = 0;

  for (const book of books) {
    const entry = byId.get(book.id);
    let synopsis = book.synopsis;

    if (entry && budget > 0) {
      const selected = selectDistinctiveSentences(
        entry.sentences,
        scores.get(book.id) ?? [],
        budget,
      );
      if (selected.length > 0) synopsis = selected.join(" ");
      totalKept += selected.length;
    }

    const embedding = await generateEmbedding(bookEmbeddingText({ ...book, synopsis }));
    await saveBookEmbedding(book.id, embedding);
  }

  if (budget > 0) {
    console.log(`Oraciones conservadas: ${totalKept}/${totalSentences}`);
  }

  console.log(`Embeddings regenerados: ${books.length}`);
}

main().finally(() => prisma.$disconnect());