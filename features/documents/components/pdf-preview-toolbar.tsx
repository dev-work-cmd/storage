// Owns the presentation for PDF preview navigation, zoom, and detection controls.
// Keeps the viewer component focused on PDF.js rendering and detection state.
// Must remain stateless so later QR overlay tools can reuse the same controls.
import {
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

type PdfPreviewToolbarProps = {
  pageCount: number;
  selectedPage: number;
  zoom: number;
  isRendering: boolean;
  isScanning: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDetectQr: () => void;
  showDetectQr?: boolean;
};

export function PdfPreviewToolbar({
  pageCount,
  selectedPage,
  zoom,
  isRendering,
  isScanning,
  canZoomIn,
  canZoomOut,
  onPreviousPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onDetectQr,
  showDetectQr = true,
}: PdfPreviewToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(249,244,238,0.88))] p-4 shadow-[0_18px_44px_-34px_rgba(85,58,34,0.35)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[color:oklch(0.5_0.024_38)]">
          Preview controls
        </p>
        <div className="mt-1 text-sm text-[color:oklch(0.49_0.024_39)]">
          Page <span className="font-medium text-zinc-950">{selectedPage}</span>
        {pageCount ? ` of ${pageCount}` : null}
        {isRendering ? " · Rendering" : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className={buttonVariants({ variant: "secondary", size: "sm" })}
          disabled={selectedPage <= 1}
          onClick={onPreviousPage}
          type="button"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Previous
        </button>
        <button
          className={buttonVariants({ variant: "secondary", size: "sm" })}
          disabled={selectedPage >= pageCount}
          onClick={onNextPage}
          type="button"
        >
          Next
          <ArrowRight size={16} strokeWidth={1.8} />
        </button>
        <button
          className={buttonVariants({ variant: "secondary", size: "sm" })}
          disabled={!canZoomOut}
          onClick={onZoomOut}
          type="button"
        >
          <ZoomOut size={16} strokeWidth={1.8} />
          Zoom out
        </button>
        <button
          className={buttonVariants({ variant: "secondary", size: "sm" })}
          disabled={!canZoomIn}
          onClick={onZoomIn}
          type="button"
        >
          <ZoomIn size={16} strokeWidth={1.8} />
          Zoom in
        </button>
        <span className="inline-flex h-9 items-center rounded-xl border border-[color:oklch(0.89_0.015_74)] bg-white/70 px-3 text-sm text-[color:oklch(0.49_0.024_39)]">
          {Math.round(zoom * 100)}%
        </span>
        {showDetectQr ? (
          <button
            className={buttonVariants({ variant: "primary", size: "sm" })}
            disabled={isRendering || isScanning || pageCount === 0}
            onClick={onDetectQr}
            type="button"
          >
            {isScanning ? "Scanning..." : "Detect QR"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
