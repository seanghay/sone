/**
 * Capability gate for the `skia` (CanvasKit WASM) dependency.
 *
 * The `skia` package ships a prebuilt, committed WASM blob and its bundled
 * `.d.ts` demonstrably overstates what the binary actually exports (its own
 * test suite skips `drawGlyphsRSXform` and `Typeface.makeVariation` as "not in
 * the WASM binary"). So every capability sone depends on is probed here at
 * runtime rather than trusted from types.
 *
 * Run this before bumping the `skia` version. If it fails, the bump is unsafe.
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { beforeAll, expect, test } from "vitest";

// The package only exports "." and "./canvaskit.wasm", so the CanvasKit type is
// reached through its own entry point rather than a deep path.
type CanvasKit = Awaited<ReturnType<typeof import("skia").create>>;

const fontPath = (name: string) =>
  fileURLToPath(new URL(`../font/${name}`, import.meta.url));

const WASM_PATH = fileURLToPath(
  new URL("../../node_modules/skia/src/canvaskit.wasm", import.meta.url),
);

/** Pinned to skia@0.3.0. Update deliberately, never to make a test pass. */
const WASM_SHA256 =
  "efbb9bc15dbcdc0d6231e3d2e4303b5d0b38afa3f1bf17605ba9bb3f1bcbc155";

let CK: CanvasKit;
let khmerBytes: Buffer;
let geistBytes: Buffer;

beforeAll(async () => {
  const { create } = await import("skia");
  CK = (await create()) as unknown as CanvasKit;
  khmerBytes = await readFile(fontPath("NotoSansKhmer.ttf"));
  geistBytes = await readFile(fontPath("GeistMono-Regular.ttf"));
});

/**
 * Measure a single shaped run the way sone will: one Paragraph, laid out
 * unconstrained, read back via getMaxIntrinsicWidth.
 */
function measure(
  text: string,
  opts: {
    family: string;
    provider: ReturnType<CanvasKit["TypefaceFontProvider"]["Make"]>;
    size?: number;
    letterSpacing?: number;
    wordSpacing?: number;
  },
) {
  const style = new CK.ParagraphStyle({
    textStyle: {
      color: CK.BLACK,
      fontSize: opts.size ?? 24,
      fontFamilies: [opts.family],
      letterSpacing: opts.letterSpacing,
      wordSpacing: opts.wordSpacing,
    },
  });
  const builder = CK.ParagraphBuilder.MakeFromFontProvider(
    style,
    opts.provider,
  );
  builder.addText(text);
  const paragraph = builder.build();
  paragraph.layout(1e7);
  const width = paragraph.getMaxIntrinsicWidth();
  paragraph.delete();
  builder.delete();
  return width;
}

function providerFor(bytes: Buffer, family: string) {
  const provider = CK.TypefaceFontProvider.Make();
  provider.registerFont(bytes, family);
  return provider;
}

/**
 * Current size of the Emscripten heap. `HEAPU8` is a real runtime property that
 * the bundled `.d.ts` does not declare — one more reason this file probes the
 * binary rather than trusting its types.
 */
const heapSize = () => (CK as unknown as { HEAPU8: Uint8Array }).HEAPU8.length;

test("wasm blob matches the pinned checksum", async () => {
  const hash = createHash("sha256")
    .update(await readFile(WASM_PATH))
    .digest("hex");
  expect(hash).toBe(WASM_SHA256);
});

test("exposes every API surface sone depends on", () => {
  for (const key of [
    "ParagraphBuilder",
    "TypefaceFontProvider",
    "FontMgr",
    "PictureRecorder",
    "PDFDocument",
    "PDFMetadata",
    "SVGCanvas",
    "MakeSurface",
    "MakeImageFromEncoded",
    "Path",
    "Paint",
    "Shader",
    "ImageFilter",
    "ColorFilter",
    "MaskFilter",
    "PathEffect",
    "Font",
    "Typeface",
  ]) {
    expect(CK[key as keyof CanvasKit], `CanvasKit.${key} missing`).toBeTruthy();
  }
  expect(CK.ImageFormat.PNG).toBeTruthy();
  expect(CK.ImageFormat.JPEG).toBeTruthy();
  expect(CK.ImageFormat.WEBP).toBeTruthy();
});

test("shapes complex scripts (HarfBuzz + ICU are compiled in)", () => {
  const provider = providerFor(khmerBytes, "Khmer");
  // Khmer requires cluster formation; an unshaped advance-sum gives a
  // different (larger) width, so this value is the shaping proof.
  expect(measure("ភាសាខ្មែរ", { family: "Khmer", provider })).toBeCloseTo(
    80.4,
    1,
  );
  provider.delete();
});

