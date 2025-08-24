import {
  Align,
  BoxSizing,
  Direction,
  Display,
  Edge,
  FlexDirection,
  Gutter,
  Justify,
  type Node,
  Overflow,
  PositionType,
  Wrap,
} from "yoga-layout/load";

import type { LayoutProps, Required } from "./core.ts";

/**
 * Apply Sone layout properties to Yoga layout node
 * @param props - Sone layout properties
 * @param node - Yoga node to configure (creates new if not provided)
 * @returns configured Yoga node
 */
export function applyPropsToYogaNode(props: LayoutProps, node: Node) {
  for (const key of Object.keys(props)) {
    switch (key) {
      case "alignContent":
        node.setAlignContent(alignContent(props.alignContent!));
        break;
      case "alignItems":
        node.setAlignItems(alignItems(props.alignItems!));
        break;
      case "alignSelf":
        node.setAlignSelf(alignItems(props.alignSelf!));
        break;
      case "aspectRatio":
        node.setAspectRatio(props.aspectRatio);
        break;
      case "borderBottomWidth":
        node.setBorder(Edge.Bottom, props.borderBottomWidth);
        break;
      case "borderEndWidth":
        node.setBorder(Edge.End, props.borderEndWidth);
        break;
      case "borderLeftWidth":
        node.setBorder(Edge.Left, props.borderLeftWidth);
        break;
      case "borderRightWidth":
        node.setBorder(Edge.Right, props.borderRightWidth);
        break;
      case "borderStartWidth":
        node.setBorder(Edge.Start, props.borderStartWidth);
        break;
      case "borderTopWidth":
        node.setBorder(Edge.Top, props.borderTopWidth);
        break;
      case "borderWidth":
        node.setBorder(Edge.All, props.borderWidth);
        break;
      case "borderInlineWidth":
        node.setBorder(Edge.Horizontal, props.borderInlineWidth);
        break;
      case "borderBlockWidth":
        node.setBorder(Edge.Vertical, props.borderBlockWidth);
        break;
      case "bottom":
        node.setPosition(Edge.Bottom, props.bottom);
        break;
      case "boxSizing":
        node.setBoxSizing(boxSizing(props.boxSizing!));
        break;
      case "direction":
        node.setDirection(direction(props.direction!));
        break;
      case "display":
        node.setDisplay(display(props.display!));
        break;
      case "end":
        node.setPosition(Edge.End, props.end);
        break;
      case "flex":
        node.setFlex(props.flex);
        break;
      case "flexBasis":
        node.setFlexBasis(props.flexBasis);
        break;
      case "flexDirection":
        node.setFlexDirection(flexDirection(props.flexDirection!));
        break;
      case "rowGap":
        node.setGap(Gutter.Row, props.rowGap);
        break;
      case "gap":
        node.setGap(Gutter.All, props.gap);
        break;
      case "columnGap":
        node.setGap(Gutter.Column, props.columnGap);
        break;
      case "flexGrow":
        node.setFlexGrow(props.flexGrow);
        break;
      case "flexShrink":
        node.setFlexShrink(props.flexShrink);
        break;
      case "flexWrap":
        node.setFlexWrap(flexWrap(props.flexWrap!));
        break;
      case "height":
        node.setHeight(props.height);
        break;
      case "justifyContent":
        node.setJustifyContent(justifyContent(props.justifyContent!));
        break;
      case "left":
        node.setPosition(Edge.Left, props.left);
        break;
      case "margin":
        node.setMargin(Edge.All, props.margin);
        break;
      case "marginBottom":
        node.setMargin(Edge.Bottom, props.marginBottom);
        break;
      case "marginEnd":
        node.setMargin(Edge.End, props.marginEnd);
        break;
      case "marginLeft":
        node.setMargin(Edge.Left, props.marginLeft);
        break;
      case "marginRight":
        node.setMargin(Edge.Right, props.marginRight);
        break;
      case "marginStart":
        node.setMargin(Edge.Start, props.marginStart);
        break;
      case "marginTop":
        node.setMargin(Edge.Top, props.marginTop);
        break;
      case "marginInline":
        node.setMargin(Edge.Horizontal, props.marginInline);
        break;
      case "marginBlock":
        node.setMargin(Edge.Vertical, props.marginBlock);
        break;
      case "maxHeight":
        node.setMaxHeight(props.maxHeight);
        break;
      case "maxWidth":
        node.setMaxWidth(props.maxWidth);
        break;
      case "minHeight":
        node.setMinHeight(props.minHeight);
        break;
      case "minWidth":
        node.setMinWidth(props.minWidth);
        break;
      case "overflow":
        node.setOverflow(overflow(props.overflow!));
        break;
      case "padding":
        node.setPadding(Edge.All, props.padding);
        break;
      case "paddingBottom":
        node.setPadding(Edge.Bottom, props.paddingBottom);
        break;
      case "paddingEnd":
        node.setPadding(Edge.End, props.paddingEnd);
        break;
      case "paddingLeft":
        node.setPadding(Edge.Left, props.paddingLeft);
        break;
      case "paddingRight":
        node.setPadding(Edge.Right, props.paddingRight);
        break;
      case "paddingStart":
        node.setPadding(Edge.Start, props.paddingStart);
        break;
      case "paddingTop":
        node.setPadding(Edge.Top, props.paddingTop);
        break;
      case "paddingInline":
        node.setPadding(Edge.Horizontal, props.paddingInline);
        break;
      case "paddingBlock":
        node.setPadding(Edge.Vertical, props.paddingBlock);
        break;
      case "position":
        node.setPositionType(position(props.position!));
        break;
      case "right":
        node.setPosition(Edge.Right, props.right);
        break;
      case "start":
        node.setPosition(Edge.Start, props.start);
        break;
      case "top":
        node.setPosition(Edge.Top, props.top);
        break;
      case "insetInline":
        node.setPosition(Edge.Horizontal, props.insetInline);
        break;
      case "insetBlock":
        node.setPosition(Edge.Vertical, props.insetBlock);
        break;
      case "inset":
        node.setPosition(Edge.All, props.inset);
        break;
      case "width":
        node.setWidth(props.width);
        break;
    }
  }
  return node;
}

