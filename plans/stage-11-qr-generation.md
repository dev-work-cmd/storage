# Stage 11: QR Generation

## Status

- State: `Done`
- Phase: `Phase 4 - PDF Mutation and Storage`
- Owner: `Codex`

## Core focus

Generate the stable app-hosted QR target URL and produce a high-quality QR PNG for embedding.

## Definition of done

- public target URL logic is centralized
- verify, open, and download URL variants work
- high-quality QR PNG generation works
- raw Supabase storage URLs are never embedded into the QR payload

## Deliverables

- QR target URL helper
- QR image generation service

## Implementation Prompt

You are implementing Stage 11 only.

Goals:

- Build the target URL logic:
  - `/verify/{publicId}`
  - `/verify/{publicId}?mode=open`
  - `/verify/{publicId}?mode=download`
- Generate high-quality QR PNG output using the `qrcode` package.
- Keep the QR generation service reusable by later document processing actions.

Constraints:

- Never embed a raw Supabase storage URL.
- Use `NEXT_PUBLIC_APP_URL` as the stable base.
- Keep output dimensions and error correction suitable for later PDF embedding.

## Tracking

- Start date: `2026-05-14`
- Finish date: `2026-05-14`
- Notes: `Implemented centralized QR target URL construction and high-quality QR PNG generation service. Target URLs use NEXT_PUBLIC_APP_URL as stable base with three mode variants (verify/open/download). QR generation uses qrcode package with error correction level H (30%), 512px default output, and configurable colors/margins. Both Buffer (for pdf-lib embedding) and data URL (for preview) output formats supported. All services are server-only and never embed raw Supabase storage URLs.`
- Deliverables:
  - `qr-target-url.ts`: Centralized URL builder with mode variants, verification path helper, and mode parser for query params
  - `qr-image-generator.ts`: QR PNG generation with configurable error correction, sizing, and colors; returns Buffer for pdf-lib or data URL for preview
  - Updated `index.ts`: Full QR service barrel exports including URL, image, validation, and coordinate modules
- Follow-ups: `Stage 12 (PDF QR replacement) will use generateQrPng() to produce the QR image and buildQrTargetUrl() to set the payload, then embed via pdf-lib at the coordinates from Stages 08-09.`