test("applies letterSpacing and wordSpacing exactly", () => {
  const provider = providerFor(khmerBytes, "Khmer");
  const text = "Hello world"; // 11 chars, 1 space
  const base = measure(text, { family: "Khmer", provider });

  expect(base).toBeCloseTo(128.71, 1);
  expect(
    measure(text, { family: "Khmer", provider, letterSpacing: 5 }),
  ).toBeCloseTo(base + 5 * text.length, 1);
  expect(
    measure(text, { family: "Khmer", provider, wordSpacing: 10 }),
  ).toBeCloseTo(base + 10, 1);

  provider.delete();
});

test("font metrics are text-independent and match paragraph line metrics", () => {
  const typeface = CK.Typeface.MakeFreeTypeFaceFromData(
    khmerBytes.buffer.slice(
      khmerBytes.byteOffset,
      khmerBytes.byteOffset + khmerBytes.byteLength,
    ) as ArrayBuffer,
  );
  expect(typeface).toBeTruthy();

  const font = new CK.Font(typeface, 24);
  const metrics = font.getMetrics();

  // This is sone's entire vertical metrics contract:
  //   fontBoundingBoxAscent  = -ascent
  //   fontBoundingBoxDescent =  descent
  expect(-metrics.ascent).toBeCloseTo(25.656, 2);
  expect(metrics.descent).toBeCloseTo(7.032, 2);

  font.delete();
  typeface?.delete();
});

test("encodes PNG, JPEG and WebP", () => {
  const surface = CK.MakeSurface(8, 8);
  expect(surface).toBeTruthy();
  surface?.getCanvas().clear(CK.RED);
  const image = surface?.makeImageSnapshot();

  for (const format of ["PNG", "JPEG", "WEBP"] as const) {
    const bytes = image?.encodeToBytes(CK.ImageFormat[format], 0.9);
    expect(bytes, `${format} encode returned null`).toBeTruthy();
    expect(bytes!.length).toBeGreaterThan(0);
  }

  image?.delete();
  surface?.delete();
});

test("replays one Picture into vector PDF and SVG", () => {
  const provider = providerFor(geistBytes, "Geist");

  const recorder = new CK.PictureRecorder();
  const canvas = recorder.beginRecording(CK.LTRBRect(0, 0, 400, 200));
  const paint = new CK.Paint();
  paint.setColor(CK.Color(26, 102, 230, 1));
  canvas.drawRect(CK.LTRBRect(10, 10, 150, 60), paint);

  const builder = CK.ParagraphBuilder.MakeFromFontProvider(
    new CK.ParagraphStyle({
      textStyle: { color: CK.BLACK, fontSize: 28, fontFamilies: ["Geist"] },
    }),
    provider,
  );
  builder.addText("SelectableText123");
  const paragraph = builder.build();
  paragraph.layout(1e6);
  canvas.drawParagraph(paragraph, 20, 100);
  const picture = recorder.finishRecordingAsPicture();

  // --- multi-page PDF, vector, with embedded subsetted fonts
  const doc = new CK.PDFDocument(new CK.PDFMetadata());
  doc.beginPage(400, 200).drawPicture(picture);
  doc.endPage();
  doc.beginPage(400, 200).drawPicture(picture);
  doc.endPage();
  const pdf = Buffer.from(doc.close());

  expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  const pdfText = pdf.toString("latin1");
  // Proves text stays selectable rather than being outlined to paths.
  expect(pdfText).toContain("/FontFile2");
  expect(pdfText).toContain("/Type0");
  expect(pdfText.match(/\/Type\s*\/Page[^s]/g)?.length).toBe(2);

  // --- SVG keeps live <text> elements
  const svgCanvas = new CK.SVGCanvas(400, 200, 0);
  svgCanvas.getCanvas().drawPicture(picture);
  const svg = Buffer.from(svgCanvas.close()).toString("utf8");

  expect(svg).toContain("<svg");
  expect(svg).toContain("<text");
  expect(svg).toContain("SelectableText123");

  paragraph.delete();
  builder.delete();
  paint.delete();
  picture.delete();
  recorder.delete();
  provider.delete();
});

