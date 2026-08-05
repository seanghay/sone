/**
 * Bundled default fonts.
 *
 * Sone ships a sans (Google Sans) and a monospace (Geist Mono, upright +
 * italic) so text renders without any `Font.load()` call. They are shipped as
 * raw `.ttf` assets and referenced through `import.meta.url`, so a Node build
 * reads them from disk and a browser bundler (Vite, etc.) emits them as assets
 * and fetches them — no multi-megabyte base64 in the JS bundle.
 *
 * This module is imported lazily (only when a render finds no registered font),
 * so applications that register their own fonts never load these URLs.
 *
 * Both fonts are licensed under the SIL Open Font License 1.1; the license text
 * ships alongside them (GoogleSans-OFL.txt, GeistMono-OFL.txt in ./fonts).
 */

/** Family name the bundled sans is registered under; backs `sans-serif`. */
export const SANS_FAMILY = "Google Sans";
/** Family name the bundled monospace is registered under; backs `monospace`. */
export const MONO_FAMILY = "Geist Mono";

/** Asset URL for the bundled sans, resolved relative to this module. */
export const SANS_URL = new URL("./fonts/google-sans.ttf", import.meta.url);
/** Asset URLs for the bundled monospace (upright then italic). */
export const MONO_URLS = [
  new URL("./fonts/geist-mono.ttf", import.meta.url),
  new URL("./fonts/geist-mono-italic.ttf", import.meta.url),
];
