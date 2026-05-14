# Security Rules

This document defines the security baseline for the platform. The goal is to reduce abuse, protect private documents, and avoid fragile or performative security decisions.

## Security principles

- Default deny, then open only what is required.
- Server-side enforcement always wins.
- Validate every external input.
- Keep secrets server-only.
- Log meaningful security events.
- Avoid exposing raw storage URLs, internal identifiers, or sensitive implementation details.

## Official guidance first

- Follow current official docs for Next.js App Router security-related patterns.
- For Next.js, pay attention to authentication, server actions, data security, route handlers, and CSP guidance from the installed docs.
- Do not ship security patterns copied from outdated blog posts without verifying against official docs.

## Access model

- Public:
  - `/`
  - `/disclaimer`
  - `/privacy`
  - `/terms`
  - `/verify/[publicId]`
  - `/api/documents/[publicId]/file`
- Protected:
  - `/dashboard/*`
  - admin-only or mutation-sensitive APIs
  - document processing actions
- Never assume layout protection alone is enough. Re-check auth and authorization inside each sensitive action and route handler.

## Authentication rules

- No public signup after owner bootstrap.
- Username and password auth must be rate-limited.
- Passkey flows must rely on supported browser and auth-library primitives, not homemade crypto.
- Session cookies must be secure and `httpOnly`.
- Auth failures should not reveal whether the username or password was wrong.

## Authorization rules

- Check ownership on every document mutation and read path that is not intentionally public.
- Public verification access must still pass document policy checks.
- A valid `publicId` alone must never bypass expiration, revoke, PIN, or access-count rules.

## Input validation rules

- Validate all form input with Zod on the server.
- Validate uploaded files by type and size on the server even if the client already checked them.
- Treat `searchParams`, route params, headers, and form data as untrusted input.
- Reject unexpected enum values and malformed dates.

## File handling rules

- Accept PDF only.
- Enforce max upload size.
- Never trust extension alone; verify MIME and file signature where practical.
- Do not expose raw Supabase Storage URLs in the UI, QR payload, or public APIs.
- Serve files through app-controlled routes only.

## PDF integrity rules

- Final processing must only replace the QR region.
- Do not re-render full pages into images for final output.
- Keep original content unchanged outside the selected QR bounds.
- Treat coordinate conversion as a security-sensitive correctness issue because wrong placement can corrupt documents.

## Server action and route handler rules

- Server actions must authorize before mutation.
- Route handlers must authorize before returning private data.
- Keep heavy logic in server services, not inline in route handlers.
- Return safe error payloads.
- Do not leak stack traces, secrets, or raw SDK errors to clients.

## Rate limiting and abuse prevention

- Rate-limit login attempts.
- Rate-limit document uploads.
- Rate-limit expensive QR detection and PDF processing actions.
- Rate-limit public verification access enough to slow abuse without breaking legitimate usage.
- Consider IP and fingerprint signals as operational hardening, not sole identity proof.

## PIN and secret handling

- Never store raw PINs.
- Hash PINs with a modern password hashing strategy.
- Never log passwords, PINs, passkeys, raw tokens, or private file paths that would help an attacker.

## Storage rules

- Use private buckets where possible.
- Access storage from the server using privileged credentials only where necessary.
- Do not return storage internals to the browser.
- Encryption at rest claims must not be added to public copy until the final encryption stage is actually implemented.

## Security headers

- Add CSP with a documented approach aligned to Next.js 16 patterns.
- Add headers to reduce clickjacking, MIME sniffing, and unsafe embedding.
- Review any third-party script before allowing it in CSP.

## Dependency security

- Prefer maintained packages with official docs and recent releases.
- Avoid adding overlapping security-sensitive libraries when one proven solution already exists.
- Review auth, crypto, and file-processing dependencies more critically than ordinary UI packages.

## Logging and monitoring

- Audit:
  - login success
  - login failure
  - upload
  - process
  - revoke
  - delete
  - access allowed
  - access denied
- Log enough context for investigation without storing secrets.

## Privacy rules

- Do not use uploaded documents for analytics payloads, profiling, advertising, or AI training.
- Minimize document metadata exposed on public verification pages.
- Show only the information required for the public access flow.

## Secure coding rules

- Never use `dangerouslySetInnerHTML` unless there is a reviewed and unavoidable reason.
- Keep client bundles free of server secrets and privileged logic.
- Mark server-only modules clearly and structure imports to avoid accidental client exposure.
- Do not trust client-calculated values for security decisions.

## Abuse scenarios to defend against

- brute-force login attempts
- automated upload abuse
- scraping public verification endpoints
- guessing `publicId` values
- bypassing expired or revoked document policies
- downloading files through leaked storage paths
- manipulating QR coordinates to damage documents
- privilege escalation from one user to another user’s documents

## Pre-merge security checklist

- every mutation re-checks auth and authorization
- every external input is server-validated
- public routes expose only what is intended
- file streaming does not leak raw storage URLs
- secrets remain server-only
- error messages are safe
- security-sensitive events are logged
- the implementation matches current official docs
