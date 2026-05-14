"use client";

// Owns the QR behavior and access settings form for Stage 10.
// Collects owner policy choices before document processing.
// Includes required legal authority confirmation per platform rules.
// Must remain client-side for form interactivity only; validation is server-enforced.
import { startTransition, useState } from "react";

import { saveQrSettings } from "@/features/documents/actions/qr-settings-actions";
import type { QrSettingsInput } from "@/features/documents/schemas/qr-settings-schema";

interface QrSettingsFormProps {
  publicId: string;
  initialValues?: Partial<QrSettingsInput>;
  onSaved?: () => void;
}

type QrMode = "VERIFY" | "OPEN" | "DOWNLOAD";

const QR_MODE_LABELS: Record<QrMode, { label: string; description: string }> = {
  VERIFY: {
    label: "Verify only",
    description:
      "Scanner sees a verification page that confirms document authenticity without revealing the full PDF.",
  },
  OPEN: {
    label: "Open in browser",
    description:
      "Scanner can view the PDF in their browser. No download option is provided.",
  },
  DOWNLOAD: {
    label: "Allow download",
    description:
      "Scanner can download the PDF file after verification. Use with caution for sensitive documents.",
  },
};

export function QrSettingsForm({
  publicId,
  initialValues,
  onSaved,
}: QrSettingsFormProps) {
  const [qrMode, setQrMode] = useState<QrMode>(
    initialValues?.qrMode ?? "VERIFY",
  );
  const [expiresAt, setExpiresAt] = useState<string>(
    initialValues?.expiresAt
      ? new Date(initialValues.expiresAt).toISOString().slice(0, 16)
      : "",
  );
  const [maxAccessCount, setMaxAccessCount] = useState<string>(
    initialValues?.maxAccessCount?.toString() ?? "",
  );
  const [requiresPin, setRequiresPin] = useState<boolean>(
    initialValues?.requiresPin ?? false,
  );
  const [pin, setPin] = useState<string>("");
  const [isEnabled, setIsEnabled] = useState<boolean>(
    initialValues?.isEnabled ?? true,
  );
  const [legalConfirmed, setLegalConfirmed] = useState<boolean>(false);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message?: string;
    errors?: Array<{ path: string; message: string }>;
  }>({ type: "idle" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: "idle" });

    const input: QrSettingsInput = {
      publicId,
      qrMode,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      maxAccessCount: maxAccessCount
        ? Number.parseInt(maxAccessCount, 10)
        : undefined,
      requiresPin,
      pin: requiresPin ? pin : undefined,
      isEnabled,
      legalConfirmed: true as const,
    };

    startTransition(async () => {
      const result = await saveQrSettings(input);

      setStatus({
        type: result.status,
        message: result.message,
        errors: "errors" in result ? result.errors : undefined,
      });
      setSaving(false);

      if (result.status === "success" && onSaved) {
        onSaved();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* QR Behavior Mode */}
      <fieldset>
        <legend className="text-sm font-medium text-zinc-950">
          QR behavior
        </legend>
        <p className="mt-1 text-sm text-zinc-500">
          Choose what happens when someone scans the QR code on this document.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {(
            Object.entries(QR_MODE_LABELS) as [
              QrMode,
              (typeof QR_MODE_LABELS)[QrMode],
            ][]
          ).map(([mode, info]) => (
            <label
              key={mode}
              className={`cursor-pointer rounded-lg border p-4 transition ${
                qrMode === mode
                  ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              }`}
            >
              <input
                type="radio"
                name="qrMode"
                value={mode}
                checked={qrMode === mode}
                onChange={() => setQrMode(mode)}
                className="sr-only"
              />
              <p
                className={`text-sm font-medium ${
                  qrMode === mode ? "text-blue-700" : "text-zinc-950"
                }`}
              >
                {info.label}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{info.description}</p>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Expiration */}
      <div>
        <label
          htmlFor="expiresAt"
          className="text-sm font-medium text-zinc-950"
        >
          Expiration date{" "}
          <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <p className="mt-1 text-sm text-zinc-500">
          The document will be inaccessible after this date. Leave empty for no
          expiration.
        </p>
        <input
          id="expiresAt"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="mt-2 block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-950 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Max Access Count */}
      <div>
        <label
          htmlFor="maxAccessCount"
          className="text-sm font-medium text-zinc-950"
        >
          Max access count{" "}
          <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <p className="mt-1 text-sm text-zinc-500">
          Limit how many times this document can be accessed. Leave empty for
          unlimited.
        </p>
        <input
          id="maxAccessCount"
          type="number"
          min={1}
          max={1000000}
          value={maxAccessCount}
          onChange={(e) => setMaxAccessCount(e.target.value)}
          placeholder="Unlimited"
          className="mt-2 block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-950 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* PIN Protection */}
      <fieldset className="rounded-lg border border-zinc-200 p-4">
        <div className="flex items-start gap-3">
          <input
            id="requiresPin"
            type="checkbox"
            checked={requiresPin}
            onChange={(e) => setRequiresPin(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-200"
          />
          <div className="flex-1">
            <label
              htmlFor="requiresPin"
              className="text-sm font-medium text-zinc-950"
            >
              Require PIN to access
            </label>
            <p className="mt-1 text-sm text-zinc-500">
              Add a PIN that scanners must enter before viewing or downloading
              the document. The PIN is hashed before storage and never stored in
              plaintext.
            </p>
            {requiresPin ? (
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter a PIN (4+ characters)"
                minLength={4}
                maxLength={64}
                required
                className="mt-3 block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-950 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            ) : null}
          </div>
        </div>
      </fieldset>

      {/* Enable/Disable */}
      <fieldset>
        <legend className="text-sm font-medium text-zinc-950">
          Document status
        </legend>
        <p className="mt-1 text-sm text-zinc-500">
          You can disable access later from document management.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEnabled(true)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              isEnabled
                ? "border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300"
            }`}
          >
            Enabled
          </button>
          <button
            type="button"
            onClick={() => setIsEnabled(false)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              !isEnabled
                ? "border-amber-400 bg-amber-50 text-amber-700 ring-2 ring-amber-200"
                : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300"
            }`}
          >
            Disabled
          </button>
        </div>
      </fieldset>

      {/* Legal Confirmation */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <div className="flex items-start gap-3">
          <input
            id="legalConfirmed"
            type="checkbox"
            checked={legalConfirmed}
            onChange={(e) => setLegalConfirmed(e.target.checked)}
            required
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-200"
          />
          <div>
            <label
              htmlFor="legalConfirmed"
              className="text-sm font-medium text-zinc-950"
            >
              Legal authority confirmation
            </label>
            <p className="mt-1 text-sm text-zinc-600">
              By checking this box, I confirm that I have the legal authority to
              distribute this document and will not use this platform for fraud,
              forgery, falsification, impersonation, or any unlawful purpose. I
              understand that misuse may result in account termination and legal
              action.
            </p>
          </div>
        </div>
      </div>

      {/* Status messages */}
      {status.type !== "idle" && status.message ? (
        <div
          className={
            status.type === "success"
              ? "rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              : "rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          }
        >
          <p>{status.message}</p>
          {status.errors && status.errors.length > 0 ? (
            <ul className="mt-2 list-inside list-disc">
              {status.errors.map((err) => (
                <li key={err.path}>{err.message}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving || !legalConfirmed}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {saving ? "Saving..." : "Save Access Settings"}
      </button>
    </form>
  );
}
