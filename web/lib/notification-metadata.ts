import type { NotificationMetadata, SpaceRole } from "@/types";

function isSpaceRole(v: unknown): v is SpaceRole {
  return v === "VIEWER" || v === "WRITER";
}

/**
 * Parses API `notification.metadata` into a typed shape.
 * Falls back to null if `message` is missing (legacy or malformed rows).
 */
export function parseNotificationMetadata(
  raw: unknown,
): NotificationMetadata | null {
  if (raw === null || raw === undefined || typeof raw !== "object") {
    return null;
  }
  const m = raw as Record<string, unknown>;
  if (typeof m.message !== "string" || m.message.length === 0) {
    return null;
  }
  const meta: NotificationMetadata = { message: m.message };
  if (typeof m.url === "string" && m.url.length > 0) {
    meta.url = m.url;
  }
  if (typeof m.token === "string") {
    meta.token = m.token;
  }
  if (isSpaceRole(m.role)) {
    meta.role = m.role;
  }
  if (typeof m.spaceName === "string") {
    meta.spaceName = m.spaceName;
  }
  return meta;
}
