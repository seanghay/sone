import { createCanvas } from "canvas";
import Yoga, { Direction, FlexDirection, Gutter } from "yoga-layout";
import { renderPattern } from "./utils.js";
import {
  measureText,
  splitLines,
  stringifyFont,
  textMeasureFunc,
} from "./text.js";

function createIdGenerator() {
  let id = -1;
  return () => {
    id++;
    return id;
  };
}

export const createId = createIdGenerator();

/**
 * @param {{children: any[], type: Function, style: Record<string, any>}} props
 */
function createNode(props, node = Yoga.Node.createDefault()) {
  return {
    id: createId(),
    ...props,
    node,
    style: {
      ...(props.style || {}),
    },
    borderRadius(...values) {
      this.style.borderRadius = values;
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
    position(type) {
      node.setPositionType(type);
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
    alignContent(value) {
      node.setAlignContent(value);
      return this;
    },
    alignItems(value) {
      node.setAlignItems(value);
      return this;
    },
    alignSelf(value) {
      node.setAlignSelf(value);
      return this;
    },
    justifyContent(value) {
      node.setJustifyContent(value);
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
  };
}

export function Row(...children) {
  const node = Yoga.Node.create();
  node.setFlexDirection(FlexDirection.Row);

  for (const item of children) {
    node.insertChild(item.node, node.getChildCount());
  }

  return createNode(
    {
      type: Row,
      children,
    },
    node,
  );
}

export function Column(...children) {
  const node = Yoga.Node.create();
  node.setFlexDirection(FlexDirection.Column);

  for (const item of children) {
    node.insertChild(item.node, node.getChildCount());
  }

  return createNode(
    {
      type: Column,
      children,
    },
    node,
  );
}

export function Box(...children) {
  const node = Yoga.Node.create();

  for (const item of children) {
    node.insertChild(item.node, node.getChildCount());
  }

  return createNode(
    {
      type: Box,
      children,
      style: {
        backgroundColor: null,
      },
      backgroundColor(color) {
        this.style.backgroundColor = color;
        return this;
      },
      bg(color) {
        this.style.backgroundColor = color;
        return this;
      },
      direction(value) {
        node.setFlexDirection(value);
        return this;
      },
    },
    node,
  );
}

/**
 * @param {string} text
 */
export function Text(text) {
  const node = Yoga.Node.create();

  /**
   * @type {import("./types.js").SoneTextOptions}
   */
  const style = {
    size: 12,
    font: "sans-serif",
    color: "black",
    weight: 400,
    lineHeight: 1,
    indentSize: 0,
    align: "left",
  };

  node.setMeasureFunc((width, widthMode, height, heightMode) =>
    textMeasureFunc(text, style, width),
  );

  return {
    node,
    type: Text,
    text,
    style,
    size(value) {
      this.style.size = value;
      return this;
    },
    font(...values) {
      this.style.font = values.join(", ");
      return this;
    },
    color(value) {
      this.style.color = value;
      return this;
    },
    weight(value) {
      this.style.weight = value;
      return this;
    },
    lineHeight(value) {
      this.style.lineHeight = value;
      return this;
    },
    indentSize(value) {
      this.style.indentSize = value;
      return this;
    },
    /**
     * @param {import("./types.js").SoneTextOptions['align']} value
     * @returns
     */
    align(value) {
      this.style.align = value;
      return this;
    },
  };
}

export function Paragraph(...children) {
  return {
    type: Paragraph,
    children,
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
  // drawing
  if (component.style.backgroundColor) {
    let radius = component.style.borderRadius;

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

    ctx.fillStyle = component.style.backgroundColor;
    ctx.beginPath();
    ctx.roundRect(
      x,
      y,
      component.node.getComputedWidth(),
      component.node.getComputedHeight(),
      radius,
    );

    ctx.fill();
  }

  // text
  if (component.type === Text) {
    /**
     * @type {import("./types.js").SoneTextOptions}
     */
    const style = component.style;

    ctx.save();
    ctx.textBaseline = "top";

    const lineHeight = style.lineHeight || 1.0;
    const font = stringifyFont(style);

    ctx.font = font;
    ctx.fillStyle = style.color;

    const width = component.node.getComputedWidth();

    const lines = splitLines({
      font,
      lineHeight,
      text: component.text,
      maxWidth: width,
      indentSize: style.indentSize,
    });

    let offsetY = y;
    let i = 0;

    for (const line of lines) {
      let indentWidth = 0;

      if (i === 0) {
        // indent width doesnt work with text align center
        if (style.align !== "center") {
          indentWidth = style.indentSize;
        }
      }

      i++;

      let offsetX = x + indentWidth;

      const isLastLine = i === lines.length;
      const segment = line.join("").trim();
      const m = measureText({ text: segment, font, lineHeight });

      if (style.align === "justify") {
        if (isLastLine) {
          ctx.fillText(segment, offsetX, offsetY);
          continue;
        }

        const items = line.join("").trim().split(" ");
        let lineWidth = 0;
        const totalSpaceCount = items.length - 1;

        // draw
        if (totalSpaceCount === 0) {
          ctx.fillText(segment, offsetX, offsetY);
          continue;
        }

        const queue = [];
        for (const item of items) {
          const c = measureText({ text: item, font, lineHeight });
          lineWidth += c.width;
          queue.push([item, c.width]);
        }

        const spaceWidth = (width - lineWidth - indentWidth) / totalSpaceCount;

        for (const [text, w] of queue) {
          ctx.fillText(text, offsetX, offsetY);
          offsetX += w + spaceWidth;
        }

        offsetY += m.height;
        continue;
      }

      if (style.align === "right") {
        offsetX += width - m.width - indentWidth * 2;
      }

      if (style.align === "center") {
        offsetX += (width - m.width) / 2;
      }

      ctx.fillText(segment, offsetX, offsetY);
      offsetY += m.height;
    }

    ctx.restore();
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
