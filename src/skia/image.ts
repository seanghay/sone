/**
 * Decoded images.
 *
 * Two constraints shape this class:
 *
 * 1. CanvasKit exposes dimensions as methods (`width()`, `height()`) while sone
 *    reads them as properties throughout layout — `configurePhotoProps` derives
 *    aspect ratios from `image.width` / `image.height`.
 *
 * 2. `compile()` deep-clones the whole node tree with klona, which walks own
 *    enumerable properties and reconstructs class instances via a no-argument
 *    constructor. A raw CanvasKit Image cannot survive that: it has no
 *    accessible constructor, and cloning a GPU/WASM handle is meaningless
 *    anyway — it must be shared by reference.
 *
 * So the handle lives in a module-level registry and the instance carries only
 * a plain numeric id. Cloning copies the id, and `image` resolves through the
 * prototype getter, which klona never sees.
 */
import { ck } from "./init.ts";

// biome-ignore lint/suspicious/noExplicitAny: CanvasKit Image
type SkImage = any;

const registry = new Map<number, SkImage>();
let nextId = 1;

export class SoneImage {
  /** Registry key. Plain number so it survives structural cloning. */
  id: number;
  width: number;
  height: number;

  constructor(image?: SkImage) {
    if (image == null) {
      // klona's reconstruction path; the real values are copied in afterwards.
      this.id = 0;
      this.width = 0;
      this.height = 0;
      return;
    }
    this.id = nextId++;
    registry.set(this.id, image);
    this.width = image.width();
    this.height = image.height();
  }

  /** The underlying CanvasKit Image. */
  get image(): SkImage {
    return registry.get(this.id) ?? null;
  }

  /** Decode PNG / JPEG / WebP / GIF / SVG bytes. */
  static decode(bytes: Uint8Array): SoneImage {
    if (looksLikeSvg(bytes)) return new SoneImage(rasterizeSvg(bytes));

    const decoded = ck().MakeImageFromEncoded(bytes);
    if (decoded == null) {
      throw new Error(
        "Failed to decode image. Supported formats are PNG, JPEG, WebP, GIF and SVG.",
      );
    }
    return new SoneImage(decoded);
  }

  /**
   * Release the decoded image.
   *
   * Note that clones share the same registry entry, so this invalidates every
   * copy — which is the intent, since they all reference one decoded bitmap.
   */
  delete(): void {
    const image = registry.get(this.id);
    if (image != null) {
      image.delete?.();
      registry.delete(this.id);
    }
  }
}

/** Cheap sniff for SVG markup, skipping any leading whitespace or BOM. */
function looksLikeSvg(bytes: Uint8Array): boolean {
  const head = new TextDecoder()
    .decode(bytes.subarray(0, 512))
    .replace(/^﻿/, "")
    .trimStart()
    .toLowerCase();
  return head.startsWith("<svg") || head.startsWith("<?xml");
}

/**
 * Rasterize SVG through Skia's SVGDOM.
 *
 * `MakeImageFromEncoded` handles bitmap codecs only, but SVG has to work:
 * `qrcode()` returns an SVG document, and it is a documented input to `Photo`.
 * Rendering at the SVG's own container size keeps the result crisp at 1x; the
 * caller scales it like any other bitmap.
 */
function rasterizeSvg(bytes: Uint8Array): SkImage {
  const kit = ck();
  const markup = new TextDecoder().decode(bytes);

  // The FontMgr variant is required for any <text> in the document.
  const dom = kit.SVGDOM.MakeFromString(markup) ?? null;
  if (dom == null) throw new Error("Failed to parse SVG document.");

  try {
    const [width, height] = readContainerSize(dom, markup);
    const surface = kit.MakeSurface(Math.ceil(width), Math.ceil(height));
    if (surface == null) {
      throw new Error(`Failed to allocate a ${width}x${height} SVG surface.`);
    }
    try {
      dom.setContainerSize(width, height);
      dom.render(surface.getCanvas());
      return surface.makeImageSnapshot();
    } finally {
      surface.delete();
    }
  } finally {
    dom.delete?.();
  }
}

/** Fall back to the viewBox when the document declares no intrinsic size. */
function readContainerSize(
  // biome-ignore lint/suspicious/noExplicitAny: CanvasKit SVGDOM
  dom: any,
  markup: string,
): [number, number] {
  const size = dom.getContainerSize?.();
  if (size != null && size[0] > 0 && size[1] > 0) {
    return [size[0], size[1]];
  }

  const viewBox = markup.match(
    /viewBox\s*=\s*["']\s*[-\d.]+[,\s]+[-\d.]+[,\s]+([\d.]+)[,\s]+([\d.]+)/i,
  );
  if (viewBox != null) {
    return [Number.parseFloat(viewBox[1]), Number.parseFloat(viewBox[2])];
  }

  return [300, 150]; // CSS default replaced-element size
}

export type { SkImage };
