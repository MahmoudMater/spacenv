"use client";

import { FolderInput, Plus, UserPlus } from "lucide-react";

import { MemberItem } from "@/components/environments/member-item";
import { EnvTabItem } from "@/components/environments/env-tab-item";
import { Button } from "@/components/ui/button";
import {
  useEnvironments,
  useMe,
  useProject,
  useSpace,
} from "@/lib/hooks";
import { useUIStore } from "@/lib/stores";

export function EnvTabsSidebar({ projectId }: { projectId: string }) {
  const openCreateEnv = useUIStore((s) => s.openCreateEnv);
  const openPasteEnv = useUIStore((s) => s.openPasteEnv);
  const openInviteMember = useUIStore((s) => s.openInviteMember);
  const activeEnvironmentId = useUIStore((s) => s.activeEnvironmentId);

  const { data: user } = useMe();
  const projectQuery = useProject(projectId);
  const spaceId = projectQuery.data?.spaceId;
  const spaceQuery = useSpace(spaceId);
  const environmentsQuery = useEnvironments(projectId);

  const space = spaceQuery.data;
  const members = space?.members ?? [];
  const isSpaceOwner =
    user?.id != null && space != null && user.id === space.ownerId;
  const membership = members.find((m) => m.userId === user?.id);
  const isWriter = isSpaceOwner || membership?.role === "WRITER";

  const environments = environmentsQuery.data ?? [];
  const shownMembers = members.slice(0, 5);
  const moreCount = Math.max(0, members.length - 5);

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col overflow-y-auto bg-zinc-950">
      <div className="flex-1">
        <div className="flex items-center justify-between px-3 py-3">
          <span className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
            Environments
          </span>
          {isWriter ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0 text-zinc-400 hover:text-white"
              aria-label="Create environment"
              onClick={openCreateEnv}
            >
              <Plus className="size-4" />
            </Button>
          ) : null}
        </div>
        <div className="flex flex-col">
          {environments.length === 0 ? (
            <p className="px-3 text-xs text-zinc-600">No environments</p>
          ) : (
            environments.map((env) => (
              <EnvTabItem
                key={env.id}
                environment={env}
                isActive={env.id === activeEnvironmentId}
              />
            ))
          )}
        </div>
        {isWriter ? (
          <Button
            type="button"
            variant="ghost"
            className="mt-1 h-auto w-full justify-start gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200"
            onClick={openPasteEnv}
          >
            <FolderInput className="size-3.5 shrink-0" />
            Paste .env file
          </Button>
        ) : null}
      </div>

      <div className="my-3 border-t border-zinc-800" />

      <div>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
            Space members
          </span>
          {isSpaceOwner ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-zinc-400 hover:text-white"
              aria-label="Invite space member"
              onClick={openInviteMember}
            >
              <UserPlus className="size-4" />
            </Button>
          ) : null}
        </div>
        <div className="flex flex-col pb-3">
          {spaceQuery.isLoading ? (
            <p className="px-3 text-xs text-zinc-600">Loading…</p>
          ) : shownMembers.length === 0 ? (
            <p className="px-3 text-xs text-zinc-600">No members</p>
          ) : (
            shownMembers.map((m) => <MemberItem key={m.id} member={m} />)
          )}
          {moreCount > 0 ? (
            <p className="px-3 pt-1 text-xs text-zinc-600">
              +{moreCount} more
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
