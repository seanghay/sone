import Yoga from "yoga-layout";
import { createNode } from "./core.js";
import { DrawSymbol } from "./utils.js";
import { smoothRoundRect } from "./corner.js";

/**
 * @param {import("skia-canvas").Image} src
 */
export function Photo(src) {
  const node = Yoga.Node.create();

  node.setWidth(src.width);
  node.setHeight(src.height);

  const result = createNode(
    {
      type: Photo,
      style: {
        scaleType: "fill",
      },
      src,
      /**
       * @param {"cover"|"fill"|"contain"} scaleType
       */
      scaleType(scaleType) {
        this.style.scaleType = scaleType;
        return this;
      },
      [DrawSymbol]: ({ ctx, component, x, y }) => {
        const createRadiusValue = () => {
          let radius = component.style.cornerRadius;

          if (radius == null) {
            radius = 0;
          }

          if (typeof radius === "number") {
            radius = [radius];
          }

          const maxRadius = Math.min(
            component.node.getComputedWidth(),
            component.node.getComputedHeight(),
          );

          for (let i = 0; i < radius.length; i++) {
            radius[i] = Math.max(0, Math.min(radius[i], maxRadius / 2));
          }
          return radius;
        };

        const scaleType = component.style.scaleType || "fill";
        const containerWidth = component.node.getComputedWidth();
        const containerHeight = component.node.getComputedHeight();
        const image = component.src;
        ctx.save();

        smoothRoundRect(
          ctx,
          x,
          y,
          containerWidth,
          containerHeight,
          createRadiusValue(),
          component.style.cornerSmoothing,
          "clip",
        );

        let sourceWidth = image.width;
        let sourceHeight = image.height;
        let destX = x;
        let destY = y;
        let destWidth = containerWidth;
        let destHeight = containerHeight;

        const imageRatio = image.width / image.height;
        const containerRatio = containerWidth / containerHeight;

        switch (scaleType) {
          case "cover":
            if (imageRatio > containerRatio) {
              // Image is wider than container (relatively)
              const newWidth = (image.width * containerHeight) / image.height;
              sourceWidth = image.width;
              sourceHeight = image.height;
              destWidth = newWidth;
              destHeight = containerHeight;
              destX = x + (containerWidth - newWidth) / 2;
            } else {
              const newHeight = (image.height * containerWidth) / image.width;
              sourceWidth = image.width;
              sourceHeight = image.height;
              destWidth = containerWidth;
              destHeight = newHeight;
              destY = y + (containerHeight - newHeight) / 2;
            }
            break;
          case "contain":
            if (imageRatio > containerRatio) {
              destWidth = containerWidth;
              destHeight = containerWidth / imageRatio;
              destY = y + (containerHeight - destHeight) / 2;
            } else {
              destHeight = containerHeight;
              destWidth = containerHeight * imageRatio;
              destX = x + (containerWidth - destWidth) / 2;
            }
            break;
        }

        ctx.drawImage(
          component.src,
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
      },
    },
    node,
  );

  return result;
}
