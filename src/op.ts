import { Edge, type Node } from "yoga-layout/load";
import type { LayoutProps } from "./core.ts";
import { type Painter, withSave } from "./skia/painter.ts";
import type { SonePath } from "./skia/path.ts";

export function drawBorder(
  p: Painter,
  layout: Node,
  props: LayoutProps,
  roundedRectPath: SonePath,
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
    withSave(p, () => {
      p.canvas.translate(x, y);
      // Inner-stroke trick: stroke at double width, then clip away the outer
      // half. The clip must be antialiased or the border edge turns hard.
      p.canvas.clipPath(roundedRectPath.path, p.ck.ClipOp.Intersect, true);
      p.canvas.drawPath(
        roundedRectPath.path,
        p.arena.stroke(color, left * 2, { join: "round" }),
      );
    });
    return;
  }

  // Per-side: draw each edge as a line
  const line = (
    width: number,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
  ) => {
    p.canvas.drawLine(
      x0,
      y0,
      x1,
      y1,
      p.arena.stroke(color, width, { cap: "square" }),
    );
  };

  if (top > 0) line(top, x, y + top / 2, x + w, y + top / 2);
  if (bottom > 0)
    line(bottom, x, y + h - bottom / 2, x + w, y + h - bottom / 2);
  if (left > 0) line(left, x + left / 2, y, x + left / 2, y + h);
  if (right > 0) line(right, x + w - right / 2, y, x + w - right / 2, y + h);
}
