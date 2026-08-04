import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderer } from "../../src/backend.ts";
import type { SoneCanvas, SoneNode } from "../../src/index.ts";
import { sone } from "../../src/index.ts";
// Side-effect import: registers the visual test fonts. CanvasKit has no system
// fonts, so this must happen before anything renders.
import "./load-test-fonts.ts";

export const relative = (p: string) =>
  fileURLToPath(new URL(p, import.meta.url));

export async function writeCanvasToFile(root: SoneNode, url: string) {
  const file = path.parse(fileURLToPath(url));
  const { canvas } = await sone(root).canvasWithMetadata();

  await fs.writeFile(
    path.join(file.dir, `${file.name}.jpg`),
    await canvas.toBuffer("jpg", { density: 2 }),
  );
}

/**
 * Minimal drawing surface for the bbox-overlay debug scripts.
 *
 * They used to reach for `canvas.getContext("2d")`; the Skia backend has no 2D
 * context, so this exposes just the few primitives those overlays need.
 */
export function createOverlay(canvas: SoneCanvas) {
  const p = renderer.createPainter(canvas);

  const labelProps = (size: number) =>
    ({
      font: ["GeistMono"],
      size,
      weight: 700,
      style: "normal",
    }) as never;

  return {
    fillRect(x: number, y: number, w: number, h: number, color: string) {
      p.canvas.drawRect(p.ck.XYWHRect(x, y, w, h), p.arena.fill(color));
    },
    strokeRect(
      x: number,
      y: number,
      w: number,
      h: number,
      color: string,
      width = 1,
    ) {
      p.canvas.drawRect(
        p.ck.XYWHRect(x, y, w, h),
        p.arena.stroke(color, width),
      );
    },
    measureText(text: string, size: number) {
      return p.measurer.measure(text, labelProps(size)).width;
    },
    /** `baselineY` is the alphabetic baseline, as `fillText` used to be. */
    fillText(
      text: string,
      x: number,
      baselineY: number,
      color: string,
      size: number,
    ) {
      const props = labelProps(size);
      p.text.drawRun(p.canvas, p.arena, text, props, {
        x,
        baselineY,
        width: p.measurer.measure(text, props).width,
        fill: p.arena.fill(color),
      });
    },
    /** Release pooled paints once the overlay is complete. */
    done() {
      p.arena.dispose();
    },
  };
}
