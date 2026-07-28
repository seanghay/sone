/**
 * CSS color strings -> CanvasKit Float32Array colors (RGBA, 0..1).
 *
 * Pure and backend-independent apart from the array shape, so it is unit
 * testable without instantiating WASM.
 */
import { colors as NAMED } from "../color.ts";

/** RGBA in 0..1, the layout CanvasKit expects for Color4f. */
export type Color4f = Float32Array;

const TRANSPARENT = new Float32Array([0, 0, 0, 0]);
const BLACK = new Float32Array([0, 0, 0, 1]);

const cache = new Map<string, Color4f>();

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Parse an alpha term, which CSS allows as either a number or a percentage. */
function alpha(value: string | undefined): number {
  if (value == null) return 1;
  const trimmed = value.trim();
  if (trimmed.endsWith("%")) return clamp01(Number.parseFloat(trimmed) / 100);
  const n = Number.parseFloat(trimmed);
  return Number.isNaN(n) ? 1 : clamp01(n);
}

/** Parse an r/g/b term, which CSS allows as either 0..255 or a percentage. */
function channel(value: string): number {
  const trimmed = value.trim();
  if (trimmed.endsWith("%")) return clamp01(Number.parseFloat(trimmed) / 100);
  const n = Number.parseFloat(trimmed);
  return Number.isNaN(n) ? 0 : clamp01(n / 255);
}

function hueToRgb(p: number, q: number, t: number): number {
  let h = t;
  if (h < 0) h += 1;
  if (h > 1) h -= 1;
  if (h < 1 / 6) return p + (q - p) * 6 * h;
  if (h < 1 / 2) return q;
  if (h < 2 / 3) return p + (q - p) * (2 / 3 - h) * 6;
  return p;
}

function fromHsl(h: number, s: number, l: number, a: number): Color4f {
  // Normalize hue into [0,1); CSS permits negative and >360 values.
  const hue = (((h % 360) + 360) % 360) / 360;
  const sat = clamp01(s);
  const lig = clamp01(l);

  if (sat === 0) return new Float32Array([lig, lig, lig, a]);

  const q = lig < 0.5 ? lig * (1 + sat) : lig + sat - lig * sat;
  const p = 2 * lig - q;
  return new Float32Array([
    hueToRgb(p, q, hue + 1 / 3),
    hueToRgb(p, q, hue),
    hueToRgb(p, q, hue - 1 / 3),
    a,
  ]);
}

function fromHex(hex: string): Color4f | null {
  const h = hex.slice(1);
  const expand = (c: string) => Number.parseInt(c + c, 16) / 255;
  const byte = (i: number) => Number.parseInt(h.slice(i, i + 2), 16) / 255;

  if (h.length === 3 || h.length === 4) {
    return new Float32Array([
      expand(h[0]),
      expand(h[1]),
      expand(h[2]),
      h.length === 4 ? expand(h[3]) : 1,
    ]);
  }
  if (h.length === 6 || h.length === 8) {
    return new Float32Array([
      byte(0),
      byte(2),
      byte(4),
      h.length === 8 ? byte(6) : 1,
    ]);
  }
  return null;
}

/** Split the argument list of a functional notation, accepting `,` or ` /`. */
function args(value: string): string[] {
  const open = value.indexOf("(");
  const close = value.lastIndexOf(")");
  if (open === -1 || close === -1) return [];
  return value
    .slice(open + 1, close)
    .replace(/\//g, ",")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/**
 * Parse any CSS color sone accepts into a CanvasKit color.
 *
 * Falls back to opaque black on unrecognized input, matching Canvas2D's
 * forgiving behavior rather than throwing mid-render.
 */
export function parseColor(value: string): Color4f {
  const key = value.trim().toLowerCase();

  const hit = cache.get(key);
  if (hit != null) return hit;

  const parsed = parseUncached(key);
  cache.set(key, parsed);
  return parsed;
}

function parseUncached(key: string): Color4f {
  if (key === "transparent" || key === "none") return TRANSPARENT;

  const named = (NAMED as Record<string, string>)[key];
  if (named != null) return fromHex(named) ?? BLACK;

  if (key.startsWith("#")) return fromHex(key) ?? BLACK;

  if (key.startsWith("rgb")) {
    const [r, g, b, a] = args(key);
    if (r == null || g == null || b == null) return BLACK;
    return new Float32Array([channel(r), channel(g), channel(b), alpha(a)]);
  }

  if (key.startsWith("hsl")) {
    const [h, s, l, a] = args(key);
    if (h == null || s == null || l == null) return BLACK;
    return fromHsl(
      Number.parseFloat(h),
      Number.parseFloat(s) / 100,
      Number.parseFloat(l) / 100,
      alpha(a),
    );
  }

  return BLACK;
}

/** Apply an opacity multiplier without mutating the cached color. */
export function withAlpha(color: Color4f, multiplier: number): Color4f {
  if (multiplier >= 1) return color;
  return new Float32Array([
    color[0],
    color[1],
    color[2],
    clamp01(color[3] * multiplier),
  ]);
}
