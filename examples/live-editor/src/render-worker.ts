/**
 * Render worker.
 *
 * Sone now ships a single WebAssembly (CanvasKit) backend that runs in the
 * browser directly, so there is no custom renderer any more — the worker just
 * drives sone's built-in pipeline off the main thread. It renders to PNG for
 * the live preview and encodes PNG/JPEG/PDF/SVG on demand for export.
 */
import {
  configureSkia,
  Font,
  sone,
  type SoneImage,
  type SoneNode,
} from "sone";
// Vite resolves the CanvasKit wasm shipped with `skia` to an asset URL.
import wasmUrl from "skia/canvaskit.wasm?url";
import { transform } from "sucrase";
import { transformCode } from "./execute";

// Point CanvasKit at the bundled wasm before the first render.
configureSkia({ wasmFile: wasmUrl });

// Image decode cache, shared across renders (keyed by url / bytes).
const renderCache = new Map<string | Uint8Array, SoneImage>();

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

/** Transform + evaluate user code into a Sone node. */
async function buildNode(code: string): Promise<SoneNode> {
  const { code: js } = transform(code, { transforms: ["typescript"] });
  const transformed = transformCode(js);
  const fn = new AsyncFunction(
    "__sone",
    `${transformed}\nreturn typeof __default === "function" ? __default() : __default;`,
  );
  // The user's `import ... from "sone"` is rewritten to read from __sone.
  const soneAll = await import("sone");
  return fn(soneAll);
}

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data as Record<string, unknown>;

  if (msg.type === "render") {
    const { id, code, dpr } = msg as { id: number; code: string; dpr: number };
    try {
      const node = await buildNode(code);
      if (node == null) {
        self.postMessage({
          type: "error",
          id,
          message:
            'Nothing returned. Make sure you have `export default function Root() { return ... }`',
        });
        return;
      }
      // Render at device density so the preview is crisp on hi-dpi screens.
      const png = await sone(node, { cache: renderCache }).png({ density: dpr });
      const bitmap = await createImageBitmap(new Blob([png as BlobPart]));
      (self as unknown as Worker).postMessage(
        { type: "result", id, bitmap, width: bitmap.width, height: bitmap.height },
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

  if (msg.type === "export") {
    const { id, code, format } = msg as {
      id: number;
      code: string;
      format: "png" | "jpeg" | "pdf" | "svg";
    };
    try {
      const node = await buildNode(code);
      if (node == null) {
        self.postMessage({ type: "exportError", id, message: "Nothing to export." });
        return;
      }
      const doc = sone(node, { cache: renderCache });
      // Raster exports render at 2x; pdf/svg are vector and ignore density.
      const bytes =
        format === "png"
          ? await doc.png({ density: 2 })
          : format === "jpeg"
            ? await doc.jpg(0.95, { density: 2 })
            : format === "pdf"
              ? await doc.pdf()
              : await doc.svg();
      const buffer = new Uint8Array(bytes); // own a transferable copy
      (self as unknown as Worker).postMessage(
        { type: "export", id, format, bytes: buffer },
        [buffer.buffer],
      );
    } catch (err) {
      self.postMessage({
        type: "exportError",
        id,
        message: err instanceof Error ? err.message : String(err),
      });
    }
    return;
  }

  if (msg.type === "registerFont") {
    const { name, url } = msg as { name: string; url: string };
    try {
      await Font.load(name, url);
    } catch {
      /* subset unavailable in this build (e.g. woff2 without decompression) */
    }
    return;
  }

  if (msg.type === "unregisterFont") {
    await Font.unload((msg as { name: string }).name);
    return;
  }

  if (msg.type === "clearImageCache") {
    const { url } = msg as { url?: string };
    if (url == null) renderCache.clear();
    else renderCache.delete(url);
    return;
  }
};
