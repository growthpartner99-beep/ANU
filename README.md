# Askwell

Askwell is an AI support chat widget for any website. This repo is a pnpm monorepo; see `Docs/project.md` for the product and `Docs/plan.md` for the build order.

Phase 0 is only the empty app: package skeletons, a minimal Next.js home page, and the deployment checks. Auth, database, billing, analytics and widget behaviour arrive in later phases.

## Layout

| Path             | What lives there                                     |
| ---------------- | ---------------------------------------------------- |
| `apps/web`       | Next.js App Router app: landing, dashboard, `/embed`, `/api` |
| `apps/widget`    | Vanilla TypeScript loader, bundled to one file       |
| `packages/shared`| Shared contract: `APP_NAME`, API types, plan limits  |
| `packages/db`    | Generated Supabase types and the pglite test helper  |
| `supabase/migrations` | SQL migrations with their RLS policies and grants |

## Local setup

Use Node.js 24 or newer and pnpm 10.

```bash
pnpm install
cp .env.example .env.local   # fill in values only when a phase needs them
pnpm dev                     # http://localhost:3000
```

`.env` is never committed. Only `.env.example` is tracked, with empty values.

## Commands

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `pnpm typecheck`  | TypeScript `strict` check in every package    |
| `pnpm lint`       | ESLint (Next.js configs) on the web app       |
| `pnpm test`       | Vitest across the workspace                   |
| `pnpm build`      | Turbo build of every package                  |
| `pnpm db:types`   | Regenerate Supabase types (Phase 1 onward)    |

## Vercel

Import the repo into Vercel with **Root Directory: `apps/web`** and the **Next.js** framework preset. Vercel detects the pnpm workspace from the lockfile; the install command is `pnpm install --frozen-lockfile`. Automatic production promotion stays **off**, every pull request gets a preview, and production builds come from `main`.

Protected previews need the `x-vercel-protection-bypass` header with `VERCEL_AUTOMATION_BYPASS_SECRET` (Vercel → Deployment Protection → Protection Bypass for Automation).
