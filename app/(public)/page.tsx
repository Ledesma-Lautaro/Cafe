import Link from "next/link";
import { BookOpen, Coffee, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

const STEPS = [
  {
    Icon: BookOpen,
    title: "Registrá lo que leés",
    body: "Buscás el libro por título y los datos se completan solos desde Google Books.",
  },
  {
    Icon: Coffee,
    title: "Sumá puntos",
    body: "Cada lectura y cada consumo en el café suman. Los puntos desbloquean logros.",
  },
  {
    Icon: Sparkles,
    title: "Descubrí el próximo",
    body: "El recomendador compara tu historial con el catálogo y te sugiere cinco libros.",
  },
];

export default async function Home() {
  const session = await auth();

  return (


      <main className="mx-auto flex w-full max-w-4xl flex-col gap-20 px-4 py-16">
        <section className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -right-6 top-4 size-24 rounded-full border-2 border-ink bg-brand" />
            <div className="absolute right-24 top-32 size-12 rotate-12 border-2 border-ink bg-coral" />
            <div className="absolute -right-2 top-52 size-16 -rotate-6 rounded-brutal border-2 border-ink bg-sky" />
          </div>

          <div className="relative flex max-w-2xl flex-col gap-6">
            <Badge tone="brand" className="self-start">
              <Link href="/readings" className="flex items-center gap-2">
                <Logo />
                <span className="font-display text-lg leading-none">
                  SOLAPA
                </span>
              </Link>
            </Badge>

            <h1 className="text-display">
              Leé, sumá puntos y descubrí{" "}
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute inset-x-[-6px] bottom-1 h-4 -rotate-1 bg-brand"
                />
                <span className="relative">tu próximo libro</span>
              </span>
              .
            </h1>

            <p className="max-w-lg text-lg text-ink-soft">
              Un programa de fidelidad para una cafetería con biblioteca:
              registrás tus lecturas, cada consumo suma, y un recomendador te
              sugiere qué leer después según lo que ya leíste.
            </p>

            <div className="flex flex-wrap gap-3">
              {session?.user ? (
                <Link href="/readings" className={buttonClasses()}>
                  Ir a mis lecturas
                </Link>
              ) : (
                <>
                  <Link href="/register" className={buttonClasses()}>
                    Crear cuenta
                  </Link>
                  <Link
                    href="/login"
                    className={buttonClasses({ variant: "secondary" })}
                  >
                    Ya tengo cuenta
                  </Link>
                </>
              )}
            </div>

            {!session?.user && (
              <Card tone="muted" className="max-w-sm text-sm">
                <p className="font-bold">Probalo sin registrarte</p>
                <p className="mt-1 text-ink-soft">
                  Usuario <code className="font-mono">demo@ejemplo.com</code> ·
                  contraseña <code className="font-mono">···</code>
                </p>
              </Card>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-title">Cómo funciona</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {STEPS.map(({ Icon, title, body }, i) => (
              <Card as="li" key={title} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-brand font-display text-on-accent"
                  >
                    {i + 1}
                  </span>
                  <Icon size={20} strokeWidth={2.5} aria-hidden />
                </div>
                <h3 className="text-heading">{title}</h3>
                <p className="text-sm text-ink-soft">{body}</p>
              </Card>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-title">El recomendador</h2>
            <p className="max-w-2xl text-ink-soft">
              Cada libro se representa como un vector de 384 dimensiones
              generado desde su título, autor, género y sinopsis. Las
              recomendaciones salen de comparar tu historial contra el catálogo
              por similitud coseno, ponderando por cómo puntuaste cada libro.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card tone="brand" className="text-center">
              <p className="font-display text-title">5,8×</p>
              <p className="text-xs font-bold">mejor que el azar</p>
            </Card>
            <Card className="text-center">
              <p className="font-display text-title">0,56</p>
              <p className="text-xs font-bold">recall@5</p>
            </Card>
            <Card className="text-center">
              <p className="font-display text-title">384</p>
              <p className="text-xs font-bold">dimensiones</p>
            </Card>
          </div>

          <Card tone="sky" className="text-sm">
            <p>
              Las métricas salen de un harness propio de evaluación{" "}
              <em>leave-one-out</em> sobre los usuarios con tres o más lecturas.
              Los usuarios de demostración son sintéticos y con gustos
              coherentes a propósito, así que{" "}
              <strong>los números son probablemente optimistas</strong> respecto
              de usuarios reales.
            </p>
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-title">Sobre el proyecto</h2>
          <Card tone="muted" className="flex flex-col gap-3 text-sm">
            <p>
              Proyecto de portfolio. El punto de venta está{" "}
              <strong>simulado a propósito</strong>: las compras las carga un
              administrador desde un panel, no una caja registradora real.
            </p>
            <p>
              El catálogo es colaborativo: cualquier persona registrada puede
              agregar libros, y esos libros afectan las recomendaciones de
              todos.
            </p>
            <div>
              <a
                href="https://github.com/Ledesma-Lautaro/cafe"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "secondary", size: "sm" })}
              >
                Ver el código
              </a>
            </div>
          </Card>
        </section>
      </main>



  );
}
