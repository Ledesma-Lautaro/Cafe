"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, User, Shield, Plus } from "lucide-react";
import type { Role } from "@/app/generated/prisma/enums";

const ITEMS = [
  { href: "/readings", label: "Lecturas", Icon: BookOpen, adminOnly: false },
  { href: "/profile", label: "Perfil", Icon: User, adminOnly: false },
  { href: "/admin", label: "Admin", Icon: Shield, adminOnly: true },
];

function useVisibleItems(role: Role) {
  return ITEMS.filter((item) => !item.adminOnly || role === "ADMIN");
}

/** Un ítem está activo también en sus rutas hijas:
 *  /readings/new y /readings/[id]/edit marcan "Lecturas". */
function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav({ role }: { role: Role }) {
  const items = useVisibleItems(role);
  const isActive = useIsActive();

  return (
    <nav aria-label="Principal" className="hidden md:flex md:items-center md:gap-5">
      {items.map(({ href, label }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className="relative py-1 font-bold hover:text-ink-soft"
          >
            {/* El trazo de marcador va detrás del texto, no debajo. */}
            {active && (
              <span
                aria-hidden
                className="absolute inset-x-[-4px] bottom-0.5 h-2.5 -rotate-1 bg-brand"
              />
            )}
            <span className="relative">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({ role }: { role: Role }) {
  const items = useVisibleItems(role);
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="flex">
        {items.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center gap-1 py-2.5"
              >
                <Icon size={22} strokeWidth={2.5} />
                <span className="relative text-xs font-bold">
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-[-4px] bottom-0 h-2 -rotate-1 bg-brand"
                    />
                  )}
                  <span className="relative">{label}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** El "+" flotante de tus referencias. Solo mobile: en desktop
 *  la misma acción vive como botón en el header. */
export function NewReadingFab() {
  return (
    <Link
      href="/readings/new"
      aria-label="Registrar lectura"
      className="fixed bottom-20 right-4 z-40 flex size-14 items-center justify-center rounded-full border-2 border-ink bg-brand text-on-accent shadow-brutal transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-brutal-sm md:hidden"
    >
      <Plus size={26} strokeWidth={3} />
    </Link>
  );
}