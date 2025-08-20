import type { GradientNode } from "gradient-parser";
import { colors } from "./color.ts";
import type { CssShadowProperties } from "./shadow.ts";
import type { SoneParagraphBlock } from "./text.ts";

/**
 * Utility type to ensure non-undefined values
 */
export type Required<T> = T extends undefined ? never : T;

/**
 * Color values - predefined color names or CSS color strings
 */
export type ColorValue = keyof typeof colors | "transparent" | (string & {});

/**
 * Layout positioning types (similar to CSS position)
 */
export type LayoutPositionType = "static" | "relative" | "absolute";
/**
 * Flexbox direction - same as CSS flex-direction
 */
export type FlexDirection = "column" | "column-reverse" | "row" | "row-reverse";

/**
 * Flexbox align-content values
 */
export type AlignContent =
  | "flex-start"
  | "flex-end"
  | "center"
  | "stretch"
  | "space-between"
  | "space-around"
  | "space-evenly";

export type AlignItems =
  | "flex-start"
  | "flex-end"
  | "center"
  | "stretch"
  | "baseline";

export type JustifyContent =
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";

/**
 * Core layout properties - mirrors CSS Flexbox/Grid with additional visual styling
 */
export interface LayoutProps {
  /** Debug identifier for development */
  tag?: string;
  alignContent?: AlignContent;
  alignItems?: AlignItems;
  alignSelf?: AlignItems;
  aspectRatio?: number;
  borderBottomWidth?: number;
  borderEndWidth?: number;
  borderLeftWidth?: number;
  borderRightWidth?: number;
  borderStartWidth?: number;
  borderTopWidth?: number;
  borderWidth?: number;
  borderInlineWidth?: number;
  borderBlockWidth?: number;
  bottom?: number | `${number}%`;
  boxSizing?: "border-box" | "content-box";
  direction?: "ltr" | "rtl";
  display?: "none" | "flex" | "contents";
  end?: number | `${number}%`;
  flex?: number;
  flexBasis?: number | "auto" | `${number}%`;
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  rowGap?: number;
  gap?: number;
  columnGap?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexWrap?: "wrap" | "nowrap" | "wrap-reverse";
  height?: number | "auto" | `${number}%`;
  justifyContent?: JustifyContent;
  left?: number | `${number}%`;
  margin?: number | "auto" | `${number}%`;
  marginBottom?: number | "auto" | `${number}%`;
  marginEnd?: number | "auto" | `${number}%`;
  marginLeft?: number | "auto" | `${number}%`;
  marginRight?: number | "auto" | `${number}%`;
  marginStart?: number | "auto" | `${number}%`;
  marginTop?: number | "auto" | `${number}%`;
  marginInline?: number | "auto" | `${number}%`;
  marginBlock?: number | "auto" | `${number}%`;
  maxHeight?: number | `${number}%`;
  maxWidth?: number | `${number}%`;
  minHeight?: number | `${number}%`;
  minWidth?: number | `${number}%`;
  overflow?: "visible" | "hidden" | "scroll";
  padding?: number | `${number}%`;
  paddingBottom?: number | `${number}%`;
  paddingEnd?: number | `${number}%`;
  paddingLeft?: number | `${number}%`;
  paddingRight?: number | `${number}%`;
  paddingStart?: number | `${number}%`;
  paddingTop?: number | `${number}%`;
  paddingInline?: number | `${number}%`;
  paddingBlock?: number | `${number}%`;
  position?: "absolute" | "relative" | "static";
  right?: number | `${number}%`;
  start?: number | `${number}%`;
  top?: number | `${number}%`;
  insetInline?: number | `${number}%`;
  insetBlock?: number | `${number}%`;
  inset?: number | `${number}%`;
  width?: number | "auto" | `${number}%`;

  borderColor?: ColorValue;
  background?: Array<ColorValue | PhotoNode | GradientNode>;
  rotation?: number;
  scale?: [number, number];
  translateX?: number;
  translateY?: number;
  cornerRadius?: number[];
  cornerSmoothing?: number;
  corner?: "cut" | "round";
  opacity?: number;
  shadows?: Array<CssShadowProperties | string>;
  filters?: string[];
}

/**
 * Fluent API builder for layout properties
 */
interface LayoutPropsBuilder<T, P = LayoutProps> {
  props: P;

  /** Apply multiple properties at once */
  apply(value: LayoutProps): T;
  /** Set debug tag */
  tag(value: Required<LayoutProps["tag"]>): T;

  // methods
  alignContent(value: Required<LayoutProps["alignContent"]>): T;
  alignItems(value: Required<LayoutProps["alignItems"]>): T;
  alignSelf(value: Required<LayoutProps["alignSelf"]>): T;
  aspectRatio(value: Required<LayoutProps["aspectRatio"]>): T;

  /**
   * Border width with CSS-like shorthand values
   * @example borderWidth(10) // all sides
   * @example borderWidth(10, 20) // top/bottom, left/right
   * @example borderWidth(10, 20, 30) // top, left/right, bottom
   * @example borderWidth(10, 20, 30, 40) // top, right, bottom, left
   */
  borderWidth(all: number): T;
  borderWidth(topBottom: number, leftRight: number): T;
  borderWidth(top: number, leftRight: number, bottom: number): T;
  borderWidth(top: number, right: number, bottom: number, left: number): T;

  borderColor(value: Required<LayoutProps["borderColor"]>): T;

