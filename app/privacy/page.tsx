// Owns the public privacy page.
// States the platform privacy boundary without claiming zero-access or custom encryption.
// Must avoid promises that are not implemented in the current staged build.
import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";
import { LegalPage } from "@/components/shared/legal-page";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Privacy boundaries for uploaded documents, account data, and public verification pages.",
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <LegalPage
        eyebrow="Privacy"
        title="Documents are handled for storage, processing, and controlled access."
        description="This page explains the intended privacy boundary for the platform at this stage of the build."
        sections={[
          {
            title: "Document handling",
            body: (
              <p>
                Uploaded PDFs are used to provide the requested document
                workflow: upload, preview, QR region selection, QR replacement,
                storage, verification, open, and download access. Raw storage
                URLs are not intended to be exposed as public share links.
              </p>
            ),
          },
          {
            title: "No advertising or profiling use",
            body: (
              <p>
                Uploaded documents are not used for advertising, behavioral
                profiling, resale, or AI training. Operational records may be
                kept to support authentication, security, audit logging,
                document lifecycle management, and abuse prevention.
              </p>
            ),
          },
          {
            title: "Public verification data",
            body: (
              <p>
                Public verification pages should expose only the information
                required to evaluate the owner-controlled access flow. They are
                not a public document directory and should not reveal raw
                storage paths or private implementation details.
              </p>
            ),
          },
          {
            title: "Security claims",
            body: (
              <p>
                The platform does not currently claim zero-access storage or
                custom application-level encryption. Any encryption-at-rest
                wording should be added only after the final encryption stage is
                implemented and verified.
              </p>
            ),
          },
        ]}
      />
    </PublicShell>
  );
}