test("density replays at scale rather than upscaling", () => {
  const recorder = new CK.PictureRecorder();
  const canvas = recorder.beginRecording(CK.LTRBRect(0, 0, 100, 50));
  const paint = new CK.Paint();
  paint.setColor(CK.BLACK);
  canvas.drawRect(CK.LTRBRect(0, 0, 100, 50), paint);
  const picture = recorder.finishRecordingAsPicture();

  for (const density of [1, 2]) {
    const surface = CK.MakeSurface(100 * density, 50 * density);
    const target = surface!.getCanvas();
    target.scale(density, density);
    target.drawPicture(picture);
    const image = surface!.makeImageSnapshot();
    expect(image.width()).toBe(100 * density);
    expect(image.height()).toBe(50 * density);
    image.delete();
    surface!.delete();
  }

  paint.delete();
  picture.delete();
  recorder.delete();
});

test("decodes PNG, JPEG and WebP images", async () => {
  const jpeg = await readFile(
    fileURLToPath(new URL("../image/kouprey.jpg", import.meta.url)),
  );
  const image = CK.MakeImageFromEncoded(jpeg);
  expect(image).toBeTruthy();
  expect(image!.width()).toBeGreaterThan(0);
  image?.delete();
});

/**
 * Memory behaviour.
 *
 * `heapSize()` only moves once Emscripten's preallocated 256MB heap is
 * exhausted, so it is insensitive to small leaks. Surfaces are by far the
 * largest per-render allocation (a 512x512 RGBA surface is 1MB), which makes
 * them the right probe.
 *
 * The finding these tests pin down: **`MakeSurface` does not fully release its
 * backing store on `.delete()`** — allocating one per render grows the heap
 * monotonically (268MB -> 464MB -> 861MB over 800 renders). Reusing a single
 * surface is perfectly stable. So sone must pool surfaces by dimension rather
 * than allocate per render/per page, or a long-running server grows unbounded.
 */
const SURFACE = 512;

function drawPicture(
  provider: ReturnType<CanvasKit["TypefaceFontProvider"]["Make"]>,
) {
  const recorder = new CK.PictureRecorder();
  const canvas = recorder.beginRecording(CK.LTRBRect(0, 0, SURFACE, SURFACE));
  const paint = new CK.Paint();
  paint.setColor(CK.BLACK);
  canvas.drawRect(CK.LTRBRect(0, 0, 50, 50), paint);

  const builder = CK.ParagraphBuilder.MakeFromFontProvider(
    new CK.ParagraphStyle({
      textStyle: { color: CK.BLACK, fontSize: 16, fontFamilies: ["Geist"] },
    }),
    provider,
  );
  builder.addText("leak check");
  const paragraph = builder.build();
  paragraph.layout(1e6);
  canvas.drawParagraph(paragraph, 0, 60);

  const picture = recorder.finishRecordingAsPicture();
  paragraph.delete();
  builder.delete();
  paint.delete();
  recorder.delete();
  return picture;
}

test("Paint and Picture round-trip without leaking", () => {
  const before = heapSize();
  for (let i = 0; i < 300; i++) {
    const paint = new CK.Paint();
    paint.delete();
    const recorder = new CK.PictureRecorder();
    recorder.beginRecording(CK.LTRBRect(0, 0, SURFACE, SURFACE));
    const picture = recorder.finishRecordingAsPicture();
    picture.delete();
    recorder.delete();
  }
  expect(heapSize()).toBe(before);
});

/**
 * Regression marker, not an aspiration: this documents an upstream leak we must
 * design around. If it ever starts failing, `MakeSurface` was fixed upstream
 * and the surface pool in `SoneCanvas` can be simplified.
 */
test("MakeSurface leaks its backing store on delete (upstream)", () => {
  for (let i = 0; i < 10; i++) CK.MakeSurface(SURFACE, SURFACE)?.delete();
  const before = heapSize();
  for (let i = 0; i < 300; i++) CK.MakeSurface(SURFACE, SURFACE)?.delete();
  expect(heapSize()).toBeGreaterThan(before);
});

test("a pooled surface renders repeatedly without growing the heap", () => {
  const provider = providerFor(geistBytes, "Geist");
  const surface = CK.MakeSurface(SURFACE, SURFACE);
  expect(surface).toBeTruthy();

  const renderOnce = () => {
    const picture = drawPicture(provider);
    const canvas = surface!.getCanvas();
    canvas.clear(CK.WHITE);
    canvas.drawPicture(picture);
    const image = surface!.makeImageSnapshot();
    image.encodeToBytes(CK.ImageFormat.PNG);
    image.delete();
    picture.delete();
  };

  // Warm up so one-time allocations settle, then assert the heap is stable.
  for (let i = 0; i < 10; i++) renderOnce();
  const settled = heapSize();
  for (let i = 0; i < 400; i++) renderOnce();

  expect(heapSize()).toBe(settled);

  surface!.delete();
  provider.delete();
});
