// Owns small shared card primitives for operational dashboard surfaces.
// Keeps border, spacing, and heading rhythm consistent without nesting cards.
// Must stay unopinionated about data fetching and feature behavior.
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,250,243,0.88))] shadow-[0_22px_60px_-34px_rgba(85,58,34,0.35)] backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-b border-[color:oklch(0.9_0.012_74)] px-6 py-5 sm:px-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-6 py-5 sm:px-7", className)}>{children}</div>;
}
