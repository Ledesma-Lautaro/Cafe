import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-[104px] w-full" />
      <div className="flex flex-col gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}