// Owns server-side environment validation for the whole application.
// Centralizes required variables so later auth, storage, and PDF services fail fast.
// Must stay server-only because it parses secrets that cannot enter client bundles.
import "server-only";

import { z } from "zod";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL.")
    .transform(trimTrailingSlash),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters."),
  SUPABASE_URL: z
    .string()
    .url("SUPABASE_URL must be a valid URL.")
    .transform(trimTrailingSlash),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required."),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required."),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL.")
    .transform(trimTrailingSlash),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required."),
  SUPABASE_STORAGE_BUCKET_ORIGINAL: z
    .string()
    .min(1, "SUPABASE_STORAGE_BUCKET_ORIGINAL is required."),
  SUPABASE_STORAGE_BUCKET_PROCESSED: z
    .string()
    .min(1, "SUPABASE_STORAGE_BUCKET_PROCESSED is required."),
  MAX_PDF_SIZE_MB: z.coerce
    .number()
    .int("MAX_PDF_SIZE_MB must be an integer.")
    .positive("MAX_PDF_SIZE_MB must be greater than zero.")
    .max(100, "MAX_PDF_SIZE_MB must stay below 100."),
});

const parsedEnv = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_STORAGE_BUCKET_ORIGINAL:
    process.env.SUPABASE_STORAGE_BUCKET_ORIGINAL,
  SUPABASE_STORAGE_BUCKET_PROCESSED:
    process.env.SUPABASE_STORAGE_BUCKET_PROCESSED,
  MAX_PDF_SIZE_MB: process.env.MAX_PDF_SIZE_MB,
});

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment configuration.\n${formattedErrors}`);
}

export const env = parsedEnv.data;
export const maxPdfSizeBytes = env.MAX_PDF_SIZE_MB * 1024 * 1024;
