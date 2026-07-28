/**
 * Runtime validation of the Skia backend core: fonts, measurement, painting,
 * and output. Types alone prove nothing here — the bundled `.d.ts` is known to
 * overstate the binary — so everything is exercised for real.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { beforeAll, expect, test } from "vitest";
import type { SpanProps } from "../../src/core.ts";
import { Arena } from "../../src/skia/arena.ts";
import {
  combineToPdf,
  releaseSurfacePool,
  SoneCanvas,
} from "../../src/skia/canvas.ts";
import { parseColor } from "../../src/skia/color.ts";
import { FontRegistry, SoneFontError } from "../../src/skia/fonts.ts";
import { ck, ready } from "../../src/skia/init.ts";
import { TextMeasurer } from "../../src/skia/measure.ts";
import { ParagraphPainter } from "../../src/skia/paragraph.ts";
import { SonePath } from "../../src/skia/path.ts";

const fontPath = (name: string) =>
  fileURLToPath(new URL(`../font/${name}`, import.meta.url));

let fonts: FontRegistry;
let measurer: TextMeasurer;
let painter: ParagraphPainter;

const span = (over: Partial<SpanProps> = {}): SpanProps =>
  ({
    font: ["Geist"],
    size: 16,
    weight: 400,
    style: "normal",
    ...over,
  }) as SpanProps;

beforeAll(async () => {
  await ready();
  fonts = new FontRegistry();
  fonts.register(
    "Geist",
    new Uint8Array(await readFile(fontPath("GeistMono-Regular.ttf"))),
  );
  fonts.register(
    "Khmer",
    new Uint8Array(await readFile(fontPath("NotoSansKhmer.ttf"))),
  );
  measurer = new TextMeasurer(fonts);
  painter = new ParagraphPainter(fonts, measurer);
});

// --- colour -----------------------------------------------------------------

test("parses the CSS colour forms sone accepts", () => {
  expect([...parseColor("#ff0000")]).toEqual([1, 0, 0, 1]);
  expect([...parseColor("#f00")]).toEqual([1, 0, 0, 1]);
  expect([...parseColor("red")]).toEqual([1, 0, 0, 1]);
  expect([...parseColor("transparent")]).toEqual([0, 0, 0, 0]);
  expect([...parseColor("rgb(255, 0, 0)")]).toEqual([1, 0, 0, 1]);

  const half = parseColor("rgba(255, 0, 0, 0.5)");
  expect(half[3]).toBeCloseTo(0.5, 5);

  const hsl = parseColor("hsl(0, 100%, 50%)");
  expect(hsl[0]).toBeCloseTo(1, 5);
  expect(hsl[1]).toBeCloseTo(0, 5);

  // Unrecognised input falls back to opaque black rather than throwing.
  expect([...parseColor("not-a-colour")]).toEqual([0, 0, 0, 1]);
});

// --- fonts ------------------------------------------------------------------

test("resolves generic families to the first registered font", () => {
  // The requested family always comes first...
  expect(fonts.resolve(["sans-serif"])[0]).toBe("Geist");
  expect(fonts.resolve(["monospace"])[0]).toBe("Geist");
  expect(fonts.resolve(["Khmer"])[0]).toBe("Khmer");
  // ...and an unknown family still resolves to something real.
  expect(fonts.resolve(["NoSuchFont"])[0]).toBe("Geist");
  expect(fonts.resolve(["Khmer", "sans-serif"]).slice(0, 2)).toEqual([
    "Khmer",
    "Geist",
  ]);
});

test("appends every registered family as a fallback chain", () => {
  // Skia walks this list per glyph, so a Latin-only primary font still renders
  // Khmer. Without it, any uncovered glyph draws as tofu.
  const chain = fonts.resolve(["Geist"]);
  expect(chain[0]).toBe("Geist");
  expect(chain).toContain("Khmer");
  // No duplicates, even when the requested family is also in the registry.
  expect(new Set(chain).size).toBe(chain.length);
});

test("throws an actionable error when no fonts are registered", () => {
  const empty = new FontRegistry();
  expect(() => empty.resolve(["sans-serif"])).toThrow(SoneFontError);
  expect(() => empty.resolve(["sans-serif"])).toThrow(/Font\.load/);
});

test("unregistering a family actually removes it", () => {
  const registry = new FontRegistry();
  const bytes = fonts.families();
  expect(bytes.length).toBeGreaterThan(0);

  return readFile(fontPath("Moul-Regular.ttf")).then((data) => {
    registry.register("Moul", new Uint8Array(data));
    expect(registry.has("Moul")).toBe(true);
    registry.unregister("Moul");
    expect(registry.has("Moul")).toBe(false);
  });
});

// --- measurement ------------------------------------------------------------

test("measures the three fields sone depends on", () => {
  const metrics = measurer.measure("Hello world", span());
  expect(metrics.width).toBeCloseTo(105.6, 1);
  expect(metrics.fontBoundingBoxAscent).toBeGreaterThan(0);
  expect(metrics.fontBoundingBoxDescent).toBeGreaterThan(0);
});

test("ascent and descent do not vary with the text", () => {
  const a = measurer.measure("i", span());
  const b = measurer.measure("WWWWWWWW", span());
  expect(a.fontBoundingBoxAscent).toBe(b.fontBoundingBoxAscent);
  expect(a.fontBoundingBoxDescent).toBe(b.fontBoundingBoxDescent);
});

test("applies letterSpacing and wordSpacing", () => {
  const base = measurer.measure("Hello world", span()).width;
  expect(
    measurer.measure("Hello world", span({ letterSpacing: 5 })).width,
  ).toBeCloseTo(base + 5 * "Hello world".length, 1);
  expect(
    measurer.measure("Hello world", span({ wordSpacing: 10 })).width,
  ).toBeCloseTo(base + 10, 1);
});

test("drives the wght axis of a variable font", async () => {
  // `fontStyle.weight` alone only selects among static faces — a variable font
  // needs the axis set through fontVariations, or every weight renders
  // identically.
  fonts.register(
    "GoogleSans",
    new Uint8Array(
      await readFile(fontPath("GoogleSans-VariableFont_GRAD,opsz,wght.ttf")),
    ),
  );

  const at = (weight: number | string) =>
    measurer.measure("Weight", span({ font: ["GoogleSans"], size: 40, weight }))
      .width;

  const regular = at(400);
  const bold = at(700);
  expect(bold).toBeGreaterThan(regular);

  // CSS keywords resolve to numbers rather than silently falling back to 400.
  expect(at("bold")).toBe(bold);
  expect(at("normal")).toBe(regular);

  // Values outside the face's axis range clamp rather than throw.
  expect(at(900)).toBe(bold);
  expect(at(100)).toBe(regular);

  fonts.unregister("GoogleSans");
});

test("selects the right face when one family has several static weights", async () => {
  fonts.register(
    "TwoFace",
    new Uint8Array(await readFile(fontPath("GeistMono-Regular.ttf"))),
  );
  fonts.register(
    "TwoFace",
    new Uint8Array(await readFile(fontPath("GeistMono-Bold.ttf"))),
  );

  // GeistMono is monospaced, so advance widths cannot distinguish the faces —
  // compare the rendered ink instead.
  const render = (weight: number) => {
    const canvas = new SoneCanvas(300, 60);
    const arena = new Arena(ck());
    painter.drawRun(
      canvas.getCanvas(),
      arena,
      "Bold?",
      span({ font: ["TwoFace"], size: 32, weight }),
      { x: 5, baselineY: 40, fill: arena.fill("black") },
    );
    const png = canvas.toBuffer("png");
    arena.dispose();
    canvas.delete();
    return png;
  };

  // Bold covers more pixels, so its PNG does not match the regular one.
  expect(Buffer.from(render(700)).equals(Buffer.from(render(400)))).toBe(false);

  fonts.unregister("TwoFace");
});

test("shapes Khmer clusters", () => {
  const width = measurer.measure(
    "ភាសាខ្មែរ",
    span({ font: ["Khmer"], size: 24 }),
  ).width;
  expect(width).toBeCloseTo(80.4, 1);
});

test("caches without changing results", () => {
  const first = measurer.measure("cache me", span());
  const second = measurer.measure("cache me", span());
  expect(second).toEqual(first);
  measurer.clear();
  expect(measurer.measure("cache me", span())).toEqual(first);
});

// --- paths ------------------------------------------------------------------

test("builds paths from SVG strings and imperatively", () => {
  const fromSvg = new SonePath("M0 0 L10 0 L10 10 Z");
  expect(fromSvg.path).toBeTruthy();
  fromSvg.delete();

  const built = new SonePath()
    .moveTo(0, 0)
    .lineTo(10, 0)
    .lineTo(10, 10)
    .closePath();
  expect(built.path).toBeTruthy();
  built.delete();

  expect(() => new SonePath("definitely not a path")).toThrow();
});

test("withFillType copies rather than mutating the shared path", () => {
  const original = new SonePath("M0 0 L10 0 L10 10 Z");
  const evenOdd = original.withFillType("evenodd");
  expect(evenOdd).not.toBe(original);
  expect(evenOdd.path).not.toBe(original.path);
  evenOdd.delete();
  original.delete();
});

// --- painting and output ----------------------------------------------------

function renderSample(): SoneCanvas {
  const kit = ck();
  const canvas = new SoneCanvas(300, 120);
  const arena = new Arena(kit);
  const target = canvas.getCanvas();

  target.drawRect(kit.LTRBRect(0, 0, 300, 120), arena.fill("white"));
  target.drawRect(kit.LTRBRect(10, 10, 80, 40), arena.fill("#1a66e6"));

  painter.drawRun(target, arena, "Vector Text", span({ size: 24 }), {
    x: 12,
    baselineY: 90,
    width: 200,
    fill: arena.fill("black"),
  });

  arena.reset();
  arena.dispose();
  return canvas;
}

/**
 * Regression: an RTL run must paint as a single line at the origin it was given.
 *
 * Constraining `paragraph.layout()` to the run's own measured width let
 * floating-point rounding push the final cluster onto a second line, which then
 * drew stacked inside the segment's box and read as overlapping text. Laying out
 * unconstrained — with alignment forced Left so RTL does not drift to the far
 * edge — is what keeps a run on one line.
 */
