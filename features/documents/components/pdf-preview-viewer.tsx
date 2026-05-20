"use client";

// Owns preview-only PDF.js rendering for uploaded documents.
// Keeps page, zoom, and viewport state controlled for later QR overlays.
// Must never be used as the final PDF processing or storage path.
// Supports both automatic QR detection and manual coordinate selection.
import { startTransition, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

import {
  logQrDetectionFailure,
  saveDetectedQrBounds,
} from "@/features/documents/actions/qr-detection-actions";
import { PdfPreviewToolbar } from "@/features/documents/components/pdf-preview-toolbar";
import { QrManualSelector } from "@/features/documents/components/qr-manual-selector";
import {
  CoordinateConversionError,
  convertViewportBoundsToPdfBounds,
  type ViewportBounds,
} from "@/lib/pdf-coordinate-conversion";
import type { PdfBounds } from "@/lib/pdf-coordinate-conversion";

type PdfViewport = {
  width: number;
  height: number;
  convertToPdfPoint: (x: number, y: number) => number[];
};

type PdfRenderTask = {
  promise: Promise<void>;
  cancel: () => void;
};

type PdfPage = {
  getViewport: (input: { scale: number }) => PdfViewport;
  render: (input: {
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfViewport;
  }) => PdfRenderTask;
};

type PdfDocumentProxy = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
  destroy: () => void;
};

type PdfLoadingTask = {
  promise: Promise<PdfDocumentProxy>;
  destroy: () => Promise<void>;
};

type PdfPreviewViewerProps = {
  fileUrl: string;
  publicId: string;
  initialQrBounds?: PdfBounds;
  allowQrEditing?: boolean;
  editingExperience?: "replace" | "insert";
};

type DetectionState =
  | { status: "idle"; message?: string }
  | { status: "scanning"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;

function boundsFromQrLocation(
  location: NonNullable<ReturnType<typeof jsQR>>["location"],
) {
  const points = [
    location.topLeftCorner,
    location.topRightCorner,
    location.bottomRightCorner,
    location.bottomLeftCorner,
  ];
  const xValues = points.map((point) => point.x);
  const yValues = points.map((point) => point.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function PdfPreviewViewer({
  fileUrl,
  publicId,
  initialQrBounds,
  allowQrEditing = true,
  editingExperience = "replace",
}: PdfPreviewViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<PdfViewport | null>(null);
  const renderTokenRef = useRef(0);
  const [pdf, setPdf] = useState<PdfDocumentProxy>();
  const [selectedPage, setSelectedPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isRendering, setIsRendering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [detectedBounds, setDetectedBounds] = useState<ViewportBounds>();
  const [detectionState, setDetectionState] = useState<DetectionState>({
    status: "idle",
  });

  // Manual selector state
  const [mode, setMode] = useState<"detect" | "select">(
    editingExperience === "insert" ? "select" : "detect",
  );
  const [existingQrBounds] = useState(initialQrBounds);
  const [pageDimensions, setPageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isLoadingBounds] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: PdfLoadingTask | undefined;

    void import("pdfjs-dist")
      .then(async ({ getDocument, GlobalWorkerOptions }) => {
        GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.mjs",
          import.meta.url,
        ).toString();

        loadingTask = getDocument({
          url: fileUrl,
          withCredentials: true,
        }) as unknown as PdfLoadingTask;

        const loadedPdf = await loadingTask.promise;

        if (!cancelled) {
          setErrorMessage(undefined);
          setSelectedPage(1);
          setPdf(loadedPdf);
        } else {
          loadedPdf.destroy();
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage("The PDF preview could not be loaded.");
        }
      });

    return () => {
      cancelled = true;
      if (loadingTask) {
        void loadingTask.destroy();
      }
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const renderToken = renderTokenRef.current + 1;
    renderTokenRef.current = renderToken;
    setIsRendering(true);

    let renderTask: PdfRenderTask | undefined;

    pdf
      .getPage(selectedPage)
      .then((page) => {
        if (renderTokenRef.current !== renderToken) {
          return;
        }

        const viewport = page.getViewport({ scale: zoom });
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas context unavailable.");
        }

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        viewportRef.current = viewport;

        setPageDimensions({
          width: viewport.width / zoom,
          height: viewport.height / zoom,
        });

        setDetectedBounds(undefined);
        setDetectionState({ status: "idle" });

        renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport,
        });

        return renderTask.promise;
      })
      .catch((error) => {
        if (error?.name !== "RenderingCancelledException") {
          setErrorMessage("The PDF page could not be rendered.");
        }
      })
      .finally(() => {
        if (renderTokenRef.current === renderToken) {
          setIsRendering(false);
        }
      });

    return () => {
      renderTask?.cancel();
    };
  }, [
    pdf,
    selectedPage,
    zoom,
    allowQrEditing,
    mode,
    editingExperience,
    existingQrBounds,
    isLoadingBounds,
  ]);

  const pageCount = pdf?.numPages ?? 0;
  const isScanning = detectionState.status === "scanning";
  const supportsDetection =
    allowQrEditing && editingExperience === "replace";
  const isManualMode = allowQrEditing && mode === "select";
  const canShowSelector =
    !isLoadingBounds &&
    pageDimensions &&
    (editingExperience === "insert" || existingQrBounds || mode === "select");

  function detectQrOnCurrentPage() {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !viewport || !context || isRendering) {
      setDetectionState({
        status: "error",
        message:
          "Wait for the current page to finish rendering before scanning.",
      });
      return;
    }

    setDetectionState({
      status: "scanning",
      message: "Scanning the current preview page for a QR code.",
    });

    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });

      if (!code) {
        startTransition(async () => {
          await logQrDetectionFailure({
            publicId,
            pageNumber: selectedPage,
            reason: "no_qr_detected",
          });
        });
        setDetectedBounds(undefined);
        setDetectionState({
          status: "error",
          message:
            "No QR code was detected on this page. Use manual selection next.",
        });
        return;
      }

      const viewportBounds = boundsFromQrLocation(code.location);
      let pdfBounds;

      try {
        pdfBounds = convertViewportBoundsToPdfBounds(viewport, viewportBounds, {
          pageNumber: selectedPage,
        });
      } catch (conversionError) {
        if (conversionError instanceof CoordinateConversionError) {
          startTransition(async () => {
            await logQrDetectionFailure({
              publicId,
              pageNumber: selectedPage,
              reason: "coordinate_conversion",
            });
          });
          setDetectedBounds(undefined);
          setDetectionState({
            status: "error",
            message: `Coordinate conversion failed: ${conversionError.message}`,
          });
          return;
        }
        throw conversionError;
      }

      setDetectedBounds(viewportBounds);

      startTransition(async () => {
        const result = await saveDetectedQrBounds({
          publicId,
          pageNumber: selectedPage,
          source: "DETECTION",
          x: pdfBounds.x,
          y: pdfBounds.y,
          width: pdfBounds.width,
          height: pdfBounds.height,
        });

        setDetectionState({
          status: result.status,
          message:
            result.status === "success"
              ? "QR detected and PDF coordinates saved. You can adjust them in the manual selector later."
              : result.message,
        });
      });
    } catch (error) {
      startTransition(async () => {
        await logQrDetectionFailure({
          publicId,
          pageNumber: selectedPage,
          reason: "client_error",
        });
      });
      setDetectedBounds(undefined);
      setDetectionState({
        status: "error",
        message:
          error instanceof Error
            ? `Detection error: ${error.message}`
            : "An unexpected error occurred during QR detection.",
      });
    }
  }

  return (
    <div className="space-y-4">
      <PdfPreviewToolbar
        canZoomIn={zoom < MAX_ZOOM}
        canZoomOut={zoom > MIN_ZOOM}
        isRendering={isRendering}
        isScanning={isScanning}
        onDetectQr={detectQrOnCurrentPage}
        onNextPage={() =>
          setSelectedPage((page) => Math.min(pageCount, page + 1))
        }
        onPreviousPage={() => setSelectedPage((page) => Math.max(1, page - 1))}
        onZoomIn={() =>
          setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))
        }
        onZoomOut={() =>
          setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))
        }
        pageCount={pageCount}
        selectedPage={selectedPage}
        showDetectQr={supportsDetection}
        zoom={zoom}
      />

      {/* Mode guidance */}
      {!allowQrEditing ? (
        <div className="rounded-[1.4rem] border border-emerald-200 bg-[linear-gradient(180deg,rgba(237,251,243,0.98),rgba(226,246,235,0.95))] p-4 text-sm text-emerald-950 shadow-[0_18px_40px_-34px_rgba(36,92,55,0.4)]">
          This PDF is not in edit mode. Choose an action above if you want to
          change the QR code.
        </div>
      ) : isLoadingBounds ? (
        <div className="rounded-[1.4rem] border border-[color:oklch(0.89_0.015_74)] bg-white/82 p-4 text-sm text-[color:oklch(0.49_0.024_39)]">
          Loading QR data...
        </div>
      ) : editingExperience === "insert" ? (
        <div className="rounded-[1.4rem] border border-[color:oklch(0.89_0.015_74)] bg-white/82 p-4 text-sm text-[color:oklch(0.47_0.023_38)] shadow-[0_16px_36px_-32px_rgba(85,58,34,0.3)]">
          Drag the box to the place where the new QR code should appear, then
          save the position.
        </div>
      ) : editingExperience === "replace" && mode === "select" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-amber-200 bg-[linear-gradient(180deg,rgba(255,248,231,0.98),rgba(252,241,212,0.92))] p-4 text-sm text-amber-950 shadow-[0_16px_36px_-32px_rgba(112,66,20,0.28)]">
          <p className="max-w-3xl">
            Manual positioning is active. Drag and resize the rectangle directly
            on top of the PDF, then save the position.
          </p>
          <button
            className="rounded-xl border border-amber-300 bg-white/75 px-3 py-2 text-sm font-medium text-amber-950 transition hover:bg-white"
            onClick={() => setMode("detect")}
            type="button"
          >
            Back to detection
          </button>
        </div>
      ) : editingExperience === "replace" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-[color:oklch(0.89_0.015_74)] bg-white/82 p-4 text-sm text-[color:oklch(0.47_0.023_38)] shadow-[0_16px_36px_-32px_rgba(85,58,34,0.3)]">
          <p className="max-w-3xl">
            Start by scanning this page for an existing QR code. If it misses,
            use manual positioning.
          </p>
          <button
            className="rounded-xl border border-[color:oklch(0.89_0.015_74)] bg-[color:oklch(0.96_0.008_80)] px-3 py-2 text-sm font-medium text-[color:oklch(0.26_0.026_40.5)] transition hover:bg-[color:oklch(0.94_0.012_76)]"
            onClick={() => setMode("select")}
            type="button"
          >
            Use manual positioning
          </button>
        </div>
      ) : null}

      {supportsDetection && detectionState.message && mode === "detect" ? (
        <div
          className={
            detectionState.status === "success"
              ? "rounded-[1.4rem] border border-emerald-200 bg-[linear-gradient(180deg,rgba(237,251,243,0.98),rgba(226,246,235,0.95))] p-4 text-sm text-emerald-900"
              : detectionState.status === "error"
                ? "rounded-[1.4rem] border border-amber-200 bg-[linear-gradient(180deg,rgba(255,248,231,0.98),rgba(252,241,212,0.92))] p-4 text-sm text-amber-950"
                : "rounded-[1.4rem] border border-[color:oklch(0.89_0.015_74)] bg-white/82 p-4 text-sm text-[color:oklch(0.47_0.023_38)]"
          }
        >
          {detectionState.message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-[1.4rem] border border-red-200 bg-[linear-gradient(180deg,rgba(254,242,242,0.98),rgba(252,226,226,0.95))] p-4 text-sm text-red-900">
          {errorMessage}
        </div>
      ) : null}

      <div className="overflow-auto rounded-[1.7rem] border border-[color:oklch(0.89_0.015_74)] bg-[linear-gradient(180deg,rgba(248,244,239,0.9),rgba(242,236,228,0.88))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
        <div className="flex min-h-112 min-w-full items-start justify-center">
          {isManualMode && canShowSelector && pageDimensions ? (
            <QrManualSelector
              publicId={publicId}
              canvasWidth={pageDimensions.width * zoom}
              canvasHeight={pageDimensions.height * zoom}
              pageNumber={selectedPage}
              pageWidth={pageDimensions.width}
              pageHeight={pageDimensions.height}
              zoom={zoom}
              initialPdfBounds={
                existingQrBounds && existingQrBounds.pageNumber === selectedPage
                  ? existingQrBounds
                  : undefined
              }
              onSave={() => {
                setMode(editingExperience === "insert" ? "select" : "detect");
                setDetectionState({
                  status: "success",
                  message:
                    editingExperience === "insert"
                      ? "QR position saved. Continue to step 3 when ready."
                      : "QR position saved. Continue to step 3 or scan again if needed.",
                });
              }}
              saveLabel={
                editingExperience === "insert"
                  ? "Save insertion position"
                  : "Save QR position"
              }
            >
              <canvas
                ref={canvasRef}
                aria-label="PDF page preview"
                className="block max-w-none bg-white shadow-sm"
              />
            </QrManualSelector>
          ) : (
            <div className="relative">
              <canvas
                ref={canvasRef}
                aria-label="PDF page preview"
                className="block max-w-none bg-white shadow-sm"
              />
              {supportsDetection && detectedBounds && mode === "detect" ? (
                <div
                  aria-label="Detected QR bounds"
                  className="pointer-events-none absolute border-2 border-emerald-500 bg-emerald-400/15"
                  style={{
                    height: detectedBounds.height,
                    left: detectedBounds.x,
                    top: detectedBounds.y,
                    width: detectedBounds.width,
                  }}
                />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
