// Owns the Better Auth HTTP entrypoint.
// Keeps auth endpoints under App Router route handlers per Next.js 16 conventions.
// Must remain thin so auth policy stays in the server auth configuration.
import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/server/auth/better-auth";

export const { GET, POST } = toNextJsHandler(auth);
