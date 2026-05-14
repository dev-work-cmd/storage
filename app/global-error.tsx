"use client";

import { useEffect } from "react";

import { buttonVariants } from "@/components/ui/button";

import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-950">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
          <div className="w-full rounded-[2rem] border border-white/70 bg-white/88 p-8 shadow-[0_24px_64px_-42px_rgba(85,58,34,0.38)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
              Application error
            </p>
            <h1 className="mt-3 font-heading text-3xl text-[color:oklch(0.245_0.026_41)]">
              The request could not be completed.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:oklch(0.49_0.024_39)]">
              A server error interrupted this page. Retry the request. If the
              problem persists, review the server logs with the error digest.
            </p>
            {error.digest ? (
              <p className="mt-4 text-xs text-[color:oklch(0.5_0.024_38)]">
                Error digest: {error.digest}
              </p>
            ) : null}
            <div className="mt-6">
              <button
                className={buttonVariants({ variant: "primary" })}
                onClick={() => unstable_retry()}
                type="button"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
