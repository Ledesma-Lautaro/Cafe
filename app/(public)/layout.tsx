import Link from "next/link";
import { Trophy } from "lucide-react";
import { auth } from "@/auth";
import { buttonClasses } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b-2 border-ink">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-5 px-4 py-3">
          <Link href="/" className="font-display text-lg">
            SOLAPA
          </Link>
          <Link href="/stats" className="text-sm font-bold hover:text-ink-soft">
            Estadísticas
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {session?.user ? (
              <Link href="/readings" className={buttonClasses({ size: "sm" })}>
                Mis lecturas
              </Link>
            ) : (
              <Link
                href="/login"
                className={buttonClasses({ variant: "secondary", size: "sm" })}
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t-2 border-ink">
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-6 text-sm text-ink-soft">
          <Link href="/stats" className="font-bold text-ink underline">
            Estadísticas
          </Link>
          
          <a
            href="https://github.com/Ledesma-Lautaro/cafe"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-ink underline"
          >
            Código
          </a>
          <span className="ml-auto flex items-center gap-2">
            <Trophy size={16} strokeWidth={2.5} aria-hidden />
            SOLAPA — proyecto de portfolio
          </span>
        </div>
      </footer>
    </div>
  );
}