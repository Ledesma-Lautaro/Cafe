"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  Field,
  TextField,
  TextAreaField,
  SelectField,
  controlClasses,
} from "@/components/ui/Field";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";

type BookResult = {
  title: string;
  author: string;
  isbn?: string;
  genre?: string;
  synopsis?: string;
};

export function ReadingForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const skipNextSearch = useRef(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState<string | undefined>(undefined);
  const [date, setDate] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [genre, setGenre] = useState<string | undefined>(undefined);
  const [synopsis, setSynopsis] = useState<string | undefined>(undefined);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (!query) {
      setResults([]);
      return;
    }
    let cancelled = false;

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(
          `/api/books/search?query=${encodeURIComponent(query)}`,
        );
        if (!res.ok) {
          throw new Error("búsqueda fallida");
        }
        const data = await res.json();
        if (!cancelled) {
          setResults(data.books ?? []);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setSearchError("No se pudo buscar. Podés cargar los datos a mano.");
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  function selectResult(result: BookResult) {
    skipNextSearch.current = true;
    setTitle(result.title);
    setAuthor(result.author);
    setIsbn(result.isbn);
    setGenre(result.genre);
    setSynopsis(result.synopsis);
    setResults([]);
    setQuery(result.title);
  }

  function resetForm() {
    setQuery("");
    setTitle("");
    setAuthor("");
    setIsbn(undefined);
    setDate("");
    setRating("");
    setComment("");
    setGenre(undefined);
    setSynopsis(undefined);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
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
          genre,
          synopsis,
        }),
      });

      if (!res.ok) {
        setError("No se pudo guardar la lectura. Intentá de nuevo.");
        return;
      }

      setSuccess(true);
      resetForm();
    } catch {
      setError("No se pudo conectar con el servidor. Intentá de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-title">Registrar lectura</h1>

      {success && (
        <Alert tone="success">
          <p className="font-bold">Lectura guardada.</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/readings" className={buttonClasses({ size: "sm" })}>
              Ver mis lecturas
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSuccess(false)}
            >
              Cargar otra
            </Button>
          </div>
        </Alert>
      )}

      <Card tone="muted" className="flex flex-col gap-3">
        <Field
          id="search"
          label="Buscar libro"
          hint="Buscamos en Google Books y completamos los datos por vos."
        >
          <input
            id="search"
            type="text"
            value={query}
            onChange={(e) => {
              skipNextSearch.current = false;
              setQuery(e.target.value);
            }}
            placeholder="Cien años de soledad…"
            className={controlClasses}
          />
        </Field>

        <div aria-live="polite" className="flex flex-col gap-2">
          {isSearching && (
            <p className="flex items-center gap-2 text-sm text-ink-soft">
              <Loader2
                size={14}
                strokeWidth={3}
                className="animate-spin"
                aria-hidden
              />
              Buscando…
            </p>
          )}
          {searchError && <Alert tone="error">{searchError}</Alert>}
          {results.length > 0 && (
            <ul className="flex flex-col overflow-hidden rounded-brutal border-2 border-ink bg-surface">
              {results.map((result, i) => (
                <li
                  key={`${result.isbn ?? result.title}-${i}`}
                  className="not-last:border-b-2 not-last:border-ink"
                >
                  <button
                    type="button"
                    onClick={() => selectResult(result)}
                    className="w-full px-3 py-2 text-left hover:bg-brand-soft"
                  >
                    <span className="font-bold">{result.title}</span>
                    <span className="block text-sm text-ink-soft">
                      {result.author}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          id="title"
          label="Título"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          id="author"
          label="Autor"
          required
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <TextField
          id="date"
          label="Fecha de lectura"
          type="date"
          required
          max={new Date().toISOString().split("T")[0]}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <SelectField
          id="rating"
          label="Puntaje"
          hint="Opcional. Influye en tus recomendaciones."
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="">Sin puntaje</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)} ({n}/5)
            </option>
          ))}
        </SelectField>
        <TextAreaField
          id="comment"
          label="Comentario"
          hint="Opcional."
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex gap-2">
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar lectura"}
          </Button>
          <Link
            href="/readings"
            className={buttonClasses({ variant: "ghost" })}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
