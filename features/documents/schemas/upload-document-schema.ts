// Owns form-level validation for PDF document uploads.
// Keeps client and server validation messages aligned while deeper PDF checks stay server-only.
// Must not treat browser-provided MIME or filenames as sufficient proof of file safety.
import { z } from "zod";

import { maxPdfSizeBytes } from "@/lib/env";

const fileSchema = z.custom<File>(
  (value): value is File =>
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "name" in value &&
    "size" in value &&
    "type" in value,
  "Choose a PDF file before uploading.",
);

export const uploadDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, "Title must be 120 characters or fewer.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  file: fileSchema
    .refine((file) => file.size > 0, "Choose a PDF file before uploading.")
    .refine((file) => file.size <= maxPdfSizeBytes, "The selected PDF is too large.")
    .refine((file) => file.type === "application/pdf", "Only PDF files are accepted.")
    .refine(
      (file) => file.name.toLowerCase().endsWith(".pdf"),
      "The uploaded file must use a .pdf extension.",
    ),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
