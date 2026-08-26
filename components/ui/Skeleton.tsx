import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-brutal bg-surface-alt", className)}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex flex-col gap-3 rounded-brutal border-2 border-ink bg-surface p-4 shadow-brutal",
        className,
      )}
    >
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-24" />
    </div>
  );
}