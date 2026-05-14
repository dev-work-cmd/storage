// Owns the authenticated dashboard frame shared by dashboard routes.
// Keeps navigation, topbar, and page chrome consistent for later document workflows.
// Must protect its children with a server-validated session.
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Audit01Icon,
  DashboardSquare01Icon,
  Files01Icon,
  FileUploadIcon,
  Logout03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon as Icon } from "@hugeicons/react";

import { AppWordmark } from "@/components/shared/app-wordmark";
import { buttonVariants } from "@/components/ui/button";
import { logout } from "@/features/auth/actions/auth-actions";
import { requireCurrentSession } from "@/server/auth/session";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: DashboardSquare01Icon,
  },
  {
    href: "/dashboard/documents/new",
    label: "New Document",
    icon: FileUploadIcon,
  },
  {
    href: "/dashboard/documents",
    label: "Documents",
    icon: Files01Icon,
  },
  {
    href: "/dashboard/audit",
    label: "Audit",
    icon: Audit01Icon,
  },
];

export async function DashboardShell({ children }: { children: ReactNode }) {
  const session = await requireCurrentSession();

  return (
    <div className="min-h-screen text-zinc-950">
      <div className="mx-auto grid min-h-screen max-w-[96rem] gap-4 px-3 py-3 lg:grid-cols-[17rem_minmax(0,1fr)] lg:px-4 lg:py-4">
        <aside className="rounded-[2rem] border border-white/70 bg-white/78 shadow-[0_24px_64px_-40px_rgba(85,58,34,0.4)] backdrop-blur-xl">
          <div className="flex h-full flex-col gap-8 p-5 lg:p-6">
            <AppWordmark />
            <nav aria-label="Dashboard navigation" className="flex-1">
              <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      className="inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-medium text-[color:oklch(0.47_0.023_38)] transition hover:bg-[color:oklch(0.968_0.01_80)] hover:text-zinc-950 lg:w-full"
                      href={item.href}
                    >
                      <Icon icon={item.icon} size={18} strokeWidth={1.8} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="rounded-[1.5rem] border border-[color:oklch(0.91_0.013_75)] bg-[linear-gradient(180deg,rgba(252,250,246,0.95),rgba(245,238,228,0.88))] p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
                Owner session
              </p>
              <p className="mt-2 font-heading text-xl text-[color:oklch(0.245_0.026_41)]">
                Controlled access workspace
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:oklch(0.49_0.024_39)]">
                Audit-backed document distribution with owner-defined QR behavior.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col rounded-[2rem] border border-white/70 bg-white/72 shadow-[0_24px_64px_-42px_rgba(85,58,34,0.38)] backdrop-blur-xl">
          <header className="flex flex-col gap-4 border-b border-[color:oklch(0.9_0.012_74)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
                Dashboard
              </p>
              <p className="mt-1 truncate font-heading text-2xl text-[color:oklch(0.245_0.026_41)]">
                {session.user.name}
              </p>
              <p className="mt-1 text-sm text-[color:oklch(0.49_0.024_39)]">
                Monitor processing, trust policies, and public access outcomes.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                className={buttonVariants({
                  variant: "primary",
                  className: "w-full sm:w-auto",
                })}
                href="/dashboard/documents/new"
              >
                <Icon icon={FileUploadIcon} size={18} strokeWidth={1.8} />
                New Document
              </Link>
              <form action={logout}>
                <button
                  className={buttonVariants({
                    variant: "secondary",
                    className: "w-full sm:w-auto",
                  })}
                  type="submit"
                >
                  <Icon icon={Logout03Icon} size={18} strokeWidth={1.8} />
                  Sign out
                </button>
              </form>
            </div>
          </header>

          <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
