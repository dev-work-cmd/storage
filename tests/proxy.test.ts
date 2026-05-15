import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSessionMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
}));

vi.mock("@/server/auth/better-auth", () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
}));

import { proxy } from "@/proxy";

describe("proxy", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
  });

  it("redirects unauthenticated dashboard requests to login with a next param", async () => {
    getSessionMock.mockResolvedValue(null);

    const response = await proxy(
      new NextRequest("http://localhost:3000/dashboard/documents"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?next=%2Fdashboard%2Fdocuments",
    );
  });

  it("returns 401 json for unauthenticated dashboard api requests", async () => {
    getSessionMock.mockResolvedValue(null);

    const response = await proxy(
      new NextRequest("http://localhost:3000/api/dashboard/documents/test"),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized",
    });
  });

  it("allows verification and public file routes without auth checks", async () => {
    const verifyResponse = await proxy(
      new NextRequest("http://localhost:3000/verify/public-doc"),
    );
    const fileResponse = await proxy(
      new NextRequest("http://localhost:3000/api/documents/public-doc/file"),
    );

    expect(verifyResponse.status).toBe(200);
    expect(fileResponse.status).toBe(200);
    expect(getSessionMock).not.toHaveBeenCalled();
  });

  it("allows authenticated dashboard requests and disables caching", async () => {
    getSessionMock.mockResolvedValue({
      user: { id: "owner_1" },
    });

    const response = await proxy(
      new NextRequest("http://localhost:3000/dashboard"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0",
    );
  });
});
