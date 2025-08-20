import { Edge, type Node } from "yoga-layout/load";
import type { LayoutProps } from "./core.ts";

export function drawBorder(
  ctx: CanvasRenderingContext2D,
  layout: Node,
  props: LayoutProps,
  roundedRectPath: Path2D,
  x: number,
  y: number,
) {
  const left = layout.getComputedBorder(Edge.Left);
  const top = layout.getComputedBorder(Edge.Top);
  const right = layout.getComputedBorder(Edge.Right);
  const bottom = layout.getComputedBorder(Edge.Bottom);

  if (left === top && top === right && right === bottom) {
    if (left > 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = props.borderColor!;
      ctx.lineJoin = "round";
      ctx.lineWidth = left * 2;
      ctx.clip(roundedRectPath);
      ctx.stroke(roundedRectPath);
      ctx.translate(-x, -y);
      ctx.restore();
    }
  }

  // FIXME: handle each border individually
}
