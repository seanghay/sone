export const colors = {
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkgrey: "#a9a9a9",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  goldenrod: "#daa520",
  gold: "#ffd700",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  grey: "#808080",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavenderblush: "#fff0f5",
  lavender: "#e6e6fa",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgreen: "#90ee90",
  lightgrey: "#d3d3d3",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#db7093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  rebeccapurple: "#663399",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32",
} as const;

type Required<T> = T extends undefined ? never : T;

export type ColorValue = keyof typeof colors | (string & {});

export type LayoutPositionType = "static" | "relative" | "absolute";
export type FlexDirection = "column" | "column-reverse" | "row" | "row-reverse";
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

export interface LayoutProps {
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
  background?: ColorValue[];
  rotation?: number;
  scale?: number;
  cornerRadius?: number;
  cornerSmoothing?: number;
  opacity?: number;
  shadows?: string[];
  filters?: string[];

  // grid
  gridArea?: string;
  gridColumnEnd?: string | number;
  gridColumnStart?: string | number;
  gridRowEnd?: string | number;
  gridRowStart?: string | number;
}

interface LayoutPropsBuilder<T, P = LayoutProps> {
  props: P;
  // grid
  gridArea(value: Required<LayoutProps["gridArea"]>): T;
  gridColumnEnd(value: Required<LayoutProps["gridColumnEnd"]>): T;
  gridColumnStart(value: Required<LayoutProps["gridColumnStart"]>): T;
  gridRowEnd(value: Required<LayoutProps["gridRowEnd"]>): T;
  gridRowStart(value: Required<LayoutProps["gridRowStart"]>): T;

  // methods
  alignContent(value: Required<LayoutProps["alignContent"]>): T;
  alignItems(value: Required<LayoutProps["alignItems"]>): T;
  alignSelf(value: Required<LayoutProps["alignSelf"]>): T;
  aspectRatio(value: Required<LayoutProps["aspectRatio"]>): T;

  /**
   * When one value is specified, it applies the same margin to all four sides.
   * When two values are specified, the first margin applies to the top and bottom, the second to the left and right.
   * When three values are specified, the first margin applies to the top, the second to the right and left, the third to the bottom.
   * When four values are specified, the margins apply to the top, right, bottom, and left in that order (clockwise).
   */
  borderWidth(all: number): T;
  borderWidth(topBottom: number, leftRight: number): T;
  borderWidth(top: number, leftRight: number, bottom: number): T;
  borderWidth(top: number, right: number, bottom: number, left: number): T;

  borderColor(value: Required<LayoutProps["borderColor"]>): T;

  // margin
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

  // padding
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

  // size
  size(width: number, height?: number): T;
  width(value: Required<LayoutProps["width"]>): T;
  height(value: Required<LayoutProps["height"]>): T;

  maxWidth(value: Required<LayoutProps["maxWidth"]>): T;
  maxHeight(value: Required<LayoutProps["maxHeight"]>): T;

  minWidth(value: Required<LayoutProps["minWidth"]>): T;
  minHeight(value: Required<LayoutProps["minHeight"]>): T;

  position(value: Required<LayoutProps["position"]>): T;
  inset(value: Required<LayoutProps["inset"]>): T;
  overflow(value: Required<LayoutProps["overflow"]>): T;

  // transform
  rotate(value: number): T;
  scale(value: number): T;

  // style
  bg(...values: Required<LayoutProps["background"]>): T;
  background(...values: Required<LayoutProps["background"]>): T;
  opacity(value: Required<LayoutProps["opacity"]>): T;

  // border radius
  borderRadius(value: Required<LayoutProps["cornerRadius"]>): T;
  borderSmoothing(value: Required<LayoutProps["cornerSmoothing"]>): T;
  cornerRadius(value: Required<LayoutProps["cornerRadius"]>): T;
  cornerSmoothing(value: Required<LayoutProps["cornerSmoothing"]>): T;

  // filters
  shadow(...values: string[]): T;
  blur(value: number): T;
  brightness(value: number): T;
  contrast(value: number): T;
  grayscale(value: number): T;
  huerotate(value: number): T;
  invert(value: number): T;
  saturate(value: number): T;
  sepia(value: number): T;
}

