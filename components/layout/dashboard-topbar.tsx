"use client";

// Owns the shared dashboard top navigation bar.
// Keeps search and user session access consistent across dashboard pages and breakpoints.
// Must remain layout-only and not replace page-specific filtering or data actions.
import { startTransition, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DashboardUserMenu } from "@/components/layout/dashboard-user-menu";

const SEARCH_DEBOUNCE_MS = 250;

export function DashboardTopbar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDocumentsPage = pathname === "/dashboard/documents";
  const routeQuery = searchParams.get("q") ?? "";
  const [searchValue, setSearchValue] = useState(routeQuery);

  useEffect(() => {
    if (isDocumentsPage) {
      setSearchValue(routeQuery);
      return;
    }

    setSearchValue("");
  }, [isDocumentsPage, routeQuery, pathname]);

  function commitRouteQuery(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = nextValue.trim();
    const targetPath = "/dashboard/documents";

    if (!isDocumentsPage) {
      params.delete("q");
    }

    if (trimmed.length > 0) {
      params.set("q", nextValue);
    } else {
      params.delete("q");
    }

    const href = params.toString()
      ? `${targetPath}?${params.toString()}`
      : targetPath;

    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  useEffect(() => {
    const normalizedSearch = searchValue.trim();

    if (isDocumentsPage && normalizedSearch === routeQuery.trim()) {
      return;
    }

    if (!isDocumentsPage && normalizedSearch.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      commitRouteQuery(searchValue);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [isDocumentsPage, routeQuery, searchValue, searchParams]);

  return (
    <header className="relative z-30 overflow-visible border-b border-[color:oklch(0.92_0.012_74)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(252,248,244,0.92))] px-4 py-3 backdrop-blur lg:px-7">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 shrink-0 max-sm:hidden">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[color:oklch(0.5_0.024_38)]">
            Secure PDF QR
          </p>
          <p className="mt-1 truncate text-sm text-[color:oklch(0.46_0.024_39)]">
            Protected owner workspace
          </p>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
          <label className="relative w-full max-w-none sm:max-w-[16rem] md:max-w-xs lg:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:oklch(0.56_0.02_40)]"
              size={16}
              strokeWidth={1.9}
            />
            <input
              aria-label="Search workspace"
              className="h-10 w-full rounded-full border border-[color:oklch(0.89_0.015_74)] bg-white/95 pl-10 pr-4 text-sm text-[color:oklch(0.24_0.026_41)] outline-none transition placeholder:text-[color:oklch(0.62_0.018_41)] focus:border-[color:oklch(0.78_0.03_49)]"
              onChange={(event) => {
                setSearchValue(event.target.value);
              }}
              onFocus={() => {
                if (!isDocumentsPage && searchValue.trim().length === 0) {
                  startTransition(() => {
                    router.replace("/dashboard/documents", { scroll: false });
                  });
                }
              }}
              placeholder="Search documents by title..."
              type="search"
              value={searchValue}
            />
          </label>
          <DashboardUserMenu userName={userName} />
        </div>
      </div>
    </header>
  );
}
