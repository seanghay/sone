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