import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { AccessLevel, EnvironmentType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) {
    return "just now";
  }
  const min = Math.floor(sec / 60);
  if (min < 60) {
    return `${min}m ago`;
  }
  const h = Math.floor(min / 60);
  if (h < 24) {
    return `${h}h ago`;
  }
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export function getEnvTypeBadgeClass(type: EnvironmentType): string {
  switch (type) {
    case "PRODUCTION":
      return "bg-red-500/10 text-red-400 border border-red-500/20";
    case "STAGING":
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    case "DEVELOPMENT":
      return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    case "QC":
      return "bg-green-500/10 text-green-400 border border-green-500/20";
    case "OTHER":
    default:
      return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
  }
}

export function spaceDescriptionToString(description: unknown): string | null {
  if (typeof description !== "string") {
    return null;
  }
  const t = description.trim();
  return t.length > 0 ? t : null;
}

/** GitHub / repo URL from environment `githubRepo` (OpenAPI `type: object` in spec). */
export function githubRepoToUrl(repo: unknown): string | null {
  if (typeof repo === "string") {
    const t = repo.trim();
    return t.length > 0 ? t : null;
  }
  return null;
}

export function getEnvTypeLabel(type: EnvironmentType): string {
  switch (type) {
    case "PRODUCTION":
      return "Production";
    case "STAGING":
      return "Staging";
    case "DEVELOPMENT":
      return "Development";
    case "QC":
      return "QC";
    case "OTHER":
    default:
      return "Other";
  }
}

export function getAccessLevelLabel(level: AccessLevel): string {
  switch (level) {
    case "OWNER_ONLY":
      return "Owner only";
    case "WRITERS":
      return "Owner & writers";
    case "ALL":
      return "All members";
    default:
      return level;
  }
}
