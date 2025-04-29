import { createCanvas } from "canvas";
import Yoga, { Direction, Gutter } from "yoga-layout";
import {
  createId,
  DrawSymbol,
  parseAlign,
  parseJustify,
  parsePositionType,
  renderPattern,
} from "./utils.js";
import { createGradientFillStyleList, isColor } from "./gradient.js";

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
      ...(props.style || {}),
    },
    backgroundColor(color) {
      if (isColor(color)) {
        this.style.backgroundColor = color;
        return this;
      }
      this.style.backgroundGradient = color;
      return this;
    },
    bg(color) {
      if (isColor(color)) {
        this.style.backgroundColor = color;
        return this;
      }
      this.style.backgroundGradient = color;
      return this;
    },
    cornerRadius(...values) {
      this.style.cornerRadius = values;
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

      // drawing
      if (style.backgroundColor) {
        ctx.fillStyle = style.backgroundColor;
        ctx.beginPath();
        ctx.roundRect(
          x,
          y,
          component.node.getComputedWidth(),
          component.node.getComputedHeight(),
          createRadiusValue(),
        );
        ctx.fill();
      }

      if (style.backgroundGradient) {
        const values = createGradientFillStyleList(
          ctx,
          style.backgroundGradient,
          x,
          y,
          component.node.getComputedWidth(),
          component.node.getComputedHeight(),
        );

        for (const fillStyle of values) {
          ctx.fillStyle = fillStyle;
          ctx.beginPath();
          ctx.roundRect(
            x,
            y,
            component.node.getComputedWidth(),
            component.node.getComputedHeight(),
            createRadiusValue(),
          );
          ctx.fill();
        }
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
      renderToCanvas(ctx, root, 0, 0);
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
  const canvas = createCanvas(
    root.node.getComputedWidth(),
    root.node.getComputedHeight(),
  );

  const ctx = canvas.getContext("2d");
  renderPattern(ctx, canvas.width, canvas.height, 15);
  root.render(ctx);
  root.free();

  return canvas.toBuffer("image/jpeg", { quality: 0.98 });
}

/**
 * @param {Function} component
 * @returns {Buffer}
 */
export function renderAsPdfBuffer(component) {
  const root = createRoot(component);
  const canvas = createCanvas(
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
