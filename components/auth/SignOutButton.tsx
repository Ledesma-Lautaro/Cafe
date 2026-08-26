import { signOut } from "@/auth";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="flex size-8 items-center justify-center rounded-brutal border-2 border-ink bg-surface text-ink hover:bg-coral hover:text-on-accent"
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <LogOut size={15} strokeWidth={2.5} />
      </button>
    </form>
  );
}