"use client";

import { useState, type FormEvent } from "react";

export function ProfileForm({ initialName, email }: { initialName: string | null; email: string }) {
  const [name, setName] = useState(initialName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        setError("No se pudo actualizar el perfil");
        return;
      }

      setSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} disabled className="rounded border bg-gray-100 px-3 py-2" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Guardado.</p>}

      <button type="submit" disabled={isSubmitting} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
        {isSubmitting ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}