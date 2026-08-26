import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const VARIANTS = {
  primary:   "border-ink bg-brand text-on-accent shadow-brutal-sm",
  secondary: "border-ink bg-surface text-ink shadow-brutal-sm hover:bg-surface-alt",
  danger:    "border-ink bg-coral text-on-accent shadow-brutal-sm",
  ghost:     "border-transparent text-ink hover:bg-surface-alt",
} as const;

const SIZES = {
  sm: "gap-1.5 px-3 py-1.5 text-sm",
  md: "gap-2 px-4 py-2.5",
} as const;

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-brutal border-2 font-bold transition",
    "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button({
  variant,
  size,
  isLoading = false,
  className,
  disabled,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  isLoading?: boolean;
}) {
  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={buttonClasses({ variant, size, className })}
    >
      {isLoading && <Loader2 size={16} strokeWidth={3} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}