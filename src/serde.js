import Yoga, {
  Align,
  BoxSizing,
  Direction,
  Display,
  Edge,
  FlexDirection,
  Gutter,
  Justify,
  Overflow,
  PositionType,
  Wrap,
} from "yoga-layout";

/**
 * @param {import("./types.js").FlexStyle} style
 * @returns {import("yoga-layout").Node | undefined}
 */
function applyStyle(style, node = Yoga.Node.create()) {
  for (const key of Object.keys(style)) {
    switch (key) {
      case "alignContent":
        node.setAlignContent(alignContent(style.alignContent));
        break;
      case "alignItems":
        node.setAlignItems(alignItems(style.alignItems));
        break;
      case "alignSelf":
        node.setAlignSelf(alignItems(style.alignSelf));
        break;
      case "aspectRatio":
        node.setAspectRatio(style.aspectRatio);
        break;
      case "borderBottomWidth":
        node.setBorder(Edge.Bottom, style.borderBottomWidth);
        break;
      case "borderEndWidth":
        node.setBorder(Edge.End, style.borderEndWidth);
        break;
      case "borderLeftWidth":
        node.setBorder(Edge.Left, style.borderLeftWidth);
        break;
      case "borderRightWidth":
        node.setBorder(Edge.Right, style.borderRightWidth);
        break;
      case "borderStartWidth":
        node.setBorder(Edge.Start, style.borderStartWidth);
        break;
      case "borderTopWidth":
        node.setBorder(Edge.Top, style.borderTopWidth);
        break;
      case "borderWidth":
        node.setBorder(Edge.All, style.borderWidth);
        break;
      case "borderInlineWidth":
        node.setBorder(Edge.Horizontal, style.borderInlineWidth);
        break;
      case "borderBlockWidth":
        node.setBorder(Edge.Vertical, style.borderBlockWidth);
        break;
      case "bottom":
        node.setPosition(Edge.Bottom, style.bottom);
        break;
      case "boxSizing":
        node.setBoxSizing(boxSizing(style.boxSizing));
        break;
      case "direction":
        node.setDirection(direction(style.direction));
        break;
      case "display":
        node.setDisplay(display(style.display));
        break;
      case "end":
        node.setPosition(Edge.End, style.end);
        break;
      case "flex":
        node.setFlex(style.flex);
        break;
      case "flexBasis":
        node.setFlexBasis(style.flexBasis);
        break;
      case "flexDirection":
        node.setFlexDirection(flexDirection(style.flexDirection));
        break;
      case "rowGap":
        node.setGap(Gutter.Row, style.rowGap);
        break;
      case "gap":
        node.setGap(Gutter.All, style.gap);
        break;
      case "columnGap":
        node.setGap(Gutter.Column, style.columnGap);
        break;
      case "flexGrow":
        node.setFlexGrow(style.flexGrow);
        break;
      case "flexShrink":
        node.setFlexShrink(style.flexShrink);
        break;
      case "flexWrap":
        node.setFlexWrap(flexWrap(style.flexWrap));
        break;
      case "height":
        node.setHeight(style.height);
        break;
      case "justifyContent":
        node.setJustifyContent(justifyContent(style.justifyContent));
        break;
      case "left":
        node.setPosition(Edge.Left, style.left);
        break;
      case "margin":
        node.setMargin(Edge.All, style.margin);
        break;
      case "marginBottom":
        node.setMargin(Edge.Bottom, style.marginBottom);
        break;
      case "marginEnd":
        node.setMargin(Edge.End, style.marginEnd);
        break;
      case "marginLeft":
        node.setMargin(Edge.Left, style.marginLeft);
        break;
      case "marginRight":
        node.setMargin(Edge.Right, style.marginRight);
        break;
      case "marginStart":
        node.setMargin(Edge.Start, style.marginStart);
        break;
      case "marginTop":
        node.setMargin(Edge.Top, style.marginTop);
        break;
      case "marginInline":
        node.setMargin(Edge.Horizontal, style.marginInline);
        break;
      case "marginBlock":
        node.setMargin(Edge.Vertical, style.marginBlock);
        break;
      case "maxHeight":
        node.setMaxHeight(style.maxHeight);
        break;
      case "maxWidth":
        node.setMaxWidth(style.maxWidth);
        break;
      case "minHeight":
        node.setMinHeight(style.minHeight);
        break;
      case "minWidth":
        node.setMinWidth(style.minWidth);
        break;
      case "overflow":
        node.setOverflow(overflow(style.overflow));
        break;
      case "padding":
        node.setPadding(Edge.All, style.padding);
        break;
      case "paddingBottom":
        node.setPadding(Edge.Bottom, style.paddingBottom);
        break;
      case "paddingEnd":
        node.setPadding(Edge.End, style.paddingEnd);
        break;
      case "paddingLeft":
        node.setPadding(Edge.Left, style.paddingLeft);
        break;
      case "paddingRight":
        node.setPadding(Edge.Right, style.paddingRight);
        break;
      case "paddingStart":
        node.setPadding(Edge.Start, style.paddingStart);
        break;
      case "paddingTop":
        node.setPadding(Edge.Top, style.paddingTop);
        break;
      case "paddingInline":
        node.setPadding(Edge.Horizontal, style.paddingInline);
        break;
      case "paddingBlock":
        node.setPadding(Edge.Vertical, style.paddingBlock);
        break;
      case "position":
        node.setPositionType(position(style.position));
        break;
      case "right":
        node.setPosition(Edge.Right, style.right);
        break;
      case "start":
        node.setPosition(Edge.Start, style.start);
        break;
      case "top":
        node.setPosition(Edge.Top, style.top);
        break;
      case "insetInline":
        node.setPosition(Edge.Horizontal, style.insetInline);
        break;
      case "insetBlock":
        node.setPosition(Edge.Vertical, style.insetBlock);
        break;
      case "inset":
        node.setPosition(Edge.All, style.inset);
        break;
      case "width":
        node.setWidth(style.width);
        break;
    }
  }
  return node;
}

