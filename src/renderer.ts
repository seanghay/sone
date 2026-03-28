import { type GradientNode, parse } from "gradient-parser";
import { klona } from "klona";
import pick from "object.pick";
import pMemoize from "p-memoize";
import getBounds from "svg-path-bounds";
import {
  Edge,
  loadYoga,
  type MeasureFunction,
  MeasureMode,
  type Node,
  type Yoga as YogaLayout,
} from "yoga-layout/load";
import {
  type ColorValue,
  Column,
  type ColumnNode,
  type DefaultTextProps,
  type FontValue,
  type ListItemNode,
  type ListNode,
  type PathNode,
  type PhotoNode,
  type RowNode,
  type SoneNode,
  type SpanNode,
  type SpanProps,
  type TableCellNode,
  type TableNode,
  type TableRowNode,
  Text,
  type TextNode,
} from "./core.ts";
import { createGradientFillStyleList, isColor } from "./gradient.ts";
import type { SoneMetadata } from "./metadata.ts";
import { drawBorder } from "./op.ts";
import { drawPhoto } from "./photo.ts";
import { createSmoothRoundRect, parseRadius } from "./rect.ts";
import { applyPropsToYogaNode } from "./serde.ts";
import { type CssShadowProperties, parseShadow } from "./shadow.ts";
import { createParagraph, createTextRuns, drawTextNode } from "./text.ts";

/**
 * Some version of Node.js don't support top-level await,
 * therefore we have to instantiate it first and await it later when use it.
 */
const _yoga = loadYoga();

export async function getYogaLayout() {
  return _yoga;
}

/**
 * Default text styling properties used as fallbacks
 */
export const DEFAULT_TEXT_PROPS: DefaultTextProps = {
  size: 11,
  color: "black",
  font: ["sans-serif"],
  style: "normal",
  weight: 400,
  letterSpacing: 0,
  nowrap: false,
  lineHeight: Number.NaN,
  indentSize: 0,
  hangingIndentSize: 0,
  align: "left",
  strokeColor: "black",
  strokeWidth: 0,
  wordSpacing: 0,
  blocks: [],
  offsetY: 0,
  underline: 0,
  underlineColor: null,
  overline: 0,
  overlineColor: null,
  lineThrough: 0,
  lineThroughColor: null,
  highlightColor: null,
  dropShadows: [],
  autofit: false,
};

function filterNullishValues<T>(value: T) {
  return Object.fromEntries(
    Object.entries(value as unknown as object).filter(([_, v]) => v != null),
  );
}

function resolveMarker(
  listStyle: string | undefined,
  index: number,
  startIndex: number,
): string {
  switch (listStyle ?? "disc") {
    case "disc":
      return "•";
    case "circle":
      return "◦";
    case "square":
      return "▪";
    case "decimal":
      return `${startIndex + index}.`;
    case "dash":
      return "–";
    case "none":
      return "";
    default:
      return listStyle!;
  }
}

/**
 * Debug configuration for development
 */
export interface SoneDebugConfig {
  /** show text measurement debugging */
  text: boolean;
  /** show layout bounding boxes */
  layout: boolean;
}

/**
 * Platform-specific renderer interface for Node.js/browser environments
 */
export interface SoneRenderer {
  /** Generate word/character break points for text wrapping */
  breakIterator(text: string): Generator<number, void, boolean>;
  /** Create canvas with specified dimensions */
  createCanvas(width: number, height: number): HTMLCanvasElement;
  /** Measure text dimensions with given styling */
  measureText(text: string, props: SpanProps): TextMetrics;
  /** Check if font is available */
  hasFont(name: string): boolean;
  /** Register custom font from file/URL */
  registerFont(name: string, source: string[] | string): Promise<void>;
  /** Remove registered font */
  unregisterFont(name: string): Promise<void>;
  /** Clear all registered fonts */
  resetFonts(): void;
  /** Load image from URL or buffer */
  loadImage(src: string | Uint8Array): Promise<HTMLImageElement>;
  /** Get platform default text properties */
  getDefaultTextProps(): DefaultTextProps;
  /** Get device pixel ratio for high-DPI displays */
  dpr(): number;
  /** Path2D constructor for drawing paths */
  Path2D: typeof Path2D;
  /** Get debug configuration */
  debug(): SoneDebugConfig;
}

export type SoneImage = Awaited<ReturnType<SoneRenderer["loadImage"]>>;

/**
 * Context passed during node compilation phase
 */
export interface SoneCompileContext {
  /** Default text properties to inherit */
  defaultTextProps: DefaultTextProps;
  /** Image loading function */
  loadImage: SoneRenderer["loadImage"];
  /** Text breaking function */
  breakIterator: SoneRenderer["breakIterator"];
  createId: () => number;
}

function configurePhotoProps(
  node: PhotoNode,
  image: Awaited<ReturnType<SoneRenderer["loadImage"]>>,
) {
  const props = node.props;
  const ratio = image.width / image.height;

  if (props.preserveAspectRatio) {
    if (typeof props.width === "number" && typeof props.height !== "number") {
      props.height = Math.round(props.width / ratio);
    }

    if (typeof props.height === "number" && typeof props.width !== "number") {
      props.width = Math.round(props.height * ratio);
    }
  }

  if (props.width == null) props.width = image.width;
  if (props.height == null) props.height = image.height;
  props.image = image;
}

/**
 * Compile and resolve node tree - loads images, parses gradients, cascades text properties
 * @param node - root node to compile
 * @param context - compilation context with defaults and functions
 * @returns compiled node tree ready for layout
 */
