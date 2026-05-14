// Owns the shared shell for public informational and legal pages.
// Keeps public navigation consistent without depending on authenticated app state.
// Must stay static and avoid exposing private document or storage details.
import type { ReactNode } from "react";
import Link from "next/link";

import { AppWordmark } from "@/components/shared/app-wordmark";
import { cn } from "@/lib/utils";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type PublicShellProps = {
  children: ReactNode;
  className?: string;
};

export function PublicShell({ children, className }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" aria-label="Secure PDF QR home">
            <AppWordmark />
          </Link>
          <nav aria-label="Public pages">
            <ul className="flex flex-wrap gap-3 text-sm text-zinc-600">
              {publicLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="rounded-sm px-1 py-1 transition hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className={cn("flex-1 py-10 sm:py-14", className)}>
          {children}
        </main>

        <footer className="border-t border-zinc-200 py-6 text-sm leading-6 text-zinc-500">
          <p>
            Secure PDF QR is for authorized document storage and access
            management. Public verification does not imply official approval.
          </p>
        </footer>
      </div>
    </div>
  );
}
