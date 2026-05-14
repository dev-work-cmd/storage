# Stage 05: Dashboard Shell

## Status

- State: `Done`
- Phase: `Phase 2 - Dashboard and Intake`
- Owner: `Codex`

## Core focus

Establish the authenticated dashboard frame and summary surface so later document workflows have a stable home.

## Definition of done

- Protected dashboard layout exists
- sidebar exists
- topbar exists
- summary cards exist
- recent documents section exists
- upload CTA exists

## Deliverables

- dashboard layout
- navigation shell
- placeholder analytics cards backed by real or stub-safe data

## Implementation Prompt

You are implementing Stage 05 only.

Goals:

- Create a minimal black/white dashboard shell using `shadcn/ui`.
- Include:
  - sidebar
  - topbar
  - total documents
  - processed documents
  - failed documents
  - scan count
  - recent documents
  - upload new document button
- Use real database reads where the underlying schema already exists.
- Keep loading and empty states clean.

Constraints:

- Do not build the upload form yet.
- Avoid overdesigned admin UI. Keep it crisp and utilitarian.
- Preserve a structure that can scale into nested dashboard routes.

## Tracking

- Start date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Added protected dashboard layout, sidebar, topbar, upload CTA, real owner-scoped document metrics, recent document empty/list states, and shared button/card primitives.`
- Blockers: `None.`
- Follow-ups: `Build /dashboard/documents/new upload workflow in Stage 06; the CTA intentionally points to that future route.`
