import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import {
  Column,
  Photo,
  Row,
  renderer,
  renderWithMetadata,
  Span,
  Text,
  toCocoDataset,
  toYoloDataset,
} from "../src/node.ts";

const relative = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const imageUrl = relative("image/kouprey.jpg");

// ── Helpers ───────────────────────────────────────────────────────────────────

async function buildMeta(root: ReturnType<typeof Column>) {
  const { metadata } = await renderWithMetadata(root, renderer);
  return metadata;
}

// ── Class discovery ───────────────────────────────────────────────────────────

test("auto-assigns class IDs alphabetically", async () => {
  const meta = await buildMeta(
    Column(
      Text("Title").tag("title"),
      Text("Body").tag("content"),
      Row().tag("footer").height(20),
    ).width(400),
  );

  const ds = toYoloDataset(meta);
  // "__unlabeled__" sorts before letters (underscore < a-z in ASCII)
  // sorted: ["__unlabeled__", "content", "footer", "title"]
  expect(ds.classes.get("__unlabeled__")).toBe(0);
  expect(ds.classes.get("content")).toBe(1);
  expect(ds.classes.get("footer")).toBe(2);
  expect(ds.classes.get("title")).toBe(3);
});

test("catchAllClass: null skips untagged nodes entirely", async () => {
  const meta = await buildMeta(
    Column(Text("Tagged").tag("header"), Text("Untagged")).width(300),
  );

  const ds = toYoloDataset(meta, { catchAllClass: null });
  expect(ds.classes.has("__unlabeled__")).toBe(false);
  expect(ds.boxes.every((b) => b.className === "header")).toBe(true);
});

test("custom catchAllClass name is used", async () => {
  const meta = await buildMeta(Column(Text("No tag")).width(200));

  const ds = toYoloDataset(meta, { catchAllClass: "unknown" });
  expect(ds.classes.has("unknown")).toBe(true);
  expect(ds.boxes.some((b) => b.className === "unknown")).toBe(true);
});

// ── Granularity: node ─────────────────────────────────────────────────────────

test("granularity=node emits one box per included node", async () => {
  const meta = await buildMeta(
    Column(
      Text("Hello").tag("text-node"),
      Row().tag("spacer").height(10),
    ).width(200),
  );

  const ds = toYoloDataset(meta, {
    granularity: "node",
    catchAllClass: null,
  });

  const tags = ds.boxes.map((b) => b.className);
  expect(tags).toContain("text-node");
  expect(tags).toContain("spacer");
});

test("granularity=node uses full node dimensions", async () => {
  const meta = await buildMeta(
    Column(Row().tag("box").width(100).height(50)).width(200),
  );

  const ds = toYoloDataset(meta, {
    granularity: "node",
    include: ["layout"],
    catchAllClass: null,
  });

  const box = ds.boxes.find((b) => b.className === "box");
  expect(box).toBeDefined();
  expect(box!.pixelWidth).toBe(100);
  expect(box!.pixelHeight).toBe(50);
});

// ── Granularity: segment ──────────────────────────────────────────────────────

test("granularity=segment emits one box per non-whitespace segment", async () => {
  const meta = await buildMeta(
    Column(
      // Each separate Span becomes its own segment
      Text(Span("Hello"), " ", Span("World")).tag("word"),
    ).width(400),
  );

  const ds = toYoloDataset(meta, {
    granularity: "segment",
    include: ["text"],
    catchAllClass: null,
  });

  // "Hello" and "World" → at least 2 segments (space skipped as whitespace)
  expect(ds.boxes.length).toBeGreaterThanOrEqual(2);
  expect(ds.boxes.every((b) => b.className === "word")).toBe(true);
});

test("granularity=segment: span tag overrides node tag", async () => {
  const meta = await buildMeta(
    Column(
      Text("Regular", " ", Span("Important").tag("highlight")).tag("body"),
    ).width(400),
  );

  const ds = toYoloDataset(meta, {
    granularity: "segment",
    include: ["text"],
    catchAllClass: null,
  });

  const labels = ds.boxes.map((b) => b.className);
  expect(labels).toContain("body");
  expect(labels).toContain("highlight");
});