export async function compile<T extends SoneNode>(
  node: T,
  { defaultTextProps, loadImage, breakIterator, createId }: SoneCompileContext,
): Promise<T | undefined> {
  if (node == null) return;

  if (node.type !== "text-default") {
    if (node.id === -1) {
      node.id = createId();
    }

    // transform regular box shadow
    if (node.props.shadows != null && Array.isArray(node.props.shadows)) {
      const items: CssShadowProperties[] = [];
      for (const item of node.props.shadows) {
        if (typeof item === "string") {
          items.push(...parseShadow(item));
        } else {
          items.push(item);
        }
      }
      node.props.shadows = items;
    }

    // gradient parser and image resolver
    if (node.props.background != null && Array.isArray(node.props.background)) {
      const background: Array<ColorValue | PhotoNode | GradientNode> = [];

      for (const bg of node.props.background) {
        if (typeof bg === "string") {
          if (!isColor(bg)) {
            const gradients = parse(bg);
            background.push(...gradients);
            continue;
          }
        } else {
          if (bg.type === "photo") {
            //
            if (
              typeof bg.props.src === "string" ||
              Buffer.isBuffer(bg.props.src)
            ) {
              configurePhotoProps(bg, await loadImage(bg.props.src));
            }
          }
        }

        background.push(bg);
      }

      node.props.background = background;
    }
  }

  if (node.type === "table-row") {
    if (node.props.flexDirection == null) {
      node.props.flexDirection = "row";
    }
  }

  if (node.type === "text") {
    if (node.props.flexShrink == null) {
      node.props.flexShrink = 1;
    }

    if (node.props.boxSizing == null) {
      node.props.boxSizing = "content-box";
    }

    node.props = {
      ...defaultTextProps,
      ...filterNullishValues(node.props),
    };

    // compile drop shadows
    if (
      node.props.dropShadows != null &&
      Array.isArray(node.props.dropShadows)
    ) {
      const items: CssShadowProperties[] = [];
      for (const item of node.props.dropShadows) {
        if (typeof item === "string") {
          items.push(...parseShadow(item));
        } else {
          items.push(item);
        }
      }
      node.props.dropShadows = items;
    }

    // text color
    if (typeof node.props.color === "string") {
      if (!isColor(node.props.color)) {
        node.props.color = parse(node.props.color);
      }
    }

    node.children.map((item) => {
      if (typeof item === "string") return item;
      const parentProps = pick(
        node.props,
        // inherit props
        [
          "size",
          "color",
          "font",
          "style",
          "weight",
          "letterSpacing",
          "wordSpacing",
          "strokeColor",
          "strokeWidth",
          "underline",
          "underlineColor",
          "overline",
          "overlineColor",
          "lineThrough",
          "lineThroughColor",
          "highlightColor",
          "dropShadows",
        ],
      );

      item.props = {
        // pick
        ...filterNullishValues(parentProps),
        ...item.props,
      };

      // compile span node drop shadows
      if (
        item.props.dropShadows != null &&
        Array.isArray(item.props.dropShadows)
      ) {
        const spanItems: CssShadowProperties[] = [];
        for (const spanItem of item.props.dropShadows) {
          if (typeof spanItem === "string") {
            spanItems.push(...parseShadow(spanItem));
          } else {
            spanItems.push(spanItem);
          }
        }
        item.props.dropShadows = spanItems;
      }

      // transform span color
      if (typeof item.props.color === "string") {
        if (!isColor(item.props.color)) {
          item.props.color = parse(item.props.color);
        }
      }

      return item;
    });

    return node;
  }

  if (node.type === "photo") {
    if (typeof node.props.src === "string" || Buffer.isBuffer(node.props.src)) {
      configurePhotoProps(node, await loadImage(node.props.src));
      return node;
    }
    return;
  }

  if (node.type === "row") {
    if (node.props.flexDirection == null) {
      node.props.flexDirection = "row";
    }
  }

  if (node.type === "list") {
    if (node.props.flexDirection == null) {
      node.props.flexDirection = "column";
    }

    const { listStyle, startIndex = 1, markerGap = 8 } = node.props;
    const isSpanMarker =
      listStyle != null &&
      typeof listStyle === "object" &&
      (listStyle as SpanNode).type === "span";
    let itemIndex = 0;

    for (const child of node.children) {
      if (child == null) continue;

      const markerNode = isSpanMarker
        ? Text(klona(listStyle as SpanNode))
        : Text(
            resolveMarker(
              listStyle as string | undefined,
              itemIndex,
              startIndex,
            ),
          );
      markerNode.props.nowrap = true;
      itemIndex++;

      const contentCol = Column(...child.children).flex(1);
      child.children = [markerNode, contentCol];

      if (child.props.flexDirection == null) child.props.flexDirection = "row";
      if (child.props.gap == null) child.props.gap = markerGap;
      if (child.props.alignItems == null) child.props.alignItems = "flex-start";
    }
    // fall through to generic children compilation loop
  }

  if (node.type !== "text-default" && node.props.background != null) {
    for (const bg of node.props.background) {
      if (typeof bg !== "string" && bg.type === "photo") {
        if (typeof bg.props.src === "string" || Buffer.isBuffer(bg.props.src)) {
          configurePhotoProps(bg, await loadImage(bg.props.src));
          return node;
        }
      }
    }
  }

  if (node.type === "path") {
    if (node.props.d) {
      node.props.bounds = getBounds(node.props.d);
    }
    return node;
  }

  const children: SoneNode[] = [];

  for (const child of node.children) {
    if (child == null) continue;
    // flatten rootless node
    if (child.type === "text-default") {
      const clonedTextProps = {
        ...defaultTextProps,
        ...filterNullishValues(child.props),
      };

      for (const c of child.children) {
        if (c == null) continue;
        children.push(
          await compile(c, {
            defaultTextProps: clonedTextProps,
            loadImage,
            breakIterator,
            createId,
          }),
        );
      }

      continue;
    }

    children.push(
      await compile(child, {
        defaultTextProps,
        loadImage,
        breakIterator,
        createId,
      }),
    );
  }

  // update
  node.children = children.filter((c) => c != null);

  if (node.type === "table") {
    if (node.props.spacing != null && Array.isArray(node.props.spacing)) {
      let [spacingX, spacingY] = node.props.spacing;
      spacingY = spacingY ?? spacingX;
      for (const row of node.children) {
        if (row == null) continue;
        for (const child of row.children) {
          if (child == null) return;
          if (child.type === "text-default") continue;
          if (child.props.paddingLeft == null)
            child.props.paddingLeft = spacingX;
          if (child.props.paddingRight == null)
            child.props.paddingRight = spacingX;
          if (child.props.paddingTop == null) child.props.paddingTop = spacingY;
          if (child.props.paddingBottom == null)
            child.props.paddingBottom = spacingY;
        }
      }
    }
  }

  return node;
}

