export interface WikipediaPage {
  title: string;
  extract: string;
  description?: string;
}

const UA = {
  "User-Agent": "cafe-portfolio/1.0 (https://github.com/Ledesma-Lautaro/Cafe)",
};

const PLOT_SECTION = /argumento|sinopsis|trama|resumen|contenido/i;

function parseSections(extract: string): {
  intro: string;
  plot: string | null;
} {
  const intro: string[] = [];
  let plotLines: string[] | null = null;
  let capturing = false;
  let insideBody = false;

  for (const line of extract.split("\n")) {
    const heading = line.trim().match(/^==\s*([^=].*?)\s*==$/);

    if (heading) {
      if (capturing) {
        break;
      }
      insideBody = true;
      capturing = plotLines === null && PLOT_SECTION.test(heading[1]);
      if (capturing) {
        plotLines = [];
      }
      continue;
    }

    if (capturing && plotLines) {
      plotLines.push(line);
    } else if (!insideBody) {
      intro.push(line);
    }
  }

  return {
    intro: intro.join(" ").trim(),
    plot: plotLines ? plotLines.join(" ").trim() : null,
  };
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
  if (words.length === 0) {
    return false;
  }
  const haystack = normalize(`${page.description ?? ""} ${page.extract}`);
  return words.some((w) => haystack.includes(w));
}

export async function fetchWikipediaArticle(title: string): Promise<{
  title: string;
  description?: string;
  text: string;
  intro: string;
} | null> {
  const url =
    `https://es.wikipedia.org/w/api.php?action=query&format=json&formatversion=2` +
    `&prop=extracts|description&explaintext=1&redirects=1` +
    `&titles=${encodeURIComponent(title)}`;

  const res = await fetch(url, { headers: UA });
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  const page = data.query?.pages?.[0];
  if (!page || page.missing || !page.extract) {
    return null;
  }

  const { intro, plot } = parseSections(page.extract);
  const text = plot || intro;
  if (!text) {
    return null;
  }

  return { title: page.title, description: page.description, text, intro };
}

export async function findWikipediaPage(
  title: string,
  author: string,
): Promise<WikipediaPage | null> {
  const cleaned = cleanTitle(title);
  try {
    const article = await fetchWikipediaArticle(cleaned);
    if (!article) {
      return null;
    }

    const paraVerificar: WikipediaPage = {
      title: article.title,
      extract: article.intro,
      description: article.description,
    };
    if (isDisambiguation(paraVerificar)) {
      return null;
    }
    if (!mentionsAuthor(paraVerificar, author)) {
      return null;
    }

    return {
      title: article.title,
      extract: article.text,
      description: article.description,
    };
  } catch {
    return null;
  }
}