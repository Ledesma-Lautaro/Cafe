export interface GoogleBookResult {
  title: string;
  author: string;
  isbn?: string;
  genre?: string;
  synopsis?: string;
}

interface GoogleBooksItem {
  volumeInfo: {
    title: string;
    authors?: string[];
    industryIdentifiers?: { type: string; identifier: string }[];
    categories?: string[];
    description?: string;
  };
}

export async function searchGoogleBooks(
  query: string,
  maxResults = 10,
): Promise<GoogleBookResult[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Books respondió ${response.status}`);
  }

  const data = await response.json();
  return (data.items ?? []).map((item: GoogleBooksItem) => {
    const info = item.volumeInfo;
    return {
      title: info.title,
      author: (info.authors ?? []).join(", "),
      isbn: info.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier,
      genre: info.categories?.[0],
      synopsis: info.description,
    };
  });
}