/**
 * Extract all fonts used in a node tree for preloading
 * @param node - node to scan for font usage
 * @returns set of font names used
 */
export function findFonts(node: SoneNode): Set<FontValue> | undefined {
  if (node == null) return;
  if (node.type === "photo") return;
  if (node.type === "path") return;

  if (node.type === "text") {
    const fonts = new Set<FontValue>();

    for (const span of node.children) {
      if (typeof span === "string") continue;
      if (span.props.font != null) {
        for (const font of span.props.font) {
          fonts.add(font);
        }
      }
    }

    if (node.props.font != null) {
      for (const font of node.props.font) {
        fonts.add(font);
      }
    }

    return fonts;
  }

  const fonts = new Set<FontValue>();

  for (const child of node.children) {
    const values = findFonts(child);
    if (values == null) continue;
    for (const value of values) {
      fonts.add(value);
    }
  }

  return fonts;
}

/**
 * Create Yoga layout tree from compiled node tree
 * Requires: resolved assets, font info, and line breaking data
 * @param node - compiled node to create layout for
 * @param renderer - platform renderer for text measurement
 * @returns Yoga layout node tree
 */
export function createLayoutNode(
  node: SoneNode,
  renderer: Pick<
    SoneRenderer,
    | "hasFont"
    | "breakIterator"
    | "getDefaultTextProps"
    | "loadImage"
    | "measureText"
  >,
  Yoga: YogaLayout,
): Node | undefined {
  if (node == null) return;
  if (node.type === "text-default") {
    throw new Error("The layout includes TextDefaut node which is illegal!");
  }

  const yogaNode = Yoga.Node.create();
  applyPropsToYogaNode(node.props, yogaNode);

  if (node.type === "photo") {
    return yogaNode;
  }

  if (node.type === "text") {
    const measureFunc: MeasureFunction = (width, widthMode, h, hMode) => {
      const { props, children } = node;
      let blockWidth = 0;
      let blockHeight = 0;

      const baseProps = klona(props);

      const isRotated = props.orientation === 90 || props.orientation === 270;
      // For 90°/270°, use the height constraint as the text wrapping width
      const textWrapWidth = isRotated ? h : width;

      // Helper function to measure blocks and return dimensions
      const measureBlocks = (fontSize: number) => {
        const testProps = { ...baseProps, size: fontSize };
        const blocks = createParagraph(
          children,
          textWrapWidth,
          testProps,
          renderer.measureText,
          renderer.breakIterator,
        );

        let maxWidth = 0;
        let totalHeight = 0;

        for (const { paragraph } of blocks) {
          if (paragraph.width > maxWidth) {
            maxWidth = paragraph.width;
          }
          totalHeight += paragraph.height;
        }

        return { blocks, width: maxWidth, height: totalHeight };
      };

      // Initial measurement
      let blocks = createParagraph(
        children,
        textWrapWidth,
        baseProps,
        renderer.measureText,
        renderer.breakIterator,
      );

      for (const { paragraph } of blocks) {
        if (paragraph.width > blockWidth) {
          blockWidth = paragraph.width;
        }
        blockHeight += paragraph.height;
      }

      if (props.autofit && !Number.isNaN(h) && hMode === MeasureMode.Exactly) {
        // Binary search for optimal font size
        let minSize = 1;
        let maxSize = 200; // Reasonable upper bound for font size
        let optimalSize = baseProps.size || 12;

        // Quick check if current size already fits
        const currentMeasurement = measureBlocks(optimalSize);
        if (currentMeasurement.height <= h) {
          // Current size fits, try to find a larger size
          while (maxSize - minSize > 1) {
            const midSize = Math.floor((minSize + maxSize) / 2);
            const measurement = measureBlocks(midSize);

            if (measurement.height <= h) {
              minSize = midSize;
              optimalSize = midSize;
            } else {
              maxSize = midSize;
            }
          }
        } else {
          // Current size doesn't fit, need to find smaller size
          maxSize = optimalSize;
          while (maxSize - minSize > 1) {
            const midSize = Math.floor((minSize + maxSize) / 2);
            const measurement = measureBlocks(midSize);

            if (measurement.height <= h) {
              minSize = midSize;
              optimalSize = midSize;
            } else {
              maxSize = midSize;
            }
          }
        }

        // Final measurement with optimal size
        const finalMeasurement = measureBlocks(optimalSize);
        blocks = finalMeasurement.blocks;
        blockWidth = finalMeasurement.width;
        blockHeight = finalMeasurement.height;
        baseProps.size = optimalSize;
      }

      if (widthMode === MeasureMode.AtMost) {
        blockWidth = Math.min(width, blockWidth);
      }

      node.props.blocks = blocks;
      // For 90°/270°, swap width/height so Yoga assigns the rotated layout footprint
      if (isRotated) {
        return { width: blockHeight, height: blockWidth };
      }
      return { width: blockWidth, height: blockHeight };
    };

    yogaNode.setMeasureFunc(measureFunc);
    return yogaNode;
  }

  if (node.type === "path") {
    if (node.props.bounds != null) {
      const [left, top, right, bottom] = node.props.bounds;
      const scale = node.props.scalePath ?? 1.0;

      if (node.props.width == null) {
        const w = right - left;
        yogaNode.setWidth(w * scale);
      }

      if (node.props.height == null) {
        const h = bottom - top;
        yogaNode.setHeight(h * scale);
      }
    }

    return yogaNode;
  }

  for (const child of node.children) {
    if (child == null) continue;
    const childNode = createLayoutNode(child, renderer, Yoga);
    if (childNode == null) continue;
    yogaNode.insertChild(childNode, yogaNode.getChildCount());
  }

  if (node.type === "table") {
    const widths: number[] = [];

    for (let r = 0; r < yogaNode.getChildCount(); r++) {
      let maxHeight = 0;

      // measure
      for (let c = 0; c < yogaNode.getChild(r).getChildCount(); c++) {
        if (widths.length - 1 < c) widths.push(0);
        const columnNode = yogaNode.getChild(r).getChild(c);

        // TODO: respect the min width min width
        columnNode.calculateLayout(undefined, undefined);

        const w = columnNode.getComputedWidth();
        const h = columnNode.getComputedHeight();

        if (maxHeight < h) maxHeight = h;
        if (widths[c] < w) widths[c] = w;
      }

      for (let c = 0; c < yogaNode.getChild(r).getChildCount(); c++) {
        const columnNode = yogaNode.getChild(r).getChild(c);
        columnNode.setMinHeight(maxHeight);
      }
    }

    // update widths
    for (let r = 0; r < yogaNode.getChildCount(); r++) {
      for (let c = 0; c < yogaNode.getChild(r).getChildCount(); c++) {
        const columnNode = yogaNode.getChild(r).getChild(c);
        columnNode.setMinWidth(widths[c]);
      }
    }
  }

  return yogaNode;
}