  /** Margin with CSS-like shorthand (same pattern as borderWidth) */
  margin(all: Required<LayoutProps["margin"]>): T;
  margin(
    topBottom: Required<LayoutProps["marginTop"]>,
    leftRight: Required<LayoutProps["marginLeft"]>,
  ): T;

  margin(
    top: Required<LayoutProps["marginTop"]>,
    leftRight: Required<LayoutProps["marginRight"]>,
    bottom: Required<LayoutProps["marginBottom"]>,
  ): T;

  margin(
    top: Required<LayoutProps["marginTop"]>,
    right: Required<LayoutProps["marginRight"]>,
    bottom: Required<LayoutProps["marginBottom"]>,
    left: Required<LayoutProps["marginLeft"]>,
  ): T;

  marginTop(value: Required<LayoutProps["marginTop"]>): T;
  marginBottom(value: Required<LayoutProps["marginBottom"]>): T;
  marginLeft(value: Required<LayoutProps["marginLeft"]>): T;
  marginRight(value: Required<LayoutProps["marginRight"]>): T;

  /** Padding with CSS-like shorthand (same pattern as borderWidth) */
  padding(all: Required<LayoutProps["padding"]>): T;
  padding(
    topBottom: Required<LayoutProps["paddingTop"]>,
    leftRight: Required<LayoutProps["paddingLeft"]>,
  ): T;

  padding(
    top: Required<LayoutProps["paddingTop"]>,
    leftRight: Required<LayoutProps["paddingRight"]>,
    bottom: Required<LayoutProps["paddingBottom"]>,
  ): T;

  padding(
    top: Required<LayoutProps["paddingTop"]>,
    right: Required<LayoutProps["paddingRight"]>,
    bottom: Required<LayoutProps["paddingBottom"]>,
    left: Required<LayoutProps["paddingLeft"]>,
  ): T;

  paddingTop(value: Required<LayoutProps["paddingTop"]>): T;
  paddingBottom(value: Required<LayoutProps["paddingBottom"]>): T;
  paddingLeft(value: Required<LayoutProps["paddingLeft"]>): T;
  paddingRight(value: Required<LayoutProps["paddingRight"]>): T;

  boxSizing(value: Required<LayoutProps["boxSizing"]>): T;
  display(value: Required<LayoutProps["display"]>): T;
  flex(value: Required<LayoutProps["flex"]>): T;
  basis(value: Required<LayoutProps["flexBasis"]>): T;
  direction(value: Required<LayoutProps["flexDirection"]>): T;
  rowGap(value: Required<LayoutProps["rowGap"]>): T;
  gap(value: Required<LayoutProps["gap"]>): T;
  columnGap(value: Required<LayoutProps["columnGap"]>): T;
  grow(value: Required<LayoutProps["flexGrow"]>): T;
  shrink(value: Required<LayoutProps["flexShrink"]>): T;
  wrap(value: Required<LayoutProps["flexWrap"]>): T;
  justifyContent(value: Required<LayoutProps["justifyContent"]>): T;

  // position
  left(value: Required<LayoutProps["left"]>): T;
  right(value: Required<LayoutProps["right"]>): T;
  bottom(value: Required<LayoutProps["bottom"]>): T;
  top(value: Required<LayoutProps["top"]>): T;
  start(value: Required<LayoutProps["start"]>): T;
  end(value: Required<LayoutProps["end"]>): T;

  /**
   * Set width and height together - height defaults to width if omitted (square)
   */
  size(
    width: Required<LayoutProps["width"]>,
    height?: Required<LayoutProps["height"]>,
  ): T;

  width(value: Required<LayoutProps["width"]>): T;
  height(value: Required<LayoutProps["height"]>): T;

  maxWidth(value: Required<LayoutProps["maxWidth"]>): T;
  maxHeight(value: Required<LayoutProps["maxHeight"]>): T;

  minWidth(value: Required<LayoutProps["minWidth"]>): T;
  minHeight(value: Required<LayoutProps["minHeight"]>): T;

  position(value: Required<LayoutProps["position"]>): T;
  inset(value: Required<LayoutProps["inset"]>): T;
  overflow(value: Required<LayoutProps["overflow"]>): T;

  /** CSS-like transforms */
  translateX(value: number): T;
  translateY(value: number): T;
  /** @param value rotation in degrees */
  rotate(value: number): T;
  /** uniform scaling */
  scale(value: number): T;
  /** separate x/y scaling */
  scale(x: number, y: number): T;

  /**
   * Background - supports colors, gradients, images
   * @example .bg("red")
   * @example .bg("linear-gradient(...)")
   * @example .bg(Photo("url"))
   */
  bg(...values: Required<LayoutProps["background"]>): T;
  background(...values: Required<LayoutProps["background"]>): T;
  opacity(value: Required<LayoutProps["opacity"]>): T;

  // border radius
  rounded(...values: Required<LayoutProps["cornerRadius"]>): T;
  borderRadius(...values: Required<LayoutProps["cornerRadius"]>): T;
  borderSmoothing(value: Required<LayoutProps["cornerSmoothing"]>): T;

  cornerRadius(...values: Required<LayoutProps["cornerRadius"]>): T;
  cornerSmoothing(value: Required<LayoutProps["cornerSmoothing"]>): T;
  corner(value: Required<LayoutProps["corner"]>): T;

