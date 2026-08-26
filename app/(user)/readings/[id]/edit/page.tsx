import Link from "next/link";
import { BookX } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";

export default function ReadingNotFound() {
  return (
    <EmptyState
      icon={BookX}
      title="Esa lectura no existe"
      description="Puede que la hayas eliminado, o que el enlace apunte a la lectura de otra persona."
      action={
        <Link href="/readings" className={buttonClasses()}>
          Volver a mis lecturas
        </Link>
      }
    />
  );
}