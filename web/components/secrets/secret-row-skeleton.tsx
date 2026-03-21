import { Skeleton } from "@/components/ui/skeleton";

export function SecretRowSkeleton() {
  return (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-3 border-b border-zinc-800 px-4 py-3 last:border-0">
      <Skeleton className="h-5 w-full max-w-[200px]" />
      <Skeleton className="h-5 w-full max-w-[240px]" />
      <div className="flex items-center gap-1">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="size-8 rounded-md" />
      </div>
    </div>
  );
}
