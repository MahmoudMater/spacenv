/**
 * TypeScript types aligned with `api.yaml` (OpenAPI 3) — EnvSpace API.
 */

// ---------------------------------------------------------------------------
// Enums (OpenAPI string enums → union types)
// ---------------------------------------------------------------------------

export type EnvironmentType =
  | "PRODUCTION"
  | "STAGING"
  | "DEVELOPMENT"
  | "QC"
  | "OTHER";

/** Space membership role (project-level roles were removed from the API). */
export type SpaceRole = "VIEWER" | "WRITER";

export type AccessLevel = "OWNER_ONLY" | "WRITERS" | "ALL";

export type NotificationType =
  | "SPACE_INVITE"
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_DELETED"
  | "ENVIRONMENT_CREATED"
  | "ENVIRONMENT_UPDATED"
  | "ENVIRONMENT_DELETED"
  | "SECRETS_IMPORTED"
  | "SECRET_ADDED"
  | "SECRET_UPDATED"
  | "SECRET_DELETED";

// ---------------------------------------------------------------------------
// Response DTOs
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

/** GET `/auth/me` — session user (includes provider when present). */
export interface MeUser extends User {
  provider?: string | null;
  createdAt?: string;
}

/** From `GET /spaces` — how the current user relates to this space. */
export type SpaceViewerMembership = "OWNER" | "MEMBER";

export interface Space {
  id: string;
  name: string;
  description?: unknown;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  projectCount: number;
  viewerMembership: SpaceViewerMembership;
}

/** Space membership from `GET /spaces/{id}` → `members[]`. */
export interface SpaceMember {
  id: string;
  spaceId: string;
  userId: string;
  role: SpaceRole;
  invitedById: string | null;
  createdAt: string;
  user: User;
}

export interface Project {
  id: string;
  spaceId: string;
  name: string;
  description?: unknown;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  environmentCount?: number;
}

export interface Environment {
  id: string;
  projectId: string;
  name: string;
  type: EnvironmentType;
  description?: unknown;
  githubRepo?: unknown;
  createdAt: string;
  updatedAt: string;
  secretCount?: number;
}

export interface Secret {
  id: string;
  key: string;
}

export interface SecretReveal {
  value: string;
}

/**
 * Backend `metadata` JSON on notifications.
 * Always includes `message` for rows created by the current listener; older rows may omit it.
 */
export interface NotificationMetadata {
  message: string;
  /** Absolute app URL (e.g. invite or project page). */
  url?: string;
  /** Present for `SPACE_INVITE`. */
  token?: string;
  role?: SpaceRole;
  spaceName?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  secretKey?: string | null;
  actorName: string;
  projectId?: string | null;
  spaceId: string;
  environmentId?: string | null;
  metadata?: NotificationMetadata | null;
  read: boolean;
  createdAt: string;
}

export interface VisibilityRule {
  envType: EnvironmentType;
  access: AccessLevel;
}

export interface SpaceVisibilityRule {
  id: string;
  spaceId: string;
  envType: EnvironmentType;
  access: AccessLevel;
}

export interface SpaceDetail {
  id: string;
  name: string;
  description?: unknown;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  visibilityRules: SpaceVisibilityRule[];
  members: SpaceMember[];
}

export interface SpaceUpdated {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportSecretsResult {
  imported: number;
}

export interface MarkReadResult {
  updated: number;
}

export interface InviteSentResponse {
  sent: boolean;
  email: string;
}

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateSpacePayload {
  name: string;
  description?: string;
}

export interface UpdateSpacePayload {
  name?: string;
  description?: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
}

export interface CreateEnvironmentPayload {
  name: string;
  type: EnvironmentType;
  description?: string;
  githubRepo?: string;
}

export interface UpdateEnvironmentPayload {
  name?: string;
  description?: string;
  githubRepo?: string;
}

export interface ImportSecretsPayload {
  rawEnv: string;
}

export interface CreateSecretPayload {
  key: string;
  value: string;
}

export interface UpdateSecretPayload {
  value: string;
}

export interface UpdateVisibilityRulesPayload {
  rules: VisibilityRule[];
}

export interface InviteMemberPayload {
  email: string;
  role?: SpaceRole;
}

export interface UpdateSpaceMemberRolePayload {
  role: SpaceRole;
}

export interface AcceptInvitePayload {
  token: string;
}

export interface AuthResponse {
  user: User;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