// ── Granularity: line ─────────────────────────────────────────────────────────

test("granularity=line emits one box per line", async () => {
  const meta = await buildMeta(
    Column(Text("Line one\nLine two\nLine three").tag("line")).width(400),
  );

  const ds = toYoloDataset(meta, {
    granularity: "line",
    include: ["text"],
    catchAllClass: null,
  });

  // 3 explicit newlines → at least 3 lines
  expect(ds.boxes.length).toBeGreaterThanOrEqual(3);
  expect(ds.boxes.every((b) => b.className === "line")).toBe(true);
});

// ── Granularity: block ────────────────────────────────────────────────────────

test("granularity=block emits one box per paragraph block", async () => {
  const meta = await buildMeta(
    Column(Text("Para one\nPara two").tag("para")).width(400),
  );

  const ds = toYoloDataset(meta, {
    granularity: "block",
    include: ["text"],
    catchAllClass: null,
  });

  // Each \n introduces a new block
  expect(ds.boxes.length).toBeGreaterThanOrEqual(2);
  expect(ds.boxes.every((b) => b.className === "para")).toBe(true);
});

// ── Node type filtering ───────────────────────────────────────────────────────

test("include=['text'] excludes layout and photo nodes", async () => {
  const meta = await buildMeta(
    Column(Text("Hi").tag("t"), Row().tag("r").height(10)).width(200),
  );

  const ds = toYoloDataset(meta, {
    include: ["text"],
    catchAllClass: null,
  });

  expect(ds.boxes.every((b) => b.className === "t")).toBe(true);
  expect(ds.boxes.some((b) => b.className === "r")).toBe(false);
});

test("include=['layout'] excludes text nodes", async () => {
  const meta = await buildMeta(
    Column(Text("Ignored").tag("text"), Row().tag("layout").height(10)).width(
      200,
    ),
  );

  const ds = toYoloDataset(meta, {
    include: ["layout"],
    catchAllClass: null,
  });

  expect(ds.boxes.every((b) => b.className === "layout")).toBe(true);
});

test("include=['photo'] captures photo nodes", async () => {
  const meta = await buildMeta(
    Column(Photo(imageUrl).tag("image").width(100).height(80)).width(200),
  );

  const ds = toYoloDataset(meta, {
    include: ["photo"],
    catchAllClass: null,
  });

  expect(ds.boxes.length).toBeGreaterThan(0);
  expect(ds.boxes.every((b) => b.className === "image")).toBe(true);
});

// ── Normalised coordinates ────────────────────────────────────────────────────

test("normalised coords are in [0, 1]", async () => {
  // Use multiple tagged nodes to exercise various sizes
  const meta = await buildMeta(
    Column(
      Row().tag("a").width(100).height(20),
      Row().tag("b").width(200).height(40),
      Row().tag("c").width(50).height(10),
    ).width(300),
  );

  const ds = toYoloDataset(meta, {
    include: ["layout"],
    catchAllClass: null,
  });

  expect(ds.boxes.length).toBeGreaterThan(0);
  for (const b of ds.boxes) {
    expect(b.cx).toBeGreaterThan(0);
    expect(b.cx).toBeLessThanOrEqual(1);
    expect(b.cy).toBeGreaterThan(0);
    expect(b.cy).toBeLessThanOrEqual(1);
    expect(b.w).toBeGreaterThan(0);
    expect(b.w).toBeLessThanOrEqual(1);
    expect(b.h).toBeGreaterThan(0);
    expect(b.h).toBeLessThanOrEqual(1);
  }
});

test("cx/cy are consistent with x/y/pixelWidth/pixelHeight", async () => {
  const meta = await buildMeta(
    Column(Row().tag("box").width(60).height(40)).width(200),
  );

  const ds = toYoloDataset(meta, {
    include: ["layout"],
    catchAllClass: null,
  });

  const b = ds.boxes.find((b) => b.className === "box")!;
  expect(b.cx).toBeCloseTo((b.x + b.pixelWidth / 2) / ds.imageWidth, 5);
  expect(b.cy).toBeCloseTo((b.y + b.pixelHeight / 2) / ds.imageHeight, 5);
  expect(b.w).toBeCloseTo(b.pixelWidth / ds.imageWidth, 5);
  expect(b.h).toBeCloseTo(b.pixelHeight / ds.imageHeight, 5);
});