export interface GridProps extends LayoutProps {
  gridAutoFlow?: string;
  gridAutoColumns?: string;
  gridAutoRows?: string;
  gridColumnGap?: string | number;
  gridRowGap?: string | number;
  gridTemplateAreas?: string | string[][];
  gridTemplateRows?: string;
  gridTemplateColumns?: string;
}

export interface GridPropsBuilder<T> extends LayoutPropsBuilder<T> {
  gridAutoFlow(value: Required<GridProps["gridAutoFlow"]>): T;
  gridAutoColumns(value: Required<GridProps["gridAutoColumns"]>): T;
  gridAutoRows(value: Required<GridProps["gridAutoRows"]>): T;
  gridColumnGap(value: Required<GridProps["gridColumnGap"]>): T;
  gridRowGap(value: Required<GridProps["gridRowGap"]>): T;
  gridTemplateAreas(value: Required<GridProps["gridTemplateAreas"]>): T;
  gridTemplateRows(value: Required<GridProps["gridTemplateRows"]>): T;
  gridTemplateColumns(value: Required<GridProps["gridTemplateColumns"]>): T;
}

export interface GridNode extends GridPropsBuilder<GridNode> {
  type: "grid";
  children: SoneNode[];
}

export interface PhotoProps extends LayoutProps {
  scaleType?: "cover" | "fill" | "contain";
  src?: string;
}

export interface PhotoPropsBuilder<T>
  extends LayoutPropsBuilder<T, PhotoProps> {
  scaleType(value: Required<PhotoProps["scaleType"]>): T;
}

export interface PhotoNode extends PhotoPropsBuilder<PhotoNode> {
  type: "photo";
}

export type FontValue = "sans-serif" | "serif" | "monospace" | (string & {});

export interface SpanProps {
  size?: number;
  color?: ColorValue;
  font?: FontValue;
  style?: "normal" | "italic" | "oblique";
  weight?: "normal" | "bold" | "lighter" | "bolder" | ("string" & {}) | number;
  letterSpacing?: number;
}

export interface TextProps extends SpanProps, LayoutProps {
  nowrap?: boolean;
  lineHeight?: number;
  indentSize?: number;
  align?: "left" | "right" | "center" | "justify";
}

export interface SpanPropsBuilder<T> {
  props: SpanProps;
  color: (value: Required<TextProps["color"]>) => T;
  size: (value: Required<TextProps["size"]>) => T;
  font: (value: Required<TextProps["font"]>) => T;
  style: (value: Required<TextProps["style"]>) => T;
  weight: (value: Required<TextProps["weight"]>) => T;
  letterSpacing: (value: Required<TextProps["letterSpacing"]>) => T;
}

export interface SpanNode extends SpanPropsBuilder<SpanNode> {
  type: "span";
  children: string[];
}

export interface TextPropsBuilder<T>
  extends Omit<
      LayoutPropsBuilder<T, TextProps>,
      | "size"
      | "position"
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
  indentSize(value: Required<TextProps["indentSize"]>): T;
}

export interface TextNode extends TextPropsBuilder<TextNode> {
  type: "text";
  children: Array<string | SpanNode>;
}

export interface RowNode extends LayoutPropsBuilder<RowNode> {
  type: "row";
  children: SoneNode[];
}

export interface ColumnNode extends LayoutPropsBuilder<ColumnNode> {
  type: "column";
  children: SoneNode[];
}

