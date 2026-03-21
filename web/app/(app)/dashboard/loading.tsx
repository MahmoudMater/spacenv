import { SpaceCardSkeleton } from "@/components/spaces/space-card-skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded bg-zinc-800" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-zinc-800" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <SpaceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