  /**
   * CSS box-shadow
   * @example .shadow("2px 2px 4px rgba(0,0,0,0.3)")
   */
  shadow(...values: string[]): T;
  /** @param value blur radius in pixels */
  blur(value: number): T;
  /** @param value 1.0 = normal, 2.0 = twice as bright */
  brightness(value: number): T;
  /** @param value 1.0 = normal */
  contrast(value: number): T;
  /** @param value 0.0 to 1.0 */
  grayscale(value: number): T;
  /** @param value hue rotation in degrees */
  huerotate(value: number): T;
  /** @param value 0.0 to 1.0 */
  invert(value: number): T;
  /** @param value 1.0 = normal */
  saturate(value: number): T;
  /** @param value 0.0 to 1.0 */
  sepia(value: number): T;
}

/**
 * Image display properties
 */
export interface PhotoProps extends LayoutProps {
  /** maintain original width/height ratio */
  preserveAspectRatio?: boolean;
  /** how image fits container */
  scaleType?: "cover" | "fill" | "contain";
  scaleAlignment?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  fill?: ColorValue;

  /** image source */
  src?: string | Uint8Array | HTMLImageElement;

  /** resolved image (set during compilation) */
  image?: HTMLImageElement;
}

export interface PhotoPropsBuilder<T>
  extends LayoutPropsBuilder<T, PhotoProps> {
  scaleType(
    value: Required<PhotoProps["scaleType"]>,
    alignment?: Required<PhotoProps["scaleAlignment"]>,
  ): T;

  scaleType(
    value: Required<PhotoProps["scaleType"]>,
    alignment?: "center" | "end" | "start",
  ): T;

  preserveAspectRatio(value?: Required<PhotoProps["preserveAspectRatio"]>): T;
  flipHorizontal(value?: Required<PhotoProps["flipHorizontal"]>): T;
  flipVertical(value?: Required<PhotoProps["flipVertical"]>): T;
  fill(value: Required<PhotoProps["fill"]>): T;
}

/**
 * Image display node
 */
export interface PhotoNode extends PhotoPropsBuilder<PhotoNode> {
  type: "photo";
}

/**
 * Font family - system fonts or custom font names
 */
export type FontValue = "sans-serif" | "serif" | "monospace" | (string & {});

/**
 * Text styling properties for spans and text
 */
export interface SpanProps {
  /** font size in pixels */
  size?: number;
  /** text color or gradient */
  color?: ColorValue | GradientNode[];
  /** font family stack @example ["Arial", "sans-serif"] */
  font?: FontValue[];
  style?: "normal" | "italic" | "oblique";
  /** font weight @example 100-900 or "bold" */
  weight?: "normal" | "bold" | "lighter" | "bolder" | (string & {}) | number;
  /** spacing between characters */
  letterSpacing?: number;
  /** spacing between words */
  wordSpacing?: number;
  /** text shadows */
  dropShadows?: Array<CssShadowProperties | string>;
  /** text outline color */
  strokeColor?: ColorValue;
  /** text outline width */
  strokeWidth?: number;

  /** vertical offset for baseline adjustment */
  offsetY?: number;

  /** underline thickness */
  underline?: number;
  underlineColor?: ColorValue | null;

  /** strikethrough thickness */
  lineThrough?: number;
  lineThroughColor?: ColorValue | null;

  /** overline thickness */
  overline?: number;
  overlineColor?: ColorValue | null;

  /** background highlight */
  highlightColor?: ColorValue | null;
}

/**
 * Text block properties extending span properties
 */
export interface TextProps extends SpanProps, LayoutProps {
  /** prevent text wrapping */
  nowrap?: boolean;
  /** line height multiplier @example 1.5 = 150% */
  lineHeight?: number;
  /** first line indent in pixels */
  indentSize?: number;
  /** subsequent lines indent */
  hangingIndentSize?: number;
  /** text alignment */
  align?: "left" | "right" | "center" | "justify";

  /** resolved paragraph (internal) */
  blocks?: SoneParagraphBlock[];
}

export type RequiredNonNullValues<T> = {
  [K in keyof T]-?: Required<T[K]>;
};

export type DefaultTextProps = RequiredNonNullValues<
  Omit<TextProps, keyof LayoutProps>
>;

export interface SpanPropsBuilder<T> {
  props: SpanProps;
  color: (value: Required<TextProps["color"]>) => T;
  size: (value: Required<TextProps["size"]>) => T;
  font: (...values: Required<TextProps["font"]>) => T;
  style: (value: Required<TextProps["style"]>) => T;
  weight: (value: Required<TextProps["weight"]>) => T;
  letterSpacing: (value: Required<TextProps["letterSpacing"]>) => T;
  wordSpacing: (value: Required<TextProps["wordSpacing"]>) => T;

  underline: (value?: Required<TextProps["underline"]>) => T;
  underlineColor: (value?: TextProps["underlineColor"]) => T;

  lineThrough: (value?: Required<TextProps["lineThrough"]>) => T;
  lineThroughColor: (value?: TextProps["lineThroughColor"]) => T;

  overline: (value?: Required<TextProps["overline"]>) => T;
  overlineColor: (value?: TextProps["overlineColor"]) => T;

  highlight: (value?: TextProps["highlightColor"]) => T;

  dropShadow: (...values: Required<TextProps["dropShadows"]>) => T;
  strokeColor: (value: Required<TextProps["strokeColor"]>) => T;
  strokeWidth: (value: Required<TextProps["strokeWidth"]>) => T;
  offsetY: (value: Required<TextProps["offsetY"]>) => T;
}

