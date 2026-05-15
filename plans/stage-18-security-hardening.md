# Stage 18: Security Hardening

## Status

- State: `Done`
- Phase: `Phase 6 - Security, Audit, and Quality`
- Owner: `Codex`

## Core focus

Harden routes, request handling, headers, validation, error handling, and operational boundaries before broader use.

## Definition of done

- route protection is complete
- rate limits exist for login and uploads
- secure headers and CSP are set
- error boundaries and safe server errors exist
- loading and empty states are in place
- public versus protected route boundaries are explicit

## Deliverables

- middleware or proxy protections where appropriate
- rate-limit services
- security headers configuration
- error boundaries

## Implementation Prompt

You are implementing Stage 18 only.

Goals:

- Add:
  - route protection
  - upload throttling
  - login throttling
  - secure headers
  - CSP
  - server-side validation everywhere
  - no stack trace leakage to end users
  - error boundaries
  - loading states
  - empty states
- Keep public:
  - `/verify/*`
  - `/api/documents/[publicId]/file`
- Keep protected:
  - `/dashboard/*`
  - `/api/admin/*`
  - `/api/documents/process`
- Optionally leave notes for future IP restriction or private-admin-network controls.

Constraints:

- Align implementation with Next.js 16 App Router patterns.
- Avoid security theater; each control must map to a real risk.

## Tracking

- Start date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Hardened protected route boundaries with Next.js 16 proxy coverage for /dashboard and /api/dashboard, added restrictive security headers and CSP via next.config.ts, disabled caching on protected/API file routes, added global and dashboard App Router error boundaries, and sanitized several action-layer/server error responses so internal exception details are not shown to end users.`
- Blockers: `CSP is intentionally compatibility-first for the current Next.js/App Router runtime and should be tightened further if inline script/style requirements are reduced later. In-memory rate limiting remains process-local and should move to durable storage for multi-instance deployment.`
- Follow-ups: `Stage 19 should add automated checks around proxy protection, security headers, and sanitized error responses. A future hardening pass can replace in-memory rate limits with Redis or Postgres-backed counters and add admin-network/IP controls if deployment requires them.`
