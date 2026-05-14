// Owns validation for QR bounds produced by preview/detection tools.
// Keeps client-derived coordinates constrained before database writes.
// Must validate PDF-space coordinates because incorrect bounds can corrupt output later.
import { z } from "zod";

const coordinate = z.number().finite().min(0);

export const qrBoundsSourceSchema = z.enum(["DETECTION", "MANUAL"]);

export const qrBoundsSchema = z.object({
  publicId: z.string().min(1).max(128),
  pageNumber: z.number().int().positive(),
  source: qrBoundsSourceSchema,
  x: coordinate,
  y: coordinate,
  width: z.number().finite().positive(),
  height: z.number().finite().positive(),
});

export const qrDetectionFailureSchema = z.object({
  publicId: z.string().min(1).max(128),
  pageNumber: z.number().int().positive(),
  reason: z.enum(["no_qr_detected", "coordinate_conversion", "client_error"]),
});

export type QrBoundsInput = z.infer<typeof qrBoundsSchema>;
export type QrDetectionFailureInput = z.infer<typeof qrDetectionFailureSchema>;
