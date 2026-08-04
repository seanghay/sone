/**
 * Sone — a declarative Canvas layout engine, backed by the `skia` CanvasKit
 * WASM build.
 *
 * Pure WebAssembly: no native addon, no prebuilt binaries, identical output on
 * every platform. This single entry runs in Node, browsers and edge runtimes;
 * the backend (see `backend.ts`) auto-detects filesystem vs. `fetch`. Because it
 * is WASM rather than a native addon, PDF and SVG output work everywhere.
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
import { renderer, wrap } from "./backend.ts";
import type { SoneNode } from "./core.ts";
import {
  type FontSource,
  render,
  renderPages,
  renderWithMetadata,
  type SoneRenderConfig,
} from "./renderer.ts";
import {
  combineToPdf,
  type ExportOptions,
  type OutputFormat,
  SoneCanvas,
} from "./skia/canvas.ts";

export * from "./core.ts";
export * from "./linebreak.ts";
export * from "./qrcode.ts";
export type {
  FontSource,
  SoneHeaderFooter,
  SonePageInfo,
  SoneRenderConfig,
} from "./renderer.ts";
// Only the public render surface is re-exported. The rendering engine's
// internals (compile, layout, draw helpers, the SoneRenderer backend, etc.)
// stay module-private to renderer.ts — there is one WASM backend and no
// pluggable seam, so they are not part of the package API.
export { render, renderPages, renderWithMetadata } from "./renderer.ts";
export type { ExportOptions, OutputFormat } from "./skia/canvas.ts";
export { SoneCanvas } from "./skia/canvas.ts";
export { SoneImage } from "./skia/image.ts";
export { configureSkia } from "./skia/init.ts";
export { SonePath } from "./skia/path.ts";
export { fontBuilder } from "./utils.ts";
export * from "./yolo.ts";

/**
 * Render a node, exposing one method per output format.
 *
 * On Node the byte-returning methods yield a `Buffer` at runtime (typed as
 * `Uint8Array`); other runtimes return a plain `Uint8Array`.
 */
export function sone(node: SoneNode, config?: SoneRenderConfig) {
  const build = () => render<SoneCanvas>(node, config);

  const encode = async (format: OutputFormat, options?: ExportOptions) =>
    wrap((await build()).toBuffer(format, options));

  return {
    /** JPEG image. `quality` is 0..1 (default 1). */
    jpg: (quality = 1.0, options?: ExportOptions) =>
      encode("jpg", { quality, ...options }),
    /** PNG image. */
    png: (options?: ExportOptions) => encode("png", options),
    /** SVG vector graphic with live `<text>` elements. */
    svg: (options?: ExportOptions) => encode("svg", options),
    /**
     * PDF document. With `pageHeight` set in config, produces one page per
     * canvas from `pages()`; text stays selectable with subsetted fonts.
     */
    pdf: async (options?: ExportOptions) => {
      if (config?.pageHeight) {
        const pages = await renderPages(node, config);
        if (pages.length === 0) return wrap(new Uint8Array(0));
        return wrap(combineToPdf(pages));
      }
      return encode("pdf", options);
    },
    /** WebP image. */
    webp: (options?: ExportOptions) => encode("webp", options),
    /** Raw RGBA pixel buffer. */
    raw: (options?: ExportOptions) => encode("raw", options),
    /** The rendered canvas, for custom export. */
    canvas: () => build(),
    canvasWithMetadata: () => renderWithMetadata<SoneCanvas>(node, config),
    /** One canvas per page, using `pageHeight` from config. */
    pages: () => renderPages(node, config),
  };
}

/**
 * Font management. CanvasKit has no system fonts, so at least one font must be
 * registered before rendering any text.
 */
export const Font = {
  /** Load and register a font from a path, URL, or raw bytes. */
  load: (name: string, source: FontSource) =>
    renderer.registerFont(name, source),
  /** Unregister a previously loaded font. */
  unload: (name: string) => renderer.unregisterFont(name),
  /** Remove every registered font. */
  reset: () => renderer.resetFonts(),
  /** Whether a font with this name is registered. */
  has: (name: string) => renderer.hasFont(name),
};
