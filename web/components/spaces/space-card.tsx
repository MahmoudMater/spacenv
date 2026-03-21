"use client";

import {
  ArrowRight,
  ExternalLink,
  FolderOpen,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useUIStore } from "@/lib/stores";
import { cn, formatRelativeTime, spaceDescriptionToString } from "@/lib/utils";
import type { Space } from "@/types";

export function SpaceCard({ space }: { space: Space }) {
  const router = useRouter();
  const setActiveSpace = useUIStore((s) => s.setActiveSpace);
  const openEditSpace = useUIStore((s) => s.openEditSpace);
  const openDeleteSpaceConfirm = useUIStore((s) => s.openDeleteSpaceConfirm);

  const desc = spaceDescriptionToString(space.description);
  const isOwner = space.viewerMembership === "OWNER";

  function goToSpace() {
    setActiveSpace(space.id);
    router.push(`/spaces/${space.id}`);
  }

  function openEdit() {
    openEditSpace({
      id: space.id,
      name: space.name,
      description: desc ?? "",
    });
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card
          role="button"
          tabIndex={0}
          onClick={goToSpace}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              goToSpace();
            }
          }}
          className={cn(
            "cursor-pointer border-zinc-800 bg-zinc-900 p-5 transition-all duration-150",
            "hover:border-zinc-700",
            "focus-visible:ring-ring/50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
          )}
        >
          <div className="flex h-full min-h-[140px] flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="max-w-full truncate text-sm font-medium text-white">
                  {space.name}
                </h2>
                <span
                  className={cn(
                    "mt-1 inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
                    isOwner
                      ? "border-amber-900/60 bg-amber-950/40 text-amber-200"
                      : "border-zinc-700 bg-zinc-800/80 text-zinc-300",
                  )}
                >
                  {isOwner ? "Your space" : "Member"}
                </span>
              </div>
              <ArrowRight
                className="size-4 shrink-0 text-zinc-600"
                aria-hidden
              />
            </div>
            {desc ? (
              <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{desc}</p>
            ) : null}
            <div className="flex-1" />
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-3">
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <Users className="size-3.5 shrink-0" aria-hidden />
                  {space.memberCount} members
                </span>
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <FolderOpen className="size-3.5 shrink-0" aria-hidden />
                  {space.projectCount} projects
                </span>
              </div>
              <span className="text-xs text-zinc-600">
                {formatRelativeTime(space.createdAt)}
              </span>
            </div>
          </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="z-[100] min-w-44 border-zinc-800 bg-zinc-900 p-1 text-zinc-50 shadow-xl ring-1 ring-zinc-700/80">
        <ContextMenuItem
          className="flex cursor-pointer items-center gap-2 text-zinc-200 focus:bg-zinc-800 focus:text-white"
          onSelect={() => {
            goToSpace();
          }}
        >
          <ExternalLink className="size-4 text-zinc-500" />
          Open space
        </ContextMenuItem>
        {isOwner ? (
          <>
            <ContextMenuSeparator className="bg-zinc-800" />
            <ContextMenuItem
              className="flex cursor-pointer items-center gap-2 text-zinc-200 focus:bg-zinc-800 focus:text-white"
              onSelect={() => {
                openEdit();
              }}
            >
              <Pencil className="size-4 text-zinc-500" />
              Edit space
            </ContextMenuItem>
            <ContextMenuItem
              variant="destructive"
              className="flex cursor-pointer items-center gap-2 focus:bg-red-950/50 focus:text-red-200"
              onSelect={() => {
                openDeleteSpaceConfirm({
                  id: space.id,
                  name: space.name,
                });
              }}
            >
              <Trash2 className="size-4" />
              Delete space
            </ContextMenuItem>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}
