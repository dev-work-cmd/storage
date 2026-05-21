// Owns validation for QR behavior and access settings on draft documents.
// Keeps policy inputs constrained before database writes.
// Must use Zod primitives for server-side enforcement boundary.
import { z } from "zod";

const positiveInt = z.number().int().positive().finite().max(1_000_000);

export const qrSettingsSchema = z
  .object({
    publicId: z.string().min(1).max(128),
    qrMode: z.enum(["VERIFY", "OPEN", "DOWNLOAD"]),
    expiresAt: z.date().optional(),
    maxAccessCount: positiveInt.optional(),
    requiresPin: z.boolean(),
    pin: z
      .string()
      .min(4, "PIN must be at least 4 characters.")
      .max(64, "PIN must be at most 64 characters.")
      .optional(),
    isEnabled: z.boolean(),
    legalConfirmed: z.boolean(),
  })
  .refine((data) => data.legalConfirmed, {
    message: "Legal authority must be confirmed before processing.",
    path: ["legalConfirmed"],
  })
  .refine(
    (data) => {
      // If PIN is required, a PIN value must be provided
      if (data.requiresPin) {
        return typeof data.pin === "string" && data.pin.length >= 4;
      }
      return true;
    },
    {
      message:
        "A PIN of at least 4 characters is required when PIN protection is enabled.",
      path: ["pin"],
    },
  )
  .refine(
    (data) => {
      // If expiration is set, validate it's in the future
      if (data.expiresAt) {
        return data.expiresAt > new Date();
      }
      return true;
    },
    {
      message: "Expiration must be a future date.",
      path: ["expiresAt"],
    },
  );

export type QrSettingsInput = z.infer<typeof qrSettingsSchema>;
