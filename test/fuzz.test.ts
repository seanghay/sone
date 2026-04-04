/**
 * Fuzz / property-based tests.
 *
 * These tests drive the engine with random, adversarial, and boundary inputs
 * and assert *invariants* rather than exact values — things that must always
 * be true regardless of input.
 *
 * Sections:
 *   1. parseShadow
 *   2. isColor
 *   3. defaultLineBreakerIterator
 *   4. fontBuilder / indicesOf / isWhitespace
 *   5. getBoundingBoxRectRotation
 *   6. parseRadius
 *   7. generateGradient
 *   8. Layout rendering (Column / Row / Grid / Text / transforms)
 *   9. YOLO dataset
 *  10. COCO dataset
 */
import type { GradientNode } from "gradient-parser";
import { expect, test } from "vitest";
import { colors } from "../src/color.ts";
import type { SpanProps } from "../src/core.ts";
import { generateGradient, isColor } from "../src/gradient.ts";
import { defaultLineBreakerIterator } from "../src/linebreak.ts";
import {
  Column,
  Grid,
  Row,
  renderer,
  renderWithMetadata,
  Span,
  Text,
  toCocoDataset,
  toYoloDataset,
} from "../src/node.ts";
import { getBoundingBoxRectRotation, parseRadius } from "../src/rect.ts";
import { parseShadow } from "../src/shadow.ts";
import { fontBuilder, indicesOf, isWhitespace } from "../src/utils.ts";

// ── Deterministic PRNG (xorshift32) ──────────────────────────────────────────

