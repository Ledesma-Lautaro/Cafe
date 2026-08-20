export function splitSentences(text: string): string[] {
  const parts = text.split(/(?<=[.!?])\s+/);
  const merged: string[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.length < 25 && merged.length > 0) {
      merged[merged.length - 1] += " " + trimmed;
    } else {
      merged.push(trimmed);
    }
  }

  return merged;
}

export interface BookSentences {
  bookId: string;
  sentences: string[];
  embeddings: number[][];
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

export function scoreDistinctiveness(
  corpus: BookSentences[],
): Map<string, number[]> {
  const result = new Map<string, number[]>();

  for (const book of corpus) {
    const scores = book.embeddings.map((vector) => {
      let maxSimilarity = -Infinity;

      for (const other of corpus) {
        if (other.bookId === book.bookId) continue;
        for (const otherVector of other.embeddings) {
          const similarity = cosineSimilarity(vector, otherVector);
          if (similarity > maxSimilarity) maxSimilarity = similarity;
        }
      }

      return maxSimilarity === -Infinity ? 1 : 1 - maxSimilarity;
    });

    result.set(book.bookId, scores);
  }

  return result;
}


export function selectDistinctiveSentences(
  sentences: string[],
  scores: number[],
  budget: number,
): string[] {
  const ranked = sentences
    .map((text, index) => ({ text, index, score: scores[index] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const chosen: { text: string; index: number }[] = [];
  let used = 0;

  for (const item of ranked) {
    const cost = item.text.length + 1; // +1 por el espacio de unión
    if (used + cost > budget && chosen.length > 0) continue;
    chosen.push(item);
    used += cost;
  }

  return chosen.sort((a, b) => a.index - b.index).map((c) => c.text);
}