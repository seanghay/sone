import {
  DEFAULT_TEXT_PROPS,
  defaultLineBreakerIterator,
  fontBuilder,
  type SoneRenderer,
} from "sone";

export interface RenderDebugOptions {
  layout: boolean;
  text: boolean;
}

const registeredFonts = new Set<string>();
const measureCanvas = document.createElement("canvas");

const sharedMethods: Omit<SoneRenderer, "dpr"> = {
  breakIterator: defaultLineBreakerIterator,

  createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.getContext("2d")?.scale(devicePixelRatio, devicePixelRatio);
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
    document.fonts.add(face);
    registeredFonts.add(name);
  },

  async unregisterFont(name: string) {
    for (const face of document.fonts) {
      if (face.family === name || face.family === `"${name}"`) {
        document.fonts.delete(face);
      }
    }
    registeredFonts.delete(name);
  },

  resetFonts() {
    for (const name of registeredFonts) {
      for (const face of document.fonts) {
        if (face.family === name || face.family === `"${name}"`) {
          document.fonts.delete(face);
        }
      }
    }
    registeredFonts.clear();
  },

  async loadImage(src: string | Uint8Array): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      if (typeof src === "string") {
        img.src = src;
      } else {
        const blob = new Blob([src.buffer as ArrayBuffer]);
        const url = URL.createObjectURL(blob);
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.src = url;
      }
    });
  },

  getDefaultTextProps: () => DEFAULT_TEXT_PROPS,
  Path2D,
  debug: () => ({ layout: false, text: false }),
};

export function createRenderer(
  dpr: number,
  debug: RenderDebugOptions = { layout: false, text: false },
): SoneRenderer {
  return { ...sharedMethods, dpr: () => dpr, debug: () => debug };
}

/** Preview renderer — renders at 2x device pixel ratio for display */
export const browserRenderer: SoneRenderer = createRenderer(
  window.devicePixelRatio,
);
