"use client";

// Owns preview-only PDF.js rendering for uploaded documents.
// Keeps page, zoom, and viewport state controlled for later QR overlays.
// Must never be used as the final PDF processing or storage path.
// Supports both automatic QR detection and manual coordinate selection.
import { startTransition, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
  type PageViewport,
  type RenderTask,
} from "pdfjs-dist";

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

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).toString();

type PdfPreviewViewerProps = {
  fileUrl: string;
  publicId: string;
  initialQrBounds?: PdfBounds;
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
}: PdfPreviewViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<PageViewport | null>(null);
  const renderTokenRef = useRef(0);
  const [pdf, setPdf] = useState<PDFDocumentProxy>();
  const [selectedPage, setSelectedPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isRendering, setIsRendering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [detectedBounds, setDetectedBounds] = useState<ViewportBounds>();
  const [detectionState, setDetectionState] = useState<DetectionState>({
    status: "idle",
  });

  // Manual selector state
  const [mode, setMode] = useState<"detect" | "select">("detect");
  const [existingQrBounds] = useState(initialQrBounds);
  const [pageDimensions, setPageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isLoadingBounds] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadingTask = getDocument({
      url: fileUrl,
      withCredentials: true,
    });

    loadingTask.promise
      .then((loadedPdf) => {
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
      void loadingTask.destroy();
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

    let renderTask: RenderTask | undefined;

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

        // Capture page dimensions for coordinate conversion
        if (pageDimensions === null) {
          setPageDimensions({
            width: viewport.width / zoom,
            height: viewport.height / zoom,
          });
        }

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
  }, [pdf, selectedPage, zoom]);

  const pageCount = pdf?.numPages ?? 0;
  const isScanning = detectionState.status === "scanning";
  const canShowSelector =
    !isLoadingBounds &&
    pageDimensions &&
    (existingQrBounds || mode === "select");

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
        zoom={zoom}
      />

      {/* Mode toggle */}
      {isLoadingBounds ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-600">
          Loading QR data...
        </div>
      ) : existingQrBounds ? (
        <div className="flex gap-2 rounded-lg border border-zinc-200 bg-white p-3">
          <button
            onClick={() => setMode("detect")}
            className={`flex-1 rounded px-3 py-2 text-sm font-medium transition ${
              mode === "detect"
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            Detect QR
          </button>
          <button
            onClick={() => setMode("select")}
            className={`flex-1 rounded px-3 py-2 text-sm font-medium transition ${
              mode === "select"
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            Adjust Manually
          </button>
        </div>
      ) : null}

      {detectionState.message && mode === "detect" ? (
        <div
          className={
            detectionState.status === "success"
              ? "rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              : detectionState.status === "error"
                ? "rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
                : "rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700"
          }
        >
          {detectionState.message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="overflow-auto rounded-lg border border-zinc-200 bg-zinc-100 p-3">
        <div className="flex min-h-112 min-w-full items-start justify-center">
          {mode === "select" && canShowSelector && pageDimensions ? (
            <QrManualSelector
              publicId={publicId}
              canvasWidth={pageDimensions.width * zoom}
              canvasHeight={pageDimensions.height * zoom}
              pageNumber={selectedPage}
              pageWidth={pageDimensions.width}
              pageHeight={pageDimensions.height}
              initialPdfBounds={
                existingQrBounds && existingQrBounds.pageNumber === selectedPage
                  ? existingQrBounds
                  : undefined
              }
              onSave={() => {
                setMode("detect");
                setDetectionState({
                  status: "success",
                  message:
                    "QR area saved successfully. Proceed to the next step when ready.",
                });
              }}
            />
          ) : (
            <div className="relative">
              <canvas
                ref={canvasRef}
                aria-label="PDF page preview"
                className="max-w-none bg-white shadow-sm"
              />
              {detectedBounds && mode === "detect" ? (
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
