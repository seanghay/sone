/**
 * Browser and edge platform implementation.
 *
 * Shares the entire Skia backend with Node — the only difference is how bytes
 * are fetched (no filesystem). Because the renderer is WASM rather than a
 * native addon, PDF and SVG output work here too, which the Node-only backend
 * could not offer.
 *
 * If the bundler does not emit `canvaskit.wasm` alongside the module, or the
 * runtime has no filesystem, point the loader at a URL first:
 *
 * @example
 * import { configureSkia, sone, Font, Column, Text } from "sone";
 * configureSkia({ wasmFile: "https://cdn.example.com/canvaskit.wasm" });
 * await Font.load("Inter", "/fonts/Inter-Regular.ttf");
 * const png = await sone(Column(Text("Hello"))).png();
 */
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

async function fetchBytes(url: string | URL): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${String(url)} (HTTP ${response.status})`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function loadFontBytes(source: FontSource): Promise<Uint8Array[]> {
  if (source instanceof Uint8Array) return [source];
  if (source instanceof ArrayBuffer) return [new Uint8Array(source)];
  if (source instanceof URL) return [await fetchBytes(source)];
  if (Array.isArray(source)) {
    const all = await Promise.all(source.map((entry) => loadFontBytes(entry)));
    return all.flat();
  }
  return [await fetchBytes(source)];
}

export const renderer: SoneRenderer = {
  debug() {
    return { layout: false, text: false };
  },
  async ready() {
    await ready();
  },
  hasFont: (name) => fonts.has(name),
  Path2D: SonePath,
  breakIterator: defaultLineBreakerIterator,
  createCanvas(width, height) {
    return new SoneCanvas(width, height);
  },
  createPainter(canvas): Painter {
    const kit = ck();
    return {
      ck: kit,
      canvas: canvas.getCanvas(),
      arena: new Arena(kit),
      fonts,
      measurer,
      text: paragraphs,
      dpr: renderer.dpr(),
    };
  },
  measureText(text, props) {
    return measurer.measure(text, props);
  },
  async registerFont(name, source) {
    await ready();
    for (const bytes of await loadFontBytes(source)) {
      fonts.register(name, bytes);
    }
  },
  async unregisterFont(name) {
    fonts.unregister(name);
  },
  resetFonts() {
    fonts.reset();
  },
  async loadImage(src) {
    await ready();
    if (typeof src !== "string") return SoneImage.decode(src);
    return SoneImage.decode(await fetchBytes(src));
  },
  getDefaultTextProps() {
    return DEFAULT_TEXT_PROPS;
  },
  dpr() {
    return typeof globalThis.devicePixelRatio === "number"
      ? globalThis.devicePixelRatio
      : 1;
  },
};

/**
 * Render a node with the browser backend.
 *
 * Returns `Uint8Array` rather than Node's `Buffer`.
 */
export function sone(node: SoneNode, config?: SoneRenderConfig) {
  const build = async () => render<SoneCanvas>(node, renderer, config);

  const encode = async (format: OutputFormat, options?: ExportOptions) =>
    (await build()).toBuffer(format, options);

  return {
    jpg: async (quality = 1.0, options?: ExportOptions) =>
      encode("jpg", { quality, ...options }),
    png: async (options?: ExportOptions) => encode("png", options),
    svg: async (options?: ExportOptions) => encode("svg", options),
    pdf: async (options?: ExportOptions) => {
      if (config?.pageHeight) {
        const pages = await renderPages(node, renderer, config);
        if (pages.length === 0) return new Uint8Array(0);
        return combineToPdf(pages);
      }
      return encode("pdf", options);
    },
    webp: async (options?: ExportOptions) => encode("webp", options),
    raw: async (options?: ExportOptions) => encode("raw", options),
    canvas: async () => build(),
    canvasWithMetadata: async () =>
      renderWithMetadata<SoneCanvas>(node, renderer, config),
    pages: async (): Promise<SoneCanvas[]> =>
      renderPages(node, renderer, config),
  };
}

export const Font = {
  async load(name: string, source: FontSource) {
    return renderer.registerFont(name, source);
  },
  async unload(name: string) {
    return renderer.unregisterFont(name);
  },
  reset() {
    renderer.resetFonts();
  },
  has(name: string): boolean {
    return renderer.hasFont(name);
  },
};
