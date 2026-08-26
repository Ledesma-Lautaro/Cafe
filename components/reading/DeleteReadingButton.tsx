"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteReading } from "@/lib/actions/readings";
import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function DeleteReadingButton({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
        <Trash2 size={15} strokeWidth={2.5} aria-hidden />
        Eliminar
      </Button>
    );
  }

  return (
    <form
      action={deleteReading.bind(null, id)}
      className="flex flex-wrap items-center justify-end gap-2"
    >
      <p role="alert" className="text-sm font-bold">
        ¿Eliminar «{title}»?
      </p>
      <SubmitButton variant="danger" size="sm" pendingLabel="Eliminando…">
        Sí, eliminar
      </SubmitButton>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setConfirming(false)}
      >
        Cancelar
      </Button>
    </form>
  );
}