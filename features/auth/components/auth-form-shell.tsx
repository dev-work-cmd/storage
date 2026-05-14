// Owns the restrained visual shell for setup and login forms.
// Keeps auth pages consistent without introducing a broader design system yet.
// Must remain server-compatible so individual forms decide their client boundary.
import type { ReactNode } from "react";

import { AppWordmark } from "@/components/shared/app-wordmark";

type AuthFormShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthFormShell({
  title,
  description,
  children,
}: AuthFormShellProps) {
  return (
    <main className="min-h-screen px-5 py-8 text-zinc-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center gap-8">
        <AppWordmark />
        <section className="rounded-[2rem] border border-white/75 bg-white/84 p-7 shadow-[0_24px_64px_-38px_rgba(85,58,34,0.42)] backdrop-blur-xl">
          <div className="mb-6 space-y-2">
            <p className="text-[0.7rem] uppercase tracking-[0.3em] text-[color:oklch(0.5_0.024_38)]">
              Owner access
            </p>
            <h1 className="text-3xl text-[color:oklch(0.245_0.026_41)]">
              {title}
            </h1>
            <p className="text-sm leading-6 text-[color:oklch(0.49_0.024_39)]">
              {description}
            </p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
