import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-brutal border-2 border-dashed border-ink bg-surface-alt px-6 py-10 text-center">
      <Icon size={32} strokeWidth={2.5} aria-hidden />
      <h3 className="text-heading">{title}</h3>
      {description && <p className="max-w-xs text-sm text-ink-soft">{description}</p>}
      {action}
    </div>
  );
}