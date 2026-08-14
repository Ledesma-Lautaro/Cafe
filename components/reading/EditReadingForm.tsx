"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function EditReadingForm({
  reading,
}: {
  reading: {
    id: string;
    date: Date;
    rating: number | null;
    comment: string | null;
  };
}) {
  const router = useRouter();
  const [date, setDate] = useState(reading.date.toISOString().split("T")[0]);
  const [rating, setRating] = useState(reading.rating?.toString() ?? "");
  const [comment, setComment] = useState(reading.comment?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/readings/${reading.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          rating: rating ? Number(rating) : undefined,
          comment: comment || undefined,
        }),
      });
      if (!res.ok) {
        setError("No se pudo guardar los cambios");
        return;
      }
      router.push("/readings");
    } finally {
      setIsSubmitting(false);
    }
  }

    return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-2xl font-bold">Editar lectura</h1>

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

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

