import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SpaceCardSkeleton() {
  return (
    <Card className="border-zinc-800 bg-zinc-900 p-5">
      <div className="flex min-h-[140px] flex-col">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="size-4 shrink-0 rounded" />
        </div>
        <Skeleton className="mt-2 h-3 w-full max-w-[220px]" />
        <Skeleton className="mt-1 h-3 w-4/5 max-w-[180px]" />
        <div className="flex-1" />
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </Card>
  );
}
