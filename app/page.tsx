// Owns the public home page and product positioning.
// States the authorized-use boundary without making unsupported security claims.
// Must stay static and avoid exposing internal storage or document details.
import type { Metadata } from "next";
import Link from "next/link";

import { PublicShell } from "@/components/layout/public-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Secure PDF QR Replacement",
  description:
    "Authorized PDF QR replacement and access management with app-controlled verification, open, and download flows.",
};

export default function Home() {
  return (
    <PublicShell>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:items-start lg:gap-12">
        <section className="space-y-8">
          <div className="space-y-6">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[color:oklch(0.5_0.024_38)]">
              Authorized PDF access management
            </p>
            <h1 className="max-w-4xl text-5xl text-[color:oklch(0.245_0.026_41)] sm:text-6xl">
              Replace a PDF QR code while preserving the rest of the document.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[color:oklch(0.49_0.024_39)] sm:text-lg">
              Secure PDF QR is built for owners who have legal authority to
              manage their own documents. Uploaded PDFs remain private, QR
              payloads resolve through app-controlled routes, and public access
              depends on owner-defined verification, open, or download policy.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className={buttonVariants({ className: "h-11 px-5" })}
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className={buttonVariants({
                variant: "secondary",
                className: "h-11 px-5",
              })}
              href="/setup"
            >
              Owner setup
            </Link>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="grid gap-6 sm:grid-cols-3">
              {[
                ["Private intake", "Original PDFs remain in owner-controlled private storage."],
                ["Policy-aware QR", "Each scan resolves through verification, open, or download rules."],
                ["Audit visibility", "Access outcomes and lifecycle changes remain reviewable."],
              ].map(([title, description]) => (
                <div key={title}>
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[color:oklch(0.52_0.022_39)]">
                    {title}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[color:oklch(0.49_0.024_39)]">
                    {description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-5">
          <Card>
            <CardContent className="space-y-5">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:oklch(0.52_0.022_39)]">
                  Platform guardrails
                </p>
                <h2 className="mt-2 text-2xl text-[color:oklch(0.245_0.026_41)]">
                  Designed for controlled distribution, not generic file sharing
                </h2>
              </div>
              <div className="space-y-4">
          {[
            "Use only for documents you own or are authorized to process.",
            "Do not use the platform for fraud, forgery, falsification, impersonation, or unlawful modification.",
            "Verification pages confirm availability in this system only; they do not certify official status or government approval.",
            "Documents are not used for advertising, profiling, or AI training.",
          ].map((item) => (
                <div
                  className="rounded-2xl border border-[color:oklch(0.9_0.012_74)] bg-white/55 px-4 py-4"
                  key={item}
                >
                  <p className="text-sm leading-7 text-[color:oklch(0.42_0.024_39)]">
                    {item}
                  </p>
                </div>
              ))}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(235,223,206,0.52))] p-6 shadow-[0_24px_64px_-44px_rgba(85,58,34,0.45)]">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:oklch(0.52_0.022_39)]">
              Workflow
            </p>
            <div className="mt-4 space-y-3">
              {[
                "1. Upload a private original PDF.",
                "2. Detect or manually select the QR area.",
                "3. Define access rules, then process the document.",
              ].map((step) => (
                <p className="text-sm leading-7 text-[color:oklch(0.42_0.024_39)]" key={step}>
                  {step}
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
