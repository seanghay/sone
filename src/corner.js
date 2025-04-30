import { CanvasRenderingContext2D } from "canvas";
import { getSvgPath } from "figma-squircle";
import { Path2D, applyPath2DToCanvasRenderingContext } from "path2d";

applyPath2DToCanvasRenderingContext(CanvasRenderingContext2D);

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number[]} radius
 * @param {number} cornerSmoothing
 * @param {'fill' | 'stroke' | 'clip'} op
 */
export function smoothRoundRect(
  ctx,
  x,
  y,
  width,
  height,
  radius,
  cornerSmoothing = 0,
  op = "fill",
) {
  let cs = cornerSmoothing;

  if (cs > 1) {
    cs = 1;
  }

  if (cs < 0) {
    cs = 0;
  }

  const corners = {
    topLeftCornerRadius: 0,
    topRightCornerRadius: 0,
    bottomRightCornerRadius: 0,
    bottomLeftCornerRadius: 0,
  };

  if (radius.length === 1) {
    corners.topLeftCornerRadius = radius[0];
    corners.topRightCornerRadius = radius[0];
    corners.bottomRightCornerRadius = radius[0];
    corners.bottomLeftCornerRadius = radius[0];
  }

  if (radius.length === 2) {
    corners.topLeftCornerRadius = radius[0];
    corners.bottomRightCornerRadius = radius[0];
    corners.topRightCornerRadius = radius[1];
    corners.bottomLeftCornerRadius = radius[1];
  }

  if (radius.length > 2) {
    corners.topLeftCornerRadius = radius[0];
    corners.topRightCornerRadius = radius[1];
    corners.bottomRightCornerRadius = radius[2];
    corners.bottomLeftCornerRadius = radius[3];
  }

  const svgPath = getSvgPath({
    cornerSmoothing: cs,
    width,
    height,
    preserveSmoothing: true,
    ...corners,
  });

  const p = new Path2D(svgPath);
  ctx.translate(x, y);
  ctx[op](p);
  ctx.translate(-x, -y);
}
