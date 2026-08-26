"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "system" | "dark";

const OPTIONS = [
  { value: "light", label: "Tema claro", Icon: Sun },
  { value: "system", label: "Seguir al sistema", Icon: Monitor },
  { value: "dark", label: "Tema oscuro", Icon: Moon },
] as const;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Theme {
  const applied = document.documentElement.getAttribute("data-theme");
  return applied === "light" || applied === "dark" ? applied : "system";
}

function getServerSnapshot(): Theme {
  return "system";
}

function applyTheme(next: Theme) {
  const root = document.documentElement;

  if (next === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", next);
  }
  try {
    if (next === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", next);
    }
  } catch {}
  for (const listener of listeners) {
    listener();
  }
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

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
          onClick={() => applyTheme(value)}
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