// ── Serialisation ─────────────────────────────────────────────────────────────

test("toTxt() produces valid YOLO format lines", async () => {
  const meta = await buildMeta(Column(Text("Hello").tag("label")).width(200));

  const ds = toYoloDataset(meta, { catchAllClass: null });
  const lines = ds.toTxt().split("\n").filter(Boolean);

  for (const line of lines) {
    const parts = line.split(" ");
    expect(parts).toHaveLength(5);
    const [id, cx, cy, w, h] = parts.map(Number);
    expect(Number.isInteger(id)).toBe(true);
    expect(cx).toBeGreaterThanOrEqual(0);
    expect(cy).toBeGreaterThanOrEqual(0);
    expect(w).toBeGreaterThan(0);
    expect(h).toBeGreaterThan(0);
  }
});

test("toJSON() round-trips correctly", async () => {
  const meta = await buildMeta(Column(Text("Hello").tag("label")).width(200));

  const ds = toYoloDataset(meta, { catchAllClass: null });
  const json = ds.toJSON();

  expect(json.imageWidth).toBe(ds.imageWidth);
  expect(json.imageHeight).toBe(ds.imageHeight);
  expect(json.classes).toEqual(Object.fromEntries(ds.classes));
  expect(json.boxes).toHaveLength(ds.boxes.length);
});

test("toJSON() is JSON-serialisable", async () => {
  const meta = await buildMeta(
    Column(Text("A").tag("a"), Row().tag("b").height(10)).width(200),
  );

  const ds = toYoloDataset(meta);
  expect(() => JSON.stringify(ds.toJSON())).not.toThrow();
});

// ── imageWidth / imageHeight ──────────────────────────────────────────────────

test("imageWidth and imageHeight match root metadata dimensions", async () => {
  const meta = await buildMeta(Column(Text("Hi")).width(320));

  const ds = toYoloDataset(meta);
  expect(ds.imageWidth).toBe(meta.width);
  expect(ds.imageHeight).toBe(meta.height);
});

// ── COCO ──────────────────────────────────────────────────────────────────────

test("toCocoDataset: categories are 1-based and sorted alphabetically", async () => {
  const meta = await buildMeta(
    Column(
      Text("Title").tag("title"),
      Text("Body").tag("content"),
      Row().tag("footer").height(20),
    ).width(400),
  );

  const ds = toCocoDataset(meta);
  const ids = ds.categories.map((c) => c.id);
  const names = ds.categories.map((c) => c.name);

  // IDs must be 1-based and contiguous
  expect(ids[0]).toBe(1);
  expect(ids).toEqual([...ids].sort((a, b) => a - b));
  // Names sorted alphabetically (same order as YOLO, offset by 1)
  expect(names).toEqual([...names].sort());
});

test("toCocoDataset: annotations bbox is absolute pixels [x,y,w,h]", async () => {
  const meta = await buildMeta(
    Column(Row().tag("box").width(80).height(40)).width(200),
  );

  const yolo = toYoloDataset(meta, {
    include: ["layout"],
    catchAllClass: null,
  });
  const coco = toCocoDataset(meta, {
    include: ["layout"],
    catchAllClass: null,
  });

  expect(coco.annotations.length).toBeGreaterThan(0);
  for (let i = 0; i < coco.annotations.length; i++) {
    const ann = coco.annotations[i];
    const box = yolo.boxes[i];
    expect(ann.bbox).toEqual([box.x, box.y, box.pixelWidth, box.pixelHeight]);
    expect(ann.area).toBe(box.pixelWidth * box.pixelHeight);
  }
});

