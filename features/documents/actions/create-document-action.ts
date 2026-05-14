"use server";

// Owns the server action boundary for authenticated PDF uploads.
// Validates untrusted form data, enforces upload throttling, and delegates storage/database work.
// Must return only safe UI state and never expose private storage paths.
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { uploadDocumentSchema } from "@/features/documents/schemas/upload-document-schema";
import { createDraftDocument } from "@/features/documents/server/create-draft-document";
import { requireCurrentSession } from "@/server/auth/session";
import { checkUploadRateLimit } from "@/server/services/rate-limit/upload-rate-limit";

export type CreateDocumentActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  documentTitle?: string;
  documentPublicId?: string;
  fieldErrors?: {
    title?: string[];
    file?: string[];
  };
};

function getRequestMetadata(headerList: Headers) {
  const forwardedFor = headerList.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown";

  return {
    ipAddress,
    userAgent: headerList.get("user-agent") ?? undefined,
  };
}

export async function createDocument(
  _state: CreateDocumentActionState,
  formData: FormData,
): Promise<CreateDocumentActionState> {
  const session = await requireCurrentSession();
  const headerList = await headers();
  const requestMetadata = getRequestMetadata(headerList);

  const limit = checkUploadRateLimit(
    `${session.user.id}:${requestMetadata.ipAddress}`,
  );

  if (!limit.allowed) {
    return {
      status: "error",
      message: `Too many upload attempts. Try again in ${limit.retryAfterSeconds} seconds.`,
    };
  }

  const parsed = uploadDocumentSchema.safeParse({
    title: formData.get("title"),
    file: formData.get("file"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Review the highlighted fields.",
    };
  }

  const result = await createDraftDocument({
    ownerId: session.user.id,
    title: parsed.data.title,
    file: parsed.data.file,
    ...requestMetadata,
  });

  if (result.status === "error") {
    return {
      status: "error",
      fieldErrors:
        result.field === "file" ? { file: [result.message] } : undefined,
      message: result.message,
    };
  }

  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "PDF uploaded and saved as a draft.",
    documentTitle: result.document.title,
    documentPublicId: result.document.publicId,
  };
}
