/**
 * The one rendering backend, plus the small amount of platform detection it
 * needs.
 *
 * Sone runs on pure WebAssembly (the `skia` CanvasKit build), so there is a
 * single backend shared by Node, the browser and edge runtimes. The only thing
 * that genuinely varies between them is how raw bytes are read — filesystem vs.
 * `fetch` — which is detected once here.
 *
 * `renderer.ts` imports this singleton directly (rather than having it injected)
 * so the binding is always retained by bundlers; there is no load-time
 * side-effect statement that tree-shaking could drop.
 */
import { defaultLineBreakerIterator } from "./linebreak.ts";
import {
  DEFAULT_TEXT_PROPS,
  type FontSource,
  type SoneRenderer,
} from "./renderer.ts";
import { Arena } from "./skia/arena.ts";
import { SoneCanvas } from "./skia/canvas.ts";
import { FontRegistry } from "./skia/fonts.ts";
import { SoneImage } from "./skia/image.ts";
import { ck, ready } from "./skia/init.ts";
import { TextMeasurer } from "./skia/measure.ts";
import type { Painter } from "./skia/painter.ts";
import { ParagraphPainter } from "./skia/paragraph.ts";
import { SonePath } from "./skia/path.ts";

// ── Platform detection ──────────────────────────────────────────────────────

const isNode = typeof process !== "undefined" && process.versions?.node != null;

const isHttp = (src: string) => /^https?:\/\//.test(src);

async function fetchBytes(src: string | URL): Promise<Uint8Array> {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${String(src)} (HTTP ${response.status})`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function readFileBytes(src: string | URL): Promise<Uint8Array> {
  const { readFile } = await import(/* @vite-ignore */ "node:fs/promises");
  return new Uint8Array(await readFile(src));
}

/** Read bytes from a file path (Node) or an `http(s)` URL string. */
function readBytes(src: string): Promise<Uint8Array> {
  if (isHttp(src)) return fetchBytes(src);
  if (isNode) return readFileBytes(src);
  // In the browser a bare string is a URL relative to the document.
  return fetchBytes(src);
}

/** Read bytes from a `URL`, honouring `file:` on Node. */
function readUrl(url: URL): Promise<Uint8Array> {
  if (url.protocol === "file:") {
    if (isNode) return readFileBytes(url);
    throw new Error("file: URLs are only supported on Node.js");
  }
  return fetchBytes(url);
}

/** Resolve any accepted font source to raw bytes. */
async function loadFontBytes(source: FontSource): Promise<Uint8Array[]> {
  if (source instanceof Uint8Array) return [source];
  if (source instanceof ArrayBuffer) return [new Uint8Array(source)];
  if (source instanceof URL) return [await readUrl(source)];
  if (Array.isArray(source)) {
    const all = await Promise.all(source.map((entry) => loadFontBytes(entry)));
    return all.flat();
  }
  return [await readBytes(source)];
}

/** Node preserves its historical `Buffer` output; other runtimes get bytes. */
const NodeBuffer = (
  globalThis as { Buffer?: typeof import("node:buffer").Buffer }
).Buffer;

/** Wrap encoded output in the platform's preferred byte type. */
export const wrap = (bytes: Uint8Array): Uint8Array =>
  isNode && NodeBuffer != null ? NodeBuffer.from(bytes) : bytes;

// ── Backend ─────────────────────────────────────────────────────────────────

const fonts = new FontRegistry();
const measurer = new TextMeasurer(fonts);
const paragraphs = new ParagraphPainter(fonts, measurer);

const dpr = () =>
  typeof globalThis.devicePixelRatio === "number"
    ? globalThis.devicePixelRatio
    : 1;

/**
 * The single rendering backend. There is no pluggable seam: `render()` uses
 * this internally. It is exported for direct measurement and advanced use, but
 * you cannot substitute your own.
 */
export const renderer: SoneRenderer = {
  debug() {
    return { layout: false, text: false };
  },
  /** Instantiate CanvasKit. Idempotent. */
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
      dpr: dpr(),
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
    return SoneImage.decode(await readBytes(src));
  },
  getDefaultTextProps() {
    return DEFAULT_TEXT_PROPS;
  },
  dpr,
};
