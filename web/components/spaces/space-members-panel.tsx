"use client";

import { Trash2 } from "lucide-react";
import { Avatar } from "radix-ui";

import { Button } from "@/components/ui/button";
import {
  useRemoveSpaceMember,
  useUpdateSpaceMemberRole,
} from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { SpaceMember } from "@/types";

function getInitials(name: string | null, email: string): string {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0]?.[0];
      const b = parts[parts.length - 1]?.[0];
      if (a && b) {
        return `${a}${b}`.toUpperCase();
      }
    }
    return trimmed.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function sortMembers(members: SpaceMember[], ownerId: string): SpaceMember[] {
  return [...members].sort((a, b) => {
    const ao = a.userId === ownerId ? 0 : 1;
    const bo = b.userId === ownerId ? 0 : 1;
    if (ao !== bo) {
      return ao - bo;
    }
    const an = (a.user.name || a.user.email).toLowerCase();
    const bn = (b.user.name || b.user.email).toLowerCase();
    return an.localeCompare(bn);
  });
}

function roleLabel(member: SpaceMember, ownerId: string): string {
  if (member.userId === ownerId) {
    return "Owner";
  }
  return member.role === "WRITER" ? "Writer" : "Viewer";
}

export function SpaceMembersPanel({
  spaceId,
  ownerId,
  members,
  currentUserId,
  isOwner,
}: {
  spaceId: string;
  ownerId: string;
  members: SpaceMember[];
  currentUserId: string | undefined;
  isOwner: boolean;
}) {
  const removeMember = useRemoveSpaceMember(spaceId);
  const updateRole = useUpdateSpaceMemberRole(spaceId);
  const sorted = sortMembers(members, ownerId);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="text-sm font-medium tracking-wider text-zinc-400 uppercase">
        Members
      </h2>
      <ul className="mt-3 divide-y divide-zinc-800">
        {sorted.map((m) => {
          const isSpaceOwner = m.userId === ownerId;
          const initials = getInitials(m.user.name, m.user.email);
          const canManage =
            isOwner && !isSpaceOwner && m.userId !== currentUserId;

          return (
            <li
              key={m.id}
              className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <Avatar.Root className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-xs font-medium text-white">
                {m.user.avatarUrl ? (
                  <Avatar.Image
                    src={m.user.avatarUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : null}
                <Avatar.Fallback className="flex size-full items-center justify-center">
                  {initials}
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-100">
                  {m.user.name?.trim() || m.user.email}
                </p>
                {m.user.name?.trim() ? (
                  <p className="truncate text-xs text-zinc-500">{m.user.email}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {canManage ? (
                  <select
                    aria-label={`Role for ${m.user.email}`}
                    value={m.role}
                    disabled={updateRole.isPending}
                    onChange={(e) => {
                      const role = e.target.value as "VIEWER" | "WRITER";
                      updateRole.mutate({
                        userId: m.userId,
                        payload: { role },
                      });
                    }}
                    className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-xs text-white outline-none focus:ring-2 focus:ring-zinc-600"
                  >
                    <option value="WRITER">Writer</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                ) : (
                  <span
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs font-medium",
                      isSpaceOwner
                        ? "border-amber-900/60 bg-amber-950/40 text-amber-200"
                        : m.role === "WRITER"
                          ? "border-zinc-700 bg-zinc-800/80 text-zinc-200"
                          : "border-zinc-800 bg-zinc-950 text-zinc-400",
                    )}
                  >
                    {roleLabel(m, ownerId)}
                  </span>
                )}
                {canManage ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
                    aria-label={`Remove ${m.user.email}`}
                    disabled={removeMember.isPending}
                    onClick={() => removeMember.mutate(m.userId)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