function makePrng(seed: number) {
  let s = seed >>> 0 || 1;
  return {
    next(): number {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return (s >>> 0) / 0x100000000;
    },
    int(lo: number, hi: number): number {
      return lo + Math.floor(this.next() * (hi - lo + 1));
    },
    float(lo: number, hi: number): number {
      return lo + this.next() * (hi - lo);
    },
    pick<T>(arr: readonly T[]): T {
      return arr[this.int(0, arr.length - 1)];
    },
    bool(p = 0.5): boolean {
      return this.next() < p;
    },
    str(maxLen = 20): string {
      const chars =
        "abcdefghijklmnopqrstuvwxyz ABCDE0123456789!@#\t\n\u200b\u00a0";
      const len = this.int(0, maxLen);
      let out = "";
      for (let i = 0; i < len; i++) out += chars[this.int(0, chars.length - 1)];
      return out;
    },
    tagName(): string {
      return this.pick([
        "title",
        "body",
        "header",
        "footer",
        "label",
        "value",
        "caption",
        "note",
      ] as const);
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function buildMeta(root: ReturnType<typeof Column>) {
  const { metadata } = await renderWithMetadata(root, renderer);
  return metadata;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §1  parseShadow
// ═══════════════════════════════════════════════════════════════════════════════

test("parseShadow: never throws on arbitrary strings", () => {
  const inputs = [
    "",
    "   ",
    "none",
    "0",
    "0px 0px",
    "garbage garbage garbage",
    "inset",
    "inset inset inset",
    "1px 2px 3px 4px 5px 6px 7px",
    "rgba(0,0,0,0.5) 1px 2px",
    "1px 2px rgba(255, 128, 0, 0.3)",
    ",",
    ",,,,",
    "1px 2px, 3px 4px, 5px 6px rgba(0,0,0,0.1)",
    "1px 2px rgb(0,0,0)",
    "1px 2px hsl(0,0%,0%)",
    "-1px -2px -3px",
    "999999px 999999px 999999px",
    "1.5px 2.5px 3.5px",
    `${"1px 2px 3px rgba(0,0,0,0.1), ".repeat(50)}1px 2px`,
    "\x00\x01\x02",
    "inset 0 0 0 0 transparent",
  ];

  for (const input of inputs) {
    expect(
      () => parseShadow(input),
      `input: ${JSON.stringify(input)}`,
    ).not.toThrow();
    const result = parseShadow(input);
    expect(Array.isArray(result)).toBe(true);
    for (const s of result) {
      expect(typeof s.inset).toBe("boolean");
      expect("offsetX" in s).toBe(true);
      expect("offsetY" in s).toBe(true);
      expect("blurRadius" in s).toBe(true);
    }
  }
});

test("parseShadow: result always has length >= 1", () => {
  const rng = makePrng(0xdeadbeef);
  for (let i = 0; i < 300; i++) {
    const shadow = rng.str(40);
    expect(() => parseShadow(shadow)).not.toThrow();
    expect(parseShadow(shadow).length).toBeGreaterThanOrEqual(1);
  }
});

test("parseShadow: comma-join splits into independent entries", () => {
  // parseShadow("a, b") should yield same shadows as [parseShadow("a")[0], parseShadow("b")[0]]
  const pairs = [
    ["1px 2px red", "3px 4px blue"],
    ["inset 0 0 4px black", "2px 2px 8px rgba(0,0,0,0.2)"],
    ["0 1px 3px #000", "0 4px 6px #ccc"],
  ];
  for (const [a, b] of pairs) {
    const combined = parseShadow(`${a}, ${b}`);
    const separate = [...parseShadow(a), ...parseShadow(b)];
    expect(combined).toHaveLength(separate.length);
  }
});

test("parseShadow: inset flag is correctly identified", () => {
  expect(parseShadow("inset 2px 4px 6px blue")[0].inset).toBe(true);
  expect(parseShadow("2px 4px 6px blue")[0].inset).toBe(false);
  expect(parseShadow("2px inset 4px blue")[0].inset).toBe(true);
});

test("parseShadow: numeric fields are numbers (not strings) for px inputs", () => {
  const s = parseShadow("2px 4px 6px 8px red")[0];
  expect(typeof s.offsetX).toBe("number");
  expect(typeof s.offsetY).toBe("number");
  expect(typeof s.blurRadius).toBe("number");
  expect(s.offsetX).toBe(2);
  expect(s.offsetY).toBe(4);
  expect(s.blurRadius).toBe(6);
  expect(s.spreadRadius).toBe(8);
});

// ═══════════════════════════════════════════════════════════════════════════════
// §2  isColor
// ═══════════════════════════════════════════════════════════════════════════════

test("isColor: never throws on arbitrary strings", () => {
  const rng = makePrng(0xc0ffee);
  for (let i = 0; i < 500; i++) {
    const s = rng.str(30);
    expect(() => isColor(s)).not.toThrow();
    expect(typeof isColor(s)).toBe("boolean");
  }
});

test("isColor: every CSS named color in the colors table is valid", () => {
  for (const name of Object.keys(colors)) {
    expect(isColor(name), `named color: ${name}`).toBe(true);
  }
});

test("isColor: transparent is always valid", () => {
  expect(isColor("transparent")).toBe(true);
});

test("isColor: all 3/4/6/8-char hex formats are valid", () => {
  expect(isColor("#abc")).toBe(true);
  expect(isColor("#abcd")).toBe(true);
  expect(isColor("#aabbcc")).toBe(true);
  expect(isColor("#aabbccdd")).toBe(true);
  expect(isColor("#ABC")).toBe(true);
  expect(isColor("#AABBCC")).toBe(true);
});

test("isColor: invalid hex lengths are rejected", () => {
  expect(isColor("#a")).toBe(false);
  expect(isColor("#ab")).toBe(false);
  expect(isColor("#abcde")).toBe(false);
  expect(isColor("#abcdefg")).toBe(false);
});

test("isColor: rgb/rgba/hsl/hsla are valid for in-range values", () => {
  expect(isColor("rgb(0,0,0)")).toBe(true);
  expect(isColor("rgb(255,255,255)")).toBe(true);
  expect(isColor("rgb(0, 128, 255)")).toBe(true);
  expect(isColor("rgba(0,0,0,0)")).toBe(true);
  expect(isColor("rgba(255,255,255,1)")).toBe(true);
  expect(isColor("rgba(128,128,128,0.5)")).toBe(true);
  expect(isColor("hsl(0,0%,0%)")).toBe(true);
  expect(isColor("hsl(360,100%,100%)")).toBe(true);
  expect(isColor("hsla(180,50%,50%,0.75)")).toBe(true);
});

test("isColor: gradients and other non-colors are rejected", () => {
  expect(isColor("linear-gradient(red, blue)")).toBe(false);
  expect(isColor("")).toBe(false);
  expect(isColor("123")).toBe(false);
  expect(isColor("not-a-color")).toBe(false);
  expect(isColor("RED")).toBe(false); // named colors are case-sensitive
  expect(isColor("Blue")).toBe(false);
});

test("isColor: named colors are case-sensitive (only lowercase valid)", () => {
  const prng = makePrng(0xfeed);
  const names = Object.keys(colors);
  for (let i = 0; i < 30; i++) {
    const name = prng.pick(names);
    expect(isColor(name)).toBe(true);
    expect(isColor(name.toUpperCase())).toBe(false);
    expect(isColor(name[0]!.toUpperCase() + name.slice(1))).toBe(false);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// §3  defaultLineBreakerIterator
// ═══════════════════════════════════════════════════════════════════════════════

test("defaultLineBreakerIterator: never throws on arbitrary strings", () => {
  const rng = makePrng(0xabcdef);
  for (let i = 0; i < 200; i++) {
    const text = rng.str(60);
    expect(() => Array.from(defaultLineBreakerIterator(text))).not.toThrow();
  }
});

test("defaultLineBreakerIterator: all indices are valid positions in the string", () => {
  const inputs = [
    "hello world",
    "foo\u2060bar",
    "foo\u00a0bar",
    "visit https://example.com today",
    "555-1234",
    "well-known compound-word",
    "foo,bar;baz:qux",
    "#hashtag @mention",
    "",
    "single",
    "   spaces   ",
    "\t\ttabs\t\t",
    "Khmer: \u1780\u17d2\u1798\u17a2",
  ];

  for (const text of inputs) {
    const indices = Array.from(defaultLineBreakerIterator(text));
    for (const i of indices) {
      expect(i, `index ${i} out of range for "${text}"`).toBeGreaterThanOrEqual(
        0,
      );
      expect(i, `index ${i} out of range for "${text}"`).toBeLessThanOrEqual(
        text.length,
      );
    }
  }
});

test("defaultLineBreakerIterator: indices are sorted ascending (no duplicates)", () => {
  const samples = [
    "hello world foo bar",
    "one two three four five",
    "a b c d e f g h i j k",
    "mix of words and 555-1234 phone",
    "url https://example.com/path in text",
  ];
  for (const text of samples) {
    const indices = Array.from(defaultLineBreakerIterator(text));
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1]!);
    }
    // No duplicates
    expect(new Set(indices).size).toBe(indices.length);
  }
});

test("defaultLineBreakerIterator: empty string yields no indices", () => {
  expect(Array.from(defaultLineBreakerIterator(""))).toHaveLength(0);
});

test("defaultLineBreakerIterator: protected chars reduce break count vs plain spaces", () => {
  const plain = Array.from(defaultLineBreakerIterator("a b c d e")).length;
  const nbsps = Array.from(
    defaultLineBreakerIterator("a\u00a0b\u00a0c\u00a0d\u00a0e"),
  ).length;
  // Non-breaking spaces suppress breaks, so fewer indices expected
  expect(nbsps).toBeLessThan(plain);
});

test("defaultLineBreakerIterator: URL interior positions are protected", () => {
  const text = "go to https://example.com/foo?q=1 now";
  const indices = Array.from(defaultLineBreakerIterator(text));
  const urlStart = text.indexOf("https://");
  const urlEnd = text.indexOf(" now");
  // No index should fall inside the URL interior (start+1 .. urlEnd-1)
  for (const i of indices) {
    const insideUrl = i > urlStart && i < urlEnd;
    expect(insideUrl, `break inside URL at index ${i}`).toBe(false);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// §4  fontBuilder / indicesOf / isWhitespace
// ═══════════════════════════════════════════════════════════════════════════════

test("fontBuilder: never throws on any SpanProps combination", () => {
  const weights = [undefined, "bold", "normal", "lighter", 100, 400, 600, 900];
  const styles = [undefined, "italic", "normal", "oblique"];
  const sizes = [undefined, 0, 8, 12, 16, 24, 72, 999];
  const fonts = [undefined, [], ["Arial"], ["Arial", "sans-serif"]];

  for (const weight of weights) {
    for (const style of styles) {
      for (const size of sizes.slice(0, 3)) {
        for (const font of fonts.slice(0, 2)) {
          const props: SpanProps = { weight, style, size, font } as SpanProps;
          expect(() => fontBuilder(props)).not.toThrow();
          expect(typeof fontBuilder(props)).toBe("string");
        }
      }
    }
  }
});

test("fontBuilder: output contains '{size}px' when size is set", () => {
  for (const size of [8, 12, 14, 16, 24, 48]) {
    const result = fontBuilder({ size, font: ["Arial"] });
    expect(result).toContain(`${size}px`);
  }
});

test("fontBuilder: same props produce same output (deterministic)", () => {
  const sizes = [10, 12, 14, 16];
  for (const size of sizes) {
    const props: SpanProps = { size, weight: "bold", font: ["Arial"] };
    expect(fontBuilder(props)).toBe(fontBuilder(props));
  }
});

test("fontBuilder: empty props returns a string (not throws)", () => {
  expect(() => fontBuilder({})).not.toThrow();
  expect(typeof fontBuilder({})).toBe("string");
});

test("indicesOf: every returned index satisfies value[i] === search char", () => {
  const cases: [string, string][] = [
    ["hello world", "l"],
    ["aababab", "a"],
    ["", "a"],
    ["no match here", "z"],
    ["aaaa", "a"],
    ["abc\tabc", "\t"],
  ];

  for (const [str, ch] of cases) {
    const result = indicesOf(str, ch);
    for (const i of result) {
      expect(str[i]).toBe(ch);
    }
    // Count matches the actual occurrences
    const expected = [...str].filter((c) => c === ch).length;
    expect(result).toHaveLength(expected);
  }
});

test("indicesOf: indices are sorted ascending", () => {
  const rng = makePrng(0xbeef);
  for (let i = 0; i < 50; i++) {
    const str = rng.str(30);
    const ch = rng.pick(["a", "b", " ", "0"]);
    const result = indicesOf(str, ch);
    for (let j = 1; j < result.length; j++) {
      expect(result[j]).toBeGreaterThan(result[j - 1]!);
    }
  }
});

test("isWhitespace: empty string always returns false", () => {
  expect(isWhitespace("")).toBe(false);
});

test("isWhitespace: pure whitespace strings return true", () => {
  for (const s of [" ", "  ", "\t", "\n", "\r", " \t\n\r", "\t\t\t"]) {
    expect(isWhitespace(s), `input: ${JSON.stringify(s)}`).toBe(true);
  }
});

test("isWhitespace: strings with non-whitespace return false", () => {
  for (const s of ["a", " a", "a ", " a ", "hello", "0", "."]) {
    expect(isWhitespace(s), `input: ${JSON.stringify(s)}`).toBe(false);
  }
});

test("isWhitespace: return type is always boolean", () => {
  const rng = makePrng(0xcafe);
  for (let i = 0; i < 200; i++) {
    const result = isWhitespace(rng.str(15));
    expect(typeof result).toBe("boolean");
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// §5  getBoundingBoxRectRotation
// ═══════════════════════════════════════════════════════════════════════════════

test("getBoundingBoxRectRotation: always returns [number, number]", () => {
  const cases: [number, number, number][] = [
    [100, 200, 0],
    [100, 200, 45],
    [100, 200, 90],
    [100, 200, 180],
    [100, 200, 270],
    [100, 200, 360],
    [50, 50, 30],
    [0, 0, 45],
    [1, 1, 45],
    [9999, 9999, 45],
  ];
  for (const [w, h, angle] of cases) {
    const result = getBoundingBoxRectRotation(w, h, angle);
    expect(result).toHaveLength(2);
    expect(Number.isFinite(result[0])).toBe(true);
    expect(Number.isFinite(result[1])).toBe(true);
  }
});

test("getBoundingBoxRectRotation: 0° and 360° return original dimensions", () => {
  for (const [w, h] of [
    [100, 200],
    [50, 50],
    [300, 150],
  ] as [number, number][]) {
    const r0 = getBoundingBoxRectRotation(w, h, 0);
    const r360 = getBoundingBoxRectRotation(w, h, 360);
    expect(r0[0]).toBeCloseTo(w, 8);
    expect(r0[1]).toBeCloseTo(h, 8);
    expect(r360[0]).toBeCloseTo(w, 8);
    expect(r360[1]).toBeCloseTo(h, 8);
  }
});

test("getBoundingBoxRectRotation: 90° swaps width and height", () => {
  for (const [w, h] of [
    [100, 200],
    [30, 80],
    [64, 48],
  ] as [number, number][]) {
    const r = getBoundingBoxRectRotation(w, h, 90);
    expect(r[0]).toBeCloseTo(h, 8);
    expect(r[1]).toBeCloseTo(w, 8);
  }
});

test("getBoundingBoxRectRotation: 180° returns original dimensions", () => {
  for (const [w, h] of [
    [100, 200],
    [50, 75],
  ] as [number, number][]) {
    const r = getBoundingBoxRectRotation(w, h, 180);
    expect(r[0]).toBeCloseTo(w, 8);
    expect(r[1]).toBeCloseTo(h, 8);
  }
});

test("getBoundingBoxRectRotation: result >= min(w,h) for any angle (bounding box grows)", () => {
  const rng = makePrng(0x7777);
  for (let i = 0; i < 100; i++) {
    const w = rng.float(1, 500);
    const h = rng.float(1, 500);
    const angle = rng.float(-720, 720);
    const [rw, rh] = getBoundingBoxRectRotation(w, h, angle);
    expect(rw).toBeGreaterThanOrEqual(Math.min(w, h) - 1e-9);
    expect(rh).toBeGreaterThanOrEqual(Math.min(w, h) - 1e-9);
  }
});

test("getBoundingBoxRectRotation: outputs are non-negative", () => {
  const rng = makePrng(0x5a5a);
  for (let i = 0; i < 200; i++) {
    const w = rng.float(0, 1000);
    const h = rng.float(0, 1000);
    const angle = rng.float(-1080, 1080);
    const [rw, rh] = getBoundingBoxRectRotation(w, h, angle);
    expect(rw).toBeGreaterThanOrEqual(0);
    expect(rh).toBeGreaterThanOrEqual(0);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// §6  parseRadius
// ═══════════════════════════════════════════════════════════════════════════════

test("parseRadius: all output values are in [0, maxRadius/2]", () => {
  const rng = makePrng(0x1111);
  for (let i = 0; i < 200; i++) {
    const len = rng.int(1, 5);
    const radius = Array.from({ length: len }, () => rng.float(-50, 200));
    const maxRadius = rng.float(0, 300);
    const result = parseRadius([...radius], maxRadius);
    for (const v of result) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(maxRadius / 2 + 1e-9);
    }
  }
});

test("parseRadius: mutates in-place and also returns the array", () => {
  const arr = [10, 20, 30];
  const result = parseRadius(arr, 100);
  expect(result).toBe(arr); // same reference
});

test("parseRadius: length is unchanged", () => {
  for (const len of [1, 2, 3, 4, 5]) {
    const arr = Array.from({ length: len }, (_, i) => i * 10);
    const result = parseRadius(arr, 100);
    expect(result).toHaveLength(len);
  }
});

test("parseRadius: negative values clamp to 0", () => {
  const result = parseRadius([-10, -0.1, -999], 100);
  for (const v of result) expect(v).toBe(0);
});

test("parseRadius: maxRadius=0 makes everything 0", () => {
  const result = parseRadius([5, 10, 15, 20], 0);
  for (const v of result) expect(v).toBe(0);
});

test("parseRadius: values exactly at maxRadius/2 are unchanged", () => {
  const result = parseRadius([25], 50);
  expect(result[0]).toBe(25);
});

// ═══════════════════════════════════════════════════════════════════════════════
// §7  generateGradient
// ═══════════════════════════════════════════════════════════════════════════════

function makeLinearGradient(
  orientation: GradientNode["orientation"],
  stops: { color: string; pct?: number }[],
): GradientNode {
  return {
    type: "linear-gradient",
    // biome-ignore lint/suspicious/noExplicitAny: gradient-parser orientation union varies by node type
    orientation: orientation as any,
    colorStops: stops.map(({ color, pct }) => ({
      type: "literal" as const,
      value: color,
      ...(pct != null
        ? { length: { type: "%" as const, value: `${pct}%` } }
        : {}),
    })),
  };
}

test("generateGradient: never throws for valid gradient inputs", () => {
  const directions = [
    "top",
    "bottom",
    "left",
    "right",
    "left top",
    "right bottom",
  ] as const;
  for (const dir of directions) {
    expect(() =>
      generateGradient(
        [
          makeLinearGradient({ type: "directional", value: dir }, [
            { color: "red", pct: 0 },
            { color: "blue", pct: 100 },
          ]),
        ],
        { width: 200, height: 100 },
      ),
    ).not.toThrow();
  }
});

test("generateGradient: colors.length === locations.length for all results", () => {
  const gradients: GradientNode[] = [
    makeLinearGradient({ type: "angular", value: "45", unit: "deg" }, [
      { color: "red", pct: 0 },
      { color: "green", pct: 50 },
      { color: "blue", pct: 100 },
    ]),
    makeLinearGradient({ type: "directional", value: "top" }, [
      { color: "white" },
      { color: "black" },
    ]),
  ];

  for (const g of gradients) {
    const results = generateGradient([g], { width: 100, height: 100 });
    for (const r of results) {
      expect(r.colors.length).toBe(r.locations.length);
    }
  }
});

test("generateGradient: radial gradients are always skipped", () => {
  const radial = {
    type: "radial-gradient",
    orientation: undefined,
    colorStops: [
      { type: "literal", value: "red" },
      { type: "literal", value: "blue" },
    ],
  } as unknown as GradientNode;
  const repeatingRadial = {
    type: "repeating-radial-gradient",
    orientation: undefined,
    colorStops: [{ type: "literal", value: "yellow" }],
  } as unknown as GradientNode;
  expect(generateGradient([radial], { width: 100, height: 100 })).toHaveLength(
    0,
  );
  expect(
    generateGradient([repeatingRadial], { width: 100, height: 100 }),
  ).toHaveLength(0);
});

test("generateGradient: start/end vectors are present and finite for linear gradients", () => {
  const angles = [0, 45, 90, 135, 180, 270, 360, -45, 720];
  for (const angle of angles) {
    const results = generateGradient(
      [
        makeLinearGradient(
          { type: "angular", value: String(angle), unit: "deg" },
          [{ color: "red" }, { color: "blue" }],
        ),
      ],
      { width: 100, height: 100 },
    );
    expect(results).toHaveLength(1);
    const { start, end } = results[0]!;
    expect(Number.isFinite(start!.x)).toBe(true);
    expect(Number.isFinite(start!.y)).toBe(true);
    expect(Number.isFinite(end!.x)).toBe(true);
    expect(Number.isFinite(end!.y)).toBe(true);
  }
});

test("generateGradient: empty color stops list produces empty colors/locations", () => {
  const g: GradientNode = {
    type: "linear-gradient",
    orientation: { type: "angular", value: "0", unit: "deg" },
    colorStops: [],
  };
  const results = generateGradient([g], { width: 100, height: 100 });
  expect(results[0]!.colors).toHaveLength(0);
  expect(results[0]!.locations).toHaveLength(0);
});

test("generateGradient: single color stop works without crash", () => {
  const g = makeLinearGradient({ type: "angular", value: "90", unit: "deg" }, [
    { color: "red", pct: 0 },
  ]);
  expect(() =>
    generateGradient([g], { width: 100, height: 100 }),
  ).not.toThrow();
});

test("generateGradient: hex color stops produce '#xxxxxx' values", () => {
  const g: GradientNode = {
    type: "linear-gradient",
    orientation: { type: "angular", value: "90", unit: "deg" },
    colorStops: [
      { type: "hex", value: "ff0000" },
      { type: "hex", value: "0000ff" },
    ],
  };
  const [r] = generateGradient([g], { width: 100, height: 100 });
  expect(r!.colors[0]).toBe("#ff0000");
  expect(r!.colors[1]).toBe("#0000ff");
});

// ═══════════════════════════════════════════════════════════════════════════════
// §8  Layout rendering — Column / Row / Grid / Text / transforms
// ═══════════════════════════════════════════════════════════════════════════════

test("rendering: empty Column does not crash", async () => {
  await expect(buildMeta(Column().width(100))).resolves.toBeDefined();
});

test("rendering: deeply nested columns do not crash", async () => {
  let node = Column(Text("leaf")).width(100);
  for (let i = 0; i < 20; i++) node = Column(node).width(100) as typeof node;
  await expect(buildMeta(node)).resolves.toBeDefined();
});

test("rendering: Text with empty string does not crash", async () => {
  await expect(buildMeta(Column(Text("")).width(200))).resolves.toBeDefined();
});

test("rendering: Text with only whitespace does not crash", async () => {
  for (const s of ["   ", "\t\t", "\n", " \t\n"]) {
    await expect(buildMeta(Column(Text(s)).width(200))).resolves.toBeDefined();
  }
});

test("rendering: Text with very long unbreakable word does not crash", async () => {
  const longWord = "a".repeat(800);
  await expect(
    buildMeta(Column(Text(longWord)).width(300)),
  ).resolves.toBeDefined();
});

test("rendering: Text with many tab stops does not crash", async () => {
  await expect(
    buildMeta(
      Column(
        Text("A\tB\tC\tD\tE\tF\tG\tH\tI\tJ").tabStops(
          50,
          100,
          150,
          200,
          250,
          300,
          350,
          400,
          450,
        ),
      ).width(500),
    ),
  ).resolves.toBeDefined();
});

test("rendering: Text with various font sizes does not crash", async () => {
  const sizes = [1, 6, 8, 10, 12, 14, 16, 20, 24, 36, 48, 72, 96];
  for (const size of sizes) {
    await expect(
      buildMeta(Column(Text("Hello").size(size)).width(200)),
    ).resolves.toBeDefined();
  }
});

test("rendering: Text lineHeight variations do not crash", async () => {
  for (const lh of [0.5, 1, 1.2, 1.5, 2, 3]) {
    await expect(
      buildMeta(Column(Text("Line height test").lineHeight(lh)).width(200)),
    ).resolves.toBeDefined();
  }
});

test("rendering: Text with maxLines and ellipsis does not crash", async () => {
  await expect(
    buildMeta(
      Column(
        Text(
          "This is a very long text that should be truncated at some point because it exceeds the max lines setting",
        )
          .maxLines(2)
          .textOverflow("ellipsis")
          .size(14),
      ).width(200),
    ),
  ).resolves.toBeDefined();
});

test("rendering: Text alignment variants do not crash", async () => {
  for (const align of ["left", "center", "right", "justify"] as const) {
    await expect(
      buildMeta(Column(Text("Aligned text").align(align)).width(300)),
    ).resolves.toBeDefined();
  }
});

test("rendering: Text baseDir variants do not crash", async () => {
  for (const dir of ["ltr", "rtl", "auto"] as const) {
    await expect(
      buildMeta(Column(Text("Hello مرحبا").baseDir(dir)).width(300)),
    ).resolves.toBeDefined();
  }
});

test("rendering: Text orientation variants do not crash", async () => {
  for (const orientation of [0, 90, 180, 270] as const) {
    await expect(
      buildMeta(Column(Text("Rotated").orientation(orientation)).width(300)),
    ).resolves.toBeDefined();
  }
});

test("rendering: Span with tag and color overrides does not crash", async () => {
  await expect(
    buildMeta(
      Column(
        Text(
          "Normal ",
          Span("red").color("red").tag("important"),
          " more normal",
        ),
      ).width(300),
    ),
  ).resolves.toBeDefined();
});

test("rendering: Row with flex properties does not crash", async () => {
  const { metadata } = await renderWithMetadata(
    Row(
      Column().width(100).height(50).grow(1),
      Column().width(50).height(50).shrink(1),
      Column().height(50).basis(80),
    )
      .gap(8)
      .wrap("wrap")
      .justifyContent("space-between")
      .alignItems("center")
      .width(400),
    renderer,
  );
  expect(metadata).toBeDefined();
});

test("rendering: Column with padding/margin CSS shorthand does not crash", async () => {
  const combos = [
    () => Column(Text("A")).padding(10),
    () => Column(Text("B")).padding(10, 20),
    () => Column(Text("C")).padding(5, 10, 15),
    () => Column(Text("D")).padding(1, 2, 3, 4),
    () => Column(Text("E")).margin(8),
    () => Column(Text("F")).margin(8, 16),
    () => Column(Text("G")).borderWidth(1),
    () => Column(Text("H")).borderWidth(1, 2),
    () => Column(Text("I")).borderWidth(1, 2, 3, 4),
  ];
  for (const fn of combos) {
    await expect(buildMeta(fn().width(200))).resolves.toBeDefined();
  }
});

test("rendering: rounded corners (all radius lengths) do not crash", async () => {
  for (const args of [
    [5] as [number],
    [5, 10] as [number, number],
    [5, 10, 15, 20] as [number, number, number, number],
  ]) {
    await expect(
      buildMeta(
        Column(Text("rounded"))
          .rounded(...args)
          .bg("#eee")
          .width(200),
      ),
    ).resolves.toBeDefined();
  }
});

test("rendering: transform methods (rotate, scale, translate) do not crash", async () => {
  await expect(
    buildMeta(
      Column(
        Column(Text("Rotated")).rotate(45).width(80).height(80),
        Column(Text("Scaled")).scale(1.5).width(80).height(80),
        Column(Text("Translated"))
          .translateX(10)
          .translateY(20)
          .width(80)
          .height(80),
      ).width(300),
    ),
  ).resolves.toBeDefined();
});

test("rendering: CSS box-shadow string does not crash", async () => {
  const shadows = [
    "0 2px 4px rgba(0,0,0,0.1)",
    "0 4px 24px rgba(0,0,0,0.2)",
    "inset 0 1px 3px rgba(0,0,0,0.15)",
    "0 1px 3px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)",
  ];
  for (const s of shadows) {
    await expect(
      buildMeta(Column(Text("shadow")).shadow(s).width(200)),
    ).resolves.toBeDefined();
  }
});

test("rendering: opacity / filter props do not crash", async () => {
  await expect(
    buildMeta(
      Column(
        Column(Text("50% opacity")).opacity(0.5).width(100),
        Column(Text("grayscale")).grayscale(1).width(100),
        Column(Text("blur")).blur(2).width(100),
        Column(Text("brightness")).brightness(1.5).width(100),
      ).width(200),
    ),
  ).resolves.toBeDefined();
});

test("rendering: absolute/relative positioned nodes do not crash", async () => {
  await expect(
    buildMeta(
      Column(
        Row().height(50).width(200).bg("#ddd"),
        Column(Text("abs"))
          .position("absolute")
          .top(10)
          .left(10)
          .width(60)
          .height(30),
      ).width(200),
    ),
  ).resolves.toBeDefined();
});

test("rendering: Grid layout does not crash", async () => {
  const { metadata } = await renderWithMetadata(
    Grid(
      Column(Text("A")).bg("#f00"),
      Column(Text("B")).bg("#0f0"),
      Column(Text("C")).bg("#00f"),
      Column(Text("D")).bg("#ff0"),
    )
      .columns("1fr", "1fr")
      .rows("auto", "auto")
      .gap(8)
      .width(300),
    renderer,
  );
  expect(metadata).toBeDefined();
});

test("rendering: Text with letter/word spacing does not crash", async () => {
  await expect(
    buildMeta(
      Column(
        Text("Letter spaced").letterSpacing(2),
        Text("Word spaced").wordSpacing(8),
        Text("Both").letterSpacing(1).wordSpacing(4),
        Text("Negative letter spacing").letterSpacing(-0.5),
      ).width(400),
    ),
  ).resolves.toBeDefined();
});

test("rendering: Text with decorations does not crash", async () => {
  await expect(
    buildMeta(
      Column(
        Text("Underline").underline(),
        Text("Strikethrough").lineThrough(),
        Text("Overline").overline(),
        Text("All").underline().lineThrough().overline(),
      ).width(300),
    ),
  ).resolves.toBeDefined();
});

test("rendering: mixed node types in a Column do not crash", async () => {
  await expect(
    buildMeta(
      Column(
        Text("Title").size(18).weight("bold"),
        Row().height(1).bg("#ccc"),
        Row(Column(Text("Left")).grow(1), Column(Text("Right")).grow(1)).gap(8),
        Text("Footer").size(10),
      ).width(400),
    ),
  ).resolves.toBeDefined();
});

test("rendering: many random Text nodes do not crash and produce finite layout", async () => {
  const rng = makePrng(0x4242);
  const sizes = [8, 10, 12, 14, 16, 20] as const;
  for (let run = 0; run < 5; run++) {
    const count = rng.int(3, 15);
    const children = Array.from({ length: count }, () => {
      const content = rng.str(30) || "x";
      return Text(content).size(rng.pick(sizes));
    });
    const meta = await buildMeta(Column(...children).width(rng.int(150, 500)));
    expect(Number.isFinite(meta.width)).toBe(true);
    expect(Number.isFinite(meta.height)).toBe(true);
    expect(meta.height).toBeGreaterThan(0);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// §9  YOLO dataset invariants
// ═══════════════════════════════════════════════════════════════════════════════

test("YOLO: cx/cy/w/h always in [0,1] across all granularities", async () => {
  const meta = await buildMeta(
    Column(
      Text("Title").size(24).tag("title"),
      Text("Body text with a longer line to exercise width coverage").tag(
        "body",
      ),
      Row().height(2).bg("#ccc"),
      Text("Mixed ", Span("highlighted").tag("em"), " normal").tag("mixed"),
      Text("Tiny").size(6).tag("small"),
    ).width(300),
  );

  for (const granularity of ["segment", "line", "block", "node"] as const) {
    const ds = toYoloDataset(meta, { granularity });
    for (const b of ds.boxes) {
      expect(b.cx).toBeGreaterThanOrEqual(0);
      expect(b.cx).toBeLessThanOrEqual(1);
      expect(b.cy).toBeGreaterThanOrEqual(0);
      expect(b.cy).toBeLessThanOrEqual(1);
      expect(b.w).toBeGreaterThanOrEqual(0);
      expect(b.w).toBeLessThanOrEqual(1);
      expect(b.h).toBeGreaterThanOrEqual(0);
      expect(b.h).toBeLessThanOrEqual(1);
    }
  }
});

test("YOLO: classId always matches ds.classes map", async () => {
  const rng = makePrng(42);
  const texts = Array.from({ length: 8 }, () =>
    Text(rng.str(15) || "x").tag(rng.tagName()),
  );
  const meta = await buildMeta(Column(...texts).width(400));
  const ds = toYoloDataset(meta);
  for (const b of ds.boxes) {
    expect(ds.classes.has(b.className)).toBe(true);
    expect(ds.classes.get(b.className)).toBe(b.classId);
  }
});

test("YOLO: class IDs are contiguous 0-based integers", async () => {
  const meta = await buildMeta(
    Column(
      Text("A").tag("alpha"),
      Text("B").tag("beta"),
      Text("C").tag("gamma"),
      Text("D"),
    ).width(300),
  );
  const ds = toYoloDataset(meta);
  const ids = [...ds.classes.values()].sort((a, b) => a - b);
  expect(ids[0]).toBe(0);
  for (let i = 1; i < ids.length; i++) {
    expect(ids[i]).toBe(ids[i - 1]! + 1);
  }
});

test("YOLO: toTxt() produces well-formed YOLO lines", async () => {
  const meta = await buildMeta(
    Column(
      Text("Hello world").tag("text"),
      Row().tag("divider").height(10),
    ).width(300),
  );
  const ds = toYoloDataset(meta);
  for (const line of ds.toTxt().split("\n").filter(Boolean)) {
    const parts = line.split(" ");
    expect(parts).toHaveLength(5);
    const [id, cx, cy, w, h] = parts.map(Number);
    expect(Number.isInteger(id)).toBe(true);
    expect(id).toBeGreaterThanOrEqual(0);
    for (const v of [cx, cy, w, h]) {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  }
});

test("YOLO: toTxt() line count equals boxes length", async () => {
  const meta = await buildMeta(
    Column(Text("A").tag("a"), Text("B").tag("b"), Text("C").tag("c")).width(
      200,
    ),
  );
  const ds = toYoloDataset(meta);
  const lines = ds.toTxt().split("\n").filter(Boolean);
  expect(lines).toHaveLength(ds.boxes.length);
});

test("YOLO: toJSON() is JSON-serializable with correct shape", async () => {
  const meta = await buildMeta(
    Column(Text("Foo").tag("foo"), Row().tag("bar").height(5)).width(200),
  );
  const ds = toYoloDataset(meta);
  const json = ds.toJSON();
  expect(() => JSON.stringify(json)).not.toThrow();
  expect(typeof json.imageWidth).toBe("number");
  expect(typeof json.imageHeight).toBe("number");
  expect(Array.isArray(json.boxes)).toBe(true);
  for (const [name, id] of ds.classes) expect(json.classes[name]).toBe(id);
});

test("YOLO: imageWidth and imageHeight match root metadata", async () => {
  const meta = await buildMeta(Column(Text("Size check")).width(350));
  const ds = toYoloDataset(meta);
  expect(ds.imageWidth).toBe(meta.width);
  expect(ds.imageHeight).toBe(meta.height);
});

test("YOLO: empty tree yields 0 boxes", async () => {
  const meta = await buildMeta(Column().width(100));
  expect(toYoloDataset(meta, { catchAllClass: null }).boxes).toHaveLength(0);
});

test("YOLO: include=[] yields 0 boxes", async () => {
  const meta = await buildMeta(
    Column(Text("Hello").tag("x"), Row().tag("y").height(10)).width(200),
  );
  expect(
    toYoloDataset(meta, { include: [], catchAllClass: null }).boxes,
  ).toHaveLength(0);
});

test("YOLO: random scenes never crash, all bbox invariants hold", async () => {
  const rng = makePrng(0xc0ffee);
  const sizes = [8, 10, 12, 14, 16, 20] as const;
  for (let run = 0; run < 5; run++) {
    const children = Array.from({ length: rng.int(3, 12) }, () => {
      const node = Text(rng.str(30) || "x").size(rng.pick(sizes));
      if (rng.bool(0.6)) node.tag(rng.tagName());
      return node;
    });
    const meta = await buildMeta(Column(...children).width(rng.int(150, 500)));
    for (const granularity of ["segment", "line", "node"] as const) {
      const ds = toYoloDataset(meta, { granularity });
      for (const b of ds.boxes) {
        expect(b.cx).toBeGreaterThanOrEqual(0);
        expect(b.cx).toBeLessThanOrEqual(1);
        expect(b.w).toBeGreaterThanOrEqual(0);
        expect(b.w).toBeLessThanOrEqual(1);
        expect(b.h).toBeGreaterThanOrEqual(0);
        expect(b.h).toBeLessThanOrEqual(1);
        expect(ds.classes.get(b.className)).toBe(b.classId);
      }
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// §10  COCO dataset invariants
// ═══════════════════════════════════════════════════════════════════════════════

test("COCO: category IDs are 1-based and match annotation category_id", async () => {
  const meta = await buildMeta(
    Column(
      Text("Heading").tag("heading"),
      Text("Paragraph").tag("paragraph"),
    ).width(300),
  );
  const ds = toCocoDataset(meta);
  const catIds = new Set(ds.categories.map((c) => c.id));
  expect(Math.min(...catIds)).toBeGreaterThanOrEqual(1);
  for (const ann of ds.annotations)
    expect(catIds.has(ann.category_id)).toBe(true);
});

test("COCO: annotation bbox area === w * h", async () => {
  const meta = await buildMeta(
    Column(Text("Area check").tag("block")).width(250),
  );
  for (const ann of toCocoDataset(meta).annotations) {
    const [, , w, h] = ann.bbox;
    expect(ann.area).toBeCloseTo(w * h, 5);
  }
});

test("COCO: annotation count matches YOLO box count", async () => {
  const meta = await buildMeta(
    Column(
      Text("A").tag("a"),
      Text("B").tag("b"),
      Row().tag("c").height(8),
    ).width(300),
  );
  const opts = { granularity: "node" as const };
  expect(toCocoDataset(meta, opts).annotations).toHaveLength(
    toYoloDataset(meta, opts).boxes.length,
  );
});

test("COCO: all bbox pixel coords are non-negative", async () => {
  const meta = await buildMeta(
    Column(Text("Pixel coords").tag("text")).width(300),
  );
  for (const ann of toCocoDataset(meta).annotations) {
    const [x, y, w, h] = ann.bbox;
    expect(x).toBeGreaterThanOrEqual(0);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(w).toBeGreaterThanOrEqual(0);
    expect(h).toBeGreaterThanOrEqual(0);
  }
});

test("COCO: toJSON() is serializable with required keys", async () => {
  const meta = await buildMeta(
    Column(Text("JSON test").tag("text")).width(200),
  );
  const ds = toCocoDataset(meta);
  let json!: ReturnType<typeof ds.toJSON>;
  expect(() => {
    json = ds.toJSON();
    JSON.stringify(json);
  }).not.toThrow();
  expect(Array.isArray(json.images)).toBe(true);
  expect(Array.isArray(json.annotations)).toBe(true);
  expect(Array.isArray(json.categories)).toBe(true);
  expect(json.images[0]).toMatchObject({
    id: expect.any(Number),
    file_name: expect.any(String),
    width: expect.any(Number),
    height: expect.any(Number),
  });
});

test("COCO: iscrowd is always 0", async () => {
  const meta = await buildMeta(
    Column(Text("Crowd").tag("text"), Row().tag("layout").height(10)).width(
      300,
    ),
  );
  expect(toCocoDataset(meta).annotations.every((a) => a.iscrowd === 0)).toBe(
    true,
  );
});

test("COCO: annotation IDs are unique and 1-based", async () => {
  const meta = await buildMeta(
    Column(Text("A").tag("a"), Text("B").tag("b"), Text("C").tag("c")).width(
      300,
    ),
  );
  const ids = toCocoDataset(meta).annotations.map((a) => a.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(Math.min(...ids)).toBeGreaterThanOrEqual(1);
});
