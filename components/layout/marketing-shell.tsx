// Owns the shared public-facing shell for early-stage routes.
// Keeps the landing layout consistent before later public/legal pages land.
// Must stay simple so Stage 04 can extend it without untangling page logic.
import type { ReactNode } from "react";

import { AppWordmark } from "@/components/shared/app-wordmark";
import { cn } from "@/lib/utils";

type MarketingShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export function MarketingShell({
  eyebrow,
  title,
  description,
  children,
  className,
}: MarketingShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-zinc-200 pb-6">
          <AppWordmark />
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
            Stage 01 Foundation
          </p>
        </header>

        <main
          className={cn(
            "flex flex-1 flex-col gap-10 py-12 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:gap-16",
            className,
          )}
        >
          <section className="space-y-6">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-zinc-500">
              {eyebrow}
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
                {description}
              </p>
            </div>
          </section>

          {children}
        </main>
      </div>
    </div>
  );
}
