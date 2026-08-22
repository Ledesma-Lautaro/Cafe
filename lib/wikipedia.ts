export interface WikipediaPage {
  title: string;
  extract: string;
  description?: string;
}

const UA = {
  "User-Agent": "cafe-portfolio/1.0 (https://github.com/Ledesma-Lautaro/Cafe)",
};
const BATCH_SIZE = 20;

interface ApiPage {
  title: string;
  missing?: boolean;
  extract?: string;
  description?: string;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*\([^)]*\)/g, "")
    .split("/")[0]
    .trim();
}

function isDisambiguation(page: WikipediaPage): boolean {
  return normalize(page.description ?? "").includes("desambiguacion");
}

function mentionsAuthor(page: WikipediaPage, author: string): boolean {
  const words = normalize(author.split(",")[0])
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4);
  if (words.length === 0) {return false;}
  const haystack = normalize(`${page.description ?? ""} ${page.extract}`);
  return words.some((w) => haystack.includes(w));
}

export async function findWikipediaPage(
  title: string,
  author: string,
): Promise<WikipediaPage | null> {
  const cleaned = cleanTitle(title);
  try {
    const page = (await fetchWikipediaPages([cleaned])).get(cleaned);
    if (!page) {return null;}
    if (isDisambiguation(page)) {return null;}
    if (!mentionsAuthor(page, author)) {return null;}
    return page;
  } catch {
    return null;
  }
}

export async function fetchWikipediaPages(
  titles: string[],
): Promise<Map<string, WikipediaPage>> {
  const result = new Map<string, WikipediaPage>();

  for (let i = 0; i < titles.length; i += BATCH_SIZE) {
    const chunk = titles.slice(i, i + BATCH_SIZE);
    const url =
      `https://es.wikipedia.org/w/api.php?action=query&format=json&formatversion=2` +
      `&prop=extracts|description&exintro=1&explaintext=1&exlimit=${BATCH_SIZE}&redirects=1` +
      `&titles=${encodeURIComponent(chunk.join("|"))}`;

    const res = await fetch(url, { headers: UA });
    if (!res.ok) {
      console.warn(
        `Wikipedia respondió ${res.status} en el lote ${i / BATCH_SIZE + 1}`,
      );
      continue;
    }

    const data = await res.json();

    const alias = new Map<string, string>();
    for (const n of data.query?.normalized ?? []) {alias.set(n.from, n.to);}
    for (const r of data.query?.redirects ?? []) {alias.set(r.from, r.to);}

    const pages: ApiPage[] = data.query?.pages ?? [];
    const byTitle = new Map(pages.map((p) => [p.title, p]));

    for (const requested of chunk) {
      let key = requested;
      for (let hop = 0; hop < 3 && alias.has(key); hop++) {key = alias.get(key)!;}

      const page = byTitle.get(key);
      if (!page || page.missing || !page.extract) {continue;}

      result.set(requested, {
        title: page.title,
        extract: page.extract,
        description: page.description,
      });
    }

    if (i + BATCH_SIZE < titles.length)
      {await new Promise((r) => setTimeout(r, 1000));}
  }

  return result;
}
