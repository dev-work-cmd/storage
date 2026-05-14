# Stage 18: Security Hardening

## Status

- State: `Not started`
- Phase: `Phase 6 - Security, Audit, and Quality`
- Owner: `Unassigned`

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

- Start date:
- Finish date:
- Notes:
- Blockers:
- Follow-ups:
