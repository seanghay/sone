import { fileURLToPath } from "node:url";
import { beforeAll, expect, test } from "vitest";
import type { TextProps } from "../src/core.ts";
import {
  getHyphenBreaks,
  hyphenateText,
  resolveHyphenLocale,
} from "../src/hyphenation.ts";
import { renderer, Span } from "../src/node.ts";
import { createMultilineParagraph, createParagraph } from "../src/text.ts";

const relative = (p: string) => fileURLToPath(new URL(p, import.meta.url));

beforeAll(() => {
  renderer.registerFont("GeistMono", relative("font/GeistMono-Regular.ttf"));
});

function textProps(overrides: Partial<TextProps> = {}): TextProps {
  return {
    size: 20,
    font: ["GeistMono"],
    color: "black",
    lineHeight: 1.2,
    indentSize: 0,
    hangingIndentSize: 0,
    tabStops: [],
    ...overrides,
  };
}

function getLineTexts(paragraph: {
  lines: Array<{ segments: Array<{ text: string }> }>;
}) {
  return paragraph.lines.map((line) =>
    line.segments.map((seg) => seg.text).join(""),
  );
}

// ─── resolveHyphenLocale ───────────────────────────────────────────────────

test("resolveHyphenLocale: true maps to en-us", () => {
  expect(resolveHyphenLocale(true)).toBe("en-us");
});

test("resolveHyphenLocale: 'en' maps to en-us", () => {
  expect(resolveHyphenLocale("en")).toBe("en-us");
});

test("resolveHyphenLocale: 'en-us' stays en-us", () => {
  expect(resolveHyphenLocale("en-us")).toBe("en-us");
});

test("resolveHyphenLocale: 'en-gb' stays en-gb", () => {
  expect(resolveHyphenLocale("en-gb")).toBe("en-gb");
});

test("resolveHyphenLocale: 'fr' stays fr", () => {
  expect(resolveHyphenLocale("fr")).toBe("fr");
});

test("resolveHyphenLocale: 'de' stays de", () => {
  expect(resolveHyphenLocale("de")).toBe("de");
});

test("resolveHyphenLocale: 'no' maps to nb", () => {
  expect(resolveHyphenLocale("no")).toBe("nb");
});

test("resolveHyphenLocale: unknown locale returns null", () => {
  expect(resolveHyphenLocale("xx")).toBeNull();
  expect(resolveHyphenLocale("klingon")).toBeNull();
});

test("resolveHyphenLocale: false returns null", () => {
  expect(resolveHyphenLocale(false)).toBeNull();
});

// ─── getHyphenBreaks ───────────────────────────────────────────────────────

test("getHyphenBreaks: English word 'hyphenation'", () => {
  const breaks = getHyphenBreaks("hyphenation", "en-us");
  expect(breaks.length).toBeGreaterThan(0);
  // Every position must be within valid range
  for (const pos of breaks) {
    expect(pos).toBeGreaterThan(0);
    expect(pos).toBeLessThan("hyphenation".length);
  }
});

test("getHyphenBreaks: English word 'beautiful'", () => {
  const breaks = getHyphenBreaks("beautiful", "en-us");
  expect(breaks.length).toBeGreaterThan(0);
});

test("getHyphenBreaks: short word is not hyphenated", () => {
  // Word length < MIN_BEFORE + 1 + MIN_AFTER = 5
  expect(getHyphenBreaks("cat", "en-us")).toHaveLength(0);
  expect(getHyphenBreaks("hi", "en-us")).toHaveLength(0);
});

test("getHyphenBreaks: unknown locale returns empty array", () => {
  expect(getHyphenBreaks("hyphenation", "xx")).toHaveLength(0);
});

test("getHyphenBreaks: French word 'typographie'", () => {
  const breaks = getHyphenBreaks("typographie", "fr");
  expect(breaks.length).toBeGreaterThan(0);
});

test("getHyphenBreaks: German word 'Silbentrennung'", () => {
  const breaks = getHyphenBreaks("Silbentrennung", "de");
  expect(breaks.length).toBeGreaterThan(0);
});

test("getHyphenBreaks: Spanish word 'hiphenación'", () => {
  const breaks = getHyphenBreaks("hiphenación", "es");
  // Spanish patterns may not break every word, but function should not throw
  expect(Array.isArray(breaks)).toBe(true);
});

test("getHyphenBreaks: Russian word 'гипнотизация'", () => {
  const breaks = getHyphenBreaks("гипнотизация", "ru");
  expect(Array.isArray(breaks)).toBe(true);
});

test("getHyphenBreaks: positions are within word bounds and respect MIN_BEFORE/MIN_AFTER", () => {
  const word = "internationalization";
  const breaks = getHyphenBreaks(word, "en-us");
  expect(breaks.length).toBeGreaterThan(0);
  for (const pos of breaks) {
    expect(pos).toBeGreaterThanOrEqual(2); // MIN_BEFORE
    expect(pos).toBeLessThanOrEqual(word.length - 2); // MIN_AFTER
  }
});

// ─── hyphenateText ─────────────────────────────────────────────────────────

