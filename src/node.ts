/**
 * Node.js platform implementation, backed by the `skia` CanvasKit WASM build.
 *
 * Pure WebAssembly: no native addon, no prebuilt binaries, and identical output
 * on every OS. Font bytes are read from disk here; everything else is shared
 * with the browser entry.
 */
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import type { SoneNode } from "./core.ts";
import { defaultLineBreakerIterator } from "./linebreak.ts";
import {
  DEFAULT_TEXT_PROPS,
  type FontSource,
  render,
  renderPages,
  renderWithMetadata,
  type SoneRenderConfig,
  type SoneRenderer,
} from "./renderer.ts";
import { Arena } from "./skia/arena.ts";
import {
  combineToPdf,
  type ExportOptions,
  type OutputFormat,
  SoneCanvas,
} from "./skia/canvas.ts";
import { FontRegistry } from "./skia/fonts.ts";
import { SoneImage } from "./skia/image.ts";
import { ck, ready } from "./skia/init.ts";
import { TextMeasurer } from "./skia/measure.ts";
import type { Painter } from "./skia/painter.ts";
import { ParagraphPainter } from "./skia/paragraph.ts";
import { SonePath } from "./skia/path.ts";

export * from "./core.ts";
export * from "./linebreak.ts";
export * from "./qrcode.ts";
export * from "./renderer.ts";
export { SoneCanvas } from "./skia/canvas.ts";
export { SoneImage } from "./skia/image.ts";
export { configureSkia } from "./skia/init.ts";
export { SonePath } from "./skia/path.ts";
export { fontBuilder } from "./utils.ts";
export * from "./yolo.ts";

const fonts = new FontRegistry();
const measurer = new TextMeasurer(fonts);
const paragraphs = new ParagraphPainter(fonts, measurer);

/** Resolve any accepted font source to raw bytes. */
async function loadFontBytes(source: FontSource): Promise<Uint8Array[]> {
  if (source instanceof Uint8Array) return [source];
  if (source instanceof ArrayBuffer) return [new Uint8Array(source)];
  if (source instanceof URL) {
    if (source.protocol === "file:") {
      return [new Uint8Array(await readFile(source))];
    }
    const response = await fetch(source);
    return [new Uint8Array(await response.arrayBuffer())];
  }
  if (Array.isArray(source)) {
    const all = await Promise.all(source.map((entry) => loadFontBytes(entry)));
    return all.flat();
  }
  if (/^https?:\/\//.test(source)) {
    const response = await fetch(source);
    return [new Uint8Array(await response.arrayBuffer())];
  }
  return [new Uint8Array(await readFile(source))];
}

/**
 * Node.js renderer implementation.
 */
export const renderer: SoneRenderer = {
  /** Debug configuration for development */
  debug() {
    return {
      layout: false,
      text: false,
    };
  },
  /** Instantiate CanvasKit. Idempotent. */
  async ready() {
    await ready();
  },
  /** Check if font is registered */
  hasFont: (name) => fonts.has(name),
  /** Path constructor for SVG path rendering */
  Path2D: SonePath,
  /** Generate word break positions using Intl.Segmenter */
  breakIterator: defaultLineBreakerIterator,
  /** Create a picture-recording canvas */
  createCanvas(width, height) {
    return new SoneCanvas(width, height);
  },
  /** Build the drawing seam for a canvas */
  createPainter(canvas): Painter {
    const kit = ck();
    return {
      ck: kit,
      canvas: canvas.getCanvas(),
      arena: new Arena(kit),
      fonts,
      measurer,
      text: paragraphs,
      dpr: 1,
    };
  },
  /** Measure a single shaped run */
  measureText(text, props) {
    return measurer.measure(text, props);
  },
  /** Register a font from a path, glob-free URL, or raw bytes */
  async registerFont(name, source) {
    await ready();
    for (const bytes of await loadFontBytes(source)) {
      fonts.register(name, bytes);
    }
  },
  /** Remove a registered font */
  async unregisterFont(name) {
    fonts.unregister(name);
  },
  /** Reset all registered fonts */
  resetFonts() {
    fonts.reset();
  },
  /** Load and decode an image from a path, URL or buffer */
  async loadImage(src) {
    await ready();
    if (typeof src !== "string") return SoneImage.decode(src);
    if (/^https?:\/\//.test(src)) {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(
          `Failed to load image from ${JSON.stringify(src)} (HTTP ${response.status})`,
        );
      }
      return SoneImage.decode(new Uint8Array(await response.arrayBuffer()));
    }
    return SoneImage.decode(new Uint8Array(await readFile(src)));
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

