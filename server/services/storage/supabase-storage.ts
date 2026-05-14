// Owns privileged Supabase Storage writes for private document files.
// Keeps service-role access server-only so raw storage URLs never reach clients.
// Must return storage paths only to trusted server workflows.
import "server-only";

import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export function createOriginalPdfStoragePath(ownerId: string) {
  return `${ownerId}/originals/${randomUUID()}.pdf`;
}

export async function uploadOriginalPdf(input: {
  path: string;
  buffer: Buffer;
}) {
  const { data, error } = await supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET_ORIGINAL)
    .upload(input.path, input.buffer, {
      cacheControl: "0",
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) {
    throw new Error("Original PDF upload failed.");
  }

  return data.path;
}

export async function removeOriginalPdf(path: string) {
  await supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET_ORIGINAL)
    .remove([path]);
}

export async function downloadOriginalPdf(path: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET_ORIGINAL)
    .download(path);

  if (error || !data) {
    throw new Error("Original PDF download failed.");
  }

  return data;
}

// --- Processed PDF operations ---

export function createProcessedPdfStoragePath(ownerId: string) {
  return `${ownerId}/processed/${randomUUID()}.pdf`;
}

export async function uploadProcessedPdf(input: {
  path: string;
  buffer: Buffer;
}) {
  const { data, error } = await supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET_PROCESSED)
    .upload(input.path, input.buffer, {
      cacheControl: "0",
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) {
    throw new Error("Processed PDF upload failed.");
  }

  return data.path;
}

export async function downloadProcessedPdf(path: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET_PROCESSED)
    .download(path);

  if (error || !data) {
    throw new Error("Processed PDF download failed.");
  }

  return data;
}