test("paints an RTL run as one line, whatever width is passed", async () => {
  const hebrew = new Uint8Array(await readFile(fontPath("NotoSansHebrew.ttf")));
  fonts.register("Hebrew", hebrew);

  const props = span({ font: ["Hebrew"], size: 24 });
  const text = "שלום עולם";
  const measured = measurer.measure(text, props).width;

  const kit = ck();
  const arena = new Arena(kit);

  // Widths deliberately at, below and above the measured value — none of them
  // may cause a wrap.
  for (const width of [measured, measured - 0.5, measured + 10]) {
    const canvas = new SoneCanvas(400, 80);
    painter.drawRun(canvas.getCanvas(), arena, text, props, {
      x: 10,
      baselineY: 40,
      width,
      direction: "rtl",
      fill: arena.fill("black"),
    });

    // A wrapped run paints a second line below the baseline; a single line does
    // not. Compare ink extents rather than pixels: the SVG carries one <text>
    // element per laid-out line.
    const svg = Buffer.from(canvas.toBuffer("svg")).toString("utf8");
    const lines = svg.match(/<text/g)?.length ?? 0;
    expect(lines, `width=${width} wrapped into ${lines} lines`).toBe(1);

    canvas.delete();
  }

  arena.dispose();
  fonts.unregister("Hebrew");
});

