// Owns coarse dashboard route protection for Next.js 16.
// Keeps protected routes uncached without performing DB-backed auth in proxy.
// Pages, route handlers, and actions perform full authorization server-side.
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/verify/") ||
    pathname.startsWith("/api/documents/")
  ) {
    return response;
  }

  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};