test("toCocoDataset: annotation category_id matches category list (1-based)", async () => {
  const meta = await buildMeta(
    Column(Text("A").tag("alpha"), Text("B").tag("beta")).width(200),
  );

  const ds = toCocoDataset(meta, { catchAllClass: null });
  const catById = new Map(ds.categories.map((c) => [c.id, c]));

  for (const ann of ds.annotations) {
    expect(catById.has(ann.category_id)).toBe(true);
  }
});

test("toCocoDataset: annotation IDs are 1-based and unique", async () => {
  const meta = await buildMeta(
    Column(
      Text("One").tag("t"),
      Text("Two").tag("t"),
      Text("Three").tag("t"),
    ).width(200),
  );

  const ds = toCocoDataset(meta, { catchAllClass: null });
  const ids = ds.annotations.map((a) => a.id);

  expect(ids[0]).toBe(1);
  expect(new Set(ids).size).toBe(ids.length); // unique
  expect(ids).toEqual([...ids].sort((a, b) => a - b)); // ascending
});

test("toCocoDataset: images entry uses imageId and fileName options", async () => {
  const meta = await buildMeta(Column(Text("Hi")).width(300));

  const ds = toCocoDataset(meta, { imageId: 42, fileName: "doc-042.jpg" });

  expect(ds.images).toHaveLength(1);
  expect(ds.images[0].id).toBe(42);
  expect(ds.images[0].file_name).toBe("doc-042.jpg");
  expect(ds.images[0].width).toBe(meta.width);
  expect(ds.images[0].height).toBe(meta.height);
});

test("toCocoDataset: supercategory option is applied to all categories", async () => {
  const meta = await buildMeta(Column(Text("Hi").tag("title")).width(200));

  const ds = toCocoDataset(meta, {
    supercategory: "document",
    catchAllClass: null,
  });

  expect(ds.categories.every((c) => c.supercategory === "document")).toBe(true);
});

test("toCocoDataset: catchAllClass=null skips untagged, same as YOLO", async () => {
  const meta = await buildMeta(
    Column(Text("Tagged").tag("label"), Text("Untagged")).width(300),
  );

  const yolo = toYoloDataset(meta, { catchAllClass: null });
  const coco = toCocoDataset(meta, { catchAllClass: null });

  expect(coco.annotations.length).toBe(yolo.boxes.length);
});

test("toCocoDataset: iscrowd is always 0 and segmentation is empty", async () => {
  const meta = await buildMeta(Column(Text("Check").tag("t")).width(200));

  const ds = toCocoDataset(meta, { catchAllClass: null });
  expect(ds.annotations.every((a) => a.iscrowd === 0)).toBe(true);
  expect(
    ds.annotations.every(
      (a) => Array.isArray(a.segmentation) && a.segmentation.length === 0,
    ),
  ).toBe(true);
});

test("toCocoDataset: toJSON() is JSON-serialisable", async () => {
  const meta = await buildMeta(
    Column(Text("A").tag("a"), Row().tag("b").height(10)).width(200),
  );

  const ds = toCocoDataset(meta);
  expect(() => JSON.stringify(ds.toJSON())).not.toThrow();

  const json = ds.toJSON();
  expect(json).toHaveProperty("images");
  expect(json).toHaveProperty("annotations");
  expect(json).toHaveProperty("categories");
});

test("toCocoDataset: granularity and include options forwarded correctly", async () => {
  const meta = await buildMeta(
    Column(
      Text("Line one\nLine two").tag("line"),
      Row().tag("spacer").height(10),
    ).width(400),
  );

  const cocoLines = toCocoDataset(meta, {
    granularity: "line",
    include: ["text"],
    catchAllClass: null,
  });

  const yoloLines = toYoloDataset(meta, {
    granularity: "line",
    include: ["text"],
    catchAllClass: null,
  });

  expect(cocoLines.annotations.length).toBe(yoloLines.boxes.length);
  // No layout nodes included
  expect(
    cocoLines.annotations.every((a) => {
      const cat = cocoLines.categories.find((c) => c.id === a.category_id);
      return cat?.name === "line";
    }),
  ).toBe(true);
});
