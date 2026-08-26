"use client";

import { useState, type FormEvent } from "react";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ProfileForm({
  initialName,
  email,
}: {
  initialName: string | null;
  email: string;
}) {
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
        setError("No se pudo actualizar el perfil.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("No se pudo conectar con el servidor. Intentá de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          id="profile-email"
          label="Email"
          type="email"
          value={email}
          disabled
          hint="El email no se puede cambiar."
        />
        <TextField
          id="profile-name"
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">Perfil actualizado.</Alert>}

      <Button type="submit" isLoading={isSubmitting} className="self-start">
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
