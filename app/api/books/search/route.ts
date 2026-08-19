import { searchGoogleBooks } from "@/lib/google-books";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return Response.json({ error: "Falta el parametro de busqueda" }, { status: 400 });
  }

  try {
    const books = await searchGoogleBooks(query);
    return Response.json({ books });
  } catch {
    return Response.json({ error: "Error al buscar libros en biblioteca" }, { status: 502 });
  }
}