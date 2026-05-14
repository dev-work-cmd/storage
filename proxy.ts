// Owns coarse dashboard route protection for Next.js 16.
// Performs full Better Auth session validation before protected pages render.
// Sensitive actions must still re-check authorization server-side.
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/server/auth/better-auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