/**
 * Styled text span within a text block
 */
export interface SpanNode extends SpanPropsBuilder<SpanNode> {
  type: "span";
  /** the text content */
  children: string;
}

export interface TextPropsBuilder<T>
  extends Omit<
      LayoutPropsBuilder<T, TextProps>,
      | "size"
      | "alignContent"
      | "alignItems"
      | "justifyContent"
      | "gap"
      | "rowGap"
      | "columnGap"
      | "wrap"
      | "direction"
      | "display"
      | "overflow"
    >,
    Omit<SpanPropsBuilder<T>, "props"> {
  nowrap(): T;
  wrap(value?: boolean): T;
  lineHeight(value: Required<TextProps["lineHeight"]>): T;
  align(value: Required<TextProps["align"]>): T;
  indent(value: Required<TextProps["indentSize"]>): T;
  hangingIndent(value: Required<TextProps["hangingIndentSize"]>): T;
}

/**
 * Text block containing styled spans and plain strings
 */
export interface TextNode extends TextPropsBuilder<TextNode> {
  type: "text";
  /** mixed content */
  children: Array<string | SpanNode>;
}

export type TextDefaultProps = Omit<TextProps, keyof LayoutProps>;

export interface TextDefaultPropsBuilder<T>
  extends Omit<SpanPropsBuilder<T>, "props"> {
  props: TextDefaultProps;
  nowrap(): T;
  wrap(value?: boolean): T;
  lineHeight(value: Required<TextProps["lineHeight"]>): T;
  align(value: Required<TextProps["align"]>): T;
  indent(value: Required<TextProps["indentSize"]>): T;
}

/**
 * Text defaults container - sets text properties for child nodes
 */
export interface TextDefaultNode
  extends TextDefaultPropsBuilder<TextDefaultNode> {
  type: "text-default";
  children: SoneNode[];
}

/**
 * Horizontal layout container (flexDirection: row)
 */
export interface RowNode extends LayoutPropsBuilder<RowNode> {
  type: "row";
  children: SoneNode[];
}

/**
 * Vertical layout container (flexDirection: column)
 */
export interface ColumnNode extends LayoutPropsBuilder<ColumnNode> {
  type: "column";
  children: SoneNode[];
}

/**
 * Union of all possible Sone node types
 */
export type SoneNode =
  | ColumnNode
  | RowNode
  | TextNode
  | TextDefaultNode
  | PhotoNode
  | PathNode
  | TableNode
  | TableRowNode
  | TableCellNode
  | null
  | undefined;

