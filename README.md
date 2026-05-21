# Secure PDF QR Storage Platform

This repository is a staged build of a secure PDF QR replacement platform. The app will let authenticated owners upload PDFs, identify an existing QR area, replace only that QR region with a newly generated app-hosted QR, and enforce verification, open, or download access through server-controlled routes.

The repo uses:

- Next.js `16.2.6` App Router
- React `19`
- TypeScript strict mode
- Tailwind CSS v4
- `shadcn/ui`
- Supabase client packages
- Prisma and PostgreSQL or Supabase Postgres

Stage 01 is intentionally foundation-only. It does not implement auth, database models, uploads, or PDF processing yet.

## Current structure

The repo deliberately keeps top-level `app/` and `lib/` folders. This matches the existing project shape and the plan documents, and avoids a needless `src/` migration before product work starts.

Key folders:

- `app/`: App Router routes, layouts, and route handlers
- `components/`: shared layout and presentational building blocks
- `features/`: feature-scoped UI, actions, schemas, and server orchestration
- `server/`: cross-feature server services such as auth, DB, PDF, QR, audit, rate limiting, and storage
- `plans/`: staged implementation prompts and repo rules

## Stage workflow

Implementation follows the plan files in `plans/`:

1. Read `plans/README.md`
2. Read `plans/phases.md`
3. Read the relevant stage file, for example `plans/stage-01-base-project-setup.md`
4. Read the relevant local Next.js docs from `node_modules/next/dist/docs/`
5. Implement only that stage
6. Update the stage tracking block

## Environment setup

Copy `.env.example` to `.env.local` and fill the values before working on runtime-backed stages:

```bash
cp .env.example .env.local
```

Required variables:

- `DATABASE_URL`
- `DIRECT_URL` for Prisma CLI commands when using Neon. In Vercel runtime,
  `DATABASE_URL` should be the pooled Neon connection string with `-pooler` in
  the host. `DIRECT_URL` should be the direct Neon connection string without
  `-pooler`.
- `NEXT_PUBLIC_APP_URL`
- `BETTER_AUTH_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_STORAGE_BUCKET_ORIGINAL`
- `SUPABASE_STORAGE_BUCKET_PROCESSED`
- `MAX_PDF_SIZE_MB`

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are included because browser-safe Supabase helpers need explicit public env keys.
- `lib/env.ts` performs strict server-side validation with Zod for the full env surface.
- Keep `.env*` files untracked.

## Installed baseline dependencies

Stage 01 adds the packages needed across stages 02 through 12:

- `@prisma/client` and `prisma`
- `better-auth`
- `zod`
- `pdfjs-dist`
- `jsqr`
- `react-rnd`
- `qrcode`
- `pdf-lib`
- `file-type`
- `server-only`

One operational note: `pnpm` blocked Prisma build scripts during install. Before running Prisma generate or migrations in Stage 02, approve the Prisma builds if your environment still requires it.

## Commands

```bash
pnpm dev
pnpm lint
pnpm exec tsc --noEmit
```

## Near-term stage map

- Stage 01: base setup, env validation, dependency audit
- Stage 02: Prisma schema and owner bootstrap guard
- Stage 03: Better Auth setup, owner bootstrap, login, protection
- Stage 04: public and legal pages
- Stage 05 to 12: dashboard, upload, preview, QR selection, access settings, QR generation, and PDF QR replacement

Refer to `plans/phases.md` for the full stage map through delivery, security hardening, testing, and final encryption.

## Product constraints

- Final processing must replace only the QR region, not re-render entire pages
- Raw storage URLs must never become the public access path
- Auth, DB, storage, PDF, QR, audit, and rate limiting logic must remain server-owned
- Public verification pages must not imply government or official approval
- Encryption claims stay out of product copy until the final encryption stage is actually implemented

## Reference documents

- `plans/README.md`
- `plans/phases.md`
- `plans/architecture.md`
- `plans/design-rules.md`
- `plans/security.md`
