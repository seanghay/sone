/**
 * Node.js platform implementation using skia-canvas for server-side rendering
 */
import { Buffer } from "node:buffer";
import skia, { Canvas, type ExportOptions, FontLibrary } from "skia-canvas";
import type { SoneNode } from "./core.ts";
import { defaultLineBreakerIterator } from "./linebreak.ts";
import {
  DEFAULT_TEXT_PROPS,
  render,
  renderWithMetadata,
  type SoneRenderConfig,
  type SoneRenderer,
} from "./renderer.ts";
import { applySpanProps } from "./utils.ts";

export * from "./core.ts";
export * from "./linebreak.ts";
export * from "./qrcode.ts";
export * from "./renderer.ts";
export { applySpanProps, fontBuilder } from "./utils.ts";

/** Temporary canvas for text measurement */
const dummyCanvas = new skia.Canvas(1, 1);

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
  breakIterator: defaultLineBreakerIterator,
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

/**
 * Creates a Sone renderer with multiple export format options
 * @param node - The SoneNode to render
 * @param config - Optional rendering configuration
 * @returns Object with methods for exporting in different formats
 */
export function sone(node: SoneNode, config?: SoneRenderConfig) {
  // Build function that renders the node to a Canvas using the specified renderer
  const build = async () => render<Canvas>(node, renderer, config);

  return {
    /**
     * Export as JPEG image
     * @param quality - JPEG quality from 0.0 to 1.0 (default: 1.0)
     * @returns Promise<Buffer> - JPEG image buffer
     */
    jpg: async (quality = 1.0, options?: ExportOptions) =>
      (await build()).toBuffer("jpg", { quality, ...options }),

    /**
     * Export as PNG image
     * @returns Promise<Buffer> - PNG image buffer
     */
    png: async (options?: ExportOptions) =>
      (await build()).toBuffer("png", options),

    /**
     * Export as SVG vector graphic
     * @param outline - Whether to include outline information (default: true)
     * @returns Promise<Buffer> - SVG image buffer
     */
    svg: async (options?: ExportOptions) =>
      (await build()).toBuffer("svg", options),

    /**
     * Export as PDF document
     * @param options - Optional PDF export settings
     * @returns Promise<Buffer> - PDF document buffer
     */
    pdf: async (options?: ExportOptions) =>
      (await build()).toBuffer("pdf", options),

    /**
     * Export as WebP image
     * @param options - Optional WebP export settings
     * @returns Promise<Buffer> - WebP image buffer
     */
    webp: async (options?: ExportOptions) =>
      (await build()).toBuffer("webp", options),

    /**
     * Export as raw buffer data
     * @returns Promise<Buffer> - Raw image data buffer
     */
    raw: async (options?: ExportOptions) =>
      (await build()).toBuffer("raw", options),

    /**
     * Get the rendered Canvas object directly
     * @returns Promise<Canvas> - The rendered Canvas instance
     */
    canvas: async () => build(),
    canvasWithMetadata: async () =>
      renderWithMetadata<Canvas>(node, renderer, config),
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
   * await Font.load('MyCustomFont', ['/assets/fonts/custom-font.ttf']);
   */
  async load(name: string, source: string | string[]) {
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
