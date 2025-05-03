import { DOMParser } from "@xmldom/xmldom";
import { Canvg, Document, Parser, presets } from "canvg";
import Yoga from "yoga-layout";
import { createNode } from "./core.js";
import { DrawSymbol, SoneConfig } from "./utils.js";
import { smoothRoundRect } from "./corner.js";

const preset = presets.node({
  DOMParser,
  canvas: {
    createCanvas: SoneConfig.createCanvas,
    loadImage: SoneConfig.loadImage,
  },
  fetch,
});

/**
 * @param {string} src
 */
export function loadSvg(src) {
  const parser = new Parser(preset);
  const root = parser.parseFromString(src);
  let documentElement = null;

  return {
    root,
    width: () => {
      if (documentElement == null) {
        documentElement = new Document(
          {
            screen: {
              wait: () => {},
            },
          },
          preset,
        ).createDocumentElement(root);
      }

      return documentElement.getStyle("width").getPixels("x");
    },
    height: () => {
      if (documentElement == null) {
        documentElement = new Document(
          {
            screen: {
              wait: () => {},
            },
          },
          preset,
        ).createDocumentElement(root);
      }
      return documentElement.getStyle("height").getPixels("x");
    },
    canvg(ctx) {
      return new Canvg(ctx, root, preset);
    },
  };
}

/**
 * Draw SVG into a canvas with position and size
 *
 * @param {CanvasRenderingContext2D}
 * @param {string} svgString
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
export function drawSvg(ctx, svg, x, y, width, height) {
  const v = svg.canvg(ctx);
  const srcWidth = v.documentElement.getStyle("width").getPixels("x");
  const srcHeight = v.documentElement.getStyle("height").getPixels("x");

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(width / srcWidth, height / srcHeight);
  v.start({
    ignoreDimensions: true,
    enableRedraw: true,
    ignoreAnimation: true,
    ignoreMouse: true,
    ignoreClear: true,
  });
  v.stop();
  ctx.restore();
}

export function Svg(src) {
  const node = Yoga.Node.create();

  node.setWidth(src.width());
  node.setHeight(src.height());

  return createNode(
    {
      type: Svg,
      style: {},
      src,
      children: [],
      /**
       * @param {"cover"|"fill"|"contain"} scaleType
       */
      scaleType(scaleType) {
        this.style.scaleType = scaleType;
        return this;
      },
      /**
       * @param {import("./types.js").SoneDrawingContext} param0
       */
      [DrawSymbol]: ({ component, ctx, x, y }) => {
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

        // drawing
        ctx.save();

        const width = component.node.getComputedWidth();
        const height = component.node.getComputedHeight();

        smoothRoundRect(
          ctx,
          x,
          y,
          width,
          height,
          createRadiusValue(),
          component.style.cornerSmoothing,
          "clip",
        );

        const containerWidth = width;
        const containerHeight = height;

        const image = {
          width: component.src.width(),
          height: component.src.height(),
        };

        let sourceWidth = image.width;
        let sourceHeight = image.height;
        let destX = x;
        let destY = y;
        let destWidth = containerWidth;
        let destHeight = containerHeight;

        const imageRatio = image.width / image.height;
        const containerRatio = containerWidth / containerHeight;
        const scaleType = component.style.scaleType || "fill";

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

        drawSvg(ctx, src, destX, destY, destWidth, destHeight);
        ctx.restore();
      },
    },
    node,
  );
}
