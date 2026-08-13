"use client";

import { useState, useEffect, type FormEvent } from "react";

export function ReadingForm() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<
    {
      title: string;
      author: string;
      isbn?: string;
    }[]
  >([]);
  const [isSearching, setIsSearhching] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState<string | undefined>(undefined);
  const [date, setDate] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query) {
        setResults([]);
        return;
      }

      setIsSearhching(true);
      const res = await fetch(
        `/api/books/search?query=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      setResults(data.books ?? []);
      setIsSearhching(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  function selectResult(result: {
    title: string;
    author: string;
    isbn?: string;
  }) {
    setTitle(result.title);
    setAuthor(result.author);
    setIsbn(result.isbn);
    setResults([]);
    setQuery(result.title);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author,
          isbn,
          date,
          rating: rating ? Number(rating) : undefined,
          comment: comment || undefined,
        }),
      });

      if (!res.ok) {
        setError("No se pudo guardar la lectura");
        return;
      }

      setSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <h1 className="text-2xl font-bold">Cargar lectura</h1>

      <div className="flex flex-col gap-1">
        <label htmlFor="search">Buscar libro</label>
        <input
          id="search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Título del libro..."
          className="rounded border px-3 py-2"
        />
        {isSearching && <p className="text-sm text-gray-500">Buscando...</p>}
        {results.length > 0 && (
          <ul className="divide-y rounded border">
            {results.map((result, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => selectResult(result)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100"
                >
                  {result.title} — {result.author}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="title">Título</label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="author">Autor</label>
        <input
          id="author"
          type="text"
          required
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="date">Fecha</label>
        <input
          id="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="rating">Puntaje (1-5, opcional)</label>
        <input
          id="rating"
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="comment">Comentario (opcional)</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {success && <p className="text-sm text-green-600">Lectura guardada.</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Guardando..." : "Guardar lectura"}
      </button>
    </form>
  );
}
