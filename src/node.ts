/**
 * Node.js platform implementation using skia-canvas for server-side rendering
 */
import skia, { Canvas, type ExportOptions, FontLibrary } from "skia-canvas";
import type { SoneNode } from "./core.ts";
import {
  DEFAULT_TEXT_PROPS,
  render,
  type SoneRenderConfig,
  type SoneRenderer,
} from "./renderer.ts";
import { applySpanProps } from "./utils.ts";

export * from "./core.ts";
export * from "./qrcode.ts";
export * from "./renderer.ts";

/** Temporary canvas for text measurement */
const dummyCanvas = new skia.Canvas(1, 1);

/** Cached text segmenter for word breaking */
let segmenter: Intl.Segmenter | null = null;

/**
 * Node.js renderer implementation using skia-canvas
 */
export const renderer: SoneRenderer = {
  /** Debug configuration for development */
  debug() {
    return {
      layout: false,
      text: false,
    };
  },
  /** Check if font is registered with skia-canvas */
  hasFont: (name) => FontLibrary.has(name),
  /** Path2D constructor for SVG path rendering */
  Path2D: skia.Path2D as typeof Path2D,
  /** Generate word break positions using Intl.Segmenter */
  *breakIterator(text) {
    if (segmenter == null) {
      segmenter = new Intl.Segmenter(undefined, {
        granularity: "word",
      });
    }

    for (const segment of segmenter.segment(text)) {
      // Skip Khmer subscript characters
      if (segment.segment.endsWith("\u17d2")) continue;
      yield segment.index;
    }
  },
  /** Create skia-canvas instance */
  createCanvas(width, height) {
    return new skia.Canvas(width, height) as unknown as HTMLCanvasElement;
  },
  /** Measure text using temporary canvas context */
  measureText(text, props) {
    const ctx = dummyCanvas.getContext(
      "2d",
    ) as unknown as CanvasRenderingContext2D;
    applySpanProps(ctx, props);
    return ctx.measureText(text);
  },
  /** Register font file with skia-canvas */
  async registerFont(name, source) {
    skia.FontLibrary.use(name, source);
  },
  /** Font unregistration not supported in skia-canvas */
  async unregisterFont() {},
  /** Reset all registered fonts */
  resetFonts() {
    skia.FontLibrary.reset();
  },
  /** Load image from URL or buffer using skia-canvas */
  async loadImage(src) {
    return skia.loadImage(
      typeof src === "string" ? src : Buffer.from(src),
    ) as unknown as HTMLImageElement;
  },
  /** Get default text properties */
  getDefaultTextProps() {
    return DEFAULT_TEXT_PROPS;
  },
  /** Device pixel ratio (always 1 in Node.js) */
  dpr() {
    return 1;
  },
};

export function sone(node: SoneNode, config?: SoneRenderConfig) {
  const build = async () => render<Canvas>(node, renderer, config);
  return {
    jpg: async (quality = 1.0) => (await build()).toBuffer("jpg", { quality }),
    png: async () => (await build()).toBuffer("png"),
    svg: async (outline = true) => (await build()).toBuffer("svg", { outline }),
    pdf: async (options?: ExportOptions) =>
      (await build()).toBuffer("pdf", options),
    webp: async (options?: ExportOptions) =>
      (await build()).toBuffer("webp", options),
    raw: async () => (await build()).toBuffer("raw"),
    canvas: async () => build(),
  };
}

/**
 * Font management utility for handling font loading, unloading, and checking availability.
 * This module provides a clean interface to interact with the underlying renderer's font system.
 */
export const Font = {
  /**
   * Loads a font and registers it with the renderer for use in rendering operations.
   *
   * @param name - The name identifier for the font (used to reference it later)
   * @param source - The source path, URL, or data for the font file
   * @returns Promise that resolves when the font is successfully loaded and registered
   *
   * @example
   * await Font.load('MyCustomFont', '/assets/fonts/custom-font.ttf');
   */
  async load(name: string, source: string) {
    return renderer.registerFont(name, source);
  },

  /**
   * Unloads a previously loaded font and removes it from the renderer.
   * This frees up memory and removes the font from the available font list.
   *
   * @param name - The name identifier of the font to unload
   * @returns Promise that resolves when the font is successfully unloaded
   *
   * @example
   * await Font.unload('MyCustomFont');
   */
  async unload(name: string) {
    return renderer.unregisterFont(name);
  },

  /**
   * Checks if a font with the given name is currently loaded and available.
   *
   * @param name - The name identifier of the font to check
   * @returns true if the font is loaded and available, false otherwise
   *
   * @example
   * if (Font.has('MyCustomFont')) {
   *   // Use the font in rendering
   * } else {
   *   // Load the font first or use a fallback
   * }
   */
  has(name: string): boolean {
    return renderer.hasFont(name);
  },
};
