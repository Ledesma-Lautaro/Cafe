"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "system" | "dark";

const OPTIONS = [
  { value: "light", label: "Tema claro", Icon: Sun },
  { value: "system", label: "Seguir al sistema", Icon: Monitor },
  { value: "dark", label: "Tema oscuro", Icon: Moon },
] as const;

export function ThemeToggle() {
  // Arranca en null: el servidor no puede saber la preferencia guardada.
  // Leerla en el render inicial rompería la hidratación.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const applied = document.documentElement.dataset.theme;
    setTheme(applied === "light" || applied === "dark" ? applied : "system");
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    const root = document.documentElement;
    if (next === "system") {
      delete root.dataset.theme;
    } else {
      root.dataset.theme = next;
    }
    try {
      if (next === "system") {
        localStorage.removeItem("theme");
      } else {
        localStorage.setItem("theme", next);
      }
    } catch {
      // Sin persistencia: el tema igual se aplica en esta sesión.
    }
  }

  return (
    <div
      role="group"
      aria-label="Tema"
      className="flex overflow-hidden rounded-brutal border-2 border-ink"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => apply(value)}
          aria-pressed={theme === value}
          aria-label={label}
          title={label}
          className={`flex size-8 items-center justify-center border-ink not-last:border-r-2 ${
            theme === value
              ? "bg-brand text-on-accent"
              : "bg-surface text-ink hover:bg-surface-alt"
          }`}
        >
          <Icon size={15} strokeWidth={2.5} />
        </button>
      ))}
    </div>
  );
}