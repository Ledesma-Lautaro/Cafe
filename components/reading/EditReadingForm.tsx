"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { TextField, TextAreaField, SelectField } from "@/components/ui/Field";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function EditReadingForm({
  reading,
}: {
  reading: { id: string; date: Date; rating: number | null; comment: string | null };
}) {
  const router = useRouter();
  const [date, setDate] = useState(reading.date.toISOString().split("T")[0]);
  const [rating, setRating] = useState(reading.rating?.toString() ?? "");
  const [comment, setComment] = useState(reading.comment ?? "");
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
        setError("No se pudieron guardar los cambios. Intentá de nuevo.");
        return;
      }
      router.push("/readings");
    } catch {
      setError("No se pudo conectar con el servidor. Intentá de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-title">Editar lectura</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </Button>
          <Link href="/readings" className={buttonClasses({ variant: "ghost" })}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}