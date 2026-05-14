// Owns QR code image generation for PDF embedding.
// Produces high-quality PNG output suitable for vector overlay placement via pdf-lib.
// Must never embed raw Supabase storage URLs or internal secrets in the QR payload.
// Uses the `qrcode` package with error correction and sizing tuned for print-quality PDF output.
import "server-only";

import QRCode from "qrcode";

export interface QrGenerationOptions {
  /** Width in pixels of the output PNG. Default: 512 */
  width?: number;
  /** Error correction level. Default: 'H' (high — 30% recovery) */
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  /** Margin around the QR code in modules. Default: 2 */
  margin?: number;
  /** Color for the dark modules. Default: '#000000' */
  darkColor?: string;
  /** Color for the light modules. Default: '#ffffff' */
  lightColor?: string;
}

export interface QrGenerationResult {
  /** PNG buffer ready for pdf-lib embedding */
  pngBuffer: Buffer;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
}

const DEFAULT_OPTIONS: Required<QrGenerationOptions> = {
  width: 512,
  errorCorrectionLevel: "H",
  margin: 2,
  darkColor: "#000000",
  lightColor: "#ffffff",
};

/**
 * Generates a high-quality QR code PNG buffer from a URL string.
 *
 * Uses error correction level H (30%) to ensure scannability even after
 * PDF embedding and potential print degradation.
 *
 * Returns a Buffer (not base64) so pdf-lib can embed it directly as raw bytes.
 */
export async function generateQrPng(
  url: string,
  options: QrGenerationOptions = {},
): Promise<QrGenerationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const pngBuffer = await QRCode.toBuffer(url, {
    type: "png",
    width: opts.width,
    errorCorrectionLevel: opts.errorCorrectionLevel,
    margin: opts.margin,
    color: {
      dark: opts.darkColor,
      light: opts.lightColor,
    },
  });

  return {
    pngBuffer,
    width: opts.width,
    height: opts.width, // QR codes are always square
  };
}

/**
 * Generates a QR code as a data URL (base64-encoded PNG).
 * Useful for preview rendering in the browser without exposing raw buffers.
 */
export async function generateQrDataUrl(
  url: string,
  options: QrGenerationOptions = {},
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return QRCode.toDataURL(url, {
    type: "image/png",
    width: opts.width,
    errorCorrectionLevel: opts.errorCorrectionLevel,
    margin: opts.margin,
    color: {
      dark: opts.darkColor,
      light: opts.lightColor,
    },
  });
}
