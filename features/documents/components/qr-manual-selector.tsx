"use client";

// Owns manual QR coordinate selection with drag/resize UI.
// Displays stored or detected QR bounds as a starting point.
// Handles coordinate system conversion between viewport and PDF space.
// Persists final bounds through server action.
import type { ReactNode } from "react";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Rnd } from "react-rnd";

import { saveDetectedQrBounds } from "@/features/documents/actions/qr-detection-actions";
import {
  convertPdfBoundsToViewportBounds,
  convertViewportBoundsToPdfBoundsWithOrigin,
  type PdfPageInfo,
} from "@/server/services/qr/coordinate-system";
import type { PdfBounds } from "@/lib/pdf-coordinate-conversion";

interface QrManualSelectorProps {
  publicId: string;
  canvasWidth: number;
  canvasHeight: number;
  pageNumber: number;
  pageWidth: number;
  pageHeight: number;
  zoom: number;
  initialPdfBounds?: PdfBounds;
  onSave?: () => void;
  children?: ReactNode;
  saveLabel?: string;
}

interface SelectorState {
  status: "idle" | "saving" | "success" | "error";
  message?: string;
}

export function QrManualSelector({
  publicId,
  canvasWidth,
  canvasHeight,
  pageNumber,
  pageWidth,
  pageHeight,
  zoom,
  initialPdfBounds,
  onSave,
  children,
  saveLabel = "Save QR Area",
}: QrManualSelectorProps) {
  const pageInfo: PdfPageInfo = useMemo(
    () => ({ width: pageWidth, height: pageHeight }),
    [pageWidth, pageHeight],
  );

  const initialViewportBounds = useMemo(() => {
    if (!initialPdfBounds) {
      return {
        x: canvasWidth * 0.2,
        y: canvasHeight * 0.2,
        width: canvasWidth * 0.3,
        height: canvasHeight * 0.3,
      };
    }

    const unscaledBounds = convertPdfBoundsToViewportBounds(
      initialPdfBounds,
      pageInfo,
    );

    return {
      x: unscaledBounds.x * zoom,
      y: unscaledBounds.y * zoom,
      width: unscaledBounds.width * zoom,
      height: unscaledBounds.height * zoom,
    };
  }, [canvasWidth, canvasHeight, initialPdfBounds, pageInfo, zoom]);

  const [position, setPosition] = useState({
    x: initialViewportBounds.x,
    y: initialViewportBounds.y,
  });

  const [size, setSize] = useState({
    width: initialViewportBounds.width,
    height: initialViewportBounds.height,
  });

  const [selectorState, setSelectorState] = useState<SelectorState>({
    status: "idle",
  });

  useEffect(() => {
    setPosition({
      x: initialViewportBounds.x,
      y: initialViewportBounds.y,
    });
    setSize({
      width: initialViewportBounds.width,
      height: initialViewportBounds.height,
    });
    setSelectorState({ status: "idle" });
  }, [initialViewportBounds, pageNumber]);

  // Clamp values to prevent box from going outside canvas
  const clampedPosition = useMemo(
    () => ({
      x: Math.max(0, Math.min(position.x, canvasWidth - size.width)),
      y: Math.max(0, Math.min(position.y, canvasHeight - size.height)),
    }),
    [canvasWidth, canvasHeight, position.x, position.y, size.width, size.height],
  );

  const clampedSize = useMemo(
    () => ({
      width: Math.min(size.width, canvasWidth - clampedPosition.x),
      height: Math.min(size.height, canvasHeight - clampedPosition.y),
    }),
    [
      canvasWidth,
      canvasHeight,
      clampedPosition.x,
      clampedPosition.y,
      size.width,
      size.height,
    ],
  );

  const handleSave = useCallback(async () => {
    setSelectorState({ status: "saving", message: "Saving QR position..." });

    const unscaledViewportBounds = {
      x: clampedPosition.x / zoom,
      y: clampedPosition.y / zoom,
      width: clampedSize.width / zoom,
      height: clampedSize.height / zoom,
    };

    const pdfBounds = convertViewportBoundsToPdfBoundsWithOrigin(
      unscaledViewportBounds,
      pageInfo,
    );

    startTransition(async () => {
      const result = await saveDetectedQrBounds({
        publicId,
        pageNumber,
        source: "MANUAL",
        x: pdfBounds.x,
        y: pdfBounds.y,
        width: pdfBounds.width,
        height: pdfBounds.height,
      });

      setSelectorState({
        status: result.status,
        message: result.message,
      });

      if (result.status === "success" && onSave) {
        onSave();
      }
    });
  }, [
    clampedPosition,
    clampedSize,
    zoom,
    pageInfo,
    publicId,
    pageNumber,
    onSave,
  ]);

  return (
    <div className="space-y-3">
      <div
        className="relative overflow-hidden rounded-[1.25rem] border border-zinc-200 bg-zinc-100"
        style={{
          width: canvasWidth,
          height: canvasHeight,
        }}
      >
        {children}
        <Rnd
          position={{
            x: clampedPosition.x,
            y: clampedPosition.y,
          }}
          size={{
            width: clampedSize.width,
            height: clampedSize.height,
          }}
          default={{
            x: clampedPosition.x,
            y: clampedPosition.y,
            width: clampedSize.width,
            height: clampedSize.height,
          }}
          onDragStop={(e, d) => {
            setPosition({ x: d.x, y: d.y });
          }}
          onDrag={(e, d) => {
            setPosition({ x: d.x, y: d.y });
          }}
          onResize={(e, direction, ref, delta, position) => {
            setPosition(position);
            setSize({
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            });
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            setPosition(position);
            setSize({
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            });
          }}
          minWidth={20}
          minHeight={20}
          maxWidth={canvasWidth}
          maxHeight={canvasHeight}
          bounds="parent"
        >
          <div className="h-full w-full cursor-inherit border-2 border-blue-500 bg-blue-400/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]" />
        </Rnd>
      </div>

      <details className="rounded-lg border border-zinc-200 bg-zinc-50 text-xs">
        <summary className="cursor-pointer list-none px-3 py-2 font-medium text-zinc-700 [&::-webkit-details-marker]:hidden">
          Show technical position details
        </summary>
        <div className="grid gap-2 border-t border-zinc-200 p-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-zinc-500">Page</p>
              <p className="font-medium text-zinc-950">{pageNumber}</p>
            </div>
            <div>
              <p className="text-zinc-500">Preview X</p>
              <p className="font-mono text-zinc-950">
                {Math.round(clampedPosition.x)}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Preview Y</p>
              <p className="font-mono text-zinc-950">
                {Math.round(clampedPosition.y)}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Preview size</p>
              <p className="font-mono text-zinc-950">
                {Math.round(clampedSize.width)}×{Math.round(clampedSize.height)}
              </p>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-2">
            <p className="text-zinc-600">PDF position:</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-zinc-500">X</p>
                <p className="font-mono text-zinc-950">
                  {Math.round(
                    convertViewportBoundsToPdfBoundsWithOrigin(
                      {
                        x: clampedPosition.x / zoom,
                        y: clampedPosition.y / zoom,
                        width: clampedSize.width / zoom,
                        height: clampedSize.height / zoom,
                      },
                      pageInfo,
                    ).x,
                  )}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Y</p>
                <p className="font-mono text-zinc-950">
                  {Math.round(
                    convertViewportBoundsToPdfBoundsWithOrigin(
                      {
                        x: clampedPosition.x / zoom,
                        y: clampedPosition.y / zoom,
                        width: clampedSize.width / zoom,
                        height: clampedSize.height / zoom,
                      },
                      pageInfo,
                    ).y,
                  )}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Width</p>
                <p className="font-mono text-zinc-950">
                  {Math.round(clampedSize.width / zoom)}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Height</p>
                <p className="font-mono text-zinc-950">
                  {Math.round(clampedSize.height / zoom)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </details>

      {/* Status messages */}
      {selectorState.message ? (
        <div
          className={
            selectorState.status === "success"
              ? "rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
              : selectorState.status === "error"
                ? "rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                : "rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-700"
          }
        >
          {selectorState.message}
        </div>
      ) : null}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={selectorState.status === "saving"}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-zinc-300"
      >
        {selectorState.status === "saving" ? "Saving..." : saveLabel}
      </button>
    </div>
  );
}
