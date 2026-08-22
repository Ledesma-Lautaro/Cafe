"use client";

import { useState, type FormEvent } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password}),
      });

      if (res.ok) {
        setSuccess(true);
        return;
      }

      const data = await res.json();
      if (res.status === 409) {
        setError(data.error as string);
      } else if (res.status === 400) {
        setError(
          "Revisa los datos ingresados: " +
            JSON.stringify(data.error.fieldErrors),
        );
      } else {
        setError("Ocurrió un error inesperado. Intente de nuevo más tarde.");
      }
    } catch {
      setError(
        "No se pudo conectar con el servidor. Intente de nuevo más tarde.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Registro exitoso</h1>
      <p>Ahora podés iniciar sesión con tu cuenta.</p>
    </div>
    ) 
  }
  return (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>

      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  </div>
);
}