test("hyphenateText: inserts soft hyphens into English words", () => {
  const result = hyphenateText("hyphenation", "en-us");
  expect(result).toContain("\u00AD");
});

test("hyphenateText: preserves spaces between words", () => {
  const result = hyphenateText("beautiful typography", "en-us");
  expect(result).toContain(" ");
});

test("hyphenateText: unknown locale returns text unchanged", () => {
  const text = "hyphenation";
  expect(hyphenateText(text, "xx")).toBe(text);
});

// ─── createMultilineParagraph with hyphenation ────────────────────────────

test("hyphenation enabled: long word is broken with a hyphen at line end", () => {
  const word = "internationalization";
  // Use a very narrow width so the word must be hyphenated
  const paragraph = createMultilineParagraph(
    [word],
    [[]],
    60, // very narrow — forces hyphenation
    textProps({ size: 14, hyphenation: true }),
    renderer.measureText,
    renderer.breakIterator,
  );

  // Should produce more than one line
  expect(paragraph.lines.length).toBeGreaterThan(1);

  // All line-ending segments (except the last) should end with '-'
  for (let i = 0; i < paragraph.lines.length - 1; i++) {
    const line = paragraph.lines[i];
    const lastSeg = line.segments[line.segments.length - 1];
    expect(lastSeg.text).toMatch(/-$/);
  }
});

test("hyphenation disabled: long word is NOT broken with a hyphen", () => {
  const word = "internationalization";
  const paragraph = createMultilineParagraph(
    [word],
    [[]],
    60,
    textProps({ size: 14 }), // no hyphenation
    renderer.measureText,
    renderer.breakIterator,
  );

  const lineTexts = getLineTexts(paragraph);
  // Without hyphenation, the whole word ends up on one line (forced)
  for (const line of lineTexts) {
    expect(line).not.toMatch(/-$/);
  }
});

test("hyphenation: multi-word text produces some hyphenated line endings", () => {
  // Use a very narrow width to force many breaks, ensuring at least one
  // hyphenated break appears across the lines.
  const text =
    "The internationalization of software requires typographical rules.";
  const maxWidth = 70;

  const paragraph = createMultilineParagraph(
    [text],
    [[]],
    maxWidth,
    textProps({ size: 14, hyphenation: true }),
    renderer.measureText,
    renderer.breakIterator,
  );

  const lineTexts = getLineTexts(paragraph);
  const hyphenatedLineCount = lineTexts.filter((l) => l.endsWith("-")).length;
  expect(hyphenatedLineCount).toBeGreaterThan(0);
});

test("hyphenation: locale 'true' behaves like 'en'", () => {
  const text = "hyphenation internationalization";
  const maxWidth = 80;

  const withTrue = createMultilineParagraph(
    [text],
    [[]],
    maxWidth,
    textProps({ size: 14, hyphenation: true }),
    renderer.measureText,
    renderer.breakIterator,
  );

  const withEn = createMultilineParagraph(
    [text],
    [[]],
    maxWidth,
    textProps({ size: 14, hyphenation: "en" }),
    renderer.measureText,
    renderer.breakIterator,
  );

  expect(getLineTexts(withTrue)).toEqual(getLineTexts(withEn));
});

test("hyphenation works via createParagraph", () => {
  const text = "internationalization and hyphenation";
  const blocks = createParagraph(
    [text],
    80,
    textProps({ size: 14, hyphenation: "en-us" }),
    renderer.measureText,
    renderer.breakIterator,
  );

  expect(blocks.length).toBeGreaterThan(0);
  const paragraph = blocks[0].paragraph;
  expect(paragraph.lines.length).toBeGreaterThan(1);
});

test("hyphenation with Span children preserves span props", () => {
  const spans = [
    "Beautiful ",
    Span("internationalization").color("red"),
    " matters.",
  ];

  const paragraph = createMultilineParagraph(
    spans,
    [[], [], []],
    80,
    textProps({ size: 14, hyphenation: true }),
    renderer.measureText,
    renderer.breakIterator,
  );

  // The red color should still appear in some segment
  const redSegment = paragraph.lines
    .flatMap((l) => l.segments)
    .find((s) => s.props.color === "red");
  expect(redSegment).toBeDefined();
});

test("hyphenation: French locale produces French hyphenation", () => {
  const word = "typographie"; // ty-po-gra-phie in French
  const breaks = getHyphenBreaks(word, "fr");
  const enBreaks = getHyphenBreaks(word, "en-us");
  // French and English patterns may differ
  expect(Array.isArray(breaks)).toBe(true);
  expect(breaks.length).toBeGreaterThan(0);
  // FR and EN may produce the same or different breaks — just confirm no crash
  expect(Array.isArray(enBreaks)).toBe(true);
});

test("hyphenation: Dutch locale", () => {
  const breaks = getHyphenBreaks("schilderkunst", "nl");
  expect(Array.isArray(breaks)).toBe(true);
});

test("hyphenation: Polish locale", () => {
  const breaks = getHyphenBreaks("rzeczpospolita", "pl");
  expect(Array.isArray(breaks)).toBe(true);
});
