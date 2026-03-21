"use client";

import type { SpaceMember } from "@/types";

export function MemberItem({ member }: { member: SpaceMember }) {
  const label =
    member.user?.name?.trim() ||
    member.user?.email ||
    `${member.userId.slice(0, 8)}…`;

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1.5">
      <span className="min-w-0 truncate text-xs text-zinc-400" title={label}>
        {label}
      </span>
      <span className="shrink-0 text-[10px] font-medium tracking-wide text-zinc-500 uppercase">
        {member.role}
      </span>
    </div>
  );
}
