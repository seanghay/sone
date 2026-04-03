import { browserRenderer } from "./renderer";
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

type LoadedFontSource =
  | { kind: "cdn"; link: HTMLLinkElement }
  | { kind: "custom" };

/** Static font URL: {id}@{version}/{subset}-{weight}-{style}.woff2 */
function staticUrl(id: string, subset: string, weight = 400, style = "normal", version = "latest") {
  return `${CDN}/${id}@${version}/${subset}-${weight}-${style}.woff2`;
}

/** Variable font URL: {id}:vf@{version}/{subset}-{axes}-{style}.woff2 */
function variableUrl(id: string, subset: string, axes = "wght", style = "normal", version = "latest") {
  return `${CDN}/${id}:vf@${version}/${subset}-${axes}-${style}.woff2`;
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

/** Load a single subset FontFace directly into document.fonts (no renderer tracking). */
async function loadSubsetDirect(name: string, fontId: string, subset: string, weight: number): Promise<void> {
  const urls = [variableUrl(fontId, subset), staticUrl(fontId, subset, weight)];
  for (const url of urls) {
    try {
      const face = new FontFace(name, `url(${url})`);
      await face.load();
      document.fonts.add(face);
      return;
    } catch {
      // try next URL / next subset
    }
  }
}

const loadedFonts = new Map<string, LoadedFontSource>();

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
 * Registers the latin subset via the Sone renderer (so hasFont() works),
 * then loads all other subsets directly so canvas rendering covers every
 * character range.
 */
export async function loadFontFromCDN(
  fontId: string,
  name: string,
  weight = 400
): Promise<void> {
  if (loadedFonts.has(fontId)) return;

  // Inject CSS stylesheet — defines @font-face rules with unicode-range for HTML rendering
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${CDN}/${fontId}@latest/index.css`;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
  loadedFonts.set(fontId, { kind: "cdn", link });

  // Register latin via the renderer so hasFont(name) returns true in Sone
  const latinUrls = [variableUrl(fontId, "latin"), staticUrl(fontId, "latin", weight)];
  let registeredUrl: string | null = null;
  for (const url of latinUrls) {
    try {
      await browserRenderer.registerFont(name, url);
      registeredUrl = url;
      break;
    } catch {
      // try next
    }
  }

  // Mirror the registration into the render worker so canvas output uses it too
  if (registeredUrl) workerBridge.registerFont(name, registeredUrl);

  // Load remaining subsets directly in parallel (skipping latin, already done above)
  await Promise.all(
    SUBSETS.filter((s) => s !== "latin").map(async (subset) => {
      const urls = [variableUrl(fontId, subset), staticUrl(fontId, subset, weight)];
      for (const url of urls) {
        try {
          const face = new FontFace(name, `url(${url})`);
          await face.load();
          document.fonts.add(face);
          workerBridge.registerFont(name, url); // sync to worker
          return;
        } catch { /* subset unavailable */ }
      }
    })
  );

  await document.fonts.ready;
}

export async function loadCustomFontFile(
  fontId: string,
  name: string,
  file: File,
): Promise<void> {
  if (loadedFonts.has(fontId)) return;

  const source = await fileToDataUrl(file);
  await browserRenderer.registerFont(name, source);
  workerBridge.registerFont(name, source);
  loadedFonts.set(fontId, { kind: "custom" });
  await document.fonts.ready;
}

export function unloadFont(fontId: string, name: string): void {
  const loaded = loadedFonts.get(fontId);
  if (loaded?.kind === "cdn") {
    document.head.removeChild(loaded.link);
  }
  loadedFonts.delete(fontId);
  browserRenderer.unregisterFont(name);
  workerBridge.unregisterFont(name);
}
