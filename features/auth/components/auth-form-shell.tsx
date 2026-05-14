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
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center gap-8">
        <AppWordmark />
        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm leading-6 text-zinc-600">{description}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
