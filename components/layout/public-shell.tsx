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
    <div className="min-h-screen text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="sticky top-4 z-20 mb-6 rounded-[1.75rem] border border-white/70 bg-white/75 px-5 py-4 shadow-[0_18px_48px_-32px_rgba(85,58,34,0.35)] backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" aria-label="Secure PDF QR home">
            <AppWordmark />
          </Link>
          <nav aria-label="Public pages">
            <ul className="flex flex-wrap gap-2 text-sm text-zinc-600">
              {publicLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="rounded-full border border-transparent px-3 py-2 transition hover:border-[color:oklch(0.89_0.016_74)] hover:bg-[color:oklch(0.98_0.006_84)] hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:oklch(0.36_0.08_33.5)]"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          </div>
        </header>

        <main className={cn("flex-1 py-10 sm:py-14", className)}>
          {children}
        </main>

        <footer className="mt-6 border-t border-[color:oklch(0.89_0.015_74)] py-6 text-sm leading-6 text-[color:oklch(0.5_0.024_38)]">
          <p>
            Secure PDF QR is for authorized document storage and access
            management. Public verification does not imply official approval.
          </p>
        </footer>
      </div>
    </div>
  );
}
