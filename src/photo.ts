import { type Node } from "yoga-layout";
import type { PhotoNode } from "./core.ts";
import { drawBorder } from "./op.ts";
import { createSmoothRoundRect, parseRadius } from "./rect.ts";
import type { SoneRenderer } from "./renderer.ts";

export function drawPhoto(
  renderer: SoneRenderer,
  ctx: CanvasRenderingContext2D,
  node: PhotoNode,
  layout: Node,
  x: number,
  y: number,
) {
  const props = node.props;
  if (props.image == null) return;
  const image = props.image;

  const containerWidth = layout.getComputedWidth();
  const containerHeight = layout.getComputedHeight();
  const scaleType = node.props.scaleType ?? "fill";

  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let destX = x;
  let destY = y;
  let destWidth = containerWidth;
  let destHeight = containerHeight;

  const imageRatio = image.width / image.height;
  const containerRatio = containerWidth / containerHeight;

  const alignment = props.scaleAlignment ?? 1 / 2;

  switch (scaleType) {
    case "cover":
      if (imageRatio > containerRatio) {
        // Image is wider than container (relatively)
        const newWidth = (image.width * containerHeight) / image.height;
        sourceWidth = image.width;
        sourceHeight = image.height;
        destWidth = newWidth;
        destHeight = containerHeight;
        destX = x + (containerWidth - newWidth) * alignment;
      } else {
        const newHeight = (image.height * containerWidth) / image.width;
        sourceWidth = image.width;
        sourceHeight = image.height;
        destWidth = containerWidth;
        destHeight = newHeight;
        destY = y + (containerHeight - newHeight) * alignment;
      }
      break;
    case "contain":
      if (imageRatio > containerRatio) {
        destWidth = containerWidth;
        destHeight = containerWidth / imageRatio;
        destY = y + (containerHeight - destHeight) * alignment;
      } else {
        destHeight = containerHeight;
        destWidth = containerHeight * imageRatio;
        destX = x + (containerWidth - destWidth) * alignment;
      }
      break;
  }

  ctx.save();

  // create rounded path
  const roundedRectPath = createSmoothRoundRect(
    renderer,
    containerWidth,
    containerHeight,
    parseRadius(
      props.cornerRadius ?? [0],
      Math.min(containerWidth, containerHeight),
    ),
    props.cornerSmoothing,
  );

  ctx.translate(x, y);
  ctx.clip(roundedRectPath);
  ctx.translate(-x, -y);

  // render layout props
  if (props.background) {
    for (const bg of props.background) {
      if (typeof bg === "string") {
        ctx.fillStyle = bg;
        ctx.fillRect(x, y, containerWidth, containerHeight);
      }
    }
  }

  const flipHorizontal = props.flipHorizontal ?? false;
  const flipVertical = props.flipVertical ?? false;

  if (flipHorizontal || flipVertical) {
    const centerX = destX + destWidth / 2;
    const centerY = destY + destHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
    ctx.translate(-centerX, -centerY);
  }

  ctx.drawImage(
    image,
    0,
    0,
    sourceWidth,
    sourceHeight,
    destX,
    destY,
    destWidth,
    destHeight,
  );

  ctx.restore();

  // border
  if (
    props.borderWidth != null ||
    props.borderTopWidth != null ||
    props.borderLeftWidth != null ||
    props.borderRightWidth != null ||
    props.borderBottomWidth != null
  ) {
    drawBorder(ctx, layout, props, roundedRectPath, x, y);
  }
}
