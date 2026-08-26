import {
  pipeline,
  type FeatureExtractionPipeline,
} from "@huggingface/transformers";
import { prisma } from "@/lib/prisma";

const LOCAL_MODEL = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
const API_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeVector(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
  return norm === 0 ? v : v.map((x) => x / norm);
}

function truncateAtSentence(text: string, maxChars: number) {
  if (text.length <= maxChars) {
    return text;
  }
  const cut = text.slice(0, maxChars);
  const lastStop = Math.max(
    cut.lastIndexOf(". "),
    cut.lastIndexOf("! "),
    cut.lastIndexOf("? "),
  );
  return lastStop > maxChars * 0.5 ? cut.slice(0, lastStop + 1) : cut;
}

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", LOCAL_MODEL);
  }
  return extractorPromise;
}

async function generateLocally(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

async function generateViaApi(text: string, retries = 2): Promise<number[]> {
  const res = await fetch(
    `https://router.huggingface.co/hf-inference/models/${API_MODEL}/pipeline/feature-extraction`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    },
  );

  if (res.status === 503 && retries > 0) {
    await new Promise((r) => setTimeout(r, 6000));
    return generateViaApi(text, retries - 1);
  }
  if (!res.ok) {
    throw new Error(`HuggingFace respondió ${res.status}`);
  }

  return normalizeVector((await res.json()) as number[]);
}

export async function generateEmbedding(
  text: string,
  opts: { local?: boolean } = {},
): Promise<number[]> {
  const useLocal = opts.local ?? !process.env.HUGGINGFACE_API_KEY;
  return useLocal ? generateLocally(text) : generateViaApi(text);
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