export type SoneNode =
  | ColumnNode
  | RowNode
  | TextNode
  | PhotoNode
  | GridNode
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
    gridArea(value: Required<LayoutProps["gridArea"]>): T {
      props.gridArea = value;
      return this;
    },
    gridColumnEnd(value: Required<LayoutProps["gridColumnEnd"]>): T {
      props.gridColumnEnd = value;
      return this;
    },
    gridColumnStart(value: Required<LayoutProps["gridColumnStart"]>): T {
      props.gridColumnStart = value;
      return this;
    },
    gridRowEnd(value: Required<LayoutProps["gridRowEnd"]>): T {
      props.gridRowEnd = value;
      return this;
    },
    gridRowStart(value: Required<LayoutProps["gridRowStart"]>): T {
      props.gridRowStart = value;
      return this;
    },
    alignContent(value: Required<LayoutProps["alignContent"]>): T {
      props.alignContent = value;
      return this;
    },
    alignItems(value: Required<LayoutProps["alignItems"]>): T {
      props.alignItems = value;
      return this;
    },
    alignSelf(value: Required<LayoutProps["alignSelf"]>): T {
      props.alignSelf = value;
      return this;
    },
    aspectRatio(value: Required<LayoutProps["aspectRatio"]>): T {
      props.aspectRatio = value;
      return this;
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
        return this;
      }

      // topBottom, leftRight
      if (right != null && bottom == null && left == null) {
        props.borderTopWidth = top;
        props.borderBottomWidth = top;
        props.borderLeftWidth = right;
        props.borderRightWidth = right;
        return this;
      }

      // top, leftRight, bottom
      if (right != null && bottom != null && left == null) {
        props.borderTopWidth = top;
        props.borderBottomWidth = bottom;
        props.borderLeftWidth = right;
        props.borderRightWidth = right;
        return this;
      }

      props.borderTopWidth = top;
      props.borderBottomWidth = bottom;
      props.borderLeftWidth = left;
      props.borderRightWidth = right;
      return this;
    },
    borderColor(value: Required<LayoutProps["borderColor"]>): T {
      props.borderColor = value;
      return this;
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
        return this;
      }

      // topBottom, leftRight
      if (right != null && bottom == null && left == null) {
        props.marginTop = top;
        props.marginBottom = top;
        props.marginLeft = right;
        props.marginRight = right;
        return this;
      }

      // top, leftRight, bottom
      if (right != null && bottom != null && left == null) {
        props.marginTop = top;
        props.marginLeft = right;
        props.marginRight = right;
        props.marginBottom = bottom;
        return this;
      }

      props.marginTop = top;
      props.marginLeft = left;
      props.marginRight = right;
      props.marginBottom = bottom;
      return this;
    },
    marginTop(value: Required<LayoutProps["marginTop"]>): T {
      props.marginTop = value;
      return this;
    },
    marginBottom(value: Required<LayoutProps["marginBottom"]>): T {
      props.marginBottom = value;
      return this;
    },
    marginLeft(value: Required<LayoutProps["marginLeft"]>): T {
      props.marginLeft = value;
      return this;
    },
    marginRight(value: Required<LayoutProps["marginRight"]>): T {
      props.marginRight = value;
      return this;
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
        return this;
      }

      // topBottom, leftRight
      if (right != null && bottom == null && left == null) {
        props.paddingTop = top;
        props.paddingBottom = top;
        props.paddingLeft = right;
        props.paddingRight = right;
        return this;
      }

      // top, leftRight, bottom
      if (right != null && bottom != null && left == null) {
        props.paddingTop = top;
        props.paddingLeft = right;
        props.paddingRight = right;
        props.paddingBottom = bottom;
        return this;
      }

      props.paddingTop = top;
      props.paddingLeft = left;
      props.paddingRight = right;
      props.paddingBottom = bottom;
      return this;
    },
    paddingTop(value: Required<LayoutProps["paddingTop"]>): T {
      props.paddingTop = value;
      return this;
    },
    paddingBottom(value: Required<LayoutProps["paddingBottom"]>): T {
      props.paddingBottom = value;
      return this;
    },
    paddingLeft(value: Required<LayoutProps["paddingLeft"]>): T {
      props.paddingLeft = value;
      return this;
    },
    paddingRight(value: Required<LayoutProps["paddingRight"]>): T {
      props.paddingRight = value;
      return this;
    },
    boxSizing(value: Required<LayoutProps["boxSizing"]>): T {
      props.boxSizing = value;
      return this;
    },
    display(value: Required<LayoutProps["display"]>): T {
      props.display = value;
      return this;
    },
    flex(value: Required<LayoutProps["flex"]>): T {
      props.flex = value;
      return this;
    },
    basis(value: Required<LayoutProps["flexBasis"]>): T {
      props.flexBasis = value;
      return this;
    },
    direction(value: Required<LayoutProps["flexDirection"]>): T {
      props.flexDirection = value;
      return this;
    },
    rowGap(value: Required<LayoutProps["rowGap"]>): T {
      props.rowGap = value;
      return this;
    },
    gap(value: Required<LayoutProps["gap"]>): T {
      props.gap = value;
      return this;
    },
    columnGap(value: Required<LayoutProps["columnGap"]>): T {
      props.columnGap = value;
      return this;
    },
    grow(value: Required<LayoutProps["flexGrow"]>): T {
      props.flexGrow = value;
      return this;
    },
    shrink(value: Required<LayoutProps["flexShrink"]>): T {
      props.flexShrink = value;
      return this;
    },
    wrap(value: Required<LayoutProps["flexWrap"]>): T {
      props.flexWrap = value;
      return this;
    },
    justifyContent(value: Required<LayoutProps["justifyContent"]>): T {
      props.justifyContent = value;
      return this;
    },
    left(value: Required<LayoutProps["left"]>): T {
      props.left = value;
      return this;
    },
    right(value: Required<LayoutProps["right"]>): T {
      props.right = value;
      return this;
    },
    bottom(value: Required<LayoutProps["bottom"]>): T {
      props.bottom = value;
      return this;
    },
    top(value: Required<LayoutProps["top"]>): T {
      props.top = value;
      return this;
    },
    start(value: Required<LayoutProps["start"]>): T {
      props.start = value;
      return this;
    },
    end(value: Required<LayoutProps["end"]>): T {
      props.end = value;
      return this;
    },
    size(width: number, height?: number): T {
      props.width = width;
      props.height = height == null ? width : height;
      return this;
    },
    width(value: Required<LayoutProps["width"]>): T {
      props.width = value;
      return this;
    },
    height(value: Required<LayoutProps["height"]>): T {
      props.height = value;
      return this;
    },
    maxWidth(value: Required<LayoutProps["maxWidth"]>): T {
      props.maxWidth = value;
      return this;
    },
    maxHeight(value: Required<LayoutProps["maxHeight"]>): T {
      props.maxHeight = value;
      return this;
    },
    minWidth(value: Required<LayoutProps["minWidth"]>): T {
      props.minWidth = value;
      return this;
    },
    minHeight(value: Required<LayoutProps["minHeight"]>): T {
      props.minHeight = value;
      return this;
    },
    position(value: Required<LayoutProps["position"]>): T {
      props.position = value;
      return this;
    },
    inset(value: Required<LayoutProps["inset"]>): T {
      props.inset = value;
      return this;
    },
    overflow(value: Required<LayoutProps["overflow"]>): T {
      props.overflow = value;
      return this;
    },
    rotate(value: number): T {
      props.rotation = value;
      return this;
    },
    scale(value: number): T {
      props.scale = value;
      return this;
    },
    bg(...values: Required<LayoutProps["background"]>): T {
      addBackground(...values);
      return this;
    },
    background(...values: Required<LayoutProps["background"]>): T {
      addBackground(...values);
      return this;
    },
    opacity(value: number): T {
      props.opacity = value;
      return this;
    },
    borderRadius(value: number): T {
      props.cornerRadius = value;
      return this;
    },
    borderSmoothing(value: number): T {
      props.cornerSmoothing = value;
      return this;
    },
    cornerRadius(value: number): T {
      props.cornerRadius = value;
      return this;
    },
    cornerSmoothing(value: number): T {
      props.cornerSmoothing = value;
      return this;
    },
    shadow(...values: string[]): T {
      if (props.shadows == null) {
        props.shadows = [];
      }
      props.shadows.push(...values);
      return this;
    },
    blur(value: number): T {
      addFilter(`blur(${value}px)`);
      return this;
    },
    brightness(value: number): T {
      addFilter(`brightness(${value})`);
      return this;
    },
    contrast(value: number): T {
      addFilter(`contrast(${value})`);
      return this;
    },
    grayscale(value: number): T {
      addFilter(`grayscale(${value})`);
      return this;
    },
    huerotate(value: number): T {
      addFilter(`hue-rotate(${value})`);
      return this;
    },
    invert(value: number): T {
      addFilter(`invert(${value})`);
      return this;
    },
    saturate(value: number): T {
      addFilter(`saturate(${value})`);
      return this;
    },
    sepia(value: number): T {
      addFilter(`sepia(${value})`);
      return this;
    },
  };
}

