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

  if (left === 0 && top === 0 && right === 0 && bottom === 0) return;

  const color = props.borderColor ?? "#000000";
  const w = layout.getComputedWidth();
  const h = layout.getComputedHeight();

  // All sides equal — use rounded rect stroke (supports corner radius)
  if (left === top && top === right && right === bottom) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.lineJoin = "round";
    ctx.lineWidth = left * 2;
    ctx.clip(roundedRectPath);
    ctx.stroke(roundedRectPath);
    ctx.translate(-x, -y);
    ctx.restore();
    return;
  }

  // Per-side: draw each edge as a line
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "square";

  if (top > 0) {
    ctx.lineWidth = top;
    ctx.beginPath();
    ctx.moveTo(x, y + top / 2);
    ctx.lineTo(x + w, y + top / 2);
    ctx.stroke();
  }

  if (bottom > 0) {
    ctx.lineWidth = bottom;
    ctx.beginPath();
    ctx.moveTo(x, y + h - bottom / 2);
    ctx.lineTo(x + w, y + h - bottom / 2);
    ctx.stroke();
  }

  if (left > 0) {
    ctx.lineWidth = left;
    ctx.beginPath();
    ctx.moveTo(x + left / 2, y);
    ctx.lineTo(x + left / 2, y + h);
    ctx.stroke();
  }

  if (right > 0) {
    ctx.lineWidth = right;
    ctx.beginPath();
    ctx.moveTo(x + w - right / 2, y);
    ctx.lineTo(x + w - right / 2, y + h);
    ctx.stroke();
  }

  ctx.restore();
}
