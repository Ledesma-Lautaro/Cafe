import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-[86px]" />
        <Skeleton className="h-[86px]" />
        <Skeleton className="h-[86px]" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-56" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}