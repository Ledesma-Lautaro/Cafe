import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const TONES = {
  neutral: "bg-surface-alt text-ink",
  brand: "bg-brand text-on-accent",
  leaf: "bg-leaf text-on-accent",
  coral: "bg-coral text-on-accent",
  sky: "bg-sky text-on-accent",
} as const;

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: keyof typeof TONES;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-bold",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}