import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ErrorState({
  title = "Algo salió mal",
  description,
  digest,
  onRetry,
}: {
  title?: string;
  description?: string;
  digest?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-brutal border-2 border-ink bg-coral-soft px-6 py-10 text-center shadow-brutal"
    >
      <TriangleAlert size={32} strokeWidth={2.5} aria-hidden />
      <div className="flex flex-col gap-1">
        <h2 className="text-heading">{title}</h2>
        {description && <p className="max-w-sm text-sm">{description}</p>}
      </div>
      {onRetry && <Button onClick={onRetry}>Reintentar</Button>}

      {digest && (
        <p className="font-mono text-xs text-ink-soft">Código: {digest}</p>
      )}
    </div>
  );
}
