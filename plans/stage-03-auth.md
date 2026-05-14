# Stage 03: Auth

## Status

- State: `Done`
- Phase: `Phase 1 - Foundation and Trust`
- Owner: `Codex`

## Core focus

Implement owner-first authentication using username and password with optional passkey support, no email requirement, and no public signup.

## Definition of done

- `/setup` works only when no owner exists.
- `/setup` is blocked once the first owner exists.
- `/login` supports username and password.
- passkey registration works for authenticated users where appropriate
- passkey login is available
- dashboard routes are protected
- logout works
- login attempts are rate-limited and brute-force aware

## Deliverables

- Better Auth server configuration
- setup flow
- login flow
- logout action
- session guard middleware or route protection utilities

## Implementation Prompt

You are implementing Stage 03 only.

Goals:

- Integrate Better Auth for username-based auth without email.
- Implement `/setup`, `/login`, and protected dashboard access.
- Use secure `httpOnly` cookies.
- Support passkey registration and passkey login.
- Prevent public signup after first owner bootstrap.
- Allow future trusted-user creation by owner, but keep that creation flow out of scope unless required for auth shape.
- Add rate limiting and audit hooks for login success and failure.

Constraints:

- No email field required anywhere in the auth UX.
- No public registration route.
- Prefer server actions and route handlers consistent with Next.js 16 App Router.
- Keep the UX minimal and production-lean, not marketing-heavy.

## Tracking

- Start date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Integrated Better Auth with Prisma, username/password, passkey support, route handler, owner-only setup, login, logout, dashboard protection, login rate limiting, and auth audit hooks. Auth pages are marked dynamic so owner/session checks run at request time instead of during build.`
- Blockers: `Runtime testing against /setup and /login requires a real DATABASE_URL in .env.local and the Prisma migrations applied to that database.`
- Follow-ups: `Stage 04 can build public legal pages. Stage 05 should replace the temporary dashboard page with the planned dashboard shell while preserving requireCurrentSession.`
