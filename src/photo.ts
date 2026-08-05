import { type Node } from "yoga-layout/load";
import type { PhotoNode } from "./core.ts";
import { drawBorder } from "./op.ts";
import { createSmoothRoundRect, parseRadius } from "./rect.ts";
import type { SoneRenderer } from "./renderer.ts";
import { type Painter, withSave } from "./skia/painter.ts";

export function drawPhoto(
  renderer: SoneRenderer,
  p: Painter,
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

  const sourceWidth = image.width;
  const sourceHeight = image.height;
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
        destWidth = newWidth;
        destHeight = containerHeight;
        destX = x + (containerWidth - newWidth) * alignment;
      } else {
        const newHeight = (image.height * containerWidth) / image.width;
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

  // create clip path — custom SVG path or default rounded rect
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

  const clipShape =
    props.clipPath != null
      ? p.arena.own(new renderer.Path2D(props.clipPath))
      : roundedRectPath;

  withSave(p, () => {
    p.canvas.translate(x, y);
    p.canvas.clipPath(clipShape.path, p.ck.ClipOp.Intersect, true);
    p.canvas.translate(-x, -y);

    // render layout props
    if (props.background) {
      for (const bg of props.background) {
        if (typeof bg === "string") {
          p.canvas.drawRect(
            p.ck.XYWHRect(x, y, containerWidth, containerHeight),
            p.arena.fill(bg),
          );
        }
      }
    }

    const flipHorizontal = props.flipHorizontal ?? false;
    const flipVertical = props.flipVertical ?? false;

    if (flipHorizontal || flipVertical) {
      const centerX = destX + destWidth / 2;
      const centerY = destY + destHeight / 2;
      p.canvas.translate(centerX, centerY);
      p.canvas.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
      p.canvas.translate(-centerX, -centerY);
    }

    p.canvas.drawImageRect(
      image.image,
      p.ck.XYWHRect(0, 0, sourceWidth, sourceHeight),
      p.ck.XYWHRect(destX, destY, destWidth, destHeight),
      p.arena.fill("black"),
    );
  });

  // border
  if (
    props.borderWidth != null ||
    props.borderTopWidth != null ||
    props.borderLeftWidth != null ||
    props.borderRightWidth != null ||
    props.borderBottomWidth != null
  ) {
    drawBorder(p, layout, props, roundedRectPath, x, y);
  }
}
