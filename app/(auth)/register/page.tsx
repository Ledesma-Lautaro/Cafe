"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TextField } from "@/components/ui/Field";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";

type FieldErrors = { email?: string; password?: string; name?: string };

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!success) {
      return;
    }
    const timeout = setTimeout(() => router.push("/login"), 3000);
    return () => clearTimeout(timeout);
  }, [success, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });

      if (res.ok) {
        setSuccess(true);
        return;
      }

      const data = await res.json();

      if (res.status === 409) {
        setFieldErrors({ email: "Ya existe una cuenta con ese email." });
      } else if (res.status === 400) {
        const zod = data.error?.fieldErrors ?? {};
        setFieldErrors({
          email: zod.email ? "Ingresá un email válido." : undefined,
          password: zod.password ? "La contraseña necesita al menos 8 caracteres." : undefined,
          name: zod.name ? "El nombre no puede estar vacío." : undefined,
        });
      } else {
        setError("Ocurrió un error inesperado. Intentá de nuevo más tarde.");
      }
    } catch {
      setError("No se pudo conectar con el servidor. Intentá de nuevo más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <Card className="flex flex-col gap-4">
        <h1 className="text-title">Cuenta creada</h1>
        <Alert tone="success">Ya podés iniciar sesión. Te llevamos en unos segundos…</Alert>
        <Link href="/login" className={buttonClasses({ className: "w-full" })}>
          Ir a iniciar sesión
        </Link>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-5">
      <h1 className="text-title">Crear cuenta</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          id="name"
          label="Nombre"
          hint="Opcional. Es el nombre que se muestra en tu perfil."
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <TextField
          id="password"
          label="Contraseña"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          hint="Al menos 8 caracteres."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>

      <p className="text-sm text-ink-soft">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-bold text-ink underline">
          Ingresá
        </Link>
      </p>
    </Card>
  );
}