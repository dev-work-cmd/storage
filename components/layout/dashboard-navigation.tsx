"use client";

// Owns dashboard navigation chrome for desktop and mobile breakpoints.
// Keeps active-state logic on the client while auth and layout remain server-controlled.
// Must stay route-safe and only link to authenticated dashboard destinations.
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Files,
  LayoutDashboard,
  LogOut,
  Upload,
  type LucideIcon,
} from "lucide-react";

import { AppWordmark } from "@/components/shared/app-wordmark";
import { buttonVariants } from "@/components/ui/button";
import { logout } from "@/features/auth/actions/auth-actions";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Overview",
  },
  {
    href: "/dashboard/documents/new",
    icon: Upload,
    label: "New Document",
  },
  {
    href: "/dashboard/documents",
    icon: Files,
    label: "Documents",
  },
  {
    href: "/dashboard/audit",
    icon: ClipboardList,
    label: "Audit",
  },
] as const satisfies ReadonlyArray<{
  href: string;
  icon: LucideIcon;
  label: string;
}>;

function isActivePath(pathname: string, href: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (href === "/dashboard") {
    return pathname === href;
  }

  if (href === "/dashboard/documents/new") {
    return (
      pathname === href || pathname === "/dashboard/documents/new/insert-qr"
    );
  }

  if (href === "/dashboard/documents") {
    if (pathname === href) {
      return true;
    }

    if (segments[0] !== "dashboard" || segments[1] !== "documents") {
      return false;
    }

    if (segments[2] === "new") {
      return false;
    }

    return segments.length >= 3;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-[18rem] shrink-0 rounded-[2rem] border border-[color:oklch(0.92_0.012_74)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,243,238,0.88))] shadow-[0_28px_80px_-44px_rgba(84,53,28,0.28)] lg:flex">
      <div className="flex min-h-full w-full flex-col px-6 py-7">
        <AppWordmark />

        <nav aria-label="Dashboard navigation" className="mt-8 flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              const ItemIcon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    className={cn(
                      "flex items-center gap-3 rounded-[1.1rem] px-4 py-3 text-sm font-medium transition",
                      active
                        ? "border border-[color:oklch(0.9_0.018_71)] bg-[linear-gradient(180deg,rgba(252,248,243,0.98),rgba(248,241,233,0.92))] text-[color:oklch(0.24_0.03_37)] shadow-[inset_3px_0_0_oklch(0.39_0.09_33)]"
                        : "text-[color:oklch(0.47_0.023_38)] hover:bg-[color:oklch(0.97_0.008_80)] hover:text-[color:oklch(0.24_0.03_37)]",
                    )}
                    href={item.href}
                  >
                    <ItemIcon size={18} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="rounded-[1.6rem] border border-[color:oklch(0.91_0.014_75)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,239,230,0.92))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
            Owner session
          </p>
          <p className="mt-3 text-xl leading-tight text-[color:oklch(0.245_0.026_41)]">
            Controlled access workspace
          </p>
          <p className="mt-2 text-sm leading-6 text-[color:oklch(0.49_0.024_39)]">
            Signed in as {userName}. Review storage, QR behavior, and protected
            document delivery from one owner-only workspace.
          </p>
          <form action={logout} className="mt-5">
            <button
              className={buttonVariants({
                variant: "secondary",
                className: "w-full rounded-[1rem]",
              })}
              type="submit"
            >
              <LogOut size={18} strokeWidth={1.8} />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

export function DashboardMobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile dashboard navigation"
      className="fixed inset-x-3 bottom-3 z-40 rounded-[1.7rem] border border-[color:oklch(0.92_0.012_74)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,243,238,0.92))] px-2 py-2 shadow-[0_20px_50px_-30px_rgba(84,53,28,0.28)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          const ItemIcon = item.icon;

          return (
            <li key={item.href}>
              <Link
                className={cn(
                  "flex flex-col items-center gap-1 rounded-[1.1rem] px-2 py-2 text-[0.72rem] font-medium transition",
                  active
                    ? "bg-[linear-gradient(180deg,rgba(116,51,38,0.98),rgba(88,38,29,0.94))] text-white shadow-[0_18px_34px_-24px_rgba(84,43,28,0.85)]"
                    : "text-[color:oklch(0.47_0.023_38)] hover:bg-[color:oklch(0.97_0.008_80)]",
                )}
                href={item.href}
              >
                <ItemIcon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
