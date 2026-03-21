# EnvSpace / Spacenv — known gaps & follow-ups

Use this file when finishing the frontend, then circle back to close items.  
**Last reviewed:** backend + `web/` tree (space-level roles, in-app notifications with `metadata.message` / `metadata.url`, no project members, no email queue).

---

## 1. Backend — product & behavior (not implemented)

These are intentional or deferred server behaviors; none block basic CRUD.

| Gap | Notes |
|-----|--------|
| **No notifications for space admin actions** | Space rename/description update, space delete, visibility rule changes, and removing a space member do **not** emit in-app notifications. |
| **No notification when invite is accepted** | Invitee gets `SPACE_INVITE` before joining; other members are not notified when someone accepts. |
| **Invite sender = owner only** | `POST /spaces/:id/invite` is **owner-only**. If writers should invite, relax `assertOwner` in `spaces.service.ts`. |
| **Environment visibility rules** | `SpaceVisibilityRule` can hide env **types** (e.g. production) from **VIEWER**s. Stricter than “every member sees everything.” Decide if that stays. |
| **No real-time delivery** | Notifications are **DB + polling** (`GET /notifications`). No WebSocket/SSE for live updates. |
| **Stale links after delete** | `PROJECT_DELETED` notifications may still carry `metadata.url` to `/projects/{id}` after the project is gone (404). UI can branch on `type`. |
| **i18n** | All `metadata.message` strings are **English** only in `notification.listener.ts`. |

---

## 2. Frontend (`web/`) — recently addressed (keep for regression checks)

The following were **implemented** in the web app (see `types/`, `lib/api/`, `components/`):

- Space members from `GET /spaces/:id` (shared React Query cache via `useSpace` / `useSpaceMembers`); **project member** API usage removed.
- **`SpaceRole`**, **`NotificationMetadata`**, full **`NotificationType`**, optional notification fields.
- **Notifications**: `metadata.message` + `metadata.url` via `lib/notification-metadata.ts` and updated `notification-item.tsx` (legacy fallback if `message` missing).
- **Invite modal**: in-app copy + **role** selector; **`InviteSentResponse`** typed invite API.
- **`/invite/[token]`** page: auth gate, login/register with `redirect`, accept mutation, redirect to **`/spaces/{id}`**.
- **`environmentsApi.update`** + **`useUpdateEnvironment`** hook (no UI surface yet — see below).

**Still open on frontend:**

| Gap | Notes |
|-----|--------|
| **Environment edit UI** | `PATCH /environments/:id` is wired in API + `useUpdateEnvironment` but **no modal or form** to edit env name/description/repo. |
| **Assign-member UI store** | `ui.store.ts` still has `isAssignMemberOpen` / `openAssignMember` (unused). Remove when cleaning dead state. |
| **`api.yaml` drift** | Partially updated (`NotificationResponseDto`, etc.). Re-sync from backend Swagger when contracts change. |

---

## 3. Cross-cutting

| Gap | Notes |
|-----|--------|
| **Database migrations** | Ensure `prisma/migrations/*space_roles*` (and prior) are applied on every environment before relying on `SpaceMember.role` and new `NotificationType` values. |
| **E2E / API tests** | No systematic coverage found for invite flow, notification payloads, or role-gated project create. Add when stabilizing contracts. |
| **`init-instructions.md` / internal docs** | May still describe `ProjectMember`; update when touching docs. |

---

## 4. Suggested order after frontend MVP

1. Fix **broken project-member** calls and **notification** rendering (`metadata` + new types).  
2. Ship **invite** page + modal (**role** + accurate copy).  
3. Sync **`types/`** and optionally **`web/api.yaml`**.  
4. Add **environment update** UI if needed.  
5. Return here for **backend gaps** in §1 (space notifications, writer invites, accept notification, i18n, push).

---

## 5. Quick API reference (current backend)

- **Prefix:** `/api/v1`  
- **Auth:** httpOnly cookies, `credentials: 'include'`  
- **Membership:** space-only; **`SpaceMember.role`**: `VIEWER` | `WRITER`; **owner** always full access.  
- **Mutations (projects/envs/secrets):** generally **owner or space WRITER** (+ env visibility for read/write on secrets).  
- **Invite:** `POST /spaces/:id/invite` `{ email, role? }` → in-app `SPACE_INVITE` with `metadata.message`, `metadata.url`, `token`, …  
- **Accept:** `POST /invites/accept` `{ token }`  

---

*End of gaps list — edit this file as items are completed.*
