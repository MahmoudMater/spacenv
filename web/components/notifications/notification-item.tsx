"use client";

import {
  Bell,
  FolderMinus,
  FolderPlus,
  Mail,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useMarkOneRead } from "@/lib/hooks";
import { parseNotificationMetadata } from "@/lib/notification-metadata";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types";

function legacyVerb(type: NotificationType): string {
  switch (type) {
    case "SECRET_ADDED":
      return "added";
    case "SECRET_UPDATED":
      return "updated";
    case "SECRET_DELETED":
      return "deleted";
    case "ENVIRONMENT_CREATED":
      return "created";
    case "ENVIRONMENT_DELETED":
      return "deleted";
    case "ENVIRONMENT_UPDATED":
      return "updated";
    case "SECRETS_IMPORTED":
      return "imported secrets in";
    case "PROJECT_CREATED":
      return "created";
    case "PROJECT_UPDATED":
      return "updated";
    case "PROJECT_DELETED":
      return "deleted";
    case "SPACE_INVITE":
      return "invited you";
    default:
      return "";
  }
}

function NotificationTypeIcon({ type }: { type: NotificationType }) {
  const wrap =
    "flex size-7 shrink-0 items-center justify-center rounded-md [&_svg]:size-3.5";
  switch (type) {
    case "SPACE_INVITE":
      return (
        <div className={cn(wrap, "bg-violet-500/10 text-violet-300")}>
          <Mail />
        </div>
      );
    case "SECRET_ADDED":
      return (
        <div className={cn(wrap, "bg-green-500/10 text-green-400")}>
          <Plus />
        </div>
      );
    case "SECRET_UPDATED":
      return (
        <div className={cn(wrap, "bg-amber-500/10 text-amber-400")}>
          <Pencil />
        </div>
      );
    case "SECRET_DELETED":
      return (
        <div className={cn(wrap, "bg-red-500/10 text-red-400")}>
          <Trash2 />
        </div>
      );
    case "ENVIRONMENT_CREATED":
      return (
        <div className={cn(wrap, "bg-blue-500/10 text-blue-400")}>
          <FolderPlus />
        </div>
      );
    case "ENVIRONMENT_UPDATED":
      return (
        <div className={cn(wrap, "bg-sky-500/10 text-sky-400")}>
          <Pencil />
        </div>
      );
    case "ENVIRONMENT_DELETED":
      return (
        <div className={cn(wrap, "bg-red-500/10 text-red-400")}>
          <FolderMinus />
        </div>
      );
    case "SECRETS_IMPORTED":
      return (
        <div className={cn(wrap, "bg-emerald-500/10 text-emerald-400")}>
          <Upload />
        </div>
      );
    case "PROJECT_CREATED":
    case "PROJECT_UPDATED":
    case "PROJECT_DELETED":
      return (
        <div className={cn(wrap, "bg-zinc-500/10 text-zinc-300")}>
          <Bell />
        </div>
      );
    default:
      return (
        <div className={cn(wrap, "bg-zinc-500/10 text-zinc-400")}>
          <Bell />
        </div>
      );
  }
}

function navigateFromUrl(
  router: ReturnType<typeof useRouter>,
  url: string | undefined,
  fallbackProjectId: string | undefined,
) {
  if (url) {
    try {
      const base =
        typeof window !== "undefined" ? window.location.origin : "http://localhost";
      const u = new URL(url, base);
      router.push(`${u.pathname}${u.search}${u.hash}`);
      return;
    } catch {
      /* fall through */
    }
  }
  if (fallbackProjectId) {
    router.push(`/projects/${fallbackProjectId}`);
  }
}

export function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  const router = useRouter();
  const markOneRead = useMarkOneRead();
  const meta = parseNotificationMetadata(notification.metadata);

  const displayText =
    meta?.message ??
    (() => {
      const verb = legacyVerb(notification.type);
      const ctx = notification.secretKey ?? "";
      return `${notification.actorName} ${verb}${ctx ? ` ${ctx}` : ""}`.trim();
    })();

  async function handleClick() {
    await markOneRead.mutateAsync(notification.id);
    navigateFromUrl(router, meta?.url, notification.projectId ?? undefined);
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      className={cn(
        "flex w-full cursor-pointer gap-3 px-3 py-2.5 text-left hover:bg-zinc-800/50",
        notification.read
          ? "border-l-2 border-transparent pl-2.5"
          : "border-l-2 border-blue-500 bg-zinc-900/50 pl-2.5",
      )}
    >
      <NotificationTypeIcon type={notification.type} />
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-snug text-zinc-200">{displayText}</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </button>
  );
}
