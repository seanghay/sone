import * as soneAll from "sone";
import {
  DEFAULT_TEXT_PROPS,
  defaultLineBreakerIterator,
  fontBuilder,
  render,
  type SoneRenderer,
} from "sone";
import { transform } from "sucrase";
import { transformCode } from "./execute";

// OffscreenCanvas-based renderer — runs entirely off the main thread
const measureCanvas = new OffscreenCanvas(1, 1);
const registeredFonts = new Set<string>();
let currentDpr = 1;

// workers expose fonts via WorkerGlobalScope.fonts
const workerFonts = (self as unknown as { fonts: FontFaceSet }).fonts;

const workerRenderer: SoneRenderer = {
  breakIterator: defaultLineBreakerIterator,

  createCanvas(w: number, h: number) {
    const dpr = currentDpr + 1;
    const canvas = new OffscreenCanvas(w * dpr, h * dpr) as unknown as HTMLCanvasElement;
    canvas.getContext("2d")?.scale(dpr, dpr)
    return canvas;
  },

  measureText(text: string, props: Parameters<SoneRenderer["measureText"]>[1]) {
    const ctx = measureCanvas.getContext("2d")!;
    ctx.font = fontBuilder(props);
    ctx.letterSpacing = `${props.letterSpacing ?? 0}px`;
    ctx.wordSpacing = `${props.wordSpacing ?? 0}px`;
    return ctx.measureText(text);
  },

  hasFont: (name: string) => registeredFonts.has(name),

  async registerFont(name: string, source: string | string[]) {
    const srcs = Array.isArray(source) ? source : [source];
    const face = new FontFace(name, srcs.map((s) => `url(${s})`).join(", "));
    await face.load();
    workerFonts.add(face);
    registeredFonts.add(name);
  },

  async unregisterFont(name: string) {
    for (const face of workerFonts) {
      if (face.family === name || face.family === `"${name}"`) {
        workerFonts.delete(face);
      }
    }
    registeredFonts.delete(name);
  },

  resetFonts() {
    for (const name of registeredFonts) {
      for (const face of workerFonts) {
        if (face.family === name || face.family === `"${name}"`) {
          workerFonts.delete(face);
        }
      }
    }
    registeredFonts.clear();
  },

  async loadImage(src: string | Uint8Array): Promise<HTMLImageElement> {
    let blob: Blob;
    if (typeof src === "string") {
      const resp = await fetch(src);
      blob = await resp.blob();
    } else {
      blob = new Blob([src.buffer as ArrayBuffer]);
    }
    return createImageBitmap(blob) as unknown as HTMLImageElement;
  },

  getDefaultTextProps: () => DEFAULT_TEXT_PROPS,
  dpr: () => currentDpr,
  Path2D,
  debug: () => ({ layout: false, text: false }),
};

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data as Record<string, unknown>;

  if (msg.type === "render") {
    const { id, code, dpr } = msg as { id: number; code: string; dpr: number };
    currentDpr = dpr;
    try {
      const { code: js } = transform(code as string, {
        transforms: ["typescript"],
      });
      const transformed = transformCode(js);
      const fn = new AsyncFunction(
        "__sone",
        `${transformed}\nreturn typeof __default === "function" ? __default() : __default;`,
      );
      const node = await fn(soneAll);
      if (node == null) {
        self.postMessage({
          type: "error",
          id,
          message:
            "Nothing returned. Make sure you have `export default function Root() { return ... }`",
        });
        return;
      }
      const canvas = (await render(
        node,
        workerRenderer,
      )) as unknown as OffscreenCanvas;
      const { width, height } = canvas;
      const bitmap = canvas.transferToImageBitmap();
      (self as unknown as Worker).postMessage(
        { type: "result", id, bitmap, width, height },
        [bitmap],
      );
    } catch (err) {
      self.postMessage({
        type: "error",
        id,
        message: err instanceof Error ? err.message : String(err),
      });
    }
    return;
  }

  if (msg.type === "registerFont") {
    const { name, url } = msg as { name: string; url: string };
    try {
      await workerRenderer.registerFont(name, url);
    } catch {
      /* subset unavailable */
    }
    return;
  }

  if (msg.type === "unregisterFont") {
    await workerRenderer.unregisterFont((msg as { name: string }).name);
  }
};
