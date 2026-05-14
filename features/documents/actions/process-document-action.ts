"use server";

// Owns server action boundary for document processing (QR replacement + storage).
// Validates the document is in DRAFT status with all prerequisites before processing.
// Must never expose raw storage paths or pipeline internals to the client.
import { revalidatePath } from "next/cache";

import { processDocument } from "@/server/services/pdf/process-document";

export interface ProcessDocumentActionResult {
  status: "success" | "error";
  message: string;
}

export async function processDocumentAction(
  publicId: string,
): Promise<ProcessDocumentActionResult> {
  try {
    if (!publicId || typeof publicId !== "string") {
      return {
        status: "error",
        message: "Invalid document identifier.",
      };
    }

    const result = await processDocument({ publicId });

    if (result.status === "success") {
      revalidatePath(`/dashboard/documents/${publicId}`);
    }

    return result;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        status: "error",
        message: "You must be logged in to process documents.",
      };
    }

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during processing.",
    };
  }
}
