# Secure PDF QR Replacement Platform Plan

This folder turns the product brief into an execution system for the current repo.

## Current repo baseline

- Next.js `16.2.6` with App Router
- React `19.2.4`
- Tailwind CSS v4
- `shadcn/ui` installed
- Supabase client packages installed
- Supabase MCP available for build-time project and database operations when useful
- Top-level `app/` layout is in use right now

## Planning rules

- Build strictly in stage order unless a stage file explicitly allows parallel prep work.
- Treat each stage markdown file as the working AI prompt for that implementation step.
- Update the status block inside a stage file when work starts or finishes.
- Keep the platform aligned with the core PDF rule: only the QR area may change in final PDF output.
- Prefer Next.js App Router conventions from the installed local docs in `node_modules/next/dist/docs/`.

## Suggested workflow

1. Open `plans/phases.md` to choose the current phase.
2. Open the matching `stage-XX-*.md` file.
3. Paste the `Implementation Prompt` section into the working thread if needed.
4. Build the stage.
5. Mark status, decisions, blockers, and follow-ups in that same file.

## Status legend

- `Not started`
- `In progress`
- `Blocked`
- `Done`

## File index

- `phases.md`: grouped roadmap and dependency map
- `stage-01-base-project-setup.md` through `stage-20-final-encryption-stage.md`: execution files