/** Node returns Buffers, matching the previous public API. */
const toBuffer = (bytes: Uint8Array) => Buffer.from(bytes);

/**
 * Creates a Sone renderer with multiple export format options
 * @param node - The SoneNode to render
 * @param config - Optional rendering configuration
 * @returns Object with methods for exporting in different formats
 */
export function sone(node: SoneNode, config?: SoneRenderConfig) {
  // Build function that renders the node to a Canvas using the specified renderer
  const build = async () => render<SoneCanvas>(node, renderer, config);

  const encode = async (format: OutputFormat, options?: ExportOptions) =>
    toBuffer((await build()).toBuffer(format, options));

  return {
    /**
     * Export as JPEG image
     * @param quality - JPEG quality from 0.0 to 1.0 (default: 1.0)
     * @returns Promise<Buffer> - JPEG image buffer
     */
    jpg: async (quality = 1.0, options?: ExportOptions) =>
      encode("jpg", { quality, ...options }),

    /**
     * Export as PNG image
     * @returns Promise<Buffer> - PNG image buffer
     */
    png: async (options?: ExportOptions) => encode("png", options),

    /**
     * Export as SVG vector graphic. Text is emitted as live `<text>` elements
     * rather than outlined paths.
     * @returns Promise<Buffer> - SVG image buffer
     */
    svg: async (options?: ExportOptions) => encode("svg", options),

    /**
     * Export as PDF document. When pageHeight is set in config, produces a
     * multi-page PDF with one page per canvas returned by renderPages().
     * Text stays selectable and fonts are embedded subsetted.
     * @param options - Optional PDF export settings
     * @returns Promise<Buffer> - PDF document buffer
     */
    pdf: async (options?: ExportOptions) => {
      if (config?.pageHeight) {
        const pages = await renderPages(node, renderer, config);
        if (pages.length === 0) return Buffer.alloc(0);
        return toBuffer(combineToPdf(pages));
      }
      return encode("pdf", options);
    },

    /**
     * Export as WebP image
     * @param options - Optional WebP export settings
     * @returns Promise<Buffer> - WebP image buffer
     */
    webp: async (options?: ExportOptions) => encode("webp", options),

    /**
     * Export as raw buffer data
     * @returns Promise<Buffer> - Raw image data buffer
     */
    raw: async (options?: ExportOptions) => encode("raw", options),

    /**
     * Get the rendered Canvas object directly
     * @returns Promise<SoneCanvas> - The rendered canvas
     */
    canvas: async () => build(),
    canvasWithMetadata: async () =>
      renderWithMetadata<SoneCanvas>(node, renderer, config),

    /**
     * Render into one Canvas per page using the pageHeight from config.
     * @returns Promise<SoneCanvas[]> - One Canvas per page
     */
    pages: async (): Promise<SoneCanvas[]> =>
      renderPages(node, renderer, config),
  };
}

/**
 * Font management utility for handling font loading, unloading, and checking availability.
 *
 * CanvasKit has no access to system fonts, so at least one font must be
 * registered before rendering any text.
 */
export const Font = {
  /**
   * Loads a font and registers it with the renderer for use in rendering operations.
   *
   * @param name - The name identifier for the font (used to reference it later)
   * @param source - A file path, URL, or raw font bytes
   * @returns Promise that resolves when the font is successfully loaded and registered
   *
   * @example
   * await Font.load('MyCustomFont', '/assets/fonts/custom-font.ttf');
   * await Font.load('MyCustomFont', ['/assets/fonts/regular.ttf', '/assets/fonts/bold.ttf']);
   */
  async load(name: string, source: FontSource) {
    return renderer.registerFont(name, source);
  },

  /**
   * Unloads a previously loaded font and removes it from the renderer.
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

  /** Remove every registered font. */
  reset() {
    renderer.resetFonts();
  },

  /**
   * Checks if a font with the given name is currently loaded and available.
   *
   * @param name - The name identifier of the font to check
   * @returns true if the font is loaded and available, false otherwise
   */
  has(name: string): boolean {
    return renderer.hasFont(name);
  },
};
