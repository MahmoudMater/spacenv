"use client";

import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkAllRead,
  useNotifications,
  useUnreadCount,
} from "@/lib/hooks";

import { NotificationItem } from "./notification-item";

export function NotificationDropdown() {
  const { data: notifications, isLoading } = useNotifications();
  const unreadCount = useUnreadCount();
  const markAllRead = useMarkAllRead();

  const items = (notifications ?? []).slice(0, 20);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
        <span className="text-sm font-medium text-zinc-100">Notifications</span>
        {unreadCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-auto px-2 py-1 text-xs text-zinc-400 hover:text-white"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all read
          </Button>
        ) : null}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-zinc-500">
            <Bell className="size-8 opacity-50" />
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800/80">
            {items.map((n) => (
              <li key={n.id}>
                <NotificationItem notification={n} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
