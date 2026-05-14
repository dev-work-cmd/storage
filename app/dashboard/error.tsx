"use client";

import { useEffect } from "react";

import { buttonVariants } from "@/components/ui/button";

export default function DashboardError({
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
    <div className="rounded-[2rem] border border-[color:oklch(0.9_0.012_74)] bg-white/82 p-8 shadow-[0_24px_64px_-42px_rgba(85,58,34,0.2)]">
      <p className="text-xs uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
        Dashboard error
      </p>
      <h1 className="mt-3 font-heading text-3xl text-[color:oklch(0.245_0.026_41)]">
        This owner page could not load.
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:oklch(0.49_0.024_39)]">
        The request failed before the dashboard could finish rendering. Retry
        the page. If it keeps failing, inspect the server logs.
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
          Retry dashboard
        </button>
      </div>
    </div>
  );
}
