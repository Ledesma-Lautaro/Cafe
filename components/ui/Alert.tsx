import type { ReactNode } from "react";
import { CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

const TONES = {
  error: { tone: "bg-coral-soft", Icon: TriangleAlert, role: "alert" },
  success: { tone: "bg-leaf-soft", Icon: CheckCircle2, role: "status" },
  info: { tone: "bg-sky-soft", Icon: Info, role: "status" },
} as const;

export function Alert({
  tone = "info",
  className,
  children,
}: {
  tone?: keyof typeof TONES;
  className?: string;
  children: ReactNode;
}) {
  const { tone: toneClass, Icon, role } = TONES[tone];
  return (
    <div
      role={role}
      className={cn(
        "flex items-start gap-2 rounded-brutal border-2 border-ink p-3 text-sm",
        toneClass,
        className,
      )}
    >
      <Icon
        size={18}
        strokeWidth={2.5}
        className="mt-px shrink-0"
        aria-hidden
      />
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
