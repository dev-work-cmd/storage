"use client";

// Owns the QR behavior and access settings form for Stage 10.
// Collects owner policy choices before document processing.
// Includes required legal authority confirmation per platform rules.
// Must remain client-side for form interactivity only; validation is server-enforced.
import { startTransition, useState } from "react";

import { saveQrSettings } from "@/features/documents/actions/qr-settings-actions";
import type { QrSettingsInput } from "@/features/documents/schemas/qr-settings-schema";
import { buttonVariants } from "@/components/ui/button";

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
      legalConfirmed,
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
      <fieldset>
        <legend className="text-sm font-medium text-zinc-950">
          Scan result
        </legend>
        <p className="mt-1 text-sm text-[color:oklch(0.49_0.024_39)]">
          Choose what people can do after scanning the QR code.
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
              className={`cursor-pointer rounded-[1.4rem] border p-4 transition ${
                qrMode === mode
                  ? "border-[color:oklch(0.62_0.073_32.8)] bg-[linear-gradient(180deg,rgba(255,246,238,0.98),rgba(250,239,227,0.95))] ring-2 ring-[color:oklch(0.86_0.026_68)]"
                  : "border-[color:oklch(0.89_0.015_74)] bg-white/82 hover:border-[color:oklch(0.8_0.022_57)]"
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
                  qrMode === mode
                    ? "text-[color:oklch(0.33_0.075_31.5)]"
                    : "text-zinc-950"
                }`}
              >
                {info.label}
              </p>
              <p className="mt-2 text-xs leading-5 text-[color:oklch(0.49_0.024_39)]">
                {info.description}
              </p>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="expiresAt"
          className="text-sm font-medium text-zinc-950"
        >
          Expiration date{" "}
          <span className="font-normal text-[color:oklch(0.6_0.02_42)]">(optional)</span>
        </label>
        <p className="mt-1 text-sm text-[color:oklch(0.49_0.024_39)]">
          The document will be inaccessible after this date. Leave empty for no
          expiration.
        </p>
        <input
          id="expiresAt"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="mt-2 block w-full rounded-2xl border border-[color:oklch(0.89_0.015_74)] bg-white/85 px-4 py-3 text-sm text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] focus:border-[color:oklch(0.62_0.073_32.8)] focus:outline-none focus:ring-4 focus:ring-[color:oklch(0.88_0.025_68)]"
        />
      </div>

      <div>
        <label
          htmlFor="maxAccessCount"
          className="text-sm font-medium text-zinc-950"
        >
          Max access count{" "}
          <span className="font-normal text-[color:oklch(0.6_0.02_42)]">(optional)</span>
        </label>
        <p className="mt-1 text-sm text-[color:oklch(0.49_0.024_39)]">
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
          className="mt-2 block w-full rounded-2xl border border-[color:oklch(0.89_0.015_74)] bg-white/85 px-4 py-3 text-sm text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] focus:border-[color:oklch(0.62_0.073_32.8)] focus:outline-none focus:ring-4 focus:ring-[color:oklch(0.88_0.025_68)]"
        />
      </div>

      <fieldset className="rounded-[1.5rem] border border-[color:oklch(0.89_0.015_74)] bg-white/62 p-5">
        <div className="flex items-start gap-3">
          <input
            id="requiresPin"
            type="checkbox"
            checked={requiresPin}
            onChange={(e) => setRequiresPin(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-[color:oklch(0.36_0.08_33.5)] focus:ring-[color:oklch(0.88_0.025_68)]"
          />
          <div className="flex-1">
            <label
              htmlFor="requiresPin"
              className="text-sm font-medium text-zinc-950"
            >
              Require PIN to access
            </label>
            <p className="mt-1 text-sm text-[color:oklch(0.49_0.024_39)]">
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
                className="mt-3 block w-full rounded-2xl border border-[color:oklch(0.89_0.015_74)] bg-white/88 px-4 py-3 text-sm text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] focus:border-[color:oklch(0.62_0.073_32.8)] focus:outline-none focus:ring-4 focus:ring-[color:oklch(0.88_0.025_68)]"
              />
            ) : null}
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-zinc-950">
          Document status
        </legend>
        <p className="mt-1 text-sm text-[color:oklch(0.49_0.024_39)]">
          You can disable access later from document management.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEnabled(true)}
            className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
              isEnabled
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200"
                : "border-[color:oklch(0.89_0.015_74)] bg-white/82 text-[color:oklch(0.49_0.024_39)] hover:border-[color:oklch(0.8_0.022_57)]"
            }`}
          >
            Enabled
          </button>
          <button
            type="button"
            onClick={() => setIsEnabled(false)}
            className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
              !isEnabled
                ? "border-amber-300 bg-amber-50 text-amber-800 ring-2 ring-amber-200"
                : "border-[color:oklch(0.89_0.015_74)] bg-white/82 text-[color:oklch(0.49_0.024_39)] hover:border-[color:oklch(0.8_0.022_57)]"
            }`}
          >
            Disabled
          </button>
        </div>
      </fieldset>

      <div className="rounded-[1.5rem] border border-[color:oklch(0.89_0.015_74)] bg-[linear-gradient(180deg,rgba(252,250,246,0.95),rgba(245,238,228,0.9))] p-5">
        <div className="flex items-start gap-3">
          <input
            id="legalConfirmed"
            type="checkbox"
            checked={legalConfirmed}
            onChange={(e) => setLegalConfirmed(e.target.checked)}
            required
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-[color:oklch(0.36_0.08_33.5)] focus:ring-[color:oklch(0.88_0.025_68)]"
          />
          <div>
            <label
              htmlFor="legalConfirmed"
              className="text-sm font-medium text-zinc-950"
            >
              Legal authority confirmation
            </label>
            <p className="mt-1 text-sm text-[color:oklch(0.45_0.024_39)]">
              By checking this box, I confirm that I have the legal authority to
              distribute this document and will not use this platform for fraud,
              forgery, falsification, impersonation, or any unlawful purpose. I
              understand that misuse may result in account termination and legal
              action.
            </p>
          </div>
        </div>
      </div>

      {status.type !== "idle" && status.message ? (
        <div
          className={
            status.type === "success"
              ? "rounded-[1.4rem] border border-emerald-200 bg-[linear-gradient(180deg,rgba(237,251,243,0.98),rgba(226,246,235,0.95))] p-4 text-sm text-emerald-900"
              : "rounded-[1.4rem] border border-red-200 bg-[linear-gradient(180deg,rgba(254,242,242,0.98),rgba(252,226,226,0.95))] p-4 text-sm text-red-900"
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

      <button
        type="submit"
        disabled={saving || !legalConfirmed}
        className={buttonVariants({
          className: "w-full h-11",
        })}
      >
        {saving ? "Saving..." : "Save Access Settings"}
      </button>
    </form>
  );
}