function alignContent(str) {
  switch (str) {
    case "flex-start":
      return Align.FlexStart;
    case "flex-end":
      return Align.FlexEnd;
    case "center":
      return Align.Center;
    case "stretch":
      return Align.Stretch;
    case "space-between":
      return Align.SpaceBetween;
    case "space-around":
      return Align.SpaceAround;
    case "space-evenly":
      return Align.SpaceEvenly;
  }
  throw new Error(`"${str}" is not a valid value for alignContent`);
}

function alignItems(str) {
  switch (str) {
    case "flex-start":
      return Align.FlexStart;
    case "flex-end":
      return Align.FlexEnd;
    case "center":
      return Align.Center;
    case "stretch":
      return Align.Stretch;
    case "baseline":
      return Align.Baseline;
  }
  throw new Error(`"${str}" is not a valid value for alignItems`);
}

function boxSizing(str) {
  switch (str) {
    case "border-box":
      return BoxSizing.BorderBox;
    case "content-box":
      return BoxSizing.ContentBox;
  }
  throw new Error(`"${str}" is not a valid value for boxSizing`);
}

function direction(str) {
  switch (str) {
    case "ltr":
      return Direction.LTR;
    case "rtl":
      return Direction.RTL;
  }
  throw new Error(`"${str}" is not a valid value for direction`);
}

function display(str) {
  switch (str) {
    case "none":
      return Display.None;
    case "flex":
      return Display.Flex;
    case "contents":
      return Display.Contents;
  }
  throw new Error(`"${str}" is not a valid value for display`);
}

function flexDirection(str) {
  switch (str) {
    case "row":
      return FlexDirection.Row;
    case "column":
      return FlexDirection.Column;
    case "row-reverse":
      return FlexDirection.RowReverse;
    case "column-reverse":
      return FlexDirection.ColumnReverse;
  }
  throw new Error(`"${str}" is not a valid value for flexDirection`);
}

function flexWrap(str) {
  switch (str) {
    case "wrap":
      return Wrap.Wrap;
    case "nowrap":
      return Wrap.NoWrap;
    case "wrap-reverse":
      return Wrap.WrapReverse;
  }
  throw new Error(`"${str}" is not a valid value for flexWrap`);
}

function justifyContent(str) {
  switch (str) {
    case "flex-start":
      return Justify.FlexStart;
    case "flex-end":
      return Justify.FlexEnd;
    case "center":
      return Justify.Center;
    case "space-between":
      return Justify.SpaceBetween;
    case "space-around":
      return Justify.SpaceAround;
    case "space-evenly":
      return Justify.SpaceEvenly;
  }
  throw new Error(`"${str}" is not a valid value for justifyContent`);
}

function overflow(str) {
  switch (str) {
    case "visible":
      return Overflow.Visible;
    case "hidden":
      return Overflow.Hidden;
    case "scroll":
      return Overflow.Scroll;
  }
  throw new Error(`"${str}" is not a valid value for overflow`);
}

function position(str) {
  switch (str) {
    case "absolute":
      return PositionType.Absolute;
    case "relative":
      return PositionType.Relative;
    case "static":
      return PositionType.Static;
  }
  throw new Error(`"${str}" is not a valid value for position`);
}
