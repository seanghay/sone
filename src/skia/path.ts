/**
 * Path construction.
 *
 * Sone builds paths two ways: from an SVG path string (squircles, clip paths,
 * `Path()` nodes) and imperatively (table grids, border segments). Both are
 * supported here, because the table renderer accumulates an entire grid as one
 * path and strokes it in a single call — issuing one `drawLine` per grid line
 * instead would mean ~100 draw calls per table.
 *
 * Note this `skia` build diverges from upstream CanvasKit: `Path` is immutable
 * (it only exposes queries, `copy` and `setFillType`) while all construction
 * lives on `PathBuilder`. So a builder is kept for mutation and snapshotted
 * lazily whenever a drawable `Path` is needed.
 *
 * `SonePath` is a real class so that `renderer.Path2D` keeps working with
 * `instanceof`, which existing tests rely on.
 */
import { ck } from "./init.ts";

// biome-ignore lint/suspicious/noExplicitAny: CanvasKit Path
type SkPath = any;
// biome-ignore lint/suspicious/noExplicitAny: CanvasKit PathBuilder
type SkPathBuilder = any;

export type FillRule = "nonzero" | "evenodd";

export class SonePath {
  private builder: SkPathBuilder | null = null;
  private snapshot: SkPath | null = null;

  constructor(source?: string | SonePath) {
    const kit = ck();

    if (typeof source === "string") {
      const parsed = kit.Path.MakeFromSVGString(source);
      if (parsed == null) {
        throw new Error(`Invalid SVG path data: ${JSON.stringify(source)}`);
      }
      this.snapshot = parsed;
    } else if (source instanceof SonePath) {
      this.snapshot = source.path.copy();
    } else {
      this.builder = new kit.PathBuilder();
    }
  }

  /** The drawable Path, snapshotting pending mutations on demand. */
  get path(): SkPath {
    if (this.snapshot == null) {
      if (this.builder == null) throw new Error("SonePath has been deleted.");
      this.snapshot = this.builder.snapshot();
    }
    return this.snapshot;
  }

  /**
   * Prepare for mutation. A path created from an SVG string has no builder, so
   * one is seeded from the existing geometry the first time it is edited.
   */
  private edit(): SkPathBuilder {
    if (this.builder == null) {
      this.builder = new (ck().PathBuilder)();
      if (this.snapshot != null) this.builder.addPath(this.snapshot);
    }
    // Any pending snapshot is stale once the builder changes.
    if (this.snapshot != null) {
      this.snapshot.delete?.();
      this.snapshot = null;
    }
    return this.builder;
  }

  moveTo(x: number, y: number): this {
    this.edit().moveTo(x, y);
    return this;
  }

  lineTo(x: number, y: number): this {
    this.edit().lineTo(x, y);
    return this;
  }

  quadraticCurveTo(cx: number, cy: number, x: number, y: number): this {
    this.edit().quadTo(cx, cy, x, y);
    return this;
  }

  bezierCurveTo(
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number,
    x: number,
    y: number,
  ): this {
    this.edit().cubicTo(c1x, c1y, c2x, c2y, x, y);
    return this;
  }

  rect(x: number, y: number, width: number, height: number): this {
    this.edit().addRect(ck().XYWHRect(x, y, width, height));
    return this;
  }

  closePath(): this {
    this.edit().close();
    return this;
  }

  addPath(other: SonePath): this {
    this.edit().addPath(other.path);
    return this;
  }

  /**
   * Fill rule is *path state* in Skia but a *fill argument* in Canvas2D.
   *
   * Mutating in place would be a trap: sone reuses a single path for clip,
   * stroke and fill (see `createSmoothRoundRect`), so setting the rule for one
   * consumer would silently change the others. Returning a copy keeps each
   * draw independent — the caller hands the copy to the arena.
   */
  withFillType(rule: FillRule): SonePath {
    const kit = ck();
    const copy = new SonePath(this);
    copy.path.setFillType(
      rule === "evenodd" ? kit.FillType.EvenOdd : kit.FillType.Winding,
    );
    return copy;
  }

  delete(): void {
    this.snapshot?.delete?.();
    this.snapshot = null;
    this.builder?.delete?.();
    this.builder = null;
  }

  isDeleted(): boolean {
    return this.snapshot == null && this.builder == null;
  }
}

export type { SkPath, SkPathBuilder };
