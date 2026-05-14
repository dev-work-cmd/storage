// Owns server-side validation schemas for owner setup and login forms.
// Keeps raw FormData parsing out of route files and UI components.
// Must avoid email input because this product uses username-first owner auth.
import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters.")
  .max(30, "Username must be 30 characters or fewer.")
  .regex(
    /^[a-zA-Z0-9_.-]+$/,
    "Username can only use letters, numbers, underscores, dots, and hyphens.",
  )
  .transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .max(128, "Password must be 128 characters or fewer.");

export const setupOwnerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
});

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, "Password is required."),
});

export type SetupOwnerInput = z.infer<typeof setupOwnerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
