import Yoga, { FlexDirection, Gutter } from "yoga-layout";

function createIdGenerator() {
  let id = -1;
  return () => {
    id++;
    return id;
  };
}

const createId = createIdGenerator();

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
    /**
     * @param {number} w
     * @param {number} h
     */
    size(w, h) {
      node.setWidth(w);
      node.setHeight(h);
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
      node.setMinWidth(value);
      return this;
    },
    maxHeight(value) {
      node.setMinHeight(value);
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
    padding(top = 0, right = 0, bottom = 0, left = 0) {
      node.setPadding(Yoga.EDGE_TOP, top);
      node.setPadding(Yoga.EDGE_RIGHT, right);
      node.setPadding(Yoga.EDGE_BOTTOM, bottom);
      node.setPadding(Yoga.EDGE_LEFT, left);
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
    margin(top = 0, right = 0, bottom = 0, left = 0) {
      node.setMargin(Yoga.EDGE_TOP, top);
      node.setMargin(Yoga.EDGE_RIGHT, right);
      node.setMargin(Yoga.EDGE_BOTTOM, bottom);
      node.setMargin(Yoga.EDGE_LEFT, left);
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
  const node = Yoga.Node.createDefault();
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
  const node = Yoga.Node.createDefault();
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
  const node = Yoga.Node.createDefault();
  for (const item of children) {
    node.insertChild(item.node, node.getChildCount());
  }
  return createNode(
    {
      type: Box,
      children,
      style: {
        backgroundColor: "black",
      },
      backgroundColor(color) {
        this.style.backgroundColor = color;
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
  const node = Yoga.Node.createDefault();

  return {
    node,
    type: Text,
    text,
    style: {
      size: 14,
      font: "sans-serif",
      color: "black",
      weight: 400,
    },
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
export function renderToCanvas(ctx, component, x, y, width, height) {
  // drawing

  if (component.style.backgroundColor) {
    ctx.fillStyle = component.style.backgroundColor;
    ctx.fillRect(x, y, width, height);
  }

  // draw children
  if (Array.isArray(component.children) && component.children.length > 0) {
    for (const child of component.children) {
      const childNode = child.node;
      const childX = x + childNode.getComputedLeft();
      const childY = y + childNode.getComputedTop();
      const childWidth = childNode.getComputedWidth();
      const childHeight = childNode.getComputedHeight();
      renderToCanvas(ctx, child, childX, childY, childWidth, childHeight);
    }
  }
}


// console.dir(tree.node.getComputedWidth(), { depth: Number.Infinity });
