// Owns the Better Auth server configuration for username/password and passkeys.
// Enforces the owner-bootstrap rule at the auth endpoint layer, not just in UI.
// Must keep nextCookies last so Server Actions can set secure auth cookies.
import "server-only";

import { passkey } from "@better-auth/passkey";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";

import { env } from "@/lib/env";
import { prisma } from "@/server/db/prisma";

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  disabledPaths: ["/is-username-available"],
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/username": {
        window: 60,
        max: 5,
      },
      "/sign-up/email": {
        window: 300,
        max: 3,
      },
      "/passkey/*": {
        window: 60,
        max: 10,
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return;
      }

      const owner = await prisma.user.findFirst({
        where: {
          role: "OWNER",
        },
        select: {
          id: true,
        },
      });

      if (owner) {
        throw new APIError("FORBIDDEN", {
          message: "Owner setup is already complete.",
        });
      }
    }),
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      usernameValidator: (value) => /^[a-z0-9_.-]+$/i.test(value),
    }),
    passkey(),
    nextCookies(),
  ],
});
