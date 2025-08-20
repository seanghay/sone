import type { SpanProps } from "./core.ts";

/**
 * Build CSS font string from span properties
 * @param props - span properties containing font info
 * @returns CSS font string for canvas context
 * @example fontBuilder({font: ["Arial"], size: 14, weight: "bold"}) // "bold 14px Arial"
 */
export function fontBuilder(props: SpanProps): string {
  const family = props.font != null ? props.font?.join(", ") : "";
  const size = props.size ?? "";
  const weight = props.weight ?? "";
  const style = props.style ?? "";
  return `${style} ${weight} ${size}px ${family}`.trim();
}

/**
 * Apply span properties to canvas rendering context
 * @param ctx - canvas 2D rendering context
 * @param props - span properties to apply
 */
export function applySpanProps(
  ctx: CanvasRenderingContext2D,
  props: SpanProps,
) {
  ctx.font = fontBuilder(props);
  if (props.letterSpacing != null) {
    ctx.letterSpacing = `${props.letterSpacing}px`;
  }
  if (props.wordSpacing != null) {
    ctx.wordSpacing = `${props.wordSpacing}px`;
  }

  if (props.color != null) {
    if (typeof props.color === "string") {
      ctx.fillStyle = props.color;
    }
  }
}

export function indicesOf(value: string, c: string): number[] {
  const indices: number[] = [];
  let index = value.indexOf(c);
  while (index !== -1) {
    indices.push(index);
    index = value.indexOf(c, index + 1);
  }
  return indices;
}

const REGEX_WHITESPACE = /^\s+$/;

export function isWhitespace(value: string): boolean {
  if (value.length === 0) return false;
  return REGEX_WHITESPACE.test(value);
}
