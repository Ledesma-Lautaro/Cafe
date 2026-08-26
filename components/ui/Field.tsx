import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const controlClasses = cn(
  "w-full rounded-brutal border-2 border-ink bg-surface px-3 py-2",
  "placeholder:text-ink-soft",
  "disabled:bg-surface-alt disabled:text-ink-soft disabled:cursor-not-allowed",
  "aria-invalid:border-danger-text aria-invalid:bg-coral-soft",
);

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-ink-soft">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-bold text-danger-text">
          {error}
        </p>
      )}
    </div>
  );
}

type SharedProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
};

function describedBy({ id, hint, error }: SharedProps) {
  return cn(hint && `${id}-hint`, error && `${id}-error`) || undefined;
}

export function TextField({ id, label, hint, error, className, ...rest }: SharedProps &
  InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <input
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy({ id, label, hint, error })}
        className={cn(controlClasses, className)}
      />
    </Field>
  );
}

export function TextAreaField({ id, label, hint, error, className, ...rest }: SharedProps &
  TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <textarea
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy({ id, label, hint, error })}
        className={cn(controlClasses, className)}
      />
    </Field>
  );
}

export function SelectField({
  id,
  label,
  hint,
  error,
  className,
  children,
  ...rest
}: SharedProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <select
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy({ id, label, hint, error })}
        className={cn(controlClasses, className)}
      >
        {children}
      </select>
    </Field>
  );
}