function spanPropsBuilder<T>(props: SpanProps = {}): SpanPropsBuilder<T> {
  return {
    props,
    color(value: Required<TextProps["color"]>): T {
      props.color = value;
      return this;
    },
    size(value: Required<TextProps["size"]>): T {
      props.size = value;
      return this;
    },
    font(value: Required<TextProps["font"]>): T {
      props.font = value;
      return this;
    },
    style(value: Required<TextProps["style"]>): T {
      props.style = value;
      return this;
    },
    weight(value: Required<TextProps["weight"]>): T {
      props.weight = value;
      return this;
    },
    letterSpacing(value: Required<TextProps["letterSpacing"]>): T {
      props.letterSpacing = value;
      return this;
    },
  };
}

function textPropsBuilder<T>(props: TextProps = {}): TextPropsBuilder<T> {
  return {
    ...layoutPropsBuilder<T>(props),
    ...spanPropsBuilder(props),
    nowrap(): T {
      props.nowrap = true;
      return this;
    },
    wrap(value?: boolean): T {
      props.nowrap = !value;
      return this;
    },
    lineHeight(value: Required<TextProps["lineHeight"]>): T {
      props.lineHeight = value;
      return this;
    },
    align(value: Required<TextProps["align"]>): T {
      props.align = value;
      return this;
    },
    indentSize(value: Required<TextProps["indentSize"]>): T {
      props.indentSize = value;
      return this;
    },
    props,
  };
}

