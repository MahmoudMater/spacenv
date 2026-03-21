import { SecretRowSkeleton } from "@/components/secrets/secret-row-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectLoading() {
  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden">
      <aside className="flex h-full w-56 shrink-0 flex-col overflow-y-auto border-r border-zinc-800 bg-zinc-950">
        <div className="px-3 py-3">
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="space-y-2 px-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="mt-auto px-3 py-3">
          <Skeleton className="mb-2 h-3 w-16" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="mt-2 h-8 w-full" />
        </div>
      </aside>
      <div
        className="w-px shrink-0 self-stretch border-r border-zinc-800"
        aria-hidden
      />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="border-b border-zinc-800 px-6 py-4">
          <div className="flex justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-72 max-w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        </div>
        <div className="mx-6 mt-4 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
          <div className="grid grid-cols-[1fr_1fr_auto] border-b border-zinc-800 px-4 py-2">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-10" />
            <div />
          </div>
          {Array.from({ length: 4 }, (_, i) => (
            <SecretRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