function layoutPropsBuilder<T>(props: LayoutProps = {}): LayoutPropsBuilder<T> {
  const addFilter = (value: string) => {
    if (props.filters == null) {
      props.filters = [];
    }
    props.filters.push(value);
  };

  const addBackground = (...values: Required<LayoutProps["background"]>) => {
    if (props.background == null) {
      props.background = [];
    }
    props.background.push(...values);
  };
  return {
    props,
    tag(value) {
      props.tag = value;
      return this as unknown as T;
    },
    apply(value) {
      Object.assign(props, value);
      return this as unknown as T;
    },
    alignContent(value: Required<LayoutProps["alignContent"]>): T {
      props.alignContent = value;
      return this as unknown as T;
    },
    alignItems(value: Required<LayoutProps["alignItems"]>): T {
      props.alignItems = value;
      return this as unknown as T;
    },
    alignSelf(value: Required<LayoutProps["alignSelf"]>): T {
      props.alignSelf = value;
      return this as unknown as T;
    },
    aspectRatio(value: Required<LayoutProps["aspectRatio"]>): T {
      props.aspectRatio = value;
      return this as unknown as T;
    },
    corner(value) {
      props.corner = value;
      return this as unknown as T;
    },
    borderWidth(
      top: number,
      right?: number,
      bottom?: number,
      left?: number,
    ): T {
      // all
      if (right == null && bottom == null && left == null) {
        props.borderWidth = top;
        return this as unknown as T;
      }

      // topBottom, leftRight
      if (right != null && bottom == null && left == null) {
        props.borderTopWidth = top;
        props.borderBottomWidth = top;
        props.borderLeftWidth = right;
        props.borderRightWidth = right;
        return this as unknown as T;
      }

      // top, leftRight, bottom
      if (right != null && bottom != null && left == null) {
        props.borderTopWidth = top;
        props.borderBottomWidth = bottom;
        props.borderLeftWidth = right;
        props.borderRightWidth = right;
        return this as unknown as T;
      }

      props.borderTopWidth = top;
      props.borderBottomWidth = bottom;
      props.borderLeftWidth = left;
      props.borderRightWidth = right;

      return this as unknown as T;
    },
    borderColor(value: Required<LayoutProps["borderColor"]>): T {
      props.borderColor = value;
      return this as unknown as T;
    },
    margin(
      top: Required<LayoutProps["marginTop"]>,
      right?: Required<LayoutProps["marginRight"]>,
      bottom?: Required<LayoutProps["marginBottom"]>,
      left?: Required<LayoutProps["marginLeft"]>,
    ): T {
      // all
      if (right == null && bottom == null && left == null) {
        props.margin = top;
        return this as unknown as T;
      }

      // topBottom, leftRight
      if (right != null && bottom == null && left == null) {
        props.marginTop = top;
        props.marginBottom = top;
        props.marginLeft = right;
        props.marginRight = right;
        return this as unknown as T;
      }

      // top, leftRight, bottom
      if (right != null && bottom != null && left == null) {
        props.marginTop = top;
        props.marginLeft = right;
        props.marginRight = right;
        props.marginBottom = bottom;
        return this as unknown as T;
      }

      props.marginTop = top;
      props.marginLeft = left;
      props.marginRight = right;
      props.marginBottom = bottom;
      return this as unknown as T;
    },
    marginTop(value: Required<LayoutProps["marginTop"]>): T {
      props.marginTop = value;
      return this as unknown as T;
    },
    marginBottom(value: Required<LayoutProps["marginBottom"]>): T {
      props.marginBottom = value;
      return this as unknown as T;
    },
    marginLeft(value: Required<LayoutProps["marginLeft"]>): T {
      props.marginLeft = value;
      return this as unknown as T;
    },
    marginRight(value: Required<LayoutProps["marginRight"]>): T {
      props.marginRight = value;
      return this as unknown as T;
    },
    padding(
      top: Required<LayoutProps["paddingTop"]>,
      right?: Required<LayoutProps["paddingRight"]>,
      bottom?: Required<LayoutProps["paddingBottom"]>,
      left?: Required<LayoutProps["paddingLeft"]>,
    ): T {
      // all
      if (right == null && bottom == null && left == null) {
        props.padding = top;
        return this as unknown as T;
      }

      // topBottom, leftRight
      if (right != null && bottom == null && left == null) {
        props.paddingTop = top;
        props.paddingBottom = top;
        props.paddingLeft = right;
        props.paddingRight = right;
        return this as unknown as T;
      }

      // top, leftRight, bottom
      if (right != null && bottom != null && left == null) {
        props.paddingTop = top;
        props.paddingLeft = right;
        props.paddingRight = right;
        props.paddingBottom = bottom;
        return this as unknown as T;
      }

      props.paddingTop = top;
      props.paddingLeft = left;
      props.paddingRight = right;
      props.paddingBottom = bottom;
      return this as unknown as T;
    },
    paddingTop(value: Required<LayoutProps["paddingTop"]>): T {
      props.paddingTop = value;
      return this as unknown as T;
    },
    paddingBottom(value: Required<LayoutProps["paddingBottom"]>): T {
      props.paddingBottom = value;
      return this as unknown as T;
    },
    paddingLeft(value: Required<LayoutProps["paddingLeft"]>): T {
      props.paddingLeft = value;
      return this as unknown as T;
    },
    paddingRight(value: Required<LayoutProps["paddingRight"]>): T {
      props.paddingRight = value;
      return this as unknown as T;
    },
    boxSizing(value: Required<LayoutProps["boxSizing"]>): T {
      props.boxSizing = value;
      return this as unknown as T;
    },
    display(value: Required<LayoutProps["display"]>): T {
      props.display = value;
      return this as unknown as T;
    },
    flex(value: Required<LayoutProps["flex"]>): T {
      props.flex = value;
      return this as unknown as T;
    },
    basis(value: Required<LayoutProps["flexBasis"]>): T {
      props.flexBasis = value;
      return this as unknown as T;
    },
    direction(value: Required<LayoutProps["flexDirection"]>): T {
      props.flexDirection = value;
      return this as unknown as T;
    },
    rowGap(value: Required<LayoutProps["rowGap"]>): T {
      props.rowGap = value;
      return this as unknown as T;
    },
    gap(value: Required<LayoutProps["gap"]>): T {
      props.gap = value;
      return this as unknown as T;
    },
    columnGap(value: Required<LayoutProps["columnGap"]>): T {
      props.columnGap = value;
      return this as unknown as T;
    },
    grow(value: Required<LayoutProps["flexGrow"]>): T {
      props.flexGrow = value;
      return this as unknown as T;
    },
    shrink(value: Required<LayoutProps["flexShrink"]>): T {
      props.flexShrink = value;
      return this as unknown as T;
    },
    wrap(value: Required<LayoutProps["flexWrap"]>): T {
      props.flexWrap = value;
      return this as unknown as T;
    },
    justifyContent(value: Required<LayoutProps["justifyContent"]>): T {
      props.justifyContent = value;
      return this as unknown as T;
    },
    left(value: Required<LayoutProps["left"]>): T {
      props.left = value;
      return this as unknown as T;
    },
    right(value: Required<LayoutProps["right"]>): T {
      props.right = value;
      return this as unknown as T;
    },
    bottom(value: Required<LayoutProps["bottom"]>): T {
      props.bottom = value;
      return this as unknown as T;
    },
    top(value: Required<LayoutProps["top"]>): T {
      props.top = value;
      return this as unknown as T;
    },
    start(value: Required<LayoutProps["start"]>): T {
      props.start = value;
      return this as unknown as T;
    },
    end(value: Required<LayoutProps["end"]>): T {
      props.end = value;
      return this as unknown as T;
    },
    size(width: number, height?: number): T {
      props.width = width;
      props.height = height == null ? width : height;
      return this as unknown as T;
    },
    width(value: Required<LayoutProps["width"]>): T {
      props.width = value;
      return this as unknown as T;
    },
    height(value: Required<LayoutProps["height"]>): T {
      props.height = value;
      return this as unknown as T;
    },
    maxWidth(value: Required<LayoutProps["maxWidth"]>): T {
      props.maxWidth = value;
      return this as unknown as T;
    },
    maxHeight(value: Required<LayoutProps["maxHeight"]>): T {
      props.maxHeight = value;
      return this as unknown as T;
    },
    minWidth(value: Required<LayoutProps["minWidth"]>): T {
      props.minWidth = value;
      return this as unknown as T;
    },
    minHeight(value: Required<LayoutProps["minHeight"]>): T {
      props.minHeight = value;
      return this as unknown as T;
    },
    position(value: Required<LayoutProps["position"]>): T {
      props.position = value;
      return this as unknown as T;
    },
    inset(value: Required<LayoutProps["inset"]>): T {
      props.inset = value;
      return this as unknown as T;
    },
    overflow(value: Required<LayoutProps["overflow"]>): T {
      props.overflow = value;
      return this as unknown as T;
    },
    rotate(value: number): T {
      props.rotation = value;
      return this as unknown as T;
    },
    scale(x: number, y?: number): T {
      props.scale = [x, y ?? x];
      return this as unknown as T;
    },
    translateX(value) {
      props.translateX = value;
      return this as unknown as T;
    },
    translateY(value) {
      props.translateY = value;
      return this as unknown as T;
    },
    bg(...values: Required<LayoutProps["background"]>): T {
      addBackground(...values);
      return this as unknown as T;
    },
    background(...values: Required<LayoutProps["background"]>): T {
      addBackground(...values);
      return this as unknown as T;
    },
    opacity(value: number): T {
      props.opacity = value;
      return this as unknown as T;
    },
    borderRadius(...values: Required<LayoutProps["cornerRadius"]>): T {
      props.cornerRadius = values;
      return this as unknown as T;
    },
    borderSmoothing(value: number): T {
      props.cornerSmoothing = value;
      return this as unknown as T;
    },
    rounded(...values: Required<LayoutProps["cornerRadius"]>): T {
      props.cornerRadius = values;
      return this as unknown as T;
    },
    cornerRadius(...values: Required<LayoutProps["cornerRadius"]>): T {
      props.cornerRadius = values;
      return this as unknown as T;
    },
    cornerSmoothing(value: number): T {
      props.cornerSmoothing = value;
      return this as unknown as T;
    },
    shadow(...values: string[]): T {
      if (props.shadows == null) {
        props.shadows = [];
      }
      props.shadows.push(...values);
      return this as unknown as T;
    },
    blur(value: number): T {
      addFilter(`blur(${value}px)`);
      return this as unknown as T;
    },
    brightness(value: number): T {
      addFilter(`brightness(${value})`);
      return this as unknown as T;
    },
    contrast(value: number): T {
      addFilter(`contrast(${value})`);
      return this as unknown as T;
    },
    grayscale(value: number): T {
      addFilter(`grayscale(${value})`);
      return this as unknown as T;
    },
    huerotate(value: number): T {
      addFilter(`hue-rotate(${value})`);
      return this as unknown as T;
    },
    invert(value: number): T {
      addFilter(`invert(${value})`);
      return this as unknown as T;
    },
    saturate(value: number): T {
      addFilter(`saturate(${value})`);
      return this as unknown as T;
    },
    sepia(value: number): T {
      addFilter(`sepia(${value})`);
      return this as unknown as T;
    },
  };
}

