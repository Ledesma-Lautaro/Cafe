import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { MainNav, MobileNav, NewReadingFab } from "@/components/layout/MainNav";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { buttonClasses } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

export default async function UserLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const { role } = session.user;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-6 px-4 py-3">
          <Link href="/readings" className="flex items-center gap-2">
            <Logo />
            <span className="font-display text-lg leading-none">SOLAPA</span>
          </Link>

          <MainNav role={role} />

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/readings/new"
              className={buttonClasses({
                size: "sm",
                className: "hidden md:inline-flex",
              })}
            >
              <Plus size={16} strokeWidth={3} />
              Registrar lectura
            </Link>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8">
        {children}
      </main>

      <footer className="mt-16 border-t-2 border-ink">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-5 gap-y-2 px-4 pt-6 pb-28 text-sm text-ink-soft md:pb-6">
          <Link href="/" className="font-bold text-ink underline">
            Sobre el proyecto
          </Link>
          <a
            href="https://github.com/Ledesma-Lautaro/cafe"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-ink underline"
          >
            Código
          </a>
          <span className="ml-auto">Solapa</span>
        </div>
      </footer>

      <MobileNav role={role} />
      <NewReadingFab />
    </div>
  );
}
