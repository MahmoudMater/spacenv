# EnvSpace Frontend — Agent Rules

## Read before writing any code
- Read `node_modules/next/dist/docs/` for the current Next.js API before using any Next.js feature
- Fetch `http://localhost:4000/yaml` for the API spec before writing any API call
- Never assume — verify the actual file contents before editing

## Project context
- Product: EnvSpace — secure shared .env manager for dev teams
- Backend: NestJS at http://localhost:4000/api/v1
- Auth: custom JWT in httpOnly cookies (NO Clerk, NO NextAuth)
- Dark mode only — never add light mode styles

## Stack rules
- Next.js 15 App Router only — no pages/ directory
- TypeScript strict — zero `any` types, zero ignored TS errors
- Tailwind CSS for all styling — no inline style objects except where Tailwind cannot reach
- shadcn/ui for all base components — never build a button, input, or dialog from scratch
- Zustand for UI state and modal state only
- TanStack Query v5 for all server state — no useState for API data
- axios with withCredentials: true for all HTTP calls
- lucide-react for all icons — no other icon library

## File conventions
- All client components must have 'use client' as the very first line
- All server components have no directive (default in App Router)
- One component per file — filename matches the component name in kebab-case
- Export components as named exports, not default exports, except for page.tsx and layout.tsx files
- Types live in types/index.ts — never define types inline in component files
- API calls live in lib/api/ — never call axios directly from a component or hook
- React Query hooks live in lib/hooks/ — never call API functions directly from components

## Component rules
- Never use useEffect to fetch data — use React Query hooks
- Never store server data in useState — use React Query hooks
- Never call API functions directly from components — always through hooks
- Modals are controlled by Zustand ui.store — never by local useState
- The revealed secret value lives in secrets.store only — never in component state

## Naming conventions
- Hooks: use-[noun].ts (e.g. use-spaces.ts)
- Stores: [noun].store.ts (e.g. ui.store.ts)
- API modules: [noun].ts inside lib/api/ (e.g. spaces.ts)
- Components: [noun]-[descriptor].tsx in kebab-case (e.g. space-card.tsx)
- Pages: page.tsx (Next.js convention)

## Security rules
- Never log secret values to the console
- Never store secret plaintext in localStorage or sessionStorage
- Never put secret values in URL parameters
- The only place a decrypted secret value may exist is in secrets.store.ts in memory
- Copy-to-clipboard must call the reveal API then write to clipboard — never show the value in UI

## Error handling
- Every mutation must have onError with toast.error showing the API error message
- Every query should handle loading and error states in the UI
- API errors come back as { statusCode, message, error } — always display the message field

## Do not
- Do not install new packages without listing them in the report
- Do not create new files outside the established folder structure without explaining why
- Do not use React context for anything — use Zustand
- Do not use the pages/ router
- Do not hardcode the API URL — always use process.env.NEXT_PUBLIC_API_URL
- Do not add comments explaining what code does — write self-documenting code