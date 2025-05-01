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
  renderPattern,
} from "./utils.js";

/**
 * @param {{children: any[], type: Function, style: Record<string, any>}} props
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
      ...(props.style || {}),
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
     * @param {Parameters<parsePositionType>[0]} type
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
     * @param {Parameters<parseAlign>[0]} value
     */
    alignContent(value) {
      node.setAlignContent(parseAlign(value));
      return this;
    },
    /**
     * @param {Parameters<parseAlign>[0]} value
     */
    alignItems(value) {
      node.setAlignItems(parseAlign(value));
      return this;
    },
    /**
     * @param {Parameters<parseAlign>[0]} value
     */

    alignSelf(value) {
      node.setAlignSelf(parseAlign(value));
      return this;
    },
    /**
     * @param {Parameters<parseJustify>[0]} value
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

export function Svg(src) {
  return {
    type: Svg,
    src,
  };
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {ReturnType<App>} component
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
export function renderToCanvas(ctx, component, x, y) {
  ctx.save();

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
    });
  }

  // draw children
  if (Array.isArray(component.children) && component.children.length > 0) {
    for (const child of component.children) {
      const childNode = child.node;
      const childX = x + childNode.getComputedLeft();
      const childY = y + childNode.getComputedTop();
      renderToCanvas(ctx, child, childX, childY);
    }
  }

  ctx.restore();
}

export function createRoot(root, width, height) {
  const node = Yoga.Node.create();
  node.setWidth(width);
  node.setHeight(height);

  node.insertChild(root.node, 0);
  node.calculateLayout(undefined, undefined, Direction.LTR);

  return {
    root,
    node,
    render(ctx) {
      renderToCanvas(
        ctx,
        root,
        0,
        0,
        node.getComputedWidth(),
        node.getComputedHeight(),
      );
    },
    free() {
      root.node.freeRecursive();
    },
  };
}

/**
 * @param {Function} component
 * @returns {Buffer}
 */
export function renderAsImageBuffer(component) {
  const root = createRoot(component);
  const canvas = SoneConfig.createCanvas(
    root.node.getComputedWidth(),
    root.node.getComputedHeight(),
  );

  const ctx = canvas.getContext("2d");
  renderPattern(ctx, canvas.width, canvas.height, 15);
  root.render(ctx);
  root.free();

  return canvas.toBuffer("image/jpeg", { quality: 1.0 });
}

/**
 * @param {Function} component
 * @returns {Buffer}
 */
export function renderAsPdfBuffer(component) {
  const root = createRoot(component);
  const canvas = SoneConfig.createCanvas(
    root.node.getComputedWidth(),
    root.node.getComputedHeight(),
    "pdf",
  );

  const ctx = canvas.getContext("2d");
  renderPattern(ctx, canvas.width, canvas.height, 15);

  root.render(ctx);
  root.free();

  return canvas.toBuffer("application/pdf");
}
