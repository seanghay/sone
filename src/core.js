import boxshadowparser from "css-box-shadow";
import Yoga, { Direction, Edge, Gutter } from "yoga-layout";
import { smoothRoundRect } from "./corner.js";
import { createGradientFillStyleList, isColor } from "./gradient.js";
import {
  DrawSymbol,
  SoneConfig,
  createId,
  isImage,
  parseAlign,
  parseJustify,
  parsePositionType,
} from "./utils.js";

/**
 * Create a common layout node
 * @template {Record<string, any>} T
 * @param {T & {children?: any[], type?: Function, style?: Record<string, any>}} props
 */
export function createNode(props, node = Yoga.Node.createDefault()) {
  return {
    id: createId(),
    ...props,
    node,
    style: {
      backgroundColor: null,
      backgroundGradient: null,
      backgroudImage: null,
      backgroudImageScaleType: null,
      cornerSmoothing: 0,
      rotationInDegrees: 0,
      scale: null,
      filters: [],
      ...(props.style || {}),
    },
    /**
     * @param {number} value
     */
    rotate(value) {
      this.style.rotationInDegrees = value;
      return this;
    },
    /**
     * @param {number} value
     */
    scale(...values) {
      this.style.scale = values;
      return this;
    },
    /**
     * @param {string|HTMLImageElement} value
     * @param {"cover"|"fill"|"contain"} scaleType
     * @returns
     */
    bg(value, scaleType) {
      if (isImage(value)) {
        this.style.backgroudImage = value;
        this.style.backgroudImageScaleType = scaleType;
        return this;
      }

      if (isColor(value)) {
        this.style.backgroundColor = value;
        return this;
      }
      this.style.backgroundGradient = value;
      return this;
    },
    opacity(value) {
      this.style.opacity = value;
      return this;
    },
    cornerRadius(...values) {
      this.style.cornerRadius = values;
      return this;
    },
    cornerSmoothing(value) {
      this.style.cornerSmoothing = value;
      return this;
    },
    /**
     * @param {number} w
     * @param {number} h
     */
    size(w, h) {
      let _h = h;
      if (_h == null) {
        _h = w;
      }
      node.setWidth(w);
      node.setHeight(_h);
      return this;
    },
    /**
     * @param {import("./types.js").LayoutPositionType} type
     */
    position(type) {
      node.setPositionType(parsePositionType(type));
      return this;
    },
    top(value) {
      node.setPosition(Edge.Top, value);
      return this;
    },
    left(value) {
      node.setPosition(Edge.Left, value);
      return this;
    },
    right(value) {
      node.setPosition(Edge.Right, value);
      return this;
    },
    bottom(value) {
      node.setPosition(Edge.Bottom, value);
      return this;
    },

    /**
     * @param {number} value
     */
    width(value) {
      node.setWidth(value);
      return this;
    },
    /**
     * @param {number} value
     */
    height(value) {
      node.setHeight(value);
      return this;
    },
    minWidth(value) {
      node.setMinWidth(value);
      return this;
    },
    minHeight(value) {
      node.setMinHeight(value);
      return this;
    },
    maxWidth(value) {
      node.setMaxWidth(value);
      return this;
    },
    maxHeight(value) {
      node.setMaxHeight(value);
      return this;
    },
    paddingTop(value) {
      node.setPadding(Yoga.EDGE_TOP, value);
      return this;
    },
    paddingRight(value) {
      node.setPadding(Yoga.EDGE_RIGHT, value);
      return this;
    },
    paddingLeft(value) {
      node.setPadding(Yoga.EDGE_LEFT, value);
      return this;
    },
    paddingBottom(value) {
      node.setPadding(Yoga.EDGE_BOTTOM, value);
      return this;
    },
    padding(...args) {
      const [top, right, bottom, left] = args;

      if (args.length === 1) {
        if (top != null) node.setPadding(Yoga.EDGE_ALL, top);
        return this;
      }

      if (args.length === 2) {
        if (top != null) {
          node.setPadding(Yoga.EDGE_TOP, top);
          node.setPadding(Yoga.EDGE_BOTTOM, top);
        }

        if (right != null) {
          node.setPadding(Yoga.EDGE_RIGHT, right);
          node.setPadding(Yoga.EDGE_LEFT, right);
        }
        return this;
      }

      if (top != null) node.setPadding(Yoga.EDGE_TOP, top);
      if (right != null) node.setPadding(Yoga.EDGE_RIGHT, right);
      if (bottom != null) node.setPadding(Yoga.EDGE_BOTTOM, bottom);
      if (left != null) node.setPadding(Yoga.EDGE_LEFT, left);

      return this;
    },
    marginTop(value) {
      node.setMargin(Yoga.EDGE_TOP, value);
      return this;
    },
    marginRight(value) {
      node.setMargin(Yoga.EDGE_RIGHT, value);
      return this;
    },
    marginLeft(value) {
      node.setMargin(Yoga.EDGE_LEFT, value);
      return this;
    },
    marginBottom(value) {
      node.setMargin(Yoga.EDGE_BOTTOM, value);
      return this;
    },
    margin(...args) {
      const [top, right, bottom, left] = args;

      if (args.length === 1) {
        if (top != null) node.setMargin(Yoga.EDGE_ALL, top);
        return this;
      }

      if (args.length === 2) {
        if (top != null) {
          node.setMargin(Yoga.EDGE_TOP, top);
          node.setMargin(Yoga.EDGE_BOTTOM, top);
        }

        if (right != null) {
          node.setMargin(Yoga.EDGE_RIGHT, right);
          node.setMargin(Yoga.EDGE_LEFT, right);
        }
        return this;
      }

      if (top != null) node.setMargin(Yoga.EDGE_TOP, top);
      if (right != null) node.setMargin(Yoga.EDGE_RIGHT, right);
      if (bottom != null) node.setMargin(Yoga.EDGE_BOTTOM, bottom);
      if (left != null) node.setMargin(Yoga.EDGE_LEFT, left);

      return this;
    },
    gap(value) {
      node.setGap(Gutter.All, value);
      return this;
    },
    /**
     * @param {import("./types.js").FlexAlign} value
     */
    alignContent(value) {
      node.setAlignContent(parseAlign(value));
      return this;
    },
    /**
     * @param {import("./types.js").FlexAlign} value
     */
    alignItems(value) {
      node.setAlignItems(parseAlign(value));
      return this;
    },
    /**
     * @param {import("./types.js").FlexAlign} value
     */

    alignSelf(value) {
      node.setAlignSelf(parseAlign(value));
      return this;
    },
    /**
     * @param {import("./types.js").FlexJustify} value
     */
    justifyContent(value) {
      node.setJustifyContent(parseJustify(value));
      return this;
    },
    wrap() {
      node.setFlexWrap(Yoga.WRAP_WRAP);
      return this;
    },
    wrapReverse() {
      node.setFlexWrap(Yoga.WRAP_WRAP_REVERSE);
      return this;
    },
    aspectRatio(value) {
      node.setAspectRatio(value);
      return this;
    },
    basis(value) {
      node.setFlexBasis(value);
      return this;
    },
    grow(value) {
      node.setFlexGrow(value);
      return this;
    },
    shrink(value) {
      node.setFlexShrink(value);
      return this;
    },
    strokeWidth(value) {
      this.style.strokeWidth = value;
      return this;
    },
    strokeColor(value) {
      this.style.strokeColor = value;
      return this;
    },
    lineDash(...values) {
      this.style.lineDash = values;
      return this;
    },
    shadow(...values) {
      const value = values.join(",");
      this.style.shadow = boxshadowparser.parse(value);
      return this;
    },
    // filters
    blur(value) {
      this.style.filters.push(`blur(${value}px)`);
      return this;
    },
    brightness(value) {
      this.style.filters.push(`brightness(${value})`);
      return this;
    },
    contrast(value) {
      this.style.filters.push(`contrast(${value})`);
      return this;
    },
    grayscale(value) {
      this.style.filters.push(`grayscale(${value})`);
      return this;
    },
    huerotate(value) {
      this.style.filters.push(`hue-rotate(${value})`);
      return this;
    },
    invert(value) {
      this.style.filters.push(`invert(${value})`);
      return this;
    },
    saturate(value) {
      this.style.filters.push(`saturate(${value})`);
      return this;
    },
    sepia(value) {
      this.style.filters.push(`sepia(${value})`);
      return this;
    },

    /**
     * @param {import("./types.js").SoneDrawingContext} args
     */
    [DrawSymbol]: (args) => {
      const { ctx, component, x, y } = args;
      const style = component.style;

      const createRadiusValue = () => {
        let radius = style.cornerRadius;

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

      // apply filter
      if (Array.isArray(style.filters) && style.filters.length > 0) {
        ctx.filter = style.filters.join(" ");
      }

      if (Array.isArray(style.shadow)) {
        for (const shadowItem of style.shadow) {
          ctx.save();
          ctx.shadowColor = shadowItem.color;
          ctx.shadowOffsetY = shadowItem.offsetY;
          ctx.shadowOffsetX = shadowItem.offsetX;
          ctx.shadowBlur = shadowItem.blurRadius;

          smoothRoundRect(
            ctx,
            x,
            y,
            component.node.getComputedWidth(),
            component.node.getComputedHeight(),
            createRadiusValue(),
            style.cornerSmoothing,
            "fill",
          );

          ctx.restore();
        }
      }

      // drawing
      if (style.backgroundColor) {
        ctx.save();
        ctx.fillStyle = style.backgroundColor;
        smoothRoundRect(
          ctx,
          x,
          y,
          component.node.getComputedWidth(),
          component.node.getComputedHeight(),
          createRadiusValue(),
          style.cornerSmoothing,
          "fill",
        );
        ctx.restore();
      }

      if (style.backgroundGradient) {
        ctx.save();
        const values = createGradientFillStyleList(
          ctx,
          style.backgroundGradient,
          0,
          0,
          component.node.getComputedWidth(),
          component.node.getComputedHeight(),
        );

        for (const fillStyle of values) {
          ctx.fillStyle = fillStyle;
          smoothRoundRect(
            ctx,
            x,
            y,
            component.node.getComputedWidth(),
            component.node.getComputedHeight(),
            createRadiusValue(),
            style.cornerSmoothing,
            "fill",
          );
        }

        ctx.restore();
      }

      if (style.backgroudImage) {
        ctx.save();

        const scaleType = style.backgroudImageScaleType || "fill";
        const containerWidth = component.node.getComputedWidth();
        const containerHeight = component.node.getComputedHeight();
        const image = style.backgroudImage;

        smoothRoundRect(
          ctx,
          x,
          y,
          containerWidth,
          containerHeight,
          createRadiusValue(),
          style.cornerSmoothing,
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
      }

      if (style.strokeWidth > 0) {
        ctx.save();

        ctx.strokeStyle = style.strokeColor;
        ctx.lineWidth = style.strokeWidth;
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;

        if (Array.isArray(style.lineDash)) {
          ctx.setLineDash(style.lineDash);
        }

        smoothRoundRect(
          ctx,
          x,
          y,
          component.node.getComputedWidth(),
          component.node.getComputedHeight(),
          createRadiusValue(),
          style.cornerSmoothing,
          "stroke",
        );

        ctx.restore();
      }

      // call to props draw symbol
      if (DrawSymbol in props) {
        props[DrawSymbol](args);
      }
    },
  };
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {ReturnType<App>} component
 * @param {number} x
 * @param {number} y
 * @param {number} computedWidth
 * @param {number} computedHeight
 */
export function renderToCanvas(ctx, component, x, y, config) {
  ctx.save();

  // handle rotation
  const rotationInDegrees = component.style.rotationInDegrees;
  const scale = component.style.scale;

  const centerX = x + component.node.getComputedWidth() / 2;
  const centerY = y + component.node.getComputedHeight() / 2;

  if (typeof rotationInDegrees === "number" && rotationInDegrees !== 0) {
    ctx.translate(centerX, centerY);
    ctx.rotate((rotationInDegrees * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  if (Array.isArray(scale)) {
    let [scaleX, scaleY] = scale;
    if (scaleY == null) scaleY = scaleX;
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-centerX, -centerY);
  }

  if (component.style.opacity >= 0) {
    ctx.globalAlpha = component.style.opacity;
  }

  if (DrawSymbol in component) {
    const onDraw = component[DrawSymbol];
    onDraw({
      component,
      ctx,
      x,
      y,
      config,
    });
  }

  // draw children
  if (Array.isArray(component.children) && component.children.length > 0) {
    for (const child of component.children) {
      const childNode = child.node;
      const childX = x + childNode.getComputedLeft();
      const childY = y + childNode.getComputedTop();
      renderToCanvas(ctx, child, childX, childY, config);
    }
  }

  ctx.restore();

  if (config.debug) {
    drawBBox(ctx, x, y, component, rotationInDegrees, scale);
  }
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {() => unknown} component
 * @param {number} rotationInDegrees
 * @param {number} scale
 */
function drawBBox(ctx, x, y, component, rotationInDegrees = 0, scale = [1, 1]) {
  const w = component.node.getComputedWidth();
  const h = component.node.getComputedHeight();

  if (!Array.isArray(scale)) {
    scale = [];
  }

  let [scaleX, scaleY] = scale;

  if (scaleX == null) scaleX = 1;
  if (scaleY == null) scaleY = scaleX;

  const rotationRadians = (rotationInDegrees * Math.PI) / 180;

  let newWidth =
    Math.abs(w * Math.cos(rotationRadians)) +
    Math.abs(h * Math.sin(rotationRadians));

  newWidth *= scaleX;

  let newHeight =
    Math.abs(w * Math.sin(rotationRadians)) +
    Math.abs(h * Math.cos(rotationRadians));
  newHeight *= scaleY;

  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "magenta";
  ctx.strokeRect(
    x - (newWidth - w) / 2,
    y - (newHeight - h) / 2,
    newWidth,
    newHeight,
  );

  const fontSize = 16;
  ctx.font = `${fontSize}px sans-serif`;
  const t = component.type.name;
  const m = ctx.measureText(t);
  ctx.fillStyle = "magenta";
  const p = 4;
  ctx.fillRect(x, y, m.width, fontSize * 0.75 + p * 2);
  ctx.fillStyle = "white";
  ctx.fillText(t, x, y + fontSize * 0.75 + p / 2);

  ctx.restore();
}

/**
 * Sone builder
 * @param {() => unknown} factory
 * @param {import("./types.js").SoneContextConfig} config
 */
export function sone(
  factory,
  config = { backgroundColor: "white", debug: false },
) {
  const createSoneCanvas = () => {
    const root = factory();
    const node = Yoga.Node.create();

    node.setWidth(config.width);
    node.setHeight(config.height);
    node.insertChild(root.node, 0);

    // layout
    node.calculateLayout(undefined, undefined, Direction.LTR);

    // root size is available now
    const canvas = SoneConfig.createCanvas(
      node.getComputedWidth(),
      node.getComputedHeight(),
    );

    const ctx = canvas.getContext("2d");

    if (config.backgroundColor != null) {
      ctx.fillStyle = config.backgroundColor || "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // render to canvas context
    renderToCanvas(ctx, root, 0, 0, config);

    node.freeRecursive();
    return canvas;
  };

  return {
    canvas() {
      return createSoneCanvas();
    },
    png() {
      return createSoneCanvas().toBuffer("png");
    },
    /**
     * @param {number} quality
     */
    jpg(quality) {
      return createSoneCanvas().toBuffer("jpeg", { quality });
    },
    webp() {
      return createSoneCanvas().toBuffer("webp");
    },
    /**
     * @param {Pick<import("skia-canvas").RenderOptions, 'density' | 'matte' | "outline" | "page">} options
     */
    pdf(options) {
      return createSoneCanvas().toBuffer("pdf", options);
    },
    svg() {
      return createSoneCanvas().toBuffer("svg");
    },
    sync: {
      png() {
        return createSoneCanvas().toBufferSync("png");
      },
      /**
       * @param {number} quality
       */
      jpg(quality) {
        return createSoneCanvas().toBufferSync("jpeg", { quality });
      },
      webp() {
        return createSoneCanvas().toBufferSync("webp");
      },
      /**
       * @param {Pick<import("skia-canvas").RenderOptions, 'density' | 'matte' | "outline" | "page">} options
       */
      pdf(options) {
        return createSoneCanvas().toBufferSync("pdf", options);
      },
      svg() {
        return createSoneCanvas().toBufferSync("svg");
      },
    },
  };
}
