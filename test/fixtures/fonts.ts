/**
 * Shared test fonts.
 *
 * CanvasKit has no system fonts, so every suite must register its own. This is
 * wired into vitest's `setupFiles` so individual test files need no changes.
 *
 * Registration order matters: generic names (`sans-serif`, `serif`,
 * `monospace`) resolve to the first family registered.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Font } from "../../src/node.ts";

const fontPath = (name: string) =>
  fileURLToPath(new URL(`../font/${name}`, import.meta.url));

/** family -> file, in registration order. */
export const TEST_FONTS: Array<[string, string]> = [
  // GoogleSans is first on purpose: generic families resolve to whatever is
  // registered first, and `sans-serif` should be a proportional sans — that is
  // what the host system used to supply.
  ["GoogleSans", "GoogleSans-VariableFont_GRAD,opsz,wght.ttf"],
  ["Geist", "GeistMono-Regular.ttf"],
  ["GeistMono", "GeistMono-Regular.ttf"],
  ["GeistMono-Bold", "GeistMono-Bold.ttf"],
  ["Moul", "Moul-Regular.ttf"],
  ["NotoSansKhmer", "NotoSansKhmer.ttf"],
  ["NotoSansArabic", "NotoSansArabic.ttf"],
  ["NotoSansHebrew", "NotoSansHebrew.ttf"],
];

let registered: Promise<void> | null = null;

/** Register every test font. Idempotent and safe to call concurrently. */
export function registerTestFonts(): Promise<void> {
  if (registered != null) return registered;
  registered = (async () => {
    for (const [family, file] of TEST_FONTS) {
      await Font.load(family, new Uint8Array(await readFile(fontPath(file))));
    }
  })();
  return registered;
}
