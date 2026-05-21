import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "@/proxy";

describe("proxy", () => {
  it("allows dashboard requests through without DB-backed auth checks", () => {
    const response = proxy(
      new NextRequest("http://localhost:3000/dashboard/documents"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0",
    );
  });

  it("allows dashboard api requests through for route-level authorization", () => {
    const response = proxy(
      new NextRequest("http://localhost:3000/api/dashboard/documents/test"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0",
    );
  });

  it("allows verification and public file routes without cache changes", () => {
    const verifyResponse = proxy(
      new NextRequest("http://localhost:3000/verify/public-doc"),
    );
    const fileResponse = proxy(
      new NextRequest("http://localhost:3000/api/documents/public-doc/file"),
    );

    expect(verifyResponse.status).toBe(200);
    expect(fileResponse.status).toBe(200);
    expect(verifyResponse.headers.get("cache-control")).toBeNull();
    expect(fileResponse.headers.get("cache-control")).toBeNull();
  });

  it("disables caching for dashboard requests", () => {
    const response = proxy(
      new NextRequest("http://localhost:3000/dashboard"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0",
    );
  });
});
