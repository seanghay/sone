import { createCanvas } from "canvas";
import Yoga, { Direction, FlexDirection, Gutter } from "yoga-layout";
import { splitLines, stringifyFont, textMeasureFunc } from "./text.js";
import {
  parseAlign,
  parseFlexDirection,
  parseJustify,
  parsePositionType,
  renderPattern,
} from "./utils.js";

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
        node.setFlexDirection(parseFlexDirection(value));
        return this;
      },
    },
    node,
  );
}

/**
 * @param  {...string} children this can be string or Span object
 * @returns
 */
export function Text(...children) {
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

  /**
   * @type {import("./types.js").SoneSpanNode[]}
   */
  const spans = children.map((child) => {
    if (typeof child !== "object") {
      return {
        type: Span,
        text: child,
        style,
      };
    }

    return {
      ...child,
      style,
      spanStyle: child.style,
    };
  });

  node.setMeasureFunc((width, widthMode, height, heightMode) =>
    textMeasureFunc(spans, style, width),
  );

  return {
    node,
    type: Text,
    spans,
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

/**
 * Span
 * @param {string} text
 */
export function Span(text) {
  /**
   * @type {Partial<import("./types.js").SoneSpanOptions>}
   */
  const style = {};

  return {
    text,
    style,
    type: Span,
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
  };
}

export function Photo(src) {
  const node = Yoga.Node.create();

  return createNode(
    {
      type: Photo,
      style: {},
      src,
    },
    node,
  );
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
  // drawing
  if (component.style.backgroundColor) {
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

  if (component.type === Photo) {
    ctx.drawImage(
      component.src,
      x,
      y,
      component.node.getComputedWidth(),
      component.node.getComputedHeight(),
    );
  }

  // text
  if (component.type === Text) {
    /**
     * @type {import("./types.js").SoneTextOptions}
     */
    const style = component.style;
    const indentSize = style.indentSize || 0.0;
    const lineHeight = style.lineHeight || 1.0;
    const width = component.node.getComputedWidth();

    ctx.save();
    ctx.textBaseline = "top";

    /**
     * @type {import("./types.js").SoneSpanNode[]}
     */
    const spans = component.spans;
    const { lines, maxHeight, forceBreaks } = splitLines({
      spans,
      indentSize,
      lineHeight,
      maxWidth: width,
    });

    const offsetX = x;
    let offsetY = y;
    let lineNumber = -1;

    for (const spanNodes of lines) {
      lineNumber++;

      let lineWidth = 0;
      let lineOffsetX = 0;
      let totalSpacesCount = 0;
      let totalSpaceWidth = 0;
      let spaceWidth = 0;
      let textAlign = style.align;

      const hasForceBreak = forceBreaks.indexOf(lineNumber) !== -1;

      // always left for last line when text align is justify
      if (
        (textAlign === "justify" && lineNumber === lines.length - 1) ||
        hasForceBreak
      ) {
        textAlign = "left";
      }

      for (const node of spanNodes) {
        lineWidth += node.width;

        if (textAlign === "justify") {
          if (/\s+/.test(node.text)) {
            totalSpacesCount++;
            totalSpaceWidth += node.width;
          }
        }
      }

      const indentable =
        lineNumber === 0 ||
        (lineNumber > 0 && forceBreaks.indexOf(lineNumber - 1) !== -1);

      if (textAlign === "justify") {
        let fullWidth = width;
        
        if (indentable) {
          fullWidth -= indentSize;
        }

        spaceWidth =
          (fullWidth - lineWidth + totalSpaceWidth) / totalSpacesCount;
      }

      if (textAlign === "left" || textAlign === "justify") {
        if (indentable) {
          lineOffsetX += indentSize;
        }
      }

      if (textAlign === "right") {
        lineOffsetX = width - lineWidth;
        if (indentable) {
          lineOffsetX -= indentSize;
        }
      }

      if (textAlign === "center") {
        lineOffsetX = (width - lineWidth) / 2;
      }

      for (const node of spanNodes) {
        let style = node.spanStyle || {};
        style = { ...node.style, ...style };

        if (textAlign === "justify") {
          if (/\s+/.test(node.text)) {
            lineOffsetX += spaceWidth;
            continue;
          }
        }

        ctx.fillStyle = style.color;
        ctx.font = stringifyFont(style);
        ctx.fillText(node.text, offsetX + lineOffsetX, offsetY);

        lineOffsetX += node.width;
      }

      offsetY += maxHeight * style.lineHeight;
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
