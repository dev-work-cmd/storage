"use server";

// Owns server action boundary for QR behavior and access settings.
// Validates owner policy inputs and delegates to persistence layer.
// Must never trust client-validated legal confirmation or PIN requirements.
import { revalidatePath } from "next/cache";

import {
  qrSettingsSchema,
  type QrSettingsInput,
} from "@/features/documents/schemas/qr-settings-schema";
import { updateDocumentQrSettings } from "@/features/documents/server/update-qr-settings";

export type QrSettingsResult =
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      errors?: Array<{ path: string; message: string }>;
    };

export async function saveQrSettings(
  input: QrSettingsInput,
): Promise<QrSettingsResult> {
  try {
    const parsed = qrSettingsSchema.safeParse(input);

    if (!parsed.success) {
      return {
        status: "error",
        message: "Please fix the errors below.",
        errors: (
          parsed.error as {
            issues: Array<{ path: (string | number)[]; message: string }>;
          }
        ).issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      };
    }

    const saved = await updateDocumentQrSettings(parsed.data);

    if (!saved) {
      return {
        status: "error",
        message:
          "The document could not be updated. It may have been deleted or already processed.",
      };
    }

    revalidatePath(`/dashboard/documents/${parsed.data.publicId}`);
    revalidatePath(`/dashboard/documents/${parsed.data.publicId}/insert-qr`);

    return {
      status: "success",
      message: "Access settings saved. The document is ready for processing.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        status: "error",
        message: "You must be logged in to save settings.",
      };
    }

    return {
      status: "error",
      message: "The access settings could not be saved. Try again.",
    };
  }
}
