# Spacenv

Spacenv is a single-repository product for managing shared `.env` values across teams.

- `backend/`: NestJS API with PostgreSQL (Prisma), cookie-based auth, encryption, invites, and notifications
- `web/`: Next.js App Router frontend with TanStack Query + Zustand

This root README is execution-focused.  
For system internals, roles, and architecture diagrams, see `CONTEXT.md`.

## Repository Layout

- `backend/`: API, domain services, Prisma schema/migrations
- `web/`: UI, hooks, API client modules, app routes
- `gaps.md`: known gaps and follow-up backlog

## Prerequisites

- Node.js 20+
- npm
- Docker + Docker Compose (for local Postgres/Redis)

## Environment Setup

### Backend

1. Copy `backend/.env.example` to `backend/.env`.
2. Fill required values:
   - `DATABASE_URL`
   - `MASTER_ENCRYPTION_KEY`
   - JWT secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, optional `JWT_INVITE_SECRET`)
   - `COOKIE_SECRET`
   - OAuth values if using Google/GitHub login
3. Keep `FRONTEND_URL` aligned with the frontend URL (default: `http://localhost:3000`).

### Frontend

Create `web/.env`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## Local Development

### 1) Start infrastructure

```bash
cd /home/mahmoudmatter/personal-projects/spacenv/backend
docker compose up -d
```

### 2) Run backend

```bash
cd /home/mahmoudmatter/personal-projects/spacenv/backend
npx prisma migrate dev
npm run start:dev
```

### 3) Run frontend

```bash
cd /home/mahmoudmatter/personal-projects/spacenv/web
npm run dev
```

## Main URLs

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API base: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- Swagger UI: [http://localhost:4000/docs](http://localhost:4000/docs)
- OpenAPI YAML (runtime): [http://localhost:4000/yaml](http://localhost:4000/yaml)
- OpenAPI snapshot in repo: `/home/mahmoudmatter/personal-projects/spacenv/web/api.yaml`
- Health check: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

## Common Commands

### Backend (`backend/`)

```bash
npm run start:dev
npm run build
npm run test
npm run lint
```

### Frontend (`web/`)

```bash
npm run dev
npm run build
npm run lint
npm run type-check
```

## Database Workflow (Prisma)

From `backend/`:

```bash
npx prisma migrate dev
npx prisma generate
npx prisma studio
```

## API Contract Notes

- Canonical generated contract is served by backend at `/yaml`.
- `web/api.yaml` is a checked-in snapshot used in frontend work. Keep it synced when backend contracts change.

## Troubleshooting

- **Cannot log in / session not persisting**
  - Ensure frontend and backend URLs match `FRONTEND_URL` and `NEXT_PUBLIC_API_URL`.
  - Ensure requests include credentials (frontend axios client is configured with `withCredentials: true`).
- **DB connection fails**
  - Verify Docker Postgres is up and `DATABASE_URL` matches actual host/port.
  - Run `docker compose ps` inside `backend/`.
- **403 on production-like environments**
  - Check space role (`OWNER`/`WRITER`/`VIEWER`) and space visibility rules by env type (`OWNER_ONLY` / `WRITERS` / `ALL`).
- **Invite links not working**
  - Check `JWT_INVITE_SECRET` consistency and `FRONTEND_URL`.

## Related Docs

- Deep architecture and flows: `CONTEXT.md`
- Current known gaps/backlog: `gaps.md`
- Frontend implementation conventions: `web/AGENTS.md`
