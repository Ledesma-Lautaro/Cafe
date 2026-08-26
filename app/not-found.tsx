
import Link from "next/link";
import { Compass } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";

export const metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <EmptyState
        icon={Compass}
        title="404 — No encontramos esta página"
        description="El enlace puede estar mal escrito o la página ya no existe."
        action={
          <Link href="/" className={buttonClasses()}>
            Ir al inicio
          </Link>
        }
      />
    </div>
  );
}