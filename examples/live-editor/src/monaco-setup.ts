import type * as Monaco from "monaco-editor";

export function setupMonaco(monaco: typeof Monaco) {
  const ts = monaco.languages.typescript;

  ts.typescriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    allowNonTsExtensions: true,
    lib: ["es2020", "dom"],
    strict: false,
  });

  ts.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    diagnosticCodesToIgnore: [2304, 2339, 2686, 7016, 1375, 1378],
  });

  ts.typescriptDefaults.addExtraLib(SONE_TYPES, "file:///sone.d.ts");
}

const SONE_TYPES = `
declare module "sone" {
  export type ColorValue = string;
  export type FontValue = "sans-serif" | "serif" | "monospace" | (string & {});
  export type FlexDirection = "column" | "column-reverse" | "row" | "row-reverse";
  export type AlignItems = "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  export type AlignContent = "flex-start" | "flex-end" | "center" | "stretch" | "space-between" | "space-around" | "space-evenly";
  export type JustifyContent = "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
  export type LayoutPositionType = "static" | "relative" | "absolute";
  export type GridTrack = number | "auto" | \`\${number}fr\`;

  interface LayoutMethods<T> {
    flex(value: number): T;
    grow(value: number): T;
    shrink(value: number): T;
    basis(value: number | string): T;
    direction(value: FlexDirection): T;
    wrap(value?: boolean): T;
    gap(value: number): T;
    rowGap(value: number): T;
    columnGap(value: number): T;
    justifyContent(value: JustifyContent): T;
    alignItems(value: AlignItems): T;
    alignContent(value: AlignContent): T;
    alignSelf(value: AlignItems): T;
    width(value: number | string): T;
    height(value: number | string): T;
    size(value: number | string): T;
    minWidth(value: number | string): T;
    minHeight(value: number | string): T;
    maxWidth(value: number | string): T;
    maxHeight(value: number | string): T;
    aspectRatio(value: number): T;
    margin(value: number | string): T;
    margin(top: number, right: number, bottom?: number, left?: number): T;
    marginTop(value: number): T;
    marginRight(value: number): T;
    marginBottom(value: number): T;
    marginLeft(value: number): T;
    padding(value: number | string): T;
    padding(top: number, right: number, bottom?: number, left?: number): T;
    paddingTop(value: number): T;
    paddingRight(value: number): T;
    paddingBottom(value: number): T;
    paddingLeft(value: number): T;
    position(value: LayoutPositionType): T;
    top(value: number): T;
    right(value: number): T;
    bottom(value: number): T;
    left(value: number): T;
    borderWidth(value: number | string): T;
    borderColor(value: ColorValue): T;
    bg(value: ColorValue | string): T;
    background(value: ColorValue | string): T;
    cornerRadius(value: number | number[]): T;
    borderRadius(value: number | string): T;
    opacity(value: number): T;
    shadow(value: string): T;
    rotate(value: number): T;
    scale(value: number): T;
    scaleX(value: number): T;
    scaleY(value: number): T;
    translateX(value: number): T;
    translateY(value: number): T;
    blur(value: number): T;
    brightness(value: number): T;
    contrast(value: number): T;
    grayscale(value: number): T;
    overflow(value: "visible" | "hidden" | "scroll"): T;
    display(value: "none" | "flex" | "contents"): T;
    tag(value: string): T;
    apply(fn: (node: T) => T): T;
  }

  interface SpanMethods<T> extends LayoutMethods<T> {
    size(value: number): T;
    color(value: ColorValue): T;
    font(...families: FontValue[]): T;
    weight(value: "normal" | "bold" | "lighter" | "bolder" | number | string): T;
    style(value: "normal" | "italic" | "oblique"): T;
    letterSpacing(value: number): T;
    wordSpacing(value: number): T;
    underline(value?: number): T;
    lineThrough(value?: number): T;
    overline(value?: number): T;
    highlight(value: ColorValue | null): T;
    dropShadow(value: string): T;
    strokeColor(value: ColorValue): T;
    strokeWidth(value: number): T;
    offsetY(value: number): T;
  }

  export interface SpanNode extends SpanMethods<SpanNode> { readonly type: "span"; }
  export interface ColumnNode extends LayoutMethods<ColumnNode> { readonly type: "column"; }
  export interface RowNode extends LayoutMethods<RowNode> { readonly type: "row"; }
  export interface GridNode extends LayoutMethods<GridNode> {
    readonly type: "grid";
    columns(...tracks: GridTrack[]): GridNode;
    rows(...tracks: GridTrack[]): GridNode;
    autoRows(...tracks: GridTrack[]): GridNode;
    autoColumns(...tracks: GridTrack[]): GridNode;
    gridColumn(start: number, span?: number): GridNode;
    gridRow(start: number, span?: number): GridNode;
  }
  export interface TextNode extends SpanMethods<TextNode> {
    readonly type: "text";
    maxLines(value: number): TextNode;
    lineHeight(value: number): TextNode;
    align(value: "left" | "right" | "center" | "justify"): TextNode;
    nowrap(): TextNode;
    wrap(): TextNode;
    indent(value: number): TextNode;
    textOverflow(value: "clip" | "ellipsis"): TextNode;
    lineBreak(value: "greedy" | "knuth-plass"): TextNode;
    autofit(value?: boolean): TextNode;
  }
  export interface PhotoNode extends LayoutMethods<PhotoNode> {
    readonly type: "photo";
    scaleType(type: "cover" | "contain" | "fill", alignment?: number): PhotoNode;
    preserveAspectRatio(value?: boolean): PhotoNode;
    flipHorizontal(value?: boolean): PhotoNode;
    flipVertical(value?: boolean): PhotoNode;
    fill(color: ColorValue): PhotoNode;
    clipPath(path: string): PhotoNode;
  }
  export interface PathNode extends LayoutMethods<PathNode> {
    readonly type: "path";
    stroke(color: ColorValue): PathNode;
    strokeWidth(value: number): PathNode;
    strokeLineCap(value: "butt" | "round" | "square"): PathNode;
    strokeLineJoin(value: "bevel" | "miter" | "round"): PathNode;
    fill(color: ColorValue): PathNode;
    fillOpacity(value: number): PathNode;
    fillRule(value: "evenodd" | "nonzero"): PathNode;
    scalePath(value: number): PathNode;
  }
  export interface TableNode extends LayoutMethods<TableNode> { readonly type: "table"; spacing(...values: number[]): TableNode; }
  export interface TableRowNode extends LayoutMethods<TableRowNode> { readonly type: "tableRow"; }
  export interface TableCellNode extends LayoutMethods<TableCellNode> { readonly type: "tableCell"; colspan(value: number): TableCellNode; rowspan(value: number): TableCellNode; }
  export interface ListNode extends LayoutMethods<ListNode> {
    readonly type: "list";
    listStyle(value: "disc" | "circle" | "square" | "decimal" | "dash" | "none" | string): ListNode;
    markerGap(value: number): ListNode;
    markerOffset(value: number): ListNode;
    startIndex(value: number): ListNode;
  }
  export interface ListItemNode extends LayoutMethods<ListItemNode> { readonly type: "listItem"; }
  export interface TextDefaultNode extends LayoutMethods<TextDefaultNode> { readonly type: "textDefault"; }
  export interface ClipGroupNode extends LayoutMethods<ClipGroupNode> { readonly type: "clipGroup"; }

  export type SoneNode =
    | ColumnNode | RowNode | GridNode | TextNode | SpanNode
    | PhotoNode | PathNode | TableNode | TableRowNode | TableCellNode
    | ListNode | ListItemNode | TextDefaultNode | ClipGroupNode
    | null | undefined;

  export function Column(...children: SoneNode[]): ColumnNode;
  export function Row(...children: SoneNode[]): RowNode;
  export function Grid(...children: SoneNode[]): GridNode;
  export function Text(...children: Array<SpanNode | string | null | undefined>): TextNode;
  export function Span(text?: string): SpanNode;
  export function Photo(src: string | Uint8Array): PhotoNode;
  export function Path(d: string): PathNode;
  export function Table(...rows: TableRowNode[]): TableNode;
  export function TableRow(...cells: Array<TableCellNode | null | undefined>): TableRowNode;
  export function TableCell(...children: SoneNode[]): TableCellNode;
  export function List(...items: Array<ListItemNode | null | undefined>): ListNode;
  export function ListItem(...children: SoneNode[]): ListItemNode;
  export function TextDefault(...children: SoneNode[]): TextDefaultNode;
  export function ClipGroup(path: string, ...children: SoneNode[]): ClipGroupNode;
  export function PageBreak(): ColumnNode;

  export interface SoneRenderConfig {
    width?: number;
    height?: number;
    background?: ColorValue;
    pageHeight?: number;
  }

  export interface SoneRenderer {
    createCanvas(width: number, height: number): HTMLCanvasElement;
    measureText(text: string, props: any): TextMetrics;
    hasFont(name: string): boolean;
    registerFont(name: string, source: string | string[]): Promise<void>;
    unregisterFont(name: string): Promise<void>;
    resetFonts(): void;
    loadImage(src: string | Uint8Array): Promise<HTMLImageElement>;
    getDefaultTextProps(): any;
    dpr(): number;
    Path2D: typeof Path2D;
    debug(): { layout?: boolean; text?: boolean };
    breakIterator(text: string): Generator<number, void, unknown>;
  }

  export function render<T = HTMLCanvasElement>(node: SoneNode, renderer: SoneRenderer, config?: SoneRenderConfig): Promise<T>;
  export function renderPages<T = HTMLCanvasElement>(node: SoneNode, renderer: SoneRenderer, config?: SoneRenderConfig): Promise<T[]>;
  export const DEFAULT_TEXT_PROPS: any;
  export function defaultLineBreakerIterator(text: string): Generator<number, void, unknown>;
  export function fontBuilder(props: any): string;
  export function applySpanProps(ctx: CanvasRenderingContext2D, props: any): void;
  export function qrcode(data: string, options?: any): any;
}
`;

