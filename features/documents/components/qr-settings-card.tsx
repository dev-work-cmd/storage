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
          onClick={() => setIsExpanded(true)}
          className="w-full rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center transition hover:border-zinc-400 hover:bg-zinc-100"
        >
          <p className="text-sm font-medium text-zinc-600">
            Configure QR behavior & access settings
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Required before processing the document
          </p>
        </button>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950">
                QR behavior & access settings
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Define what happens when someone scans the QR code on this
                document.
              </p>
            </div>
            {hasSaved ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
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
