# Master Build Prompt

You are building this project inside the existing repo and must follow the repo planning and rule documents exactly.

## Project context

- This is a Next.js `16.2.6` App Router app using React `19`, TypeScript strict, Tailwind CSS v4, `shadcn/ui`, Supabase, Prisma, and PostgreSQL or Supabase Postgres.
- `shadcn/ui` is already installed.
- Supabase client packages are already installed.
- Supabase MCP may be available for build-time setup or verification, but it is not part of runtime architecture.
- The repo currently uses top-level `app/` and `lib/`, not `src/`.

## Mandatory rule files to follow before coding

- `plans/README.md`
- `plans/phases.md`
- `plans/architecture.md`
- `plans/design-rules.md`
- `plans/security.md`
- the current stage file under `plans/stage-XX-*.md`

## Critical Next.js instruction

- This is not generic older Next.js.
- Before writing code, read the relevant local official docs from `node_modules/next/dist/docs/`.
- Prefer official docs and current package docs over memory or blog-post patterns.

## Build rules

- Follow the current stage only. Do not skip ahead.
- Keep code modular and avoid spaghetti code.
- Use App Router conventions: layouts, route groups, route handlers, loading states, and error boundaries.
- Prefer Server Components by default.
- Use Client Components only when interactivity or browser APIs require them.
- Use shared layouts and shared components when patterns repeat.
- Use `shadcn/ui` primitives as the base UI layer.
- Keep folder structure clear and naming consistent.
- Add a short explanatory comment at the top of each non-trivial component or server module explaining:
  - what it owns
  - why it exists
  - important constraints
- Keep components small when possible, ideally under 200 to 300 lines.
- Validate all external input on the server with Zod.
- Keep business logic out of page files and UI components.
- Use server-only modules for auth, DB, storage, PDF, QR, audit, access-control, and rate-limiting logic.
- Never expose secrets, raw storage URLs, or privileged server logic to the client.
- Mobile-first always.
- Keep UI minimal, premium, restrained, and consistent with `plans/design-rules.md`.
- Follow `plans/security.md` strictly to reduce abuse and prevent unsafe patterns.

## Working pattern

1. Read the current stage file and summarize the exact scope.
2. Read the relevant official Next.js docs from `node_modules/next/dist/docs/`.
3. Audit the existing repo structure before changing anything.
4. Implement only what the stage requires.
5. Reuse shared components and layouts where appropriate.
6. Keep route files thin and move logic into feature and server modules.
7. After coding, run the relevant checks if available.
8. Update the stage file tracking section:
   - state
   - notes
   - blockers
   - follow-ups

## Output expectations

- First, briefly state what stage is being implemented.
- Then implement the work directly.
- Do not give only a plan unless explicitly asked.
- If something is missing or conflicts with the current repo, make the smallest safe change and explain why.
- If an assumption is necessary, state it clearly and keep it conservative.

## Stage placeholder

Paste the contents of the current stage file here, or reference the exact stage file path being implemented.

## Product goal

Build a secure PDF QR replacement platform where authenticated users upload PDFs, detect or manually select the QR area, generate a new QR, replace only the QR region using `pdf-lib`, store the processed PDF, and enforce owner-controlled access via verification, open, and download flows without changing any other visible PDF content.
