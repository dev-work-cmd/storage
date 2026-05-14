import { convertViewportBoundsToPdfBounds } from "@/lib/pdf-coordinate-conversion";
import {
  validateQrBoundsAgainstPage,
  validateQrBoundsSanity,
} from "@/server/services/qr/validate-qr-bounds";

describe("qr bounds validation", () => {
  it("converts viewport bounds into pdf bounds using the viewport converter", () => {
    const viewport = {
      convertToPdfPoint(x: number, y: number) {
        return [x / 2, 400 - y / 2];
      },
    };

    expect(
      convertViewportBoundsToPdfBounds(
        viewport,
        { x: 20, y: 40, width: 80, height: 120 },
        { pageNumber: 2 },
      ),
    ).toEqual({
      pageNumber: 2,
      x: 10,
      y: 320,
      width: 40,
      height: 60,
    });
  });

  it("rejects qr bounds that extend beyond the page", () => {
    const errors = validateQrBoundsAgainstPage(
      {
        pageNumber: 1,
        x: 180,
        y: 20,
        width: 40,
        height: 30,
      },
      {
        width: 200,
        height: 200,
      },
    );

    expect(errors.map((error) => error.field)).toContain("width");
  });

  it("rejects non-finite or non-positive qr bounds early", () => {
    expect(
      validateQrBoundsSanity({
        pageNumber: 1,
        x: Number.NaN,
        y: 10,
        width: 30,
        height: 30,
      }),
    ).toBe("QR position contains invalid numbers.");

    expect(
      validateQrBoundsSanity({
        pageNumber: 1,
        x: 10,
        y: 10,
        width: 0,
        height: 30,
      }),
    ).toBe("QR dimensions must be positive.");
  });
});
