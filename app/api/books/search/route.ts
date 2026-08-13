interface GoogleBooksItem {
  volumeInfo: {
    title: string;
    authors?: string[];
    industryIdentifiers?: { type: string; identifier: string }[];
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return new Response(
      JSON.stringify({ error: "Falta el parametro de busqueda" }),
      { status: 400 },
    );
  }

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: "Error al buscar libros en biblioteca" }),
      { status: 502 },
    );
  }

  const data = await response.json();
  const books = (data.items ?? []).map((item: GoogleBooksItem) => {
    const info = item.volumeInfo;
    const isbn = info.industryIdentifiers?.find(
      (id) => id.type === "ISBN_13",
    )?.identifier;
    return{
        title: info.title as string,
        author: (info.authors ?? []).join(", "),
        isbn,
    }
  });

  return Response.json({ books });
}
