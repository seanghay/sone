import type { TextProps } from "./core.ts";
import type { SoneMetadata } from "./metadata.ts";
import type {
  SoneParagraphBlock,
  SoneParagraphLine,
  SoneParagraphLineRun,
  SoneParagraphLineSegment,
} from "./text.ts";

// ── Public types ──────────────────────────────────────────────────────────────

/**
 * Controls how finely bounding boxes are emitted for text nodes.
 *
 * - `"segment"` — one bbox per individual text run (word/glyph cluster)
 * - `"line"`    — one bbox per typeset line (union of its segments)
 * - `"block"`   — one bbox per paragraph block (union of its lines)
 * - `"node"`    — one bbox for the whole layout node (works for all types)
 */
export type YoloGranularity = "segment" | "line" | "block" | "node";

/**
 * Broad category used to filter which node types are included.
 *
 * - `"text"`   — TextNode
 * - `"photo"`  — PhotoNode / ImageNode
 * - `"layout"` — Column, Row, Grid, Table, Path, ClipGroup, …
 */
export type YoloNodeType = "text" | "photo" | "layout";

export interface YoloExportOptions {
  /**
   * Granularity at which bboxes are emitted for text nodes.
   * Non-text nodes always emit at node level regardless of this setting.
   * @default "node"
   */
  granularity?: YoloGranularity;

  /**
   * Node types to include. Mix and match freely.
   * @default ["text", "photo", "layout"]
   */
  include?: YoloNodeType[];

  /**
   * Class name assigned to nodes/segments that carry no `.tag()`.
   * Pass `null` to silently skip untagged items.
   * @default "__unlabeled__"
   */
  catchAllClass?: string | null;
}

/** A single bounding box entry in the dataset. */
export interface YoloBox {
  /** Numeric class ID (auto-assigned, sorted alphabetically by class name). */
  classId: number;
  /** Human-readable class name. */
  className: string;
  /** Normalised center-x  [0, 1] */
  cx: number;
  /** Normalised center-y  [0, 1] */
  cy: number;
  /** Normalised width     [0, 1] */
  w: number;
  /** Normalised height    [0, 1] */
  h: number;
  /** Absolute pixel left edge */
  x: number;
  /** Absolute pixel top edge */
  y: number;
  /** Absolute pixel width */
  pixelWidth: number;
  /** Absolute pixel height */
  pixelHeight: number;
}

export interface YoloDatasetJSON {
  imageWidth: number;
  imageHeight: number;
  /** Class-name → class-ID mapping. */
  classes: Record<string, number>;
  boxes: YoloBox[];
}