function spanPropsBuilder<T>(props: SpanProps = {}): SpanPropsBuilder<T> {
  return {
    props,
    underline(value?: Required<TextProps["underline"]>) {
      props.underline = value == null ? 1.0 : value;
      return this as unknown as T;
    },
    underlineColor(value) {
      props.underlineColor = value;
      return this as unknown as T;
    },
    overline(value?: Required<TextProps["overline"]>) {
      props.overline = value == null ? 1.0 : value;
      return this as unknown as T;
    },
    overlineColor(value) {
      props.overlineColor = value;
      return this as unknown as T;
    },
    lineThrough(value?: Required<TextProps["lineThrough"]>) {
      props.lineThrough = value == null ? 1.0 : value;
      return this as unknown as T;
    },
    lineThroughColor(value) {
      props.lineThroughColor = value;
      return this as unknown as T;
    },

    highlight(value) {
      props.highlightColor = value;
      return this as unknown as T;
    },
    offsetY(value) {
      props.offsetY = value;
      return this as unknown as T;
    },
    color(value: Required<TextProps["color"]>): T {
      props.color = value;
      return this as unknown as T;
    },
    size(value: Required<TextProps["size"]>): T {
      props.size = value;
      return this as unknown as T;
    },
    font(...values: Required<TextProps["font"]>): T {
      props.font = values;
      return this as unknown as T;
    },
    style(value: Required<TextProps["style"]>): T {
      props.style = value;
      return this as unknown as T;
    },
    weight(value: Required<TextProps["weight"]>): T {
      props.weight = value;
      return this as unknown as T;
    },
    letterSpacing(value: Required<TextProps["letterSpacing"]>): T {
      props.letterSpacing = value;
      return this as unknown as T;
    },
    wordSpacing(value: Required<TextProps["wordSpacing"]>): T {
      props.wordSpacing = value;
      return this as unknown as T;
    },
    strokeColor(value: Required<TextProps["strokeColor"]>): T {
      props.strokeColor = value;
      return this as unknown as T;
    },
    strokeWidth(value: Required<TextProps["strokeWidth"]>): T {
      props.strokeWidth = value;
      return this as unknown as T;
    },
    dropShadow(...values: Required<TextProps["dropShadows"]>): T {
      if (props.dropShadows == null) {
        props.dropShadows = [];
      }
      props.dropShadows.push(...values);
      return this as unknown as T;
    },
  };
}