/**
 * Convert CSS align-content value to Yoga enum
 */
function alignContent(str: Required<LayoutProps["alignContent"]>) {
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
}

/**
 * Convert CSS align-items value to Yoga enum
 */
function alignItems(str: Required<LayoutProps["alignItems"]>) {
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
}

/**
 * Convert CSS box-sizing value to Yoga enum
 */
function boxSizing(str: Required<LayoutProps["boxSizing"]>) {
  switch (str) {
    case "border-box":
      return BoxSizing.BorderBox;
    case "content-box":
      return BoxSizing.ContentBox;
  }
}

/**
 * Convert CSS direction value to Yoga enum
 */
function direction(str: Required<LayoutProps["direction"]>) {
  switch (str) {
    case "ltr":
      return Direction.LTR;
    case "rtl":
      return Direction.RTL;
  }
}

/**
 * Convert CSS display value to Yoga enum
 */
function display(str: Required<LayoutProps["display"]>) {
  switch (str) {
    case "none":
      return Display.None;
    case "flex":
      return Display.Flex;
    case "contents":
      return Display.Contents;
  }
}

/**
 * Convert CSS flex-direction value to Yoga enum
 */
function flexDirection(str: Required<LayoutProps["flexDirection"]>) {
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
}

/**
 * Convert CSS flex-wrap value to Yoga enum
 */
function flexWrap(str: Required<LayoutProps["flexWrap"]>) {
  switch (str) {
    case "wrap":
      return Wrap.Wrap;
    case "nowrap":
      return Wrap.NoWrap;
    case "wrap-reverse":
      return Wrap.WrapReverse;
  }
}

/**
 * Convert CSS justify-content value to Yoga enum
 */
function justifyContent(str: Required<LayoutProps["justifyContent"]>) {
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
}

/**
 * Convert CSS overflow value to Yoga enum
 */
function overflow(str: Required<LayoutProps["overflow"]>) {
  switch (str) {
    case "visible":
      return Overflow.Visible;
    case "hidden":
      return Overflow.Hidden;
    case "scroll":
      return Overflow.Scroll;
  }
}

/**
 * Convert CSS position value to Yoga enum
 */
function position(str: Required<LayoutProps["position"]>) {
  switch (str) {
    case "absolute":
      return PositionType.Absolute;
    case "relative":
      return PositionType.Relative;
    case "static":
      return PositionType.Static;
  }
}
