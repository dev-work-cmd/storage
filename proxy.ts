// Owns coarse dashboard route protection for Next.js 16.
// Performs full Better Auth session validation before protected pages render.
// Sensitive actions must still re-check authorization server-side.
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/server/auth/better-auth";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/verify/") ||
    pathname.startsWith("/api/documents/")
  ) {
    return response;
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    if (pathname.startsWith("/api/dashboard/")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: {
            "Cache-Control": "private, no-store, max-age=0",
          },
        },
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};