function textPropsBuilder<T>(props: TextProps = {}): TextPropsBuilder<T> {
  return {
    ...layoutPropsBuilder<T>(props),
    ...spanPropsBuilder(props),
    nowrap(): T {
      props.nowrap = true;
      return this as unknown as T;
    },
    wrap(value?: boolean): T {
      props.nowrap = !value;
      return this as unknown as T;
    },
    lineHeight(value: Required<TextProps["lineHeight"]>): T {
      props.lineHeight = value;
      return this as unknown as T;
    },
    align(value: Required<TextProps["align"]>): T {
      props.align = value;
      return this as unknown as T;
    },
    indent(value: Required<TextProps["indentSize"]>): T {
      props.indentSize = value;
      return this as unknown as T;
    },
    hangingIndent(value: Required<TextProps["hangingIndentSize"]>): T {
      props.hangingIndentSize = value;
      return this as unknown as T;
    },
    props,
  };
}

/**
 * Creates a styled text span
 * @param children - the text content
 * @example Span("Hello").color("red").size(16)
 */
export function Span(children: string): SpanNode {
  return {
    type: "span",
    children,
    ...spanPropsBuilder(),
  };
}

function textDefaultPropsBuilder<T>(
  props: TextDefaultProps,
): TextDefaultPropsBuilder<T> {
  return {
    ...spanPropsBuilder(props),
    nowrap(): T {
      props.nowrap = true;
      return this as unknown as T;
    },
    wrap(value?: boolean): T {
      props.nowrap = !value;
      return this as unknown as T;
    },
    lineHeight(value: Required<TextProps["lineHeight"]>): T {
      props.lineHeight = value;
      return this as unknown as T;
    },
    align(value: Required<TextProps["align"]>): T {
      props.align = value;
      return this as unknown as T;
    },
    indent(value: Required<TextProps["indentSize"]>): T {
      props.indentSize = value;
      return this as unknown as T;
    },
    props,
  };
}

/**
 * Creates a text defaults container for cascading text properties
 * @param children - child nodes that will inherit text properties
 * @example TextDefault(Text("Hello")).color("blue") // all child text inherits blue color
 */
export function TextDefault(...children: SoneNode[]): TextDefaultNode {
  return {
    type: "text-default",
    children,
    ...textDefaultPropsBuilder({}),
  };
}

/**
 * Creates a text block with mixed content
 * @param children - strings and span nodes
 * @example Text("Hello ", Span("world").color("red")).size(14)
 */
export function Text(
  ...children: Array<SpanNode | string | undefined | null>
): TextNode {
  return {
    type: "text",
    children: children.filter((c) => c != null),
    ...textPropsBuilder(),
  };
}

/**
 * Creates a vertical layout container
 * @param children - child nodes to layout vertically
 * @example Column(Text("Top"), Text("Bottom")).gap(10)
 */
export function Column(...children: SoneNode[]): ColumnNode {
  return {
    type: "column",
    children,
    ...layoutPropsBuilder(),
  };
}

/**
 * Creates a horizontal layout container
 * @param children - child nodes to layout horizontally
 * @example Row(Text("Left"), Text("Right")).gap(10)
 */
export function Row(...children: SoneNode[]): RowNode {
  return {
    type: "row",
    children,
    ...layoutPropsBuilder(),
  };
}

/**
 * Creates an image display node
 * @param src - image URL or buffer data, resolved before rendering
 * @example Photo("./image.jpg").size(200, 100).scaleType("cover")
 */
export function Photo(src: string | Uint8Array): PhotoNode {
  const props: PhotoProps = { src };

  return {
    type: "photo",
    ...layoutPropsBuilder(props),
    scaleType(value, alignment) {
      props.scaleType = value;
      if (typeof alignment === "string") {
        switch (alignment) {
          case "center":
            props.scaleAlignment = 1 / 2;
            break;
          case "end":
            props.scaleAlignment = 1;
            break;
          case "start":
            props.scaleAlignment = 0;
            break;
        }
      } else {
        props.scaleAlignment = alignment;
      }
      return this;
    },
    preserveAspectRatio(value = true) {
      props.preserveAspectRatio = value;
      return this;
    },
    flipVertical(value = true) {
      props.flipVertical = value;
      return this;
    },
    flipHorizontal(value = true) {
      props.flipHorizontal = value;
      return this;
    },
    fill(value) {
      props.fill = value;
      return this;
    },
  };
}

/**
 * SVG path drawing properties
 */
export interface PathProps extends LayoutProps {
  /** SVG path data @example "M10,10 L20,20 Z" */
  d: string;
  /** path bounding box [left, top, right, bottom] (computed) */
  bounds?: number[];
  /** outline color */
  stroke?: ColorValue;
  strokeWidth?: number;
  strokeLineCap?: "butt" | "round" | "square";
  strokeLineJoin?: "bevel" | "miter" | "round";
  strokeMiterLimit?: number;
  /** dash pattern @example [5, 5] = 5px dash, 5px gap */
  strokeDashArray?: number[];
  strokeDashOffset?: number;
  /** fill color */
  fill?: ColorValue;
  /** @param value 0.0 to 1.0 */
  fillOpacity?: number;
  fillRule?: "evenodd" | "nonzero";
  /** uniform scaling of the path */
  scalePath?: number;
}