test("renders and encodes every raster format", () => {
  const canvas = renderSample();
  for (const format of ["png", "jpg", "webp"] as const) {
    const bytes = canvas.toBuffer(format, { quality: 0.9 });
    expect(bytes.length, `${format} produced no bytes`).toBeGreaterThan(0);
  }
  expect(canvas.toBuffer("png").subarray(1, 4)).toEqual(
    new Uint8Array([0x50, 0x4e, 0x47]),
  );
  canvas.delete();
});

test("density re-renders the vector rather than upscaling", () => {
  const canvas = renderSample();
  const raw1 = canvas.toBuffer("raw", { density: 1 });
  const raw2 = canvas.toBuffer("raw", { density: 2 });
  // 4 bytes per pixel, so 2x density is 4x the data.
  expect(raw2.length).toBe(raw1.length * 4);
  canvas.delete();
});

test("PDF output keeps text selectable with embedded fonts", () => {
  const canvas = renderSample();
  const pdf = Buffer.from(canvas.toBuffer("pdf"));
  expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  const text = pdf.toString("latin1");
  expect(text).toContain("/FontFile2");
  expect(text).toContain("/Type0");
  canvas.delete();
});

test("SVG output keeps live text elements", () => {
  const canvas = renderSample();
  const svg = Buffer.from(canvas.toBuffer("svg")).toString("utf8");
  expect(svg).toContain("<svg");
  expect(svg).toContain("<text");
  expect(svg).toContain("Vector Text");
  canvas.delete();
});

test("combines several canvases into one multi-page PDF", () => {
  const pages = [renderSample(), renderSample(), renderSample()];
  const pdf = Buffer.from(combineToPdf(pages));
  expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  expect(pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g)?.length).toBe(3);
  for (const page of pages) page.delete();
});

test("surfaces are pooled, so repeated exports do not grow the heap", () => {
  const heap = () => (ck() as unknown as { HEAPU8: Uint8Array }).HEAPU8.length;

  for (let i = 0; i < 5; i++) {
    const canvas = renderSample();
    canvas.toBuffer("png");
    canvas.delete();
  }
  const settled = heap();

  for (let i = 0; i < 100; i++) {
    const canvas = renderSample();
    canvas.toBuffer("png");
    canvas.delete();
  }

  expect(heap()).toBe(settled);
  releaseSurfacePool();
  // 100+ full render/encode passes run several seconds on a GPU-less CI runner.
}, 60_000);
