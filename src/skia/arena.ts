/**
 * Paint pooling and scoped disposal.
 *
 * CanvasKit objects are not garbage collected — every one must be `.delete()`d.
 * Threading that discipline through ~190 draw sites by hand is the largest
 * correctness risk in this backend, so instead draw sites *request* paints from
 * an arena and never own them. The arena is reset once per node, which bounds
 * every object's lifetime to a single node's paint pass.
 *
 * This is memory hygiene, not a Canvas2D emulation: the arena has no drawing
 * surface, no implicit style state, and no path building.
 */
import { type Color4f, parseColor, withAlpha } from "./color.ts";
import type { CanvasKit } from "./init.ts";

type SkPaint = InstanceType<CanvasKit["Paint"]>;
type Disposable = { delete(): void; isDeleted?(): boolean };

export interface StrokeOptions {
  /** Butt | Round | Square — Canvas2D `lineCap` */
  cap?: "butt" | "round" | "square";
  /** Miter | Round | Bevel — Canvas2D `lineJoin` */
  join?: "miter" | "round" | "bevel";
  /** Canvas2D `miterLimit`. Note Canvas2D defaults to 10, Skia to 4. */
  miterLimit?: number;
  /** Canvas2D `setLineDash` intervals */
  dash?: number[];
  /** Canvas2D `lineDashOffset` */
  dashOffset?: number;
}

/** Canvas2D's default miter limit. Skia's Paint default is 4, so we set it. */
const CANVAS2D_MITER_LIMIT = 10;

export class Arena {
  private readonly pool: SkPaint[] = [];
  private used = 0;
  private owned: Disposable[] = [];
  private readonly ck: CanvasKit;

  constructor(ck: CanvasKit) {
    this.ck = ck;
  }

  /**
   * Take a paint from the pool, reset to Canvas2D-equivalent defaults.
   *
   * Antialiasing is forced on: Skia's Paint defaults `isAntiAlias` to false
   * while Canvas2D is always antialiased. Getting this wrong makes every
   * rendered output subtly jagged in a way that reads as a porting bug.
   */
  private take(): SkPaint {
    let paint: SkPaint;
    if (this.used < this.pool.length) {
      paint = this.pool[this.used];
      paint.setShader(null);
      paint.setImageFilter(null);
      paint.setMaskFilter(null);
      paint.setColorFilter(null);
      paint.setPathEffect(null);
      paint.setBlendMode(this.ck.BlendMode.SrcOver);
    } else {
      paint = new this.ck.Paint();
      this.pool.push(paint);
    }
    this.used++;
    paint.setAntiAlias(true);
    paint.setStyle(this.ck.PaintStyle.Fill);
    paint.setStrokeWidth(1);
    paint.setStrokeMiter(CANVAS2D_MITER_LIMIT);
    paint.setAlphaf(1);
    return paint;
  }

  /** A fill paint for a CSS color, with an optional opacity multiplier. */
  fill(color: string | Color4f, alpha = 1): SkPaint {
    const paint = this.take();
    const rgba = typeof color === "string" ? parseColor(color) : color;
    paint.setColor(alpha >= 1 ? rgba : withAlpha(rgba, alpha));
    return paint;
  }

  /** A fill paint driven by a shader (gradients). */
  shaderFill(shader: Parameters<SkPaint["setShader"]>[0], alpha = 1): SkPaint {
    const paint = this.take();
    paint.setShader(shader);
    paint.setAlphaf(alpha);
    return paint;
  }

  /** A stroke paint mirroring Canvas2D's stroke state. */
  stroke(
    color: string | Color4f,
    width: number,
    options: StrokeOptions = {},
  ): SkPaint {
    const paint = this.take();
    const rgba = typeof color === "string" ? parseColor(color) : color;
    paint.setColor(rgba);
    paint.setStyle(this.ck.PaintStyle.Stroke);
    paint.setStrokeWidth(width);

    if (options.cap != null) {
      paint.setStrokeCap(
        options.cap === "round"
          ? this.ck.StrokeCap.Round
          : options.cap === "square"
            ? this.ck.StrokeCap.Square
            : this.ck.StrokeCap.Butt,
      );
    }
    if (options.join != null) {
      paint.setStrokeJoin(
        options.join === "round"
          ? this.ck.StrokeJoin.Round
          : options.join === "bevel"
            ? this.ck.StrokeJoin.Bevel
            : this.ck.StrokeJoin.Miter,
      );
    }
    if (options.miterLimit != null) paint.setStrokeMiter(options.miterLimit);

    const dash = normalizeDash(options.dash);
    if (dash != null) {
      const effect = this.ck.PathEffect.MakeDash(dash, options.dashOffset ?? 0);
      if (effect != null) {
        paint.setPathEffect(this.own(effect));
      }
    }
    return paint;
  }

  /**
   * A paint for `saveLayer` — group opacity, CSS filters, and blend modes.
   * Used only where a layer is genuinely required; folding alpha into a fill
   * paint is far cheaper and covers most nodes.
   */
  layer(options: {
    alpha?: number;
    filter?: Parameters<SkPaint["setImageFilter"]>[0];
    blend?: Parameters<SkPaint["setBlendMode"]>[0];
  }): SkPaint {
    const paint = this.take();
    if (options.alpha != null) paint.setAlphaf(options.alpha);
    if (options.filter != null) paint.setImageFilter(options.filter);
    if (options.blend != null) paint.setBlendMode(options.blend);
    return paint;
  }

  /** Hand ownership of a disposable (Path, Shader, PathEffect, …) to the arena. */
  own<T extends Disposable>(object: T): T {
    this.owned.push(object);
    return object;
  }

  /**
   * Recycle paints and delete everything owned since the last reset.
   * Called once per node, from a `finally`.
   */
  reset(): void {
    for (const object of this.owned) {
      if (object.isDeleted?.() !== true) object.delete();
    }
    if (this.owned.length > 0) this.owned = [];
    this.used = 0;
  }

  /** Number of live owned objects — used by the debug leak assertion. */
  get liveCount(): number {
    return this.owned.length;
  }

  /** Release the paint pool itself. Call when the render is complete. */
  dispose(): void {
    this.reset();
    for (const paint of this.pool) paint.delete();
    this.pool.length = 0;
    this.used = 0;
  }
}

/**
 * Canvas2D accepts odd-length dash arrays and implicitly repeats them to an
 * even length; Skia requires even. An all-zero array means "no dash" in
 * Canvas2D but produces an invalid PathEffect in Skia.
 */
export function normalizeDash(dash: number[] | undefined): number[] | null {
  if (dash == null || dash.length === 0) return null;
  if (dash.every((n) => n === 0)) return null;
  return dash.length % 2 === 0 ? dash : [...dash, ...dash];
}

/** Run `fn` against a fresh arena scope, resetting even if it throws. */
export function withArena<T>(arena: Arena, fn: () => T): T {
  try {
    return fn();
  } finally {
    arena.reset();
  }
}

export type { SkPaint };
