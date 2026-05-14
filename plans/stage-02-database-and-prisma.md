# Stage 02: Database and Prisma

## Status

- State: `Done`
- Phase: `Phase 1 - Foundation and Trust`
- Owner: `Codex`

## Core focus

Introduce Prisma and the initial database schema on Supabase Postgres, including the owner bootstrap rule that decides whether `/setup` is allowed.

## Definition of done

- Prisma is configured and connected to Supabase Postgres.
- Initial schema contains `User`, `Passkey`, `Document`, and `AuditLog`.
- Migrations can run locally.
- No public seed users are created.
- A reusable server helper can determine whether an owner already exists.

## Deliverables

- `prisma/schema.prisma`
- migration files
- Prisma client setup
- owner existence guard helper

## Implementation note

- Supabase MCP may be used during setup, schema verification, or project inspection, but it is not part of the runtime application architecture.

## Implementation Prompt

You are implementing Stage 02 only.

Goals:

- Add Prisma to the repo and configure it for Supabase Postgres.
- Implement the models from the product brief with pragmatic adjustments only when required by Prisma or Better Auth integration.
- Keep username unique.
- Keep document ownership and audit relationships explicit.
- Create a server-side helper that answers:
  - does any owner user exist
  - should `/setup` be allowed
- Do not seed demo users.
- Prepare the schema for later access control, QR coordinates, counters, and encryption extension.

Constraints:

- Do not implement login routes yet.
- Do not create public registration.
- Keep schema names and field names close to the brief unless there is a strong implementation reason not to.
- Any enum-vs-string decision must be documented in code comments or notes.

## Tracking

- Start date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Added Prisma 7 configuration with prisma.config.ts, introduced the initial domain schema plus Better Auth support tables, generated the initial migration SQL, and added a server-only Prisma client plus owner bootstrap helper.`
- Blockers: `A real DATABASE_URL is still required in .env.local before running prisma migrate dev against a live local or remote Postgres instance.`
- Follow-ups: `Stage 03 can reuse Account, Session, Verification, and Passkey directly for Better Auth. If Supabase uses separate pooled and direct URLs later, add a dedicated direct migration URL in prisma.config.ts.`
