"use client";

import {
  FolderOpen,
  Plus,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { DeleteProjectConfirmModal } from "@/components/projects/delete-project-confirm-modal";
import { EditProjectModal } from "@/components/projects/edit-project-modal";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectCardSkeleton } from "@/components/projects/project-card-skeleton";
import { InviteMemberModal } from "@/components/spaces/invite-member-modal";
import { SpaceMembersPanel } from "@/components/spaces/space-members-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe, useProjects, useSpace } from "@/lib/hooks";
import { useUIStore } from "@/lib/stores";
import { cn, spaceDescriptionToString } from "@/lib/utils";

function queryErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: string }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "Something went wrong";
}

export default function SpacePage() {
  const params = useParams<{ spaceId: string }>();
  const spaceId = params.spaceId;

  const setActiveSpace = useUIStore((s) => s.setActiveSpace);
  const setActiveProject = useUIStore((s) => s.setActiveProject);
  const openCreateProject = useUIStore((s) => s.openCreateProject);
  const openInviteMember = useUIStore((s) => s.openInviteMember);

  const { data: user } = useMe();
  const spaceQuery = useSpace(spaceId);
  const projectsQuery = useProjects(spaceId);

  useEffect(() => {
    if (spaceId) {
      setActiveSpace(spaceId);
      setActiveProject(null);
    }
  }, [spaceId, setActiveSpace, setActiveProject]);

  if (!spaceId) {
    return null;
  }

  if (spaceQuery.isLoading) {
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

  if (spaceQuery.isError) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-300">{queryErrorMessage(spaceQuery.error)}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
            onClick={() => void spaceQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const space = spaceQuery.data;
  if (!space) {
    return null;
  }

  const desc = spaceDescriptionToString(space.description);
  const memberCount = space.members.length;
  const isOwner = user?.id === space.ownerId;
  const membership = user
    ? space.members.find((m) => m.userId === user.id)
    : undefined;
  const canWrite = isOwner || membership?.role === "WRITER";
  const yourRoleLabel = !user
    ? null
    : isOwner
      ? "Owner"
      : membership?.role === "WRITER"
        ? "Writer"
        : membership?.role === "VIEWER"
          ? "Viewer"
          : "Member";

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-white">
                {space.name}
              </h1>
              {yourRoleLabel ? (
                <span
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-xs font-medium",
                    isOwner
                      ? "border-amber-900/60 bg-amber-950/40 text-amber-200"
                      : membership?.role === "WRITER"
                        ? "border-zinc-700 bg-zinc-800/80 text-zinc-200"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400",
                  )}
                >
                  You: {yourRoleLabel}
                </span>
              ) : null}
            </div>
            {desc ? (
              <p className="mt-1 text-sm text-zinc-400">{desc}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isOwner ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
                  onClick={openInviteMember}
                >
                  <UserPlus className="mr-1.5 size-4" />
                  Invite
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    href={`/spaces/${spaceId}/settings`}
                    aria-label="Space settings"
                  >
                    <Settings className="size-4 text-zinc-300" />
                  </Link>
                </Button>
              </>
            ) : null}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Users className="size-4 shrink-0 text-zinc-500" aria-hidden />
          <span className="text-sm text-zinc-500">
            {memberCount} members
          </span>
        </div>
      </div>

      <SpaceMembersPanel
        spaceId={space.id}
        ownerId={space.ownerId}
        members={space.members}
        currentUserId={user?.id}
        isOwner={!!isOwner}
      />

      <div className="my-6 border-t border-zinc-800" />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-wider text-zinc-400 uppercase">
          Projects
        </h2>
        {canWrite ? (
          <Button
            type="button"
            onClick={openCreateProject}
            className="bg-white text-zinc-950 hover:bg-zinc-200"
          >
            <Plus className="mr-2 size-4" />
            New project
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projectsQuery.isLoading ? (
          Array.from({ length: 3 }, (_, i) => (
            <ProjectCardSkeleton key={i} />
          ))
        ) : projectsQuery.isError ? (
          <div className="col-span-full rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center">
            <p className="text-zinc-400">
              {queryErrorMessage(projectsQuery.error)}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
              onClick={() => void projectsQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : projectsQuery.data?.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <FolderOpen
              className="mx-auto mb-4 size-12 text-zinc-600"
              aria-hidden
            />
            <p className="text-zinc-400">No projects yet</p>
            <p className="mt-1 text-sm text-zinc-600">
              Create your first project
            </p>
          </div>
        ) : (
          projectsQuery.data?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              spaceId={spaceId}
              canWrite={canWrite}
            />
          ))
        )}
      </div>

      <CreateProjectModal />
      <InviteMemberModal />
      <EditProjectModal />
      <DeleteProjectConfirmModal />
    </div>
  );
}
