import { getSvgPath } from "figma-squircle";
import type { SoneRenderer } from "./renderer.ts";

export function getBoundingBoxRectRotation(
  width: number,
  height: number,
  angle: number,
) {
  const angleInRadians = (angle * Math.PI) / 180;
  const cos = Math.abs(Math.cos(angleInRadians));
  const sin = Math.abs(Math.sin(angleInRadians));
  const newWidth = width * cos + height * sin;
  const newHeight = width * sin + height * cos;
  return [newWidth, newHeight];
}

export function parseRadius(radius: number[], maxRadius: number) {
  for (let i = 0; i < radius.length; i++) {
    radius[i] = Math.max(0, Math.min(radius[i], maxRadius / 2));
  }
  return radius;
}

export function createSmoothRoundRect(
  renderer: SoneRenderer,
  width: number,
  height: number,
  radius: number[],
  cornerSmoothing = 0,
  shape: "cut" | "round" = "round",
) {
  let cs = cornerSmoothing;
  if (cs > 1) cs = 1;
  if (cs < 0) cs = 0;

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
    corners.topRightCornerRadius = radius[1] ?? 0;
    corners.bottomRightCornerRadius = radius[2] ?? 0;
    corners.bottomLeftCornerRadius = radius[3] ?? 0;
  }

  if (shape === "round") {
    const svgPath = getSvgPath({
      cornerSmoothing: cs,
      width,
      height,
      preserveSmoothing: true,
      ...corners,
    });

    return new renderer.Path2D(svgPath);
  }

  const path = new renderer.Path2D();

  path.moveTo(corners.topLeftCornerRadius, 0);

  path.lineTo(width - corners.topRightCornerRadius, 0);
  path.lineTo(width, corners.topRightCornerRadius);

  path.lineTo(width, height - corners.bottomRightCornerRadius);
  path.lineTo(width - corners.bottomRightCornerRadius, height);

  path.lineTo(corners.bottomLeftCornerRadius, height);
  path.lineTo(0, height - corners.bottomLeftCornerRadius);

  path.lineTo(0, corners.topLeftCornerRadius);
  path.closePath();

  return path;
}
