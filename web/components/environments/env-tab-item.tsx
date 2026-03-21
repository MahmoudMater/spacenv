"use client";

import { useUIStore } from "@/lib/stores";
import { cn, getEnvTypeBadgeClass, getEnvTypeLabel } from "@/lib/utils";
import type { Environment } from "@/types";

export function EnvTabItem({
  environment,
  isActive,
}: {
  environment: Environment;
  isActive: boolean;
}) {
  const setActiveEnvironment = useUIStore((s) => s.setActiveEnvironment);
  const secretCount = environment.secretCount ?? 0;

  return (
    <button
      type="button"
      onClick={() => setActiveEnvironment(environment.id)}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded-none border-l-2 px-3 py-2 text-left text-sm transition-colors",
        isActive
          ? "border-white bg-zinc-800/80 text-white"
          : "border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-xs",
          getEnvTypeBadgeClass(environment.type),
        )}
      >
        {getEnvTypeLabel(environment.type)}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">
        {environment.name}
      </span>
      <span className="shrink-0 text-xs text-zinc-600">{secretCount}</span>
    </button>
  );
}
