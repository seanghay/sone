/**
 * The drawing seam.
 *
 * Replaces `ctx: CanvasRenderingContext2D` throughout the renderer. Deliberately
 * *not* a Canvas2D object: there is no `fillStyle`, no implicit current path,
 * and no style state carried across calls. Style is expressed as a Paint built
 * at the point of use, which is what keeps the ported code from drifting back
 * into implicit-state shape.
 *
 * The matrix and clip stack are the one part of Canvas2D that maps directly —
 * Skia has a real save/restore stack — so `save()`/`restore()` survive intact.
 */
import type { CssShadowProperties } from "../shadow.ts";
import type { Arena, SkImageFilter } from "./arena.ts";
import type { SkCanvas } from "./canvas.ts";
import { parseColor } from "./color.ts";
import type { FontRegistry } from "./fonts.ts";
import type { CanvasKit } from "./init.ts";
import type { TextMeasurer } from "./measure.ts";
import type { ParagraphPainter } from "./paragraph.ts";

export interface Painter {
  /** The CanvasKit namespace. */
  ck: CanvasKit;
  /** Native Skia canvas — matrix and clip stack only. */
  canvas: SkCanvas;
  /** Paint pool and scoped disposal for this node. */
  arena: Arena;
  fonts: FontRegistry;
  measurer: TextMeasurer;
  text: ParagraphPainter;
  /** Device pixel ratio. */
  dpr: number;
}

/**
 * Run `fn` inside a matrix/clip save, restoring even if it throws.
 *
 * Use this rather than a bare `saveLayer`: a layer allocates an offscreen the
 * size of the current clip and composites on restore, which on a software
 * rasterizer is expensive. Only reach for `withLayer` when group opacity or a
 * filter genuinely requires it.
 */
export function withSave<T>(painter: Painter, fn: () => T): T {
  // restoreToCount rather than restore: `fn` may open additional layers (group
  // opacity, CSS filters) and a single restore would leave the stack unbalanced.
  const depth = painter.canvas.save();
  try {
    return fn();
  } finally {
    painter.canvas.restoreToCount(depth);
  }
}

/**
 * Run `fn` inside a `saveLayer`, giving true *group* opacity and filters.
 *
 * Canvas2D's `globalAlpha` multiplies into each primitive, so overlapping
 * shapes inside one node double-darken. A layer composites the group once,
 * which is the correct interpretation — and the reason some outputs differ
 * slightly from the old backend.
 *
 * Note the clip ordering: a clip set *before* this call constrains the layer's
 * composite; a clip set inside constrains only the draws within it.
 */
export function withLayer<T>(
  painter: Painter,
  options: {
    alpha?: number;
    // biome-ignore lint/suspicious/noExplicitAny: CanvasKit ImageFilter
    filter?: any;
    // biome-ignore lint/suspicious/noExplicitAny: CanvasKit BlendMode
    blend?: any;
  },
  fn: () => T,
): T {
  painter.canvas.saveLayer(painter.arena.layer(options));
  try {
    return fn();
  } finally {
    painter.canvas.restore();
  }
}

/**
 * Build an owned drop-shadow-only image filter from a parsed shadow.
 *
 * Centralises the Canvas2D→Skia blur conversion: Canvas2D's `shadowBlur` is
 * twice the Gaussian sigma Skia takes, so sigma is `blurRadius / 2`. `color` is
 * passed in resolved because callers differ on the default (an unset box shadow
 * is black; an unset text shadow is transparent).
 */
export function dropShadowFilter(
  painter: Painter,
  shadow: CssShadowProperties,
  color: string,
): SkImageFilter {
  const sigma = shadow.blurRadius / 2;
  return painter.arena.own(
    painter.ck.ImageFilter.MakeDropShadowOnly(
      shadow.offsetX,
      shadow.offsetY,
      sigma,
      sigma,
      parseColor(color),
      null,
    ),
  );
}

/** Translate, run, restore. */
export function withTranslate<T>(
  painter: Painter,
  x: number,
  y: number,
  fn: () => T,
): T {
  return withSave(painter, () => {
    painter.canvas.translate(x, y);
    return fn();
  });
}

/**
 * Clip to a rectangle.
 *
 * Antialiasing is on: sone's inner-stroke border trick draws a double-width
 * stroke and clips it in half, and a hard-edged clip there produces visibly
 * different borders.
 */
export function clipRect(
  painter: Painter,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  painter.canvas.clipRect(
    painter.ck.XYWHRect(x, y, width, height),
    painter.ck.ClipOp.Intersect,
    true,
  );
}