export function Span(...children: Array<string | undefined | null>): SpanNode {
  return {
    type: "span",
    children: children.filter((value) => value != null),
    ...spanPropsBuilder(),
  };
}

export function Text(
  ...children: Array<SpanNode | string | undefined | null>
): TextNode {
  return {
    type: "text",
    children: children.filter((c) => c != null),
    ...textPropsBuilder(),
  };
}

export function Column(...children: SoneNode[]): ColumnNode {
  return {
    type: "column",
    children,
    ...layoutPropsBuilder({ flexDirection: "column" }),
  };
}

export function Row(...children: SoneNode[]): RowNode {
  return {
    type: "row",
    children,
    ...layoutPropsBuilder({ flexDirection: "row" }),
  };
}

export function Photo(src: string): PhotoNode {
  const props: PhotoProps = { src };

  return {
    type: "photo",
    ...layoutPropsBuilder(props),
    scaleType(value) {
      props.scaleType = value;
      return this;
    },
  };
}

function gridPropsBuilder<T>(props: GridProps): GridPropsBuilder<T> {
  return {
    ...layoutPropsBuilder(props),
    props,
    gridAutoFlow(value: Required<GridProps["gridAutoFlow"]>): T {
      props.gridAutoFlow = value;
      return this;
    },
    gridAutoColumns(value: Required<GridProps["gridAutoColumns"]>): T {
      props.gridAutoColumns = value;
      return this;
    },
    gridAutoRows(value: Required<GridProps["gridAutoRows"]>): T {
      props.gridAutoRows = value;
      return this;
    },
    gridColumnGap(value: Required<GridProps["gridColumnGap"]>): T {
      props.gridColumnGap = value;
      return this;
    },
    gridRowGap(value: Required<GridProps["gridRowGap"]>): T {
      props.gridRowGap = value;
      return this;
    },
    gridTemplateAreas(value: Required<GridProps["gridTemplateAreas"]>): T {
      props.gridTemplateAreas = value;
      return this;
    },
    gridTemplateRows(value: Required<GridProps["gridTemplateRows"]>): T {
      props.gridTemplateRows = value;
      return this;
    },
    gridTemplateColumns(value: Required<GridProps["gridTemplateColumns"]>): T {
      props.gridTemplateColumns = value;
      return this;
    },
  };
}

export function Grid(...children: SoneNode[]): GridNode {
  const props: GridProps = {};
  return {
    type: "grid",
    children,
    ...gridPropsBuilder(props),
  };
}

const tree = Column(
  Row(
    Text(
      "hello, ",
      Span("world!").color("red").weight("bold").font("monospace"),
    )
      .size(44)
      .color("black")
      .indentSize(24)
      .nowrap()
      .lineHeight(1.4)
      .margin(10, 20),
    Photo("https://example.com/img.jpg").scale(1).scaleType("cover"),
    Grid(
      Text("Hello World").gridRowEnd(2).padding(32),
      Text("Hello World").gridRowEnd(2),
      Text("Hello World").gridRowEnd(2),
    )
      .gridTemplateColumns("1fr 1fr")
      .gridTemplateRows("2fr 1fr")
      .margin(20),
  )
    .padding(10)
    .bg("red")
    .gap(20)
    .flex(1)
    .grow(1)
    .alignContent("center")
    .alignItems("center"),
)
  .margin(30, 120)
  .justifyContent("center")
  .blur(30)
  .saturate(10);

console.log(JSON.stringify(tree, null, 2));
