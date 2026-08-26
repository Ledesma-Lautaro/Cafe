import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <Link href="/readings" className="flex items-center gap-2">
        <Logo />
        <span className="font-display text-lg leading-none">SOLAPA</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
