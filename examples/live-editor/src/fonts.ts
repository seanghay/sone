import { workerBridge } from "./worker-bridge";

export interface FontEntry {
  id: string;
  name: string;
  loaded: boolean;
}

export interface FontMeta {
  id: string;
  family: string;
  subsets: string[];
  weights: number[];
  styles: string[];
  variable: boolean;
  category: string;
}

let fontsCache: FontMeta[] | null = null;

export async function fetchAllFonts(): Promise<FontMeta[]> {
  if (fontsCache) return fontsCache;
  const res = await fetch("https://api.fontsource.org/v1/fonts");
  if (!res.ok) throw new Error(`FontSource API error: ${res.status}`);
  fontsCache = await res.json();
  return fontsCache!;
}

const CDN = "https://cdn.jsdelivr.net/fontsource/fonts";

export interface LoadedFontInfo {
  id: string;
  name: string;
}

type LoadedFontRecord =
  | { id: string; name: string; kind: "cdn"; link: HTMLLinkElement }
  | { id: string; name: string; kind: "custom" };

/**
 * Static font URL as TTF: {id}@{version}/{subset}-{weight}-{style}.ttf
 *
 * TTF, not woff2: sone's WASM backend parses TTF/OTF/WOFF but not woff2, and
 * fontsource only publishes its variable fonts as woff2.
 */
function staticUrl(id: string, subset: string, weight = 400, style = "normal", version = "latest") {
  return `${CDN}/${id}@${version}/${subset}-${weight}-${style}.ttf`;
}

// Ordered by likelihood — latin first so the primary registration succeeds fast
const SUBSETS = [
  "latin",
  "latin-ext",
  "cyrillic",
  "cyrillic-ext",
  "greek",
  "greek-ext",
  "vietnamese",
  "arabic",
  "hebrew",
  "thai",
  "khmer",
];

const loadedFonts = new Map<string, LoadedFontRecord>();

export function getLoadedFonts(): LoadedFontInfo[] {
  return Array.from(loadedFonts.values()).map(({ id, name }) => ({ id, name }));
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to read font file."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read font file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Load a font from the jsDelivr FontSource CDN.
 *
 * Rendering happens in the worker (sone's WASM backend), so each subset is
 * registered there via {@link workerBridge}. The CSS stylesheet and directly
 * loaded FontFaces cover the editor's own HTML rendering of the font.
 */
export async function loadFontFromCDN(
  fontId: string,
  name: string,
  weight = 400
): Promise<void> {
  if (loadedFonts.has(fontId)) return;

  // Inject CSS stylesheet — @font-face rules with unicode-range for the editor's
  // own HTML rendering (the browser handles woff2 there).
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${CDN}/${fontId}@latest/index.css`;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
  loadedFonts.set(fontId, { id: fontId, name, kind: "cdn", link });

  // Register static TTF in the render worker (sone can't parse woff2). Latin
  // gets regular + bold; other subsets get regular. Missing files 404 and are
  // skipped silently in the worker's Font.load.
  const registerTtf = async (subset: string, w: number) => {
    const url = staticUrl(fontId, subset, w);
    workerBridge.registerFont(name, url);
    try {
      const face = new FontFace(name, `url(${url})`, { weight: String(w) });
      await face.load();
      document.fonts.add(face);
    } catch {
      /* subset/weight unavailable */
    }
  };

  await Promise.all([
    registerTtf("latin", 400),
    registerTtf("latin", 700),
    ...SUBSETS.filter((s) => s !== "latin").map((s) => registerTtf(s, weight)),
  ]);

  await document.fonts.ready;
}

export async function loadCustomFontFile(
  fontId: string,
  name: string,
  file: File,
): Promise<void> {
  if (loadedFonts.has(fontId)) return;

  // sone's WASM backend parses TTF/OTF/WOFF (not woff2); a woff2 upload will be
  // rejected by the worker and simply won't render.
  const source = await fileToDataUrl(file);
  workerBridge.registerFont(name, source);
  try {
    const face = new FontFace(name, `url(${source})`);
    await face.load();
    document.fonts.add(face);
  } catch { /* still usable by the worker even if the browser rejects it */ }
  loadedFonts.set(fontId, { id: fontId, name, kind: "custom" });
  await document.fonts.ready;
}

export function unloadFont(fontId: string, name: string): void {
  const loaded = loadedFonts.get(fontId);
  if (loaded?.kind === "cdn") {
    document.head.removeChild(loaded.link);
  }
  loadedFonts.delete(fontId);
  for (const face of document.fonts) {
    if (face.family === name || face.family === `"${name}"`) {
      document.fonts.delete(face);
    }
  }
  workerBridge.unregisterFont(name);
}
