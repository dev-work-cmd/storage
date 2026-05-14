// Owns the public disclaimer page.
// Defines the permitted-use boundary and avoids unsupported legal or official claims.
// Must remain general information, not legal advice.
import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";
import { LegalPage } from "@/components/shared/legal-page";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Important limitations for authorized PDF QR replacement and public verification.",
};

export default function DisclaimerPage() {
  return (
    <PublicShell>
      <LegalPage
        eyebrow="Disclaimer"
        title="Use this service only for documents you are allowed to process."
        description="Secure PDF QR is a document storage and access-management tool. It does not make a document official, valid, certified, or approved by any authority."
        sections={[
          {
            title: "Authorized use only",
            body: (
              <p>
                You must have the legal right and practical authority to upload,
                process, and manage each document. Do not use this service to
                alter documents owned by someone else or documents you are not
                permitted to modify.
              </p>
            ),
          },
          {
            title: "Misuse is prohibited",
            body: (
              <p>
                Fraud, forgery, falsification, impersonation, unlawful
                modification, concealment of material information, or any use
                intended to mislead another person or organization is not
                allowed.
              </p>
            ),
          },
          {
            title: "Verification is limited",
            body: (
              <p>
                A verification page only confirms whether a document is
                available through this system under the owner&apos;s current
                access policy. It does not verify the truth, legal effect,
                issuer, approval status, or official authenticity of the
                document.
              </p>
            ),
          },
          {
            title: "No official endorsement",
            body: (
              <p>
                Secure PDF QR is not a government registry, not a certification
                authority, and not evidence of approval by any public agency,
                employer, school, issuer, or other third party.
              </p>
            ),
          },
        ]}
      />
    </PublicShell>
  );
}
