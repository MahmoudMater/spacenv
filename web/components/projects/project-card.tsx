"use client";

import {
  ArrowRight,
  FolderOpen,
  MoreVertical,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenu } from "radix-ui";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUIStore } from "@/lib/stores";
import {
  cn,
  formatRelativeTime,
  getEnvTypeBadgeClass,
  getEnvTypeLabel,
  spaceDescriptionToString,
} from "@/lib/utils";
import type { EnvironmentType, Project } from "@/types";

const PLACEHOLDER_ENV_TYPES: EnvironmentType[] = [
  "PRODUCTION",
  "STAGING",
  "DEVELOPMENT",
];

export function ProjectCard({
  project,
  spaceId,
  canWrite,
}: {
  project: Project;
  spaceId: string;
  canWrite: boolean;
}) {
  const router = useRouter();
  const setActiveProject = useUIStore((s) => s.setActiveProject);
  const openEditProject = useUIStore((s) => s.openEditProject);
  const openDeleteProjectConfirm = useUIStore(
    (s) => s.openDeleteProjectConfirm,
  );
  const desc = spaceDescriptionToString(project.description);
  const members = project.memberCount ?? 0;

  function goToProject() {
    setActiveProject(project.id);
    router.push(`/projects/${project.id}`);
  }

  function handleOpenEdit(e: Event) {
    e.preventDefault();
    openEditProject({
      id: project.id,
      spaceId: project.spaceId,
      name: project.name,
      description: desc ?? "",
    });
  }

  function handleOpenDelete(e: Event) {
    e.preventDefault();
    openDeleteProjectConfirm({
      id: project.id,
      spaceId: project.spaceId,
      name: project.name,
    });
  }

  return (
    <Card
      data-space-id={spaceId}
      className={cn(
        "relative cursor-pointer border-zinc-800 bg-zinc-900 p-5 transition-all duration-150",
        "hover:border-zinc-700",
        "focus-within:ring-ring/50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-zinc-950",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={goToProject}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goToProject();
          }
        }}
        className={cn(
          "flex min-h-[160px] flex-col outline-none",
          "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        )}
      >
        <div className="flex items-start justify-between gap-2 pr-8">
          <h2 className="max-w-[180px] truncate text-sm font-medium text-white">
            {project.name}
          </h2>
          <ArrowRight
            className="size-4 shrink-0 text-zinc-600"
            aria-hidden
          />
        </div>
        {desc ? (
          <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{desc}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PLACEHOLDER_ENV_TYPES.map((type) => (
            <span
              key={type}
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                getEnvTypeBadgeClass(type),
              )}
            >
              {getEnvTypeLabel(type)}
            </span>
          ))}
        </div>
        <div className="flex-1" />
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Users className="size-3.5 shrink-0" aria-hidden />
            {members} members
          </span>
          <span className="text-xs text-zinc-600">
            {formatRelativeTime(project.createdAt)}
          </span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-10">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              aria-label={`Actions for ${project.name}`}
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              className="z-50 min-w-44 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-1 text-zinc-50 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            >
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-200 outline-none hover:bg-zinc-800 focus:bg-zinc-800"
                onSelect={goToProject}
              >
                <FolderOpen className="size-4 shrink-0 text-zinc-500" />
                Open
              </DropdownMenu.Item>
              {canWrite ? (
                <>
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-200 outline-none hover:bg-zinc-800 focus:bg-zinc-800"
                    onSelect={handleOpenEdit}
                  >
                    <Pencil className="size-4 shrink-0 text-zinc-500" />
                    Edit
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-300 outline-none hover:bg-zinc-800 focus:bg-zinc-800"
                    onSelect={handleOpenDelete}
                  >
                    <Trash2 className="size-4 shrink-0 text-red-400/80" />
                    Delete
                  </DropdownMenu.Item>
                </>
              ) : null}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </Card>
  );
}