/** Per-page information passed to dynamic header/footer functions. */
export interface SonePageInfo {
  /** 1-based page number */
  pageNumber: number;
  /** Total number of pages in the document */
  totalPages: number;
}

/**
 * A header or footer value: either a static node (same on every page) or a
 * function that receives page info and returns a node (rendered per-page).
 */
export type SoneHeaderFooter = SoneNode | ((info: SonePageInfo) => SoneNode);

/**
 * Configuration for rendering
 */
export interface SoneRenderConfig {
  /** canvas width (auto-sized if not specified) */
  width?: number;
  /** canvas height (auto-sized if not specified) */
  height?: number;
  /** canvas background color */
  background?: ColorValue;
  /** image cache for performance */
  cache?: Map<string | Uint8Array, SoneImage>;
  /** When set, enables pagination — each page is this many pixels tall */
  pageHeight?: number;
  /**
   * Node (or function returning a node) rendered at the top of every page.
   * When a function, it receives `{ pageNumber, totalPages }` per page.
   */
  header?: SoneHeaderFooter;
  /**
   * Node (or function returning a node) rendered at the bottom of every page.
   * When a function, it receives `{ pageNumber, totalPages }` per page.
   */
  footer?: SoneHeaderFooter;
  /**
   * Page margins (pixels). A single number applies to all sides; an object
   * sets each side individually. Left/right expand the canvas; top/bottom
   * add space between the header/footer bands and the content area.
   */
  margin?:
    | number
    | { top?: number; right?: number; bottom?: number; left?: number };
  /**
   * Controls the height of the last page.
   * - `"uniform"` (default) — every page canvas is the same height; the last
   *   page has whitespace below the content.
   * - `"content"` — the last page canvas is only as tall as its content.
   */
  lastPageHeight?: "uniform" | "content";
}

export async function calculateLayout(
  node: SoneNode,
  renderer: Pick<
    SoneRenderer,
    | "hasFont"
    | "breakIterator"
    | "getDefaultTextProps"
    | "loadImage"
    | "measureText"
  >,
  config?: SoneRenderConfig,
) {
  // create yoga
  const Yoga = await getYogaLayout();

  // compile the node
  const fonts = findFonts(node);

  // check fonts
  if (fonts != null) {
    for (const font of fonts) {
      if (font === "serif") continue;
      if (font === "sans-serif") continue;
      if (font === "monospace") continue;
      if (font === "cursive") continue;
      if (font === "fantasy") continue;
      if (font === "system-ui") continue;
      if (!renderer.hasFont(font)) {
        console.warn(`${JSON.stringify(font)} font has not been registered!`);
      }
    }
  }

  const cache =
    config == null || config.cache == null
      ? new Map<string | Uint8Array, SoneImage>()
      : config.cache;

  let currentId = 0;
  const createId = () => currentId++;

  const compiledNode = await compile(klona(node), {
    defaultTextProps: renderer.getDefaultTextProps(),
    loadImage: pMemoize(renderer.loadImage, { cache }),
    breakIterator: renderer.breakIterator,
    createId,
  });

  // purge local cache
  if (config == null || config.cache == null) {
    cache.clear();
  }

  const layout = createLayoutNode(compiledNode, renderer, Yoga);

  if (layout == null) {
    throw new Error("Unable to create canvas!");
  }

  // layout
  layout.calculateLayout(config?.width, config?.height);
  return { layout, compiledNode };
}

/**
 * Main rendering function - compiles, layouts, and draws to canvas
 * @param node - root node to render
 * @param renderer - platform-specific renderer
 * @param config - rendering configuration
 */
export async function renderWithMetadata<T = HTMLCanvasElement>(
  node: SoneNode,
  renderer: SoneRenderer,
  config?: SoneRenderConfig,
) {
  const { compiledNode, layout } = await calculateLayout(
    node,
    renderer,
    config,
  );

  // render
  const canvas = renderer.createCanvas(
    layout.getComputedWidth(),
    layout.getComputedHeight(),
  );

  drawOnCanvas(canvas, compiledNode, renderer, layout, config) as unknown as T;

  const metadata = createMetadata(compiledNode, layout);

  return { canvas, metadata };
}

export function drawOnCanvas(
  canvas: HTMLCanvasElement,
  compiledNode: SoneNode,
  renderer: SoneRenderer,
  layout: Node,
  config?: SoneRenderConfig,
  offsetY?: number,
  clipRegion?: { top: number; height: number },
  offsetX?: number,
) {
  const ctx = canvas.getContext("2d")!;

  if (config?.background) {
    ctx.fillStyle = config.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (offsetY != null || clipRegion != null || offsetX != null) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      0,
      clipRegion?.top ?? 0,
      canvas.width,
      clipRegion?.height ?? canvas.height,
    );
    ctx.clip();
    const tx = offsetX ?? 0;
    const ty = offsetY ?? 0;
    if (tx !== 0 || ty !== 0) ctx.translate(tx, ty);
  }

  function draw(node: SoneNode, layout: Node, x: number, y: number) {
    if (node == null) return;

    try {
      ctx.save();

      if (node.type !== "text-default") {
        makeTransforms(ctx, node, layout, x, y);
      }

      if (node.type === "text-default") return;

      // draw text
      if (node.type === "text") {
        drawLayoutNode(renderer, ctx, node, layout, x, y);
        drawTextNode(renderer, ctx, node, layout, x, y);
        return;
      }

      if (node.type === "photo") {
        drawPhoto(renderer, ctx, node, layout, x, y);
        return;
      }

      if (node.type === "path") {
        drawLayoutNode(renderer, ctx, node, layout, x, y);
        drawPathNode(renderer, ctx, node, x, y);
        return;
      }

      drawLayoutNode(renderer, ctx, node, layout, x, y);

      for (let i = 0; i < node.children.length; i++) {
        const childRoot = layout.getChild(i);
        const child = node.children[i];
        draw(
          child,
          childRoot,
          x + childRoot.getComputedLeft(),
          y + childRoot.getComputedTop(),
        );
      }

      // draw over the children
      if (node.type === "table") {
        drawTableNode(renderer, ctx, node, layout, x, y);
      }
    } finally {
      ctx.restore();

      // debug view
      if (renderer.debug().layout) {
        drawDebugBBox(renderer, ctx, node, layout, x, y);
      }
    }
  }

  // draw
  draw(compiledNode, layout, 0, 0);

  if (offsetY != null || clipRegion != null || offsetX != null) {
    ctx.restore();
  }
}

// ── Leaf node types that are treated as indivisible for page breaking ─────────
const LEAF_TYPES = new Set(["text", "photo", "path"]);

function computePageBreaks(
  rootLayout: Node,
  rootNode: SoneNode,
  pageHeight: number,
): number[] {
  const state = { currentPageEnd: pageHeight, breaks: [] as number[] };

  function walk(yogaNode: Node, node: SoneNode, absY: number) {
    if (node == null || typeof node === "string") return;
    if (!("children" in node) || node.children == null) return;

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (child == null || typeof child === "string") continue;
      if (!("props" in child)) continue;

      const childLayout = yogaNode.getChild(i);
      const childAbsTop = absY + childLayout.getComputedTop();
      const childAbsBottom = childAbsTop + childLayout.getComputedHeight();
      const childProps = child.props as { pageBreak?: string } | undefined;

      // Explicit break before: end the current page at childAbsTop
      if (childProps?.pageBreak === "before" && childAbsTop > 0) {
        // Advance natural page boundaries to cover content up to childAbsTop
        while (state.currentPageEnd < childAbsTop) {
          state.breaks.push(state.currentPageEnd);
          state.currentPageEnd += pageHeight;
        }
        // Break right before this child if it falls in the middle of a page
        if (childAbsTop < state.currentPageEnd) {
          const lastBreak = state.breaks[state.breaks.length - 1] ?? 0;
          if (childAbsTop > lastBreak) {
            state.breaks.push(childAbsTop);
            state.currentPageEnd = childAbsTop + pageHeight;
          }
        }
      }

      // Fits on current page
      if (childAbsBottom <= state.currentPageEnd) {
        if (childProps?.pageBreak === "after") {
          const lastBreak = state.breaks[state.breaks.length - 1] ?? 0;
          if (childAbsBottom > lastBreak) {
            state.breaks.push(childAbsBottom);
            state.currentPageEnd = childAbsBottom + pageHeight;
          }
        }
        continue;
      }

      // Straddles or is beyond the current page boundary
      const isAtomic =
        childProps?.pageBreak === "avoid" || LEAF_TYPES.has(child.type);
      const childHeight = childAbsBottom - childAbsTop;

      if (child.type === "text") {
        // Text paragraphs: split at line boundaries so no line is clipped in
        // half. Walk each line; when a line would cross the page boundary,
        // break immediately before it.
        const textBlocks = (child as TextNode).props?.blocks;
        if (textBlocks && textBlocks.length > 0) {
          const insetTop =
            childLayout.getComputedPadding(Edge.Top) +
            childLayout.getComputedBorder(Edge.Top);
          let paragraphLocalY = 0;
          for (const { paragraph } of textBlocks) {
            // paragraph.offsetY is the lineHeight centering adjustment
            let lineLocalY = paragraphLocalY + paragraph.offsetY;
            for (const line of paragraph.lines) {
              const lineAbsBottom =
                childAbsTop + insetTop + lineLocalY + line.height;
              if (lineAbsBottom > state.currentPageEnd) {
                // Floor to integer so page canvas dimensions are whole pixels
                const lineAbsTop = Math.floor(
                  childAbsTop + insetTop + lineLocalY,
                );
                const lastBreak = state.breaks[state.breaks.length - 1] ?? 0;
                if (lineAbsTop > lastBreak) {
                  state.breaks.push(lineAbsTop);
                  state.currentPageEnd = lineAbsTop + pageHeight;
                }
                // Advance past lines that are taller than one page
                while (lineAbsBottom > state.currentPageEnd) {
                  state.breaks.push(state.currentPageEnd);
                  state.currentPageEnd += pageHeight;
                }
              }
              lineLocalY += line.height;
            }
            paragraphLocalY += paragraph.height;
          }
        } else {
          // No blocks yet (shouldn't happen after layout) — fall back to atomic
          if (childAbsTop < state.currentPageEnd && childHeight <= pageHeight) {
            state.breaks.push(state.currentPageEnd);
            state.currentPageEnd += pageHeight;
          } else {
            while (childAbsTop >= state.currentPageEnd) {
              state.breaks.push(state.currentPageEnd);
              state.currentPageEnd += pageHeight;
            }
          }
          while (childAbsBottom > state.currentPageEnd) {
            state.breaks.push(state.currentPageEnd);
            state.currentPageEnd += pageHeight;
          }
        }
      } else if (isAtomic) {
        if (childAbsTop < state.currentPageEnd) {
          // Straddles: break before if it fits on a fresh page
          if (childHeight <= pageHeight) {
            state.breaks.push(state.currentPageEnd);
            state.currentPageEnd += pageHeight;
          }
        } else {
          // Entirely on a future page: advance to it
          while (childAbsTop >= state.currentPageEnd) {
            state.breaks.push(state.currentPageEnd);
            state.currentPageEnd += pageHeight;
          }
        }
        // Advance past any additional pages this child spans
        while (childAbsBottom > state.currentPageEnd) {
          state.breaks.push(state.currentPageEnd);
          state.currentPageEnd += pageHeight;
        }
      } else {
        // Has children: recurse to find finer break points
        walk(childLayout, child, childAbsTop);
      }

      if (childProps?.pageBreak === "after") {
        state.breaks.push(state.currentPageEnd);
        state.currentPageEnd += pageHeight;
      }
    }
  }

  walk(rootLayout, rootNode, 0);
  // Sort, deduplicate, and collapse breaks that are within 4 px of each other.
  // This prevents hairline pages caused by a text-line break landing just
  // before an explicit PageBreak() node (which sits a few gap-pixels later).
  const sorted = [...new Set(state.breaks)].sort((a, b) => a - b);
  const collapsed: number[] = [];
  for (const b of sorted) {
    if (collapsed.length === 0 || b - collapsed[collapsed.length - 1] > 20) {
      collapsed.push(b);
    }
  }
  return collapsed;
}

