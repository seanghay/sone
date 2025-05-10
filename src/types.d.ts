export interface SoneTextOptions {
  size: number;
  font: string;
  color: string;
  weight: number;
  lineHeight: number;
  indentSize: number;
  align: "left" | "right" | "center" | "justify"
}

export interface SoneSpanOptions {
  size: number;
  font: string;
  color: string;
  weight: number;
}

export type SoneSpanNode = {
  text: string;
  style: SoneSpanOptions;
  spanStyle?: SoneSpanOptions;
  type: (...args: unknown[]) => unknown;
}

export type SoneSpanRenderNode = SoneSpanNode & {
  width: number;
  height: number;
  textMetrics: TextMetrics;
}


export interface SoneDrawingContext {
  ctx: CanvasRenderingContext2D;
  component: () => unknown;
  x: number;
  y: number;
  computedWidth: number;
  computedHeight: number;
}

export type SoneDefaultFont = "sans-serif" | "monospace" | "serif"
export type SoneFont = SoneDefaultFont