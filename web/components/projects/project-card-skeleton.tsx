import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectCardSkeleton() {
  return (
    <Card className="border-zinc-800 bg-zinc-900 p-5">
      <div className="flex min-h-[160px] flex-col">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="size-4 shrink-0 rounded" />
        </div>
        <Skeleton className="mt-2 h-3 w-full max-w-[200px]" />
        <Skeleton className="mt-1 h-3 w-3/4 max-w-[160px]" />
        <div className="mt-3 flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex-1" />
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </Card>
  );
}