function parseMargin(margin: SoneRenderConfig["margin"]) {
  if (margin == null) return { top: 0, right: 0, bottom: 0, left: 0 };
  if (typeof margin === "number")
    return { top: margin, right: margin, bottom: margin, left: margin };
  return {
    top: margin.top ?? 0,
    right: margin.right ?? 0,
    bottom: margin.bottom ?? 0,
    left: margin.left ?? 0,
  };
}

export async function renderPages(
  node: SoneNode,
  renderer: SoneRenderer,
  config?: SoneRenderConfig,
): Promise<HTMLCanvasElement[]> {
  // ── 1. Resolve margins first so content layout can use the correct width ──
  const mg = parseMargin(config?.margin);

  // When config.width is provided it is treated as the exact canvas width;
  // left/right margins inset the content within that width rather than
  // expanding the canvas.  Without config.width the legacy behaviour is
  // preserved: canvas = content + margins.
  const contentLayoutConfig =
    config?.width != null
      ? { ...config, width: config.width - mg.left - mg.right }
      : config;

  // ── 2. Layout main content ────────────────────────────────────────────────
  const { layout, compiledNode } = await calculateLayout(
    node,
    renderer,
    contentLayoutConfig,
  );
  const totalWidth = layout.getComputedWidth();
  const totalHeight = layout.getComputedHeight();
  const pageHeight = config?.pageHeight ?? totalHeight;

  // ── 3. Resolve canvas width ───────────────────────────────────────────────
  const canvasWidth =
    config?.width != null ? config.width : totalWidth + mg.left + mg.right;

  // ── 4. Layout header/footer at full canvas width ──────────────────────────
  // Clear header/footer in hfConfig to prevent infinite recursion.
  const hfConfig: SoneRenderConfig = {
    ...config,
    width: canvasWidth,
    height: undefined,
    header: undefined,
    footer: undefined,
    margin: undefined,
  };

  // Resolve a header/footer value to a SoneNode, calling the function if needed.
  function resolveHF(hf: SoneHeaderFooter, info: SonePageInfo): SoneNode {
    return typeof hf === "function" ? hf(info) : hf;
  }
  // Placeholder used for the height-probe pass (function-based header/footer).
  const PROBE: SonePageInfo = { pageNumber: 1, totalPages: 1 };

  // Measure header height. For function-based headers, probe with PROBE then
  // free the layout — actual per-page layouts are computed inside the loop.
  let headerH = 0;
  let headerLayout: Node | undefined;
  let headerCompiled: SoneNode | undefined;
  if (config?.header != null) {
    const r = await calculateLayout(
      resolveHF(config.header, PROBE),
      renderer,
      hfConfig,
    );
    headerH = r.layout.getComputedHeight();
    if (typeof config.header !== "function") {
      headerLayout = r.layout;
      headerCompiled = r.compiledNode;
    } else {
      r.layout.freeRecursive();
    }
  }

  let footerH = 0;
  let footerLayout: Node | undefined;
  let footerCompiled: SoneNode | undefined;
  if (config?.footer != null) {
    const r = await calculateLayout(
      resolveHF(config.footer, PROBE),
      renderer,
      hfConfig,
    );
    footerH = r.layout.getComputedHeight();
    if (typeof config.footer !== "function") {
      footerLayout = r.layout;
      footerCompiled = r.compiledNode;
    } else {
      r.layout.freeRecursive();
    }
  }

  // ── 4. Page breaks use content-area height (excluding header/footer/margins)
  const contentPageHeight = pageHeight - headerH - footerH - mg.top - mg.bottom;
  if (contentPageHeight <= 0) {
    layout.freeRecursive();
    headerLayout?.freeRecursive();
    footerLayout?.freeRecursive();
    return [];
  }

  const pageBreaks = computePageBreaks(layout, compiledNode, contentPageHeight);
  const pageStarts = [0, ...pageBreaks];
  const totalPages = pageStarts.length;

  const canvases: HTMLCanvasElement[] = [];
  const hasClip = headerH > 0 || footerH > 0 || mg.top > 0 || mg.bottom > 0;

  for (let i = 0; i < totalPages; i++) {
    const info: SonePageInfo = { pageNumber: i + 1, totalPages };
    const contentStart = pageStarts[i];
    const nextStart = pageStarts[i + 1] ?? totalHeight;
    const actualContentH = nextStart - contentStart;
    const isLastPage = i === totalPages - 1;
    const contentH =
      isLastPage && config?.lastPageHeight === "content"
        ? actualContentH
        : contentPageHeight;
    const canvasHeight = headerH + mg.top + contentH + mg.bottom + footerH;

    const canvas = renderer.createCanvas(canvasWidth, canvasHeight);

    // Draw content band: shift right by marginLeft, down by headerH+marginTop,
    // scroll up by contentStart
    drawOnCanvas(
      canvas,
      compiledNode,
      renderer,
      layout,
      config,
      headerH + mg.top - contentStart,
      hasClip ? { top: headerH + mg.top, height: actualContentH } : undefined,
      mg.left,
    );

    // Resolve per-page header layout (or reuse static layout)
    let hLayout = headerLayout;
    let hCompiled = headerCompiled;
    if (config?.header != null && typeof config.header === "function") {
      const r = await calculateLayout(
        resolveHF(config.header, info),
        renderer,
        hfConfig,
      );
      hLayout = r.layout;
      hCompiled = r.compiledNode;
    }

    // Draw header at top spanning full canvas width (no background repaint)
    if (hCompiled != null && hLayout != null) {
      drawOnCanvas(
        canvas,
        hCompiled,
        renderer,
        hLayout,
        { ...config, background: undefined },
        0,
        { top: 0, height: headerH },
      );
    }
    if (typeof config?.header === "function") hLayout?.freeRecursive();

    // Resolve per-page footer layout (or reuse static layout)
    let fLayout = footerLayout;
    let fCompiled = footerCompiled;
    if (config?.footer != null && typeof config.footer === "function") {
      const r = await calculateLayout(
        resolveHF(config.footer, info),
        renderer,
        hfConfig,
      );
      fLayout = r.layout;
      fCompiled = r.compiledNode;
    }

    // Draw footer at bottom spanning full canvas width
    if (fCompiled != null && fLayout != null) {
      drawOnCanvas(
        canvas,
        fCompiled,
        renderer,
        fLayout,
        { ...config, background: undefined },
        headerH + mg.top + contentH + mg.bottom,
        { top: headerH + mg.top + contentH + mg.bottom, height: footerH },
      );
    }
    if (typeof config?.footer === "function") fLayout?.freeRecursive();

    canvases.push(canvas);
  }

  layout.freeRecursive();
  headerLayout?.freeRecursive();
  footerLayout?.freeRecursive();
  return canvases;
}

