"use server";

// Owns server actions for Stage 03 authentication forms.
// Validates input, enforces owner bootstrap, and writes safe audit events.
// Must not expose whether a username or password caused login failure.
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AuditEvent, AuditOutcome } from "@prisma/client";

import { auth } from "@/server/auth/better-auth";
import { isSetupAllowed } from "@/server/auth/owner-setup";
import { prisma } from "@/server/db/prisma";
import { getRequestAuditMetadata } from "@/server/services/audit/audit-log";
import { logAuthEvent } from "@/server/services/audit/log-auth-event";
import {
  checkLoginRateLimit,
  clearLoginRateLimit,
} from "@/server/services/rate-limit/login-rate-limit";

import { loginSchema, setupOwnerSchema } from "../schemas/auth-schemas";

export type AuthActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function buildInternalOwnerEmail(username: string) {
  return `${username}@owner.local.invalid`;
}

export async function setupOwner(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = setupOwnerSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Review the highlighted fields.",
    };
  }

  if (parsed.data.password !== parsed.data.confirmPassword) {
    return {
      status: "error",
      fieldErrors: {
        confirmPassword: ["Passwords do not match."],
      },
      message: "Review the highlighted fields.",
    };
  }

  if (!(await isSetupAllowed())) {
    return {
      status: "error",
      message: "Owner setup is already complete.",
    };
  }

  await auth.api.signUpEmail({
    headers: await headers(),
    body: {
      email: buildInternalOwnerEmail(parsed.data.username),
      password: parsed.data.password,
      name: parsed.data.username,
      username: parsed.data.username,
      displayUsername: parsed.data.username,
    },
  });

  redirect("/dashboard");
}

export async function loginWithUsername(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const headerList = await headers();
  const requestMetadata = getRequestAuditMetadata(headerList);
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Enter a valid username and password.",
    };
  }

  const rateLimitKey = `${requestMetadata.ipAddress}:${parsed.data.username}`;
  const limit = checkLoginRateLimit(rateLimitKey);

  if (!limit.allowed) {
    await logAuthEvent({
      event: AuditEvent.LOGIN_FAILURE,
      outcome: AuditOutcome.FAILURE,
      username: parsed.data.username,
      ...requestMetadata,
      reason: "rate_limited",
    });

    return {
      status: "error",
      message: `Too many login attempts. Try again in ${limit.retryAfterSeconds} seconds.`,
    };
  }

  try {
    const response = await auth.api.signInUsername({
      headers: headerList,
      body: {
        username: parsed.data.username,
        password: parsed.data.password,
      },
    });

    const user = await prisma.user.findUnique({
      where: {
        username: parsed.data.username,
      },
      select: {
        id: true,
      },
    });

    clearLoginRateLimit(rateLimitKey);

    await logAuthEvent({
      event: AuditEvent.LOGIN_SUCCESS,
      outcome: AuditOutcome.SUCCESS,
      actorUserId: user?.id ?? response.user.id,
      username: parsed.data.username,
      ...requestMetadata,
    });
  } catch {
    await logAuthEvent({
      event: AuditEvent.LOGIN_FAILURE,
      outcome: AuditOutcome.FAILURE,
      username: parsed.data.username,
      ...requestMetadata,
      reason: "invalid_credentials",
    });

    return {
      status: "error",
      message: "Invalid username or password.",
    };
  }

  redirect("/dashboard");
}

export async function logout() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/login");
}
