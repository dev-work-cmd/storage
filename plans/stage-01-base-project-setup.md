# Stage 01: Base Project Setup

## Status

- State: `Done`
- Phase: `Phase 1 - Foundation and Trust`
- Owner: `Codex`

## Core focus

Audit the existing scaffold and installed packages, fill the missing dependencies, normalize the project structure for Next.js 16 App Router work, and establish environment validation and developer documentation.

## Inputs already true

- Next.js, React, Tailwind v4, Supabase client packages, and `shadcn/ui` are already installed.
- Supabase MCP is available if needed for setup verification or later database workflows.
- The repo currently uses top-level `app/` and `lib/` folders instead of `src/`.

## Definition of done

- All required dependencies for stages 02 to 12 are installed.
- `README.md` reflects the actual product direction and setup steps.
- `.env.example` exists and matches the expected env surface.
- `lib/env.ts` or `src/lib/env.ts` validates required env vars with Zod.
- Folder conventions are chosen deliberately for this repo and documented.
- No broken imports or baseline lint errors remain from setup changes.

## Deliverables

- dependency audit
- `.env.example`
- environment schema module
- updated README
- initial feature and server folder skeleton

## Implementation Prompt

You are implementing Stage 01 only.

Work inside this existing Next.js 16.2.6 App Router repo. Respect the local Next.js docs in `node_modules/next/dist/docs/`.

Goals:

- Audit what is already installed.
- Add only missing packages from the master brief.
- Decide whether to keep top-level `app/` or migrate to `src/`; prefer the smallest safe change for this repo.
- Create `.env.example` with:
  - `DATABASE_URL=`
  - `NEXT_PUBLIC_APP_URL=`
  - `BETTER_AUTH_SECRET=`
  - `SUPABASE_URL=`
  - `SUPABASE_SERVICE_ROLE_KEY=`
  - `SUPABASE_ANON_KEY=`
  - `SUPABASE_STORAGE_BUCKET_ORIGINAL=original-pdfs`
  - `SUPABASE_STORAGE_BUCKET_PROCESSED=processed-pdfs`
  - `MAX_PDF_SIZE_MB=10`
- Add strict env validation with Zod in `lib/env.ts` unless the repo is intentionally migrated to `src/lib/env.ts`.
- Create minimal folder scaffolding for:
  - auth
  - documents
  - server services
  - shared UI/layout
- Update README so another engineer can boot the project and understand the stage plan.

Constraints:

- Do not implement auth logic yet.
- Do not implement database models yet.
- Keep setup changes production-oriented, not demo-oriented.
- Prefer App Router route handlers over legacy API routes.

## Tracking

- Start date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Kept the existing top-level app/lib structure, added Zod env validation, documented the required env surface, normalized Supabase public env key names, and installed the baseline packages needed through stage 12.`
- Blockers: `Prisma install completed, but pnpm blocked Prisma build scripts pending local approval.`
- Follow-ups: `Approve Prisma build scripts before Stage 02 migrations if your environment still requires it, then introduce the Prisma schema and DB helper modules.`
