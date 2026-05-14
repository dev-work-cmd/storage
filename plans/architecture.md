# Architecture Rules

This document defines the implementation rules for this repo so the codebase stays consistent, current, and maintainable.

## Source of truth

- Prefer official documentation first.
- For Next.js, use the local docs in `node_modules/next/dist/docs/` before relying on memory.
- Prefer current official docs for Supabase, Prisma, Better Auth, React, Tailwind, `shadcn/ui`, and pdf-related libraries.
- Do not introduce patterns copied from outdated blog posts if they conflict with official docs or the installed package version.

## Baseline architecture

- Framework: Next.js App Router only.
- Routing: use `app/` route segments, layouts, loading states, error boundaries, and route handlers.
- Data ownership: server-first.
- UI ownership: shared layouts and shared components first, route-specific components second.
- Business logic: move out of pages and components into typed server modules.
- Validation: Zod at every server boundary.

## Keep the current repo shape

Use top-level `app/` and `lib/` because the repo already starts there. Do not migrate to `src/` unless there is a strong and current reason.

Preferred structure:

```txt
app/
  (public)/
  (auth)/
  dashboard/
  verify/
  api/
components/
  ui/
  layout/
  shared/
features/
  auth/
    actions/
    components/
    schemas/
    server/
    types/
  documents/
    actions/
    components/
    schemas/
    server/
    types/
server/
  auth/
  db/
  services/
    access/
    audit/
    pdf/
    qr/
    rate-limit/
    storage/
lib/
  env.ts
  utils.ts
  constants.ts
```

## Responsibility boundaries

- `app/`: route entry points, layouts, metadata, route handlers, page composition.
- `components/ui/`: base presentational components, usually `shadcn/ui` wrappers or safe extensions.
- `components/layout/`: app shell, section shells, headers, footers, sidebars.
- `components/shared/`: reusable components shared across multiple features.
- `features/*/components/`: feature-specific UI that should not leak into unrelated areas.
- `features/*/actions/`: server actions for that feature only.
- `features/*/schemas/`: Zod schemas and input parsing.
- `features/*/server/`: feature-specific orchestration that depends on app business rules.
- `server/services/*`: cross-feature server services such as PDF replacement, storage access, audit logging, and rate limiting.
- `server/db/`: Prisma client and database helpers.
- `server/auth/`: auth integration and guards.
- `lib/`: low-level shared utilities, env parsing, constants, and framework-agnostic helpers.

## Server-first rules

- Default to Server Components.
- Use Client Components only for interactivity, browser APIs, drag-and-drop, PDF preview canvas, passkey browser flows, or UI state that truly requires the client.
- Never call route handlers from Server Components just to reach server logic. Import the server module directly instead.
- Keep database access and storage access in server-only modules.
- Treat server actions as thin input-to-service adapters, not places for large business workflows.

## Shared layout rules

- Use route groups for separation without changing URLs.
- Put public pages in a shared public layout.
- Put auth routes in a narrow auth layout.
- Put all dashboard routes behind one dashboard layout with shared navigation and page chrome.
- Avoid duplicating headers, spacing wrappers, container widths, or breadcrumbs across pages.

## Shared component rules

- Use `shadcn/ui` primitives as the default base layer for shared UI components and extend them consistently.
- If a pattern appears in 2 or more routes, extract it.
- If a component is tightly bound to one feature’s state or schema, keep it inside that feature.
- Prefer composition over prop explosion.
- Avoid “god components” that fetch data, validate input, manage mutations, and render complex UI in one file.

## Naming rules

- File names: kebab-case for files and folders.
- Component names: PascalCase.
- Utility and service functions: camelCase.
- Zod schemas: `SomethingSchema`.
- Parsed types: `SomethingInput`, `SomethingFormValues`, `SomethingResult`.
- Server actions: verb-first, for example `createDocument`, `processDocument`, `loginWithPassword`.
- Route handler files: `route.ts`.
- Layout files: `layout.tsx`.
- Loading files: `loading.tsx`.
- Error boundaries: `error.tsx` and `global-error.tsx`.

## Component size and file size rules

- Target 200 to 300 lines max per component file.
- Split earlier when a file mixes rendering, state, domain logic, and helpers.
- Keep page files thin. They should compose feature modules, not implement the whole feature inline.
- Put long option maps, copy blocks, or schema constants in separate modules when they make a file noisy.

## Comment rules

Each non-trivial component or server module should start with a short explanatory comment that states:

- what the module owns
- why it exists
- any important constraint

Example:

```ts
// Owns the QR selection overlay for PDF preview pages.
// Keeps preview-space and PDF-space coordinates aligned.
// Must stay client-side because it depends on drag and resize browser events.
```

Rules:

- Comments explain intent and constraints, not obvious syntax.
- Avoid noisy comments on every function.
- Keep comments current or remove them.

## Data flow rules

- Parse input with Zod at the boundary.
- Convert raw input into a typed internal shape once.
- Pass typed objects into services.
- Return explicit success or error results from server workflows.
- Do not leak raw third-party SDK responses across the app.

## Dependency rules

- Add a dependency only when the built-in platform or an existing package cannot solve the problem well.
- Prefer mature libraries with active official docs and a clear maintenance story.
- Before adding a package:
  - check official docs
  - confirm compatibility with Next.js 16 and React 19
  - confirm it is still maintained
  - avoid duplicate capability with an existing dependency
- Remove dead dependencies instead of accumulating them.

## Forms and mutations

- Use server actions for app mutations unless a route handler is clearly the better interface.
- Keep client forms thin.
- Validate on the server even if the client already validates.
- Surface user-facing errors in a controlled format.

## Mobile-first rules

- Design mobile first, then scale up.
- Start layout decisions at narrow widths.
- Avoid desktop-only assumptions for tables, controls, or preview areas.
- Any wide dashboard surface must have a small-screen fallback strategy before implementation is considered done.

## Performance rules

- Minimize client boundaries.
- Lazy load heavy client-only modules where appropriate, especially PDF preview and QR detection UI.
- Avoid unnecessary global providers.
- Avoid fetching the same data repeatedly across nested routes.
- Use shared layouts and server data composition to reduce duplication.

## Error handling rules

- Add route-level `loading.tsx` and `error.tsx` where the UX benefits.
- Never expose stack traces or raw internal errors to users.
- Use typed error messages for recoverable failures.
- Log sensitive failures on the server, not in the client console alone.

## Anti-spaghetti checklist

Before merging a stage, confirm:

- the route file is thin
- the feature owns its own schemas and UI
- shared patterns are extracted once
- business logic is not duplicated
- no component is doing too many jobs
- file names and folders match existing naming rules
- server and client boundaries are explicit
- the implementation matches current official docs