export interface YoloDataset {
  /** Class-name → class-ID mapping (auto-assigned, sorted alphabetically). */
  classes: Map<string, number>;
  /** All bounding boxes ordered by document depth (top-to-bottom tree walk). */
  boxes: YoloBox[];
  /** Image width in pixels (derived from root metadata). */
  imageWidth: number;
  /** Image height in pixels (derived from root metadata). */
  imageHeight: number;
  /**
   * Serialise to YOLO `.txt` format.
   * Each line: `classId cx cy w h` (normalised floats, space-separated).
   */
  toTxt(): string;
  /** Serialise to a plain JSON-safe object. */
  toJSON(): YoloDatasetJSON;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

interface ResolvedOptions {
  granularity: YoloGranularity;
  include: YoloNodeType[];
  catchAllClass: string | null;
}

function nodeKind(type: string): YoloNodeType {
  if (type === "text") return "text";
  if (type === "photo" || type === "image") return "photo";
  return "layout";
}

function unionRun(runs: SoneParagraphLineRun[]): SoneParagraphLineRun | null {
  if (!runs.length) return null;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const r of runs) {
    if (r.x < minX) minX = r.x;
    if (r.y < minY) minY = r.y;
    if (r.x + r.width > maxX) maxX = r.x + r.width;
    if (r.y + r.height > maxY) maxY = r.y + r.height;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function makeBox(
  className: string,
  classId: number,
  x: number,
  y: number,
  width: number,
  height: number,
  iw: number,
  ih: number,
): YoloBox {
  return {
    classId,
    className,
    x,
    y,
    pixelWidth: width,
    pixelHeight: height,
    cx: clamp01((x + width / 2) / iw),
    cy: clamp01((y + height / 2) / ih),
    w: clamp01(width / iw),
    h: clamp01(height / ih),
  };
}

// ── Class collection (pass 1) ─────────────────────────────────────────────────

function collectClasses(
  node: SoneMetadata,
  opts: ResolvedOptions,
  out: Set<string>,
): void {
  const kind = nodeKind(node.type);
  const included = opts.include.includes(kind);

  if (included) {
    if (kind === "text" && opts.granularity === "segment") {
      // Collect both node-level and per-segment span tags
      const props = node.props as TextProps;
      if (props.blocks?.length) {
        for (const { paragraph } of props.blocks) {
          for (const line of paragraph.lines) {
            for (const seg of line.segments) {
              if (seg.isTab) continue;
              const tag = seg.props?.tag ?? node.tag;
              if (tag) out.add(tag);
              else if (opts.catchAllClass != null) out.add(opts.catchAllClass);
            }
          }
        }
      } else {
        // No blocks yet — still register node tag
        if (node.tag) out.add(node.tag);
        else if (opts.catchAllClass != null) out.add(opts.catchAllClass);
      }
    } else {
      if (node.tag) out.add(node.tag);
      else if (opts.catchAllClass != null) out.add(opts.catchAllClass);
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child != null && typeof child === "object" && "type" in child) {
        collectClasses(child as SoneMetadata, opts, out);
      }
    }
  }
}

// ── Bbox emission (pass 2) ────────────────────────────────────────────────────

function runsFromLine(line: SoneParagraphLine): SoneParagraphLineRun[] {
  const runs: SoneParagraphLineRun[] = [];
  for (const seg of line.segments) {
    if (seg.run && seg.run.width > 0 && seg.run.height > 0) {
      runs.push(seg.run);
    }
  }
  return runs;
}

function emitTextBoxes(
  node: SoneMetadata,
  blocks: SoneParagraphBlock[],
  opts: ResolvedOptions,
  classMap: Map<string, number>,
  iw: number,
  ih: number,
  out: YoloBox[],
): void {
  const nodeTag = node.tag;

  for (const { paragraph } of blocks) {
    if (opts.granularity === "block") {
      const allRuns: SoneParagraphLineRun[] = [];
      for (const line of paragraph.lines) allRuns.push(...runsFromLine(line));
      const rect = unionRun(allRuns);
      if (!rect) continue;
      const className = nodeTag ?? opts.catchAllClass;
      if (className == null) continue;
      const classId = classMap.get(className);
      if (classId == null) continue;
      out.push(
        makeBox(
          className,
          classId,
          rect.x,
          rect.y,
          rect.width,
          rect.height,
          iw,
          ih,
        ),
      );
      continue;
    }

    for (const line of paragraph.lines) {
      if (opts.granularity === "line") {
        const rect = unionRun(runsFromLine(line));
        if (!rect) continue;
        const className = nodeTag ?? opts.catchAllClass;
        if (className == null) continue;
        const classId = classMap.get(className);
        if (classId == null) continue;
        out.push(
          makeBox(
            className,
            classId,
            rect.x,
            rect.y,
            rect.width,
            rect.height,
            iw,
            ih,
          ),
        );
        continue;
      }

      // "segment" granularity
      for (const seg of line.segments) {
        if (seg.isTab) continue;
        const r = seg.run;
        if (!r || r.width === 0 || r.height === 0) continue;
        if ((seg as SoneParagraphLineSegment).text.trim() === "") continue;
        const className = seg.props?.tag ?? nodeTag ?? opts.catchAllClass;
        if (className == null) continue;
        const classId = classMap.get(className);
        if (classId == null) continue;
        out.push(
          makeBox(className, classId, r.x, r.y, r.width, r.height, iw, ih),
        );
      }
    }
  }
}

function emitBoxes(
  node: SoneMetadata,
  opts: ResolvedOptions,
  classMap: Map<string, number>,
  iw: number,
  ih: number,
  out: YoloBox[],
): void {
  const kind = nodeKind(node.type);
  const included = opts.include.includes(kind);

  if (included) {
    const isText = kind === "text";
    const useSubNodeGranularity = isText && opts.granularity !== "node";

    if (useSubNodeGranularity) {
      const blocks = (node.props as TextProps).blocks;
      if (blocks?.length) {
        emitTextBoxes(node, blocks, opts, classMap, iw, ih, out);
      }
    } else {
      // Node-level bbox for all node types (and text when granularity="node")
      const className = node.tag ?? opts.catchAllClass;
      if (className != null && node.width > 0 && node.height > 0) {
        const classId = classMap.get(className);
        if (classId != null) {
          out.push(
            makeBox(
              className,
              classId,
              node.x,
              node.y,
              node.width,
              node.height,
              iw,
              ih,
            ),
          );
        }
      }
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child != null && typeof child === "object" && "type" in child) {
        emitBoxes(child as SoneMetadata, opts, classMap, iw, ih, out);
      }
    }
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Transform a `SoneMetadata` tree into a YOLO bounding-box dataset.
 *
 * @example
 * ```ts
 * // Node-level, all types (default)
 * const ds = toYoloDataset(metadata);
 * console.log(ds.toTxt());
 *
 * // Segment-level for tagged text only, skip untagged
 * const ds = toYoloDataset(metadata, {
 *   granularity: "segment",
 *   include: ["text"],
 *   catchAllClass: null,
 * });
 *
 * // Document layout analysis: section / total / margin-row classes
 * const ds = toYoloDataset(metadata, {
 *   granularity: "line",
 *   include: ["text", "photo"],
 *   catchAllClass: "content",
 * });
 *
 * // Write files
 * await fs.writeFile("labels.txt", ds.toTxt());
 * await fs.writeFile("labels.json", JSON.stringify(ds.toJSON(), null, 2));
 * ```
 */
export function toYoloDataset(
  metadata: SoneMetadata,
  options: YoloExportOptions = {},
): YoloDataset {
  const opts: ResolvedOptions = {
    granularity: options.granularity ?? "node",
    include: options.include ?? ["text", "photo", "layout"],
    catchAllClass:
      options.catchAllClass !== undefined
        ? options.catchAllClass
        : "__unlabeled__",
  };

  // Pass 1 — collect all class names that will appear in the output
  const classNames = new Set<string>();
  collectClasses(metadata, opts, classNames);

  // Assign IDs alphabetically for determinism
  const classes = new Map<string, number>();
  for (const [i, name] of [...classNames].sort().entries()) {
    classes.set(name, i);
  }

  // Pass 2 — emit bounding boxes
  const iw = metadata.width;
  const ih = metadata.height;
  const boxes: YoloBox[] = [];
  emitBoxes(metadata, opts, classes, iw, ih, boxes);

  return {
    classes,
    boxes,
    imageWidth: iw,
    imageHeight: ih,
    toTxt() {
      return boxes
        .map(
          (b) =>
            `${b.classId} ${b.cx.toFixed(6)} ${b.cy.toFixed(6)} ${b.w.toFixed(6)} ${b.h.toFixed(6)}`,
        )
        .join("\n");
    },
    toJSON(): YoloDatasetJSON {
      return {
        imageWidth: iw,
        imageHeight: ih,
        classes: Object.fromEntries(classes),
        boxes,
      };
    },
  };
}

// ── COCO types ────────────────────────────────────────────────────────────────

export interface CocoExportOptions extends YoloExportOptions {
  /**
   * Numeric ID assigned to the image entry.
   * @default 1
   */
  imageId?: number;
  /**
   * File name recorded in the image entry.
   * @default "image.jpg"
   */
  fileName?: string;
  /**
   * `supercategory` field written to every category entry.
   * @default "layout"
   */
  supercategory?: string;
}

export interface CocoImage {
  id: number;
  file_name: string;
  width: number;
  height: number;
}

export interface CocoAnnotation {
  /** 1-based annotation ID. */
  id: number;
  image_id: number;
  category_id: number;
  /** Absolute pixel bbox: [x, y, width, height] (top-left origin). */
  bbox: [number, number, number, number];
  /** Bbox area in pixels². */
  area: number;
  /** Segmentation polygons (empty — bbox-only dataset). */
  segmentation: number[][];
  iscrowd: 0 | 1;
}

export interface CocoCategory {
  /** 1-based category ID. */
  id: number;
  name: string;
  supercategory: string;
}

export interface CocoDatasetJSON {
  images: CocoImage[];
  annotations: CocoAnnotation[];
  categories: CocoCategory[];
}

export interface CocoDataset {
  images: CocoImage[];
  annotations: CocoAnnotation[];
  /** Categories sorted by ID (1-based, alphabetical by name). */
  categories: CocoCategory[];
  /** Serialise to a plain JSON-safe object ready for `JSON.stringify`. */
  toJSON(): CocoDatasetJSON;
}

/**
 * Transform a `SoneMetadata` tree into a COCO bounding-box dataset.
 *
 * Reuses the same granularity / include / catchAllClass options as
 * `toYoloDataset`. Category IDs are 1-based and assigned alphabetically.
 * Bbox coordinates are absolute pixels in `[x, y, width, height]` format.
 *
 * @example
 * ```ts
 * const { metadata } = await sone(root).canvasWithMetadata();
 *
 * const ds = toCocoDataset(metadata, {
 *   granularity: "line",
 *   include: ["text", "photo"],
 *   catchAllClass: "content",
 *   fileName: "invoice-001.jpg",
 * });
 *
 * await fs.writeFile("annotations.json", JSON.stringify(ds.toJSON(), null, 2));
 * ```
 */
export function toCocoDataset(
  metadata: SoneMetadata,
  options: CocoExportOptions = {},
): CocoDataset {
  const imageId = options.imageId ?? 1;
  const fileName = options.fileName ?? "image.jpg";
  const supercategory = options.supercategory ?? "layout";

  // Reuse YOLO extraction — absolute pixel coords live on every YoloBox
  const ds = toYoloDataset(metadata, {
    granularity: options.granularity,
    include: options.include,
    catchAllClass: options.catchAllClass,
  });

  // Categories: 1-based IDs, sorted by the 0-based YOLO ID for consistency
  const categories: CocoCategory[] = [...ds.classes.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([name, id]) => ({ id: id + 1, name, supercategory }));

  // Annotations: 1-based IDs, absolute pixel bbox
  const annotations: CocoAnnotation[] = ds.boxes.map((b, i) => ({
    id: i + 1,
    image_id: imageId,
    category_id: b.classId + 1,
    bbox: [b.x, b.y, b.pixelWidth, b.pixelHeight],
    area: b.pixelWidth * b.pixelHeight,
    segmentation: [],
    iscrowd: 0,
  }));

  const images: CocoImage[] = [
    {
      id: imageId,
      file_name: fileName,
      width: ds.imageWidth,
      height: ds.imageHeight,
    },
  ];

  return {
    images,
    annotations,
    categories,
    toJSON(): CocoDatasetJSON {
      return { images, annotations, categories };
    },
  };
}