export function createMetadata(compiledNode: SoneNode, layout: Node) {
  // draw metadata
  function drawWithMeta(
    node: SoneNode,
    layout: Node,
    x: number,
    y: number,
  ): SoneMetadata | undefined {
    if (node == null) return;
    if (node.type === "text-default") return;

    const props = node.props;
    const type = node.type;

    const extra = {
      x,
      y,
      width: layout.getComputedWidth(),
      height: layout.getComputedHeight(),
      position: {
        top: layout.getComputedTop(),
        bottom: layout.getComputedBottom(),
        left: layout.getComputedLeft(),
        right: layout.getComputedRight(),
      },
      padding: {
        top: layout.getComputedPadding(Edge.Top),
        left: layout.getComputedPadding(Edge.Left),
        right: layout.getComputedPadding(Edge.Right),
        bottom: layout.getComputedPadding(Edge.Bottom),
      },
      margin: {
        top: layout.getComputedMargin(Edge.Top),
        left: layout.getComputedMargin(Edge.Left),
        right: layout.getComputedMargin(Edge.Right),
        bottom: layout.getComputedMargin(Edge.Bottom),
      },
    };

    if (type === "text") {
      createTextRuns(node, layout, x, y);
      const props = klona(node.props);
      if (props.blocks != null) {
        for (const block of props.blocks) {
          for (const line of block.paragraph.lines) {
            for (const segment of line.segments) {
              if ("lines" in segment.metrics) {
                delete segment.metrics.lines;
              }
            }
          }
        }
      }

      return {
        type,
        children: node.children,
        props,
        ...extra,
      };
    }

    const children: SoneMetadata[] = [];

    if (
      type === "column" ||
      type === "row" ||
      type === "table" ||
      type === "table-row" ||
      type === "table-cell"
    ) {
      for (let i = 0; i < node.children.length; i++) {
        const childRoot = layout.getChild(i);
        const child = node.children[i];
        if (child == null) continue;
        const output = drawWithMeta(
          child,
          childRoot,
          x + childRoot.getComputedLeft(),
          y + childRoot.getComputedTop(),
        );
        if (output == null) continue;
        children.push(output);
      }
    }

    return {
      type,
      props,
      children,
      ...extra,
    };
  }

  return drawWithMeta(compiledNode, layout, 0, 0);
}

/**
 * Main rendering function - compiles, layouts, and draws to canvas
 * @param node - root node to render
 * @param renderer - platform-specific renderer
 * @param config - rendering configuration
 * @returns rendered canvas
 */
export async function render<T = HTMLCanvasElement>(
  node: SoneNode,
  renderer: SoneRenderer,
  config?: SoneRenderConfig,
): Promise<T> {
  const { layout, compiledNode } = await calculateLayout(
    node,
    renderer,
    config,
  );
  const canvas = renderer.createCanvas(
    layout.getComputedWidth(),
    layout.getComputedHeight(),
  );
  drawOnCanvas(canvas, compiledNode, renderer, layout, config);
  layout.freeRecursive();
  return canvas as unknown as T;
}

/**
 * Draw background, 2shadows, and borders for layout nodes
 * @param renderer - platform renderer
 * @param ctx - canvas rendering context
 * @param node - node to draw
 * @param layout - yoga layout node
 * @param x - x position
 * @param y - y position
 */
export function drawLayoutNode(
  renderer: SoneRenderer,
  ctx: CanvasRenderingContext2D,
  node:
    | ColumnNode
    | RowNode
    | TextNode
    | PathNode
    | TableNode
    | TableRowNode
    | TableCellNode
    | ListNode
    | ListItemNode,
  layout: Node,
  x: number,
  y: number,
) {
  const width = layout.getComputedWidth();
  const height = layout.getComputedHeight();
  const props = node.props;

  // create rounded path
  const roundedRectPath = createSmoothRoundRect(
    renderer,
    width,
    height,
    parseRadius(props.cornerRadius ?? [0], Math.min(width, height)),
    props.cornerSmoothing,
    props.corner,
  );

  // draw box shadows
  if (props.background != null && props.shadows) {
    for (const shadow of props.shadows) {
      if (typeof shadow === "string") continue;
      ctx.save();
      ctx.shadowOffsetX = shadow.offsetX;
      ctx.shadowOffsetY = shadow.offsetY;
      ctx.shadowBlur = shadow.blurRadius;
      if (shadow.color) {
        ctx.shadowColor = shadow.color;
        ctx.fillStyle = shadow.color;
      }

      ctx.translate(x, y);
      ctx.fill(roundedRectPath);
      ctx.restore();
    }
  }

  // clip
  ctx.save();
  ctx.translate(x, y);
  ctx.clip(roundedRectPath);
  ctx.translate(-x, -y);

  if (props.background != null) {
    for (const bg of props.background) {
      if (typeof bg === "string") {
        ctx.fillStyle = bg;
        ctx.fillRect(x, y, width, height);
        continue;
      }

      if (bg.type === "photo") {
        ctx.save();
        makeTransforms(ctx, bg, layout, x, y);
        drawPhoto(renderer, ctx, bg, layout, x, y);
        ctx.restore();
        continue;
      }

      // gradient fill
      const [gradientFill] = createGradientFillStyleList(
        ctx,
        [bg],
        x,
        y,
        width,
        height,
      );

      ctx.fillStyle = gradientFill;
      ctx.fillRect(x, y, width, height);
    }
  }

  ctx.restore();

  // stroke / border
  drawBorder(ctx, layout, props, roundedRectPath, x, y);

  return roundedRectPath;
}

