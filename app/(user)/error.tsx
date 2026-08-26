"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function UserError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      description="No pudimos cargar esta sección. Puede ser un problema momentáneo de la base de datos."
      digest={error.digest}
      onRetry={retry}
    />
  );
}