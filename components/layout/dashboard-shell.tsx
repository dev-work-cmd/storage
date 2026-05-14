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
    label: "Upload",
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
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="grid min-h-screen lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="border-b border-zinc-200 bg-white lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col gap-6 p-5">
            <AppWordmark />
            <nav aria-label="Dashboard navigation" className="flex-1">
              <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 lg:w-full"
                      href={item.href}
                    >
                      <Icon icon={item.icon} size={18} strokeWidth={1.8} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex flex-col gap-4 border-b border-zinc-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
                Dashboard
              </p>
              <p className="mt-1 truncate text-sm font-medium text-zinc-950">
                {session.user.name}
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
                Upload PDF
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
