import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers"
import { prisma } from "@/lib/prisma";

let extractorPromise: Promise <FeatureExtractionPipeline> | null = null;

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function truncateAtSentence(text: string, maxChars: number) {
  if (text.length <= maxChars) {return text;}
  const cut = text.slice(0, maxChars);
  const lastStop = Math.max(
    cut.lastIndexOf(". "),
    cut.lastIndexOf("! "),
    cut.lastIndexOf("? "),
  );
  return lastStop > maxChars * 0.5 ? cut.slice(0, lastStop + 1) : cut;
}

function getExtractor(){
    if(!extractorPromise) {
        extractorPromise = pipeline(
            "feature-extraction",
            "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
        )
    }
    return extractorPromise;
}

export async function generateEmbedding(
    text: string
) : Promise<number[]>{
    const extractor = await getExtractor();
    const output = await extractor(text, {
        pooling: "mean",
        normalize: true
    });
    return Array.from(output.data as Float32Array);
}

export function bookEmbeddingText(book: {
  title: string;
  author: string;
  genre?: string | null;
  synopsis?: string | null;
}) {
  const synopsis = book.synopsis
    ? truncateAtSentence(normalize(book.synopsis), 400)
    : null;
  return [book.title, book.author, book.genre, synopsis]
    .filter(Boolean)
    .join(". ");
}

export async function saveBookEmbedding(bookId: string, embedding: number[]) {
  const vectorLiteral = `[${embedding.join(",")}]`;
  await prisma.$executeRaw`
    UPDATE "Book" SET embedding = ${vectorLiteral}::vector WHERE id = ${bookId}
  `;
}