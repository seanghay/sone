import { fileURLToPath } from "node:url";
import { Font } from "../../src/index.ts";

const relative = (p: string) => fileURLToPath(new URL(p, import.meta.url));

let loading: Promise<void> | null = null;

/**
 * Register the fonts the visual scripts draw with.
 *
 * CanvasKit has no system fonts, so this must run before any script renders.
 * Registration order matters: generic names (`sans-serif`, `serif`,
 * `monospace`) resolve to the first family registered, which is what the
 * scripts previously got from the host system.
 */
export function loadVisualTestFonts(): Promise<void> {
  if (loading != null) return loading;

  loading = (async () => {
    // First registration wins for generic families, so a proportional sans
    // goes first — `sans-serif` should not resolve to a monospace face.
    await Font.load(
      "GoogleSans",
      relative("../font/GoogleSans-VariableFont_GRAD,opsz,wght.ttf"),
    );
    await Font.load("Geist", relative("../font/GeistMono-Regular.ttf"));
    await Font.load("GeistMono", relative("../font/GeistMono-Regular.ttf"));
    await Font.load("GeistMono-Bold", relative("../font/GeistMono-Bold.ttf"));
    await Font.load("Moul", relative("../font/Moul-Regular.ttf"));
    await Font.load("NotoSansKhmer", relative("../font/NotoSansKhmer.ttf"));
    await Font.load("NotoSansArabic", relative("../font/NotoSansArabic.ttf"));
    await Font.load("NotoSansHebrew", relative("../font/NotoSansHebrew.ttf"));
  })();

  return loading;
}

// Registering on import means every script that pulls in this module — directly
// or through `utils.ts` — has fonts available without its own bootstrap.
await loadVisualTestFonts();
