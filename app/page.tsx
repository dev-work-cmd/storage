// Owns the public home page and product positioning.
// States the authorized-use boundary without making unsupported security claims.
// Must stay static and avoid exposing internal storage or document details.
import type { Metadata } from "next";
import Link from "next/link";

import { PublicShell } from "@/components/layout/public-shell";

export const metadata: Metadata = {
  title: "Secure PDF QR Replacement",
  description:
    "Authorized PDF QR replacement and access management with app-controlled verification, open, and download flows.",
};

export default function Home() {
  return (
    <PublicShell>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] lg:gap-16">
        <section className="space-y-7">
          <div className="space-y-5">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
              Authorized PDF access management
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              Replace a PDF QR code while preserving the rest of the document.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
              Secure PDF QR is built for owners who have legal authority to
              manage their own documents. Uploaded PDFs remain private, QR
              payloads resolve through app-controlled routes, and public access
              depends on owner-defined verification, open, or download policy.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
              href="/setup"
            >
              Owner setup
            </Link>
          </div>
        </section>

        <section className="space-y-4 border-l border-zinc-200 pl-0 lg:pl-8">
          {[
            "Use only for documents you own or are authorized to process.",
            "Do not use the platform for fraud, forgery, falsification, impersonation, or unlawful modification.",
            "Verification pages confirm availability in this system only; they do not certify official status or government approval.",
            "Documents are not used for advertising, profiling, or AI training.",
          ].map((item) => (
            <div className="border-t border-zinc-200 pt-4" key={item}>
              <p className="text-sm leading-7 text-zinc-700">{item}</p>
            </div>
          ))}
        </section>
      </div>
    </PublicShell>
  );
}
