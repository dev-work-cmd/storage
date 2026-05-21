"use client";

// Owns the collapsible card wrapper for QR behavior and access settings.
// Loads existing settings from the server and delegates to the settings form.
// Uses React.lazy-like pattern via card UI for clean section separation.
import { useCallback, useState } from "react";
import { QrSettingsForm } from "@/features/documents/components/qr-settings-form";
import type { DocumentQrSettings } from "@/features/documents/server/get-document-qr-settings";

interface QrSettingsCardProps {
  publicId: string;
  initialSettings?: DocumentQrSettings;
}

function convertSettingsForForm(settings?: DocumentQrSettings) {
  if (!settings) return undefined;
  return {
    ...settings,
    expiresAt: settings.expiresAt ?? undefined,
    maxAccessCount: settings.maxAccessCount ?? undefined,
  };
}

export function QrSettingsCard({
  publicId,
  initialSettings,
}: QrSettingsCardProps) {
  const [isExpanded, setIsExpanded] = useState(!!initialSettings);
  const [hasSaved, setHasSaved] = useState(false);

  const handleSaved = useCallback(() => {
    setHasSaved(true);
  }, []);

  return (
    <div className="space-y-4">
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="w-full rounded-[1.8rem] border border-dashed border-[color:oklch(0.85_0.018_70)] bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(245,239,230,0.56))] p-7 text-center transition hover:border-[color:oklch(0.76_0.025_60)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(244,237,227,0.68))]"
        >
          <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
            Step 3
          </p>
          <p className="mt-3 text-base font-medium text-[color:oklch(0.245_0.026_41)]">
            Choose what scanning the QR should do
          </p>
          <p className="mt-2 text-sm text-[color:oklch(0.49_0.024_39)]">
            Required before creating the final PDF
          </p>
        </button>
      ) : (
        <div className="rounded-[1.8rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,244,237,0.88))] shadow-[0_20px_52px_-36px_rgba(85,58,34,0.35)]">
          <div className="flex items-center justify-between border-b border-[color:oklch(0.9_0.012_74)] px-6 py-5">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:oklch(0.5_0.024_38)]">
                Step 3
              </p>
              <h2 className="mt-2 text-2xl text-[color:oklch(0.245_0.026_41)]">
                What should happen when someone scans the QR?
              </h2>
              <p className="mt-1 text-sm text-[color:oklch(0.49_0.024_39)]">
                Choose whether people can verify, open, or download the final
                PDF.
              </p>
            </div>
            {hasSaved ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Saved
              </span>
            ) : null}
          </div>
          <div className="px-6 py-4">
            <QrSettingsForm
              publicId={publicId}
              initialValues={convertSettingsForForm(initialSettings)}
              onSaved={handleSaved}
            />
          </div>
        </div>
      )}
    </div>
  );
}
