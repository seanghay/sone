import { expect, test } from "vitest";
import { SoneImage } from "../src/skia/image.ts";
import { ready } from "../src/skia/init.ts";

const MAX_SVG_SIDE = 8192;

function svg(attrs: string): Uint8Array {
  return new TextEncoder().encode(
    `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}><rect width="10" height="10"/></svg>`,
  );
}

test("SVG raster size is clamped so a tiny document cannot force a huge allocation", async () => {
  await ready();

  // A ~100-byte document declaring 60000x60000 would ask for ~14 GB unclamped.
  const huge = SoneImage.decode(svg('width="60000" height="60000"'));
  expect(huge.width).toBeLessThanOrEqual(MAX_SVG_SIDE);
  expect(huge.height).toBeLessThanOrEqual(MAX_SVG_SIDE);
  // Aspect ratio is preserved (square stays square).
  expect(huge.width).toBe(huge.height);
  huge.delete();

  // viewBox is subject to the same bound.
  const hugeViewBox = SoneImage.decode(svg('viewBox="0 0 50000 25000"'));
  expect(hugeViewBox.width).toBeLessThanOrEqual(MAX_SVG_SIDE);
  expect(hugeViewBox.height).toBeLessThanOrEqual(MAX_SVG_SIDE);
  hugeViewBox.delete();
});

test("normal-sized SVG is rasterized at its declared size", async () => {
  await ready();
  const normal = SoneImage.decode(svg('width="200" height="120"'));
  expect(normal.width).toBe(200);
  expect(normal.height).toBe(120);
  normal.delete();
});
