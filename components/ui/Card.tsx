import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const TONES = {
  default: "bg-surface",
  muted: "bg-surface-alt",
  brand: "bg-brand-soft",
  coral: "bg-coral-soft",
  leaf: "bg-leaf-soft",
  sky: "bg-sky-soft",
} as const;

export function Card({
  as: Tag = "div",
  tone = "default",
  interactive = false,
  className,
  children,
}: {
  as?: "div" | "li" | "article" | "section";
  tone?: keyof typeof TONES;
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "rounded-brutal border-2 border-ink p-4 shadow-brutal",
        TONES[tone],
        interactive &&
          "transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg",
        className,
      )}
    >
      {children}
    </Tag>
  );
}