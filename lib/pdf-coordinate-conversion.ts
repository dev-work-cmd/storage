// Owns conversion from preview canvas QR bounds into PDF-space rectangles.
// Uses PDF.js viewport conversion so rotation and coordinate origin stay aligned.
// Must preserve PDF-space values for later pdf-lib overlay placement.
// Validates output to catch coordinate precision or PDF.js edge cases early.

export class CoordinateConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CoordinateConversionError";
  }
}

type ViewportPointConverter = {
  convertToPdfPoint: (x: number, y: number) => unknown[];
};

export type ViewportBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PdfBounds = {
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

function toNumberPair(value: unknown[], context: string): [number, number] {
  const [x, y] = value;

  if (typeof x !== "number" || typeof y !== "number") {
    throw new CoordinateConversionError(
      `Failed to convert ${context}: expected [number, number], got [${typeof x}, ${typeof y}].`,
    );
  }

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new CoordinateConversionError(
      `Converted ${context} contains non-finite numbers: [${x}, ${y}].`,
    );
  }

  return [x, y];
}

interface ConvertBoundsOptions {
  pageNumber: number;
}

export function convertViewportBoundsToPdfBounds(
  viewport: ViewportPointConverter,
  bounds: ViewportBounds,
  options?: ConvertBoundsOptions,
): PdfBounds {
  // Validate input bounds first
  if (
    !Number.isFinite(bounds.x) ||
    !Number.isFinite(bounds.y) ||
    !Number.isFinite(bounds.width) ||
    !Number.isFinite(bounds.height)
  ) {
    throw new CoordinateConversionError(
      `Viewport bounds contain non-finite values: [x=${bounds.x}, y=${bounds.y}, w=${bounds.width}, h=${bounds.height}].`,
    );
  }

  if (bounds.width <= 0 || bounds.height <= 0) {
    throw new CoordinateConversionError(
      `Viewport bounds have invalid dimensions: width=${bounds.width}, height=${bounds.height}.`,
    );
  }

  try {
    const topLeft = toNumberPair(
      viewport.convertToPdfPoint(bounds.x, bounds.y),
      "top-left corner",
    );
    const bottomRight = toNumberPair(
      viewport.convertToPdfPoint(
        bounds.x + bounds.width,
        bounds.y + bounds.height,
      ),
      "bottom-right corner",
    );

    const minX = Math.min(topLeft[0], bottomRight[0]);
    const maxX = Math.max(topLeft[0], bottomRight[0]);
    const minY = Math.min(topLeft[1], bottomRight[1]);
    const maxY = Math.max(topLeft[1], bottomRight[1]);

    const result: PdfBounds = {
      pageNumber: options?.pageNumber ?? 0,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };

    // Sanity check: converted dimensions should match roughly
    if (result.width <= 0 || result.height <= 0) {
      throw new CoordinateConversionError(
        `Conversion produced invalid dimensions: width=${result.width}, height=${result.height}.`,
      );
    }

    return result;
  } catch (error) {
    if (error instanceof CoordinateConversionError) {
      throw error;
    }
    throw new CoordinateConversionError(
      `Unexpected error during coordinate conversion: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
