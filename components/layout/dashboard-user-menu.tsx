"use client";

// Owns the owner avatar menu used across dashboard surfaces.
// Keeps logout tucked behind a compact user trigger so page headers stay clean.
// Must only expose safe owner-facing identity details already present in session data.
import { LogOut } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { logout } from "@/features/auth/actions/auth-actions";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "O";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function DashboardUserMenu({ userName }: { userName: string }) {
  const initials = getInitials(userName);

  return (
    <details className="relative z-50">
      <summary
        aria-label="Open user menu"
        className="flex cursor-pointer list-none items-center justify-center rounded-full border border-[#eadfd6] bg-white/92 p-1.5 shadow-[0_14px_30px_-24px_rgba(84,53,28,0.22)] transition hover:border-[#dbc8bb] [&::-webkit-details-marker]:hidden"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfd6] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,235,226,0.9))] text-sm font-semibold text-[#5d3428] shadow-[0_10px_22px_-18px_rgba(84,43,28,0.7)]">
          {initials}
        </span>
      </summary>

      <div className="absolute right-0 top-[calc(100%+0.6rem)] z-[60] w-56 rounded-[1.1rem] border border-[#eadfd6] bg-white p-2 shadow-[0_24px_54px_-28px_rgba(84,53,28,0.28)]">
        <div className="rounded-[0.95rem] bg-[#fcfaf8] px-3 py-3">
          <p className="text-sm font-medium text-[#241915]">{userName}</p>
          <p className="mt-1 text-xs text-[#8a776d]">
            Protected owner workspace
          </p>
        </div>

        <form action={logout} className="mt-2">
          <button
            className={buttonVariants({
              variant: "secondary",
              className: "w-full justify-start rounded-[0.95rem]",
            })}
            type="submit"
          >
            <LogOut size={16} strokeWidth={1.9} />
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}
