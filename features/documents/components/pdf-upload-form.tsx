"use client";

// Owns the interactive PDF upload form for Stage 06 intake.
// Provides immediate browser validation while the server remains authoritative.
// Must not display storage paths, signed URLs, or raw backend errors.
import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Upload } from "lucide-react";

import {
  createDocument,
  type CreateDocumentActionState,
} from "@/features/documents/actions/create-document-action";
import { buttonVariants } from "@/components/ui/button";

const initialState: CreateDocumentActionState = {
  status: "idle",
};

type PdfUploadFormProps = {
  maxPdfSizeBytes: number;
  maxPdfSizeLabel: string;
};

function validateBrowserFile(file: File | undefined, maxPdfSizeBytes: number) {
  if (!file) {
    return undefined;
  }

  if (file.type !== "application/pdf") {
    return "Only PDF files are accepted.";
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return "The uploaded file must use a .pdf extension.";
  }

  if (file.size > maxPdfSizeBytes) {
    return "The selected PDF is too large.";
  }

  return undefined;
}

export function PdfUploadForm({
  maxPdfSizeBytes,
  maxPdfSizeLabel,
}: PdfUploadFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>();
  const [clientFileError, setClientFileError] = useState<string>();
  const [state, formAction, pending] = useActionState(
    createDocument,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      const resetId = window.setTimeout(() => {
        formRef.current?.reset();
        setSelectedFileName(undefined);
        setClientFileError(undefined);
      }, 0);

      return () => window.clearTimeout(resetId);
    }
  }, [state.status]);

  const fileError = clientFileError ?? state.fieldErrors?.file?.[0];
  const successHref = state.documentPublicId
    ? `/dashboard/documents/${state.documentPublicId}`
    : undefined;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-950" htmlFor="title">
          Document title
        </label>
        <input
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/10"
          id="title"
          maxLength={120}
          name="title"
          placeholder="Optional, defaults to the file name"
          type="text"
        />
        {state.fieldErrors?.title?.[0] ? (
          <p className="text-sm text-red-700">{state.fieldErrors.title[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-950" htmlFor="file">
          PDF file
        </label>
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
          <input
            accept="application/pdf,.pdf"
            className="block w-full cursor-pointer rounded-md border border-zinc-300 bg-white text-sm text-zinc-700 file:mr-4 file:h-10 file:border-0 file:bg-zinc-950 file:px-4 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
            id="file"
            name="file"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              setSelectedFileName(file?.name);
              setClientFileError(validateBrowserFile(file, maxPdfSizeBytes));
            }}
            required
            type="file"
          />
          <p className="mt-3 text-sm text-zinc-600">
            PDF only. Maximum size: {maxPdfSizeLabel}. The original is stored
            privately and is not exposed as a public link.
          </p>
          {selectedFileName ? (
            <p className="mt-2 text-sm font-medium text-zinc-950">
              Selected: {selectedFileName}
            </p>
          ) : null}
          {fileError ? <p className="mt-2 text-sm text-red-700">{fileError}</p> : null}
        </div>
      </div>

      {state.message ? (
        <div
          aria-live="polite"
          className={
            state.status === "success"
              ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
              : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          }
        >
          <p>
            {state.documentTitle
              ? `${state.message} ${state.documentTitle} is ready for editing.`
              : state.message}
          </p>
          {state.documentPublicId ? (
            <Link
              className="mt-2 inline-flex font-medium underline underline-offset-4"
              href={successHref ?? "/dashboard/documents"}
            >
              Open document workspace
            </Link>
          ) : null}
        </div>
      ) : null}

      <button
        className={buttonVariants({
          variant: "primary",
          className: "w-full sm:w-auto",
        })}
        disabled={pending || Boolean(clientFileError)}
        type="submit"
      >
        <Upload size={18} strokeWidth={1.8} />
        {pending ? "Uploading..." : "Upload PDF"}
      </button>
    </form>
  );
}
