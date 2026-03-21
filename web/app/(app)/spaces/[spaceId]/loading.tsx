import { ProjectCardSkeleton } from "@/components/projects/project-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SpaceLoading() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="size-9 shrink-0 rounded-lg" />
      </div>
      <Skeleton className="mb-6 h-4 w-32" />
      <div className="my-6 border-t border-zinc-800" />
      <div className="mb-4 flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
