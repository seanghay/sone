/**
 * CSS filter strings -> Skia ImageFilter.
 *
 * `filters` is typed `string[]` on the node and was previously passed straight
 * through to `ctx.filter`, so it accepted the full CSS filter grammar. Anything
 * outside the subset below now warns once rather than silently rendering
 * differently.
 */
import { parseColor } from "./color.ts";
import type { CanvasKit } from "./init.ts";

// biome-ignore lint/suspicious/noExplicitAny: CanvasKit ImageFilter
type SkImageFilter = any;

const warned = new Set<string>();

function warnOnce(fn: string): void {
  if (warned.has(fn)) return;
  warned.add(fn);
  console.warn(
    `sone: CSS filter ${JSON.stringify(fn)} is not supported by the Skia backend and was ignored.`,
  );
}

/** `10px` / `10` / `50%` / `0.5` / `45deg` -> number in the unit implied. */
function parseValue(raw: string, percentBase = 1): number {
  const value = raw.trim();
  if (value.endsWith("%")) {
    return (Number.parseFloat(value) / 100) * percentBase;
  }
  return Number.parseFloat(value);
}

/** CSS blur() takes a radius; Skia takes a sigma. */
const radiusToSigma = (radius: number) => radius / 2;

/**
 * A 4x5 row-major color matrix, the shape `ColorFilter.MakeMatrix` expects.
 */
function saturateMatrix(amount: number): number[] {
  // Luminance coefficients per the CSS filter effects spec.
  const r = 0.213;
  const g = 0.715;
  const b = 0.072;
  const s = amount;
  return [
    r + s * (1 - r),
    g - s * g,
    b - s * b,
    0,
    0,
    r - s * r,
    g + s * (1 - g),
    b - s * b,
    0,
    0,
    r - s * r,
    g - s * g,
    b + s * (1 - b),
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}

function sepiaMatrix(amount: number): number[] {
  const a = amount;
  return [
    0.393 + 0.607 * (1 - a),
    0.769 - 0.769 * (1 - a),
    0.189 - 0.189 * (1 - a),
    0,
    0,
    0.349 - 0.349 * (1 - a),
    0.686 + 0.314 * (1 - a),
    0.168 - 0.168 * (1 - a),
    0,
    0,
    0.272 - 0.272 * (1 - a),
    0.534 - 0.534 * (1 - a),
    0.131 + 0.869 * (1 - a),
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}

function grayscaleMatrix(amount: number): number[] {
  return saturateMatrix(1 - amount);
}

function scaleMatrix(amount: number): number[] {
  // brightness(): multiply RGB, leave alpha.
  return [
    amount,
    0,
    0,
    0,
    0,
    0,
    amount,
    0,
    0,
    0,
    0,
    0,
    amount,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}

function contrastMatrix(amount: number): number[] {
  const intercept = 0.5 * (1 - amount);
  return [
    amount,
    0,
    0,
    0,
    intercept,
    0,
    amount,
    0,
    0,
    intercept,
    0,
    0,
    amount,
    0,
    intercept,
    0,
    0,
    0,
    1,
    0,
  ];
}

function invertMatrix(amount: number): number[] {
  const s = 1 - 2 * amount;
  return [
    s,
    0,
    0,
    0,
    amount,
    0,
    s,
    0,
    0,
    amount,
    0,
    0,
    s,
    0,
    amount,
    0,
    0,
    0,
    1,
    0,
  ];
}

function opacityMatrix(amount: number): number[] {
  return [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, amount, 0];
}

function hueRotateMatrix(degrees: number): number[] {
  const rad = (degrees * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [
    0.213 + c * 0.787 - s * 0.213,
    0.715 - c * 0.715 - s * 0.715,
    0.072 - c * 0.072 + s * 0.928,
    0,
    0,
    0.213 - c * 0.213 + s * 0.143,
    0.715 + c * 0.285 + s * 0.14,
    0.072 - c * 0.072 - s * 0.283,
    0,
    0,
    0.213 - c * 0.213 - s * 0.787,
    0.715 - c * 0.715 + s * 0.715,
    0.072 + c * 0.928 + s * 0.072,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}

/** Split "blur(4px) brightness(0.5)" into its individual function calls. */
function splitFunctions(input: string): Array<{ name: string; args: string }> {
  const out: Array<{ name: string; args: string }> = [];
  const re = /([a-z-]+)\(([^)]*)\)/gi;
  let match = re.exec(input);
  while (match != null) {
    out.push({ name: match[1].toLowerCase(), args: match[2] });
    match = re.exec(input);
  }
  return out;
}

/**
 * Build a single composed ImageFilter for a list of CSS filter strings.
 *
 * @returns the filter, plus every intermediate object so the caller can hand
 * them to an arena — CanvasKit filters are not garbage collected.
 */
export function parseCssFilter(
  kit: CanvasKit,
  filters: readonly string[],
): { filter: SkImageFilter | null; disposables: Array<{ delete(): void }> } {
  const disposables: Array<{ delete(): void }> = [];
  let result: SkImageFilter | null = null;

  const compose = (next: SkImageFilter) => {
    result = result == null ? next : kit.ImageFilter.MakeCompose(result, next);
    if (result !== next) disposables.push(result);
  };

  const colorMatrix = (matrix: number[]) => {
    const colorFilter = kit.ColorFilter.MakeMatrix(matrix);
    disposables.push(colorFilter);
    const imageFilter = kit.ImageFilter.MakeColorFilter(colorFilter, null);
    disposables.push(imageFilter);
    compose(imageFilter);
  };

  for (const entry of filters) {
    for (const { name, args } of splitFunctions(entry)) {
      switch (name) {
        case "blur": {
          const sigma = radiusToSigma(parseValue(args));
          if (!(sigma > 0)) break;
          const blur = kit.ImageFilter.MakeBlur(
            sigma,
            sigma,
            kit.TileMode.Decal,
            null,
          );
          disposables.push(blur);
          compose(blur);
          break;
        }
        case "brightness":
          colorMatrix(scaleMatrix(parseValue(args)));
          break;
        case "contrast":
          colorMatrix(contrastMatrix(parseValue(args)));
          break;
        case "saturate":
          colorMatrix(saturateMatrix(parseValue(args)));
          break;
        case "grayscale":
          colorMatrix(grayscaleMatrix(parseValue(args)));
          break;
        case "sepia":
          colorMatrix(sepiaMatrix(parseValue(args)));
          break;
        case "invert":
          colorMatrix(invertMatrix(parseValue(args)));
          break;
        case "opacity":
          colorMatrix(opacityMatrix(parseValue(args)));
          break;
        case "hue-rotate":
          colorMatrix(hueRotateMatrix(Number.parseFloat(args)));
          break;
        case "drop-shadow": {
          // drop-shadow(<dx> <dy> <blur> <color>)
          const parts = args.trim().split(/\s+/);
          const dx = parseValue(parts[0] ?? "0");
          const dy = parseValue(parts[1] ?? "0");
          const sigma = radiusToSigma(parseValue(parts[2] ?? "0"));
          const color = parts.slice(3).join(" ") || "black";
          const shadow = kit.ImageFilter.MakeDropShadow(
            dx,
            dy,
            sigma,
            sigma,
            parseColor(color),
            null,
          );
          disposables.push(shadow);
          compose(shadow);
          break;
        }
        case "none":
          break;
        default:
          warnOnce(name);
      }
    }
  }

  return { filter: result, disposables };
}
