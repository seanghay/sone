/**
 * Output surface.
 *
 * Drawing records into a `PictureRecorder` at logical size, density-independent.
 * A single recorded Picture then replays into whichever backend the caller asks
 * for — raster, PDF or SVG. Because text is recorded as real glyph runs rather
 * than rasterized, PDF and SVG come out vector with selectable text, and
 * `density` becomes a replay at scale with no re-layout.
 */
import { ck } from "./init.ts";

// biome-ignore lint/suspicious/noExplicitAny: CanvasKit types
type SkCanvas = any;
// biome-ignore lint/suspicious/noExplicitAny: CanvasKit types
type SkPicture = any;
// biome-ignore lint/suspicious/noExplicitAny: CanvasKit types
type SkSurface = any;

export type OutputFormat =
  | "png"
  | "jpg"
  | "jpeg"
  | "webp"
  | "raw"
  | "pdf"
  | "svg";

export interface ExportOptions {
  /** 0..1, honoured by jpg and webp. */
  quality?: number;
  /** Pixel density multiplier for raster output. Ignored by pdf/svg. */
  density?: number;
}

/**
 * Surfaces are pooled by pixel dimensions.
 *
 * `MakeSurface` does not release its backing store on `delete()` — allocating
 * one per render grows the WASM heap monotonically (~1MB per 512x512 render),
 * which would make any long-running server leak without bound. Reuse is stable,
 * so surfaces are cached and cleared between uses instead of reallocated.
 * See the regression markers in `test/skia/smoke.test.ts`.
 */
const surfacePool = new Map<string, SkSurface>();

function acquireSurface(width: number, height: number): SkSurface {
  const key = `${width}x${height}`;
  const existing = surfacePool.get(key);
  if (existing != null && existing.isDeleted?.() !== true) {
    existing.getCanvas().clear(ck().TRANSPARENT);
    return existing;
  }

  const surface = ck().MakeSurface(width, height);
  if (surface == null) {
    throw new Error(`Failed to allocate a ${width}x${height} surface.`);
  }
  surfacePool.set(key, surface);
  return surface;
}

/** Release every pooled surface. Exposed mainly for tests and teardown. */
export function releaseSurfacePool(): void {
  for (const surface of surfacePool.values()) surface?.delete?.();
  surfacePool.clear();
}

export class SoneCanvas {
  readonly width: number;
  readonly height: number;
  /** Pixel density for raster export; mirrors skia-canvas's `canvas.density`. */
  density = 1;

  private recorder: SkPicture | null;
  private recorded: SkPicture | null = null;
  private readonly canvas: SkCanvas;

  constructor(width: number, height: number) {
    const kit = ck();
    this.width = width;
    this.height = height;
    this.recorder = new kit.PictureRecorder();
    this.canvas = this.recorder.beginRecording(
      kit.LTRBRect(0, 0, width, height),
    );
  }

  /** The Skia canvas being recorded into. */
  getCanvas(): SkCanvas {
    return this.canvas;
  }

  /** Finish recording. Idempotent — later calls reuse the same Picture. */
  picture(): SkPicture {
    if (this.recorded == null) {
      if (this.recorder == null) {
        throw new Error("SoneCanvas has been disposed.");
      }
      this.recorded = this.recorder.finishRecordingAsPicture();
      this.recorder.delete();
      this.recorder = null;
    }
    return this.recorded;
  }

  toBuffer(format: OutputFormat, options: ExportOptions = {}): Uint8Array {
    const kit = ck();
    const picture = this.picture();

    if (format === "pdf") {
      const doc = new kit.PDFDocument(new kit.PDFMetadata());
      doc.beginPage(this.width, this.height).drawPicture(picture);
      doc.endPage();
      return doc.close();
    }

    if (format === "svg") {
      const svg = new kit.SVGCanvas(this.width, this.height, 0);
      svg.getCanvas().drawPicture(picture);
      return svg.close();
    }

    const density = options.density ?? this.density;
    const pixelWidth = Math.max(1, Math.ceil(this.width * density));
    const pixelHeight = Math.max(1, Math.ceil(this.height * density));

    const surface = acquireSurface(pixelWidth, pixelHeight);
    const target = surface.getCanvas();
    target.save();
    target.scale(density, density);
    target.drawPicture(picture);
    target.restore();

    const image = surface.makeImageSnapshot();
    try {
      if (format === "raw") {
        const info = {
          width: pixelWidth,
          height: pixelHeight,
          colorType: kit.ColorType.RGBA_8888,
          alphaType: kit.AlphaType.Unpremul,
          colorSpace: kit.ColorSpace.SRGB,
        };
        const pixels = image.readPixels(0, 0, info);
        if (pixels == null) throw new Error("Failed to read raw pixels.");
        return pixels instanceof Uint8Array
          ? new Uint8Array(pixels)
          : new Uint8Array(pixels.buffer.slice(0));
      }

      const encoded = image.encodeToBytes(
        format === "png"
          ? kit.ImageFormat.PNG
          : format === "webp"
            ? kit.ImageFormat.WEBP
            : kit.ImageFormat.JPEG,
        // CanvasKit takes 0..100; sone's public API takes 0..1.
        Math.round((options.quality ?? 1) * 100),
      );
      if (encoded == null) {
        throw new Error(`Failed to encode ${format}.`);
      }
      return encoded;
    } finally {
      image.delete();
    }
  }

  /** Release the recorded Picture. The pooled surface is intentionally kept. */
  delete(): void {
    this.recorded?.delete?.();
    this.recorded = null;
    this.recorder?.delete?.();
    this.recorder = null;
  }
}

/**
 * Assemble one PDF from several rendered canvases, one page each.
 *
 * Replaces the skia-canvas approach of compositing pages into a root canvas via
 * the non-standard `newPage()`/`drawCanvas()` extensions.
 */
export function combineToPdf(canvases: SoneCanvas[]): Uint8Array {
  const kit = ck();
  if (canvases.length === 0) return new Uint8Array(0);

  const doc = new kit.PDFDocument(new kit.PDFMetadata());
  for (const canvas of canvases) {
    doc.beginPage(canvas.width, canvas.height).drawPicture(canvas.picture());
    doc.endPage();
  }
  return doc.close();
}

export type { SkCanvas, SkPicture, SkSurface };