export function makeTransforms(
  ctx: CanvasRenderingContext2D,
  node: SoneNode,
  layout: Node,
  x: number,
  y: number,
) {
  if (node == null) return;
  if (node.type === "text-default") return;

  // alpha
  if (typeof node.props.opacity === "number")
    ctx.globalAlpha = node.props.opacity;

  // translate
  const { translateX, translateY } = node.props;
  ctx.translate(translateX ?? 0, translateY ?? 0);

  const centerX = x + layout.getComputedWidth() / 2;
  const centerY = y + layout.getComputedHeight() / 2;
  const rotation = node.props.rotation;

  // rotation
  if (typeof rotation === "number" && rotation !== 0) {
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  // scale
  const scale = node.props.scale;
  if (scale != null && Array.isArray(scale)) {
    ctx.translate(centerX, centerY);
    ctx.scale(scale[0], scale[1]);
    ctx.translate(-centerX, -centerY);
  }

  if (node.props.filters != null && Array.isArray(node.props.filters)) {
    const filter = node.props.filters.join(" ");
    ctx.filter = filter;
  }
}

export function drawDebugBBox(
  renderer: SoneRenderer,
  ctx: CanvasRenderingContext2D,
  node: SoneNode,
  layout: Node,
  x: number,
  y: number,
) {
  if (node == null) return;
  if (node.type === "text-default") return;

  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "cyan";
  ctx.strokeRect(x, y, layout.getComputedWidth(), layout.getComputedHeight());

  const text =
    node.props.tag != null ? `${node.type}:${node.props.tag}` : node.type;

  ctx.font = `${20 * renderer.dpr()}px monospace`;
  const m = ctx.measureText(text);

  ctx.fillStyle = "rgba(0,255,255,.6)";
  ctx.fillRect(
    x,
    y,
    m.width,
    m.fontBoundingBoxAscent + m.fontBoundingBoxDescent,
  );

  ctx.strokeStyle = "cyan";
  ctx.strokeRect(
    x,
    y,
    m.width,
    m.fontBoundingBoxAscent + m.fontBoundingBoxDescent,
  );
  ctx.fillStyle = "black";
  ctx.textBaseline = "top";
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawPathNode(
  renderer: SoneRenderer,
  ctx: CanvasRenderingContext2D,
  node: PathNode,
  x: number,
  y: number,
) {
  ctx.save();
  const { props } = node;
  const { d } = props;

  if (!d) {
    ctx.restore();
    return;
  }

  const path = new renderer.Path2D(d);

  ctx.translate(x, y);

  if (props.bounds) {
    const [left, top] = props.bounds;
    ctx.scale(props.scalePath ?? 1.0, props.scalePath ?? 1.0);
    ctx.translate(-left, -top);
  }

  if (props.fill != null) {
    ctx.fillStyle = props.fill;

    if (props.fillOpacity != null) {
      const currentAlpha = ctx.globalAlpha;
      ctx.globalAlpha = currentAlpha * props.fillOpacity;
    }

    if (props.fillRule) {
      ctx.fill(path, props.fillRule as CanvasFillRule);
    } else {
      ctx.fill(path);
    }

    if (props.fillOpacity != null) {
      ctx.globalAlpha = ctx.globalAlpha / props.fillOpacity;
    }
  }

  if (props.stroke != null) {
    ctx.strokeStyle = props.stroke;

    if (props.strokeWidth != null) {
      ctx.lineWidth = props.strokeWidth;
    }

    if (props.strokeLineCap) {
      ctx.lineCap = props.strokeLineCap;
    }

    if (props.strokeLineJoin) {
      ctx.lineJoin = props.strokeLineJoin;
    }

    if (props.strokeMiterLimit != null) {
      ctx.miterLimit = props.strokeMiterLimit;
    }

    if (props.strokeDashArray != null) {
      ctx.setLineDash(props.strokeDashArray);
    }

    if (props.strokeDashOffset != null) {
      ctx.lineDashOffset = props.strokeDashOffset;
    }

    ctx.stroke(path);
  }

  ctx.restore();
}

export function drawTableNode(
  _renderer: SoneRenderer,
  ctx: CanvasRenderingContext2D,
  node: TableNode,
  layout: Node,
  x: number,
  y: number,
) {
  ctx.save();
  let borderWidth = 0;

  if (node.props.borderColor != null) {
    ctx.strokeStyle = node.props.borderColor;
  }

  if (node.props.borderWidth != null) {
    ctx.lineWidth = node.props.borderWidth;
    borderWidth = node.props.borderWidth;
  }

  let offsetY = 0;
  let maxColumnIndex = -1;

  ctx.beginPath();
  for (let r = 0; r < layout.getChildCount(); r++) {
    const child = layout.getChild(r);
    if (
      maxColumnIndex === -1 ||
      child.getChildCount() > layout.getChild(maxColumnIndex).getChildCount()
    ) {
      maxColumnIndex = r;
    }

    if (r === layout.getChildCount() - 1) continue;
    ctx.moveTo(x, y + child.getComputedHeight() + offsetY + borderWidth);
    ctx.lineTo(
      x + layout.getComputedWidth(),
      y + child.getComputedHeight() + offsetY + borderWidth,
    );

    offsetY += child.getComputedHeight();
  }

  if (maxColumnIndex !== -1) {
    const maxColChild = layout.getChild(maxColumnIndex);
    let offsetX = 0;
    for (let c = 0; c < maxColChild.getChildCount(); c++) {
      const child = maxColChild.getChild(c);
      if (c > 0) {
        ctx.moveTo(x + offsetX + borderWidth, y);
        ctx.lineTo(x + offsetX + borderWidth, y + layout.getComputedHeight());
      }
      offsetX += child.getComputedWidth();
    }
  }

  ctx.stroke();
  ctx.restore();
}