export interface PathPropsBuilder<T> extends LayoutPropsBuilder<T, PathProps> {
  stroke(value: Required<PathProps["stroke"]>): T;
  strokeWidth(value: Required<PathProps["strokeWidth"]>): T;
  strokeLineCap(value: Required<PathProps["strokeLineCap"]>): T;
  strokeLineJoin(value: Required<PathProps["strokeLineJoin"]>): T;
  strokeMiterLimit(value: Required<PathProps["strokeMiterLimit"]>): T;
  strokeDashArray(...values: Required<PathProps["strokeDashArray"]>): T;
  strokeDashOffset(value: Required<PathProps["strokeDashOffset"]>): T;
  fill(value: Required<PathProps["fill"]>): T;
  fillOpacity(value: Required<PathProps["fillOpacity"]>): T;
  fillRule(value: Required<PathProps["fillRule"]>): T;
  scalePath(value: Required<PathProps["scalePath"]>): T;
}

/**
 * SVG path drawing node
 */
export interface PathNode extends PathPropsBuilder<PathNode> {
  type: "path";
}

export function pathPropsBuilder<T>(props: PathProps): PathPropsBuilder<T> {
  return {
    ...layoutPropsBuilder(props),
    props,
    stroke(value: Required<PathProps["stroke"]>): T {
      props.stroke = value;
      return this as unknown as T;
    },
    strokeWidth(value: Required<PathProps["strokeWidth"]>): T {
      props.strokeWidth = value;
      return this as unknown as T;
    },
    strokeLineCap(value: Required<PathProps["strokeLineCap"]>): T {
      props.strokeLineCap = value;
      return this as unknown as T;
    },
    strokeLineJoin(value: Required<PathProps["strokeLineJoin"]>): T {
      props.strokeLineJoin = value;
      return this as unknown as T;
    },
    strokeMiterLimit(value: Required<PathProps["strokeMiterLimit"]>): T {
      props.strokeMiterLimit = value;
      return this as unknown as T;
    },
    strokeDashArray(...values: Required<PathProps["strokeDashArray"]>): T {
      props.strokeDashArray = values;
      return this as unknown as T;
    },
    strokeDashOffset(value: Required<PathProps["strokeDashOffset"]>): T {
      props.strokeDashOffset = value;
      return this as unknown as T;
    },
    fill(value: Required<PathProps["fill"]>): T {
      props.fill = value;
      return this as unknown as T;
    },
    fillOpacity(value: Required<PathProps["fillOpacity"]>): T {
      props.fillOpacity = value;
      return this as unknown as T;
    },
    fillRule(value: Required<PathProps["fillRule"]>): T {
      props.fillRule = value;
      return this as unknown as T;
    },
    scalePath(value: Required<PathProps["scalePath"]>): T {
      props.scalePath = value;
      return this as unknown as T;
    },
  };
}

/**
 * Creates an SVG path drawing node
 * @param d - SVG path data string
 * @example Path("M10,10 L50,50 Z").fill("red").stroke("black").strokeWidth(2)
 */
export function Path(d: string): PathNode {
  const props: PathProps = { d };
  return {
    type: "path",
    ...pathPropsBuilder(props),
    props,
  };
}

// FIXME: Table doesn't support children layout similar to Text component
export interface TableProps extends LayoutProps {
  spacing?: number[];
}

export interface TablePropsBuilder<T>
  extends LayoutPropsBuilder<T, TableProps> {
  spacing(...values: Required<TableProps["spacing"]>): T;
}

export interface TableNode extends TablePropsBuilder<TableNode> {
  type: "table";
  children: Array<TableRowNode | undefined | null>;
}

export interface TableRowProps extends LayoutProps {}

export interface TableRowPropsBuilder<T>
  extends LayoutPropsBuilder<T, TableRowProps> {}

export interface TableRowNode extends TableRowPropsBuilder<TableRowNode> {
  type: "table-row";
  children: Array<TextDefaultNode | TableCellNode | null | undefined>;
}

export function Table(...children: TableRowNode[]): TableNode {
  const props: TableProps = {};
  return {
    type: "table",
    children,
    ...layoutPropsBuilder(props),
    spacing(...values) {
      props.spacing = values;
      return this;
    },
  };
}

export function TableRow(
  ...children: Array<TextDefaultNode | TableCellNode | null | undefined>
): TableRowNode {
  const props: TableRowProps = {};

  return {
    type: "table-row",
    children,
    ...layoutPropsBuilder(props),
  };
}

export interface TableCellProps extends LayoutProps {
  colspan?: number;
  rowspan?: number;
}

export interface TableCellPropsBuilder<T>
  extends LayoutPropsBuilder<T, TableCellProps> {
  colspan: (value: Required<TableCellProps["colspan"]>) => T;
  rowspan: (value: Required<TableCellProps["rowspan"]>) => T;
}

export interface TableCellNode extends TableCellPropsBuilder<TableCellNode> {
  type: "table-cell";
  children: SoneNode[];
}

export function TableCell(...children: SoneNode[]): TableCellNode {
  const props: TableCellProps = {};

  return {
    type: "table-cell",
    children,
    ...layoutPropsBuilder(props),
    colspan(value) {
      props.colspan = value;
      return this;
    },
    rowspan(value) {
      props.rowspan = value;
      return this;
    },
    props,
  };
}
