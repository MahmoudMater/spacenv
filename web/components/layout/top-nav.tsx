"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, DropdownMenu, Separator } from "radix-ui";

import { NotificationBell } from "@/components/layout/notification-bell";
import { Button } from "@/components/ui/button";
import { projectKeys, spaceKeys } from "@/lib/hooks";
import { useLogout } from "@/lib/hooks/use-auth";
import { useAuthStore, useUIStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import type { Project, SpaceDetail } from "@/types";

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

function NavBreadcrumb() {
  const queryClient = useQueryClient();
  const activeSpaceId = useUIStore((s) => s.activeSpaceId);
  const activeProjectId = useUIStore((s) => s.activeProjectId);

  const space =
    activeSpaceId != null
      ? queryClient.getQueryData<SpaceDetail>(spaceKeys.detail(activeSpaceId))
      : undefined;
  const project =
    activeProjectId != null
      ? queryClient.getQueryData<Project>(projectKeys.detail(activeProjectId))
      : undefined;

  if (!activeSpaceId) {
    return null;
  }

  const spaceName = space?.name ?? "Space";
  const projectName = project?.name;

  return (
    <nav
      className="flex min-w-0 items-center gap-1 overflow-hidden"
      aria-label="Breadcrumb"
    >
      <ChevronRight className="size-4 text-zinc-600" aria-hidden />
      <Link
        href={`/spaces/${activeSpaceId}`}
        className={cn(
          "text-sm",
          activeProjectId ? "text-zinc-400 hover:text-zinc-200" : "text-white",
        )}
      >
        {spaceName}
      </Link>
      {activeProjectId && projectName ? (
        <>
          <ChevronRight className="size-4 text-zinc-600" aria-hidden />
          <Link
            href={`/projects/${activeProjectId}`}
            className="text-sm text-white"
          >
            {projectName}
          </Link>
        </>
      ) : null}
    </nav>
  );
}

export function TopNav() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const initials =
    user != null ? getInitials(user.name, user.email) : "?";
  const displayName =
    user != null ? (user.name?.trim() || user.email) : "";

  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex h-12 w-full items-center border-b border-zinc-800 bg-zinc-950">
      <div className="flex w-full items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/dashboard"
            className="shrink-0 font-mono text-sm font-semibold text-white"
          >
            EnvSpace
          </Link>
          <NavBreadcrumb />
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Separator.Root
            orientation="vertical"
            decorative
            className="h-4 w-px shrink-0 bg-zinc-800"
          />
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full text-zinc-200 hover:bg-zinc-800"
                aria-label="User menu"
              >
                <Avatar.Root className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-xs font-medium text-white">
                  {user?.avatarUrl ? (
                    <Avatar.Image
                      src={user.avatarUrl}
                      alt=""
                      className="size-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                  <Avatar.Fallback className="flex size-full items-center justify-center rounded-full">
                    {initials}
                  </Avatar.Fallback>
                </Avatar.Root>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-40 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-1 text-zinc-50 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
              >
                <div className="px-2 py-2">
                  <p className="truncate text-sm font-medium text-zinc-100">
                    {displayName}
                  </p>
                  {user?.name?.trim() ? (
                    <p className="truncate text-xs text-zinc-500">{user.email}</p>
                  ) : null}
                </div>
                <DropdownMenu.Separator className="my-1 h-px bg-zinc-800" />
                <DropdownMenu.Item
                  className="cursor-pointer rounded-md px-2 py-1.5 text-sm text-zinc-200 outline-none hover:bg-zinc-800 focus:bg-zinc-800"
                  onSelect={() => logout.mutate()}
                >
                  Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}
