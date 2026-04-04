import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, test } from "vitest";
import {
  detectParagraphDirection,
  hasRTLText,
  resolveParagraphDirection,
} from "../src/bidi.ts";
import { Span, Text } from "../src/core.ts";
import { renderer } from "../src/node.ts";
import { createParagraph } from "../src/text.ts";

const relative = (p: string) => fileURLToPath(new URL(p, import.meta.url));

beforeAll(() => {
  renderer.registerFont("NotoSansArabic", relative("font/NotoSansArabic.ttf"));
  renderer.registerFont("NotoSansHebrew", relative("font/NotoSansHebrew.ttf"));
  renderer.registerFont("GeistMono", relative("font/GeistMono-Regular.ttf"));
});

// ---------------------------------------------------------------------------
// hasRTLText
// ---------------------------------------------------------------------------
describe("hasRTLText", () => {
  test("returns false for empty string", () => {
    expect(hasRTLText("")).toBe(false);
  });

  test("returns false for LTR Latin text", () => {
    expect(hasRTLText("Hello World")).toBe(false);
  });

  test("returns false for digits and punctuation", () => {
    expect(hasRTLText("1234567890 !@#$%")).toBe(false);
  });

  test("returns true for Arabic text", () => {
    expect(hasRTLText("مرحبا بالعالم")).toBe(true);
  });

  test("returns true for Hebrew text", () => {
    expect(hasRTLText("שָׁלוֹם")).toBe(true);
  });

  test("returns true for mixed text with Arabic", () => {
    expect(hasRTLText("Hello مرحبا")).toBe(true);
  });

  test("returns true for Syriac text", () => {
    expect(hasRTLText("\u0710\u0712\u0713")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// detectParagraphDirection
// ---------------------------------------------------------------------------
describe("detectParagraphDirection", () => {
  test("returns ltr for empty string", () => {
    expect(detectParagraphDirection("")).toBe("ltr");
  });

  test("returns ltr for Latin text", () => {
    expect(detectParagraphDirection("Hello World")).toBe("ltr");
  });

  test("returns ltr for digits-only text", () => {
    expect(detectParagraphDirection("12345")).toBe("ltr");
  });

  test("returns rtl for Arabic text", () => {
    expect(detectParagraphDirection("مرحبا بالعالم")).toBe("rtl");
  });

  test("returns rtl for Hebrew text", () => {
    expect(detectParagraphDirection("שלום עולם")).toBe("rtl");
  });

  test("returns ltr for text starting with LTR before RTL", () => {
    expect(detectParagraphDirection("Hello مرحبا")).toBe("ltr");
  });

  test("returns rtl for text starting with RTL before LTR", () => {
    expect(detectParagraphDirection("مرحبا Hello")).toBe("rtl");
  });

  test("returns rtl for Arabic text with embedded numbers", () => {
    // First strong character is Arabic
    expect(detectParagraphDirection("السعر 100 دولار")).toBe("rtl");
  });

  test("returns ltr for CJK text", () => {
    expect(detectParagraphDirection("こんにちは")).toBe("ltr");
  });

  test("returns ltr for Cyrillic text", () => {
    expect(detectParagraphDirection("Привет")).toBe("ltr");
  });
});

// ---------------------------------------------------------------------------
// resolveParagraphDirection
// ---------------------------------------------------------------------------
describe("resolveParagraphDirection", () => {
  test("returns ltr when baseDir is ltr regardless of text", () => {
    expect(resolveParagraphDirection("مرحبا", "ltr")).toBe("ltr");
  });

  test("returns rtl when baseDir is rtl regardless of text", () => {
    expect(resolveParagraphDirection("Hello", "rtl")).toBe("rtl");
  });

  test("auto-detects rtl for Arabic text", () => {
    expect(resolveParagraphDirection("مرحبا", "auto")).toBe("rtl");
  });

  test("auto-detects ltr for Latin text", () => {
    expect(resolveParagraphDirection("Hello", "auto")).toBe("ltr");
  });

  test("defaults to ltr when baseDir is undefined", () => {
    expect(resolveParagraphDirection("مرحبا", undefined)).toBe("ltr");
  });
});

// ---------------------------------------------------------------------------
// createParagraph with baseDir
// ---------------------------------------------------------------------------
describe("createParagraph baseDir propagation", () => {
  function makeProps(baseDir?: "ltr" | "rtl" | "auto") {
    return {
      size: 16,
      font: ["NotoSansArabic"],
      color: "black",
      lineHeight: 1.2,
      indentSize: 0,
      hangingIndentSize: 0,
      tabStops: [],
      baseDir,
    };
  }

  test("paragraph has ltr baseDir by default", () => {
    const blocks = createParagraph(
      ["Hello"],
      300,
      makeProps(),
      renderer.measureText,
      renderer.breakIterator,
    );
    expect(blocks[0].paragraph.baseDir).toBe("ltr");
  });

  test("paragraph has rtl baseDir when explicitly set", () => {
    const blocks = createParagraph(
      ["مرحبا بالعالم"],
      300,
      makeProps("rtl"),
      renderer.measureText,
      renderer.breakIterator,
    );
    expect(blocks[0].paragraph.baseDir).toBe("rtl");
  });

  test("paragraph auto-detects rtl from Arabic text", () => {
    const blocks = createParagraph(
      ["مرحبا"],
      300,
      makeProps("auto"),
      renderer.measureText,
      renderer.breakIterator,
    );
    expect(blocks[0].paragraph.baseDir).toBe("rtl");
  });

  test("paragraph auto-detects ltr from Latin text", () => {
    const blocks = createParagraph(
      ["Hello World"],
      300,
      makeProps("auto"),
      renderer.measureText,
      renderer.breakIterator,
    );
    expect(blocks[0].paragraph.baseDir).toBe("ltr");
  });

  test("paragraph overrides auto-detected direction with explicit ltr", () => {
    const blocks = createParagraph(
      ["مرحبا"],
      300,
      makeProps("ltr"),
      renderer.measureText,
      renderer.breakIterator,
    );
    expect(blocks[0].paragraph.baseDir).toBe("ltr");
  });
});

// ---------------------------------------------------------------------------
// SpanProps.textDir builder
// ---------------------------------------------------------------------------
describe("SpanProps.textDir builder", () => {
  test("sets textDir on span", () => {
    const span = Span("مرحبا").textDir("rtl");
    expect(span.props.textDir).toBe("rtl");
  });

  test("sets ltr textDir on span", () => {
    const span = Span("Hello").textDir("ltr");
    expect(span.props.textDir).toBe("ltr");
  });
});

// ---------------------------------------------------------------------------
// TextProps.baseDir builder
// ---------------------------------------------------------------------------
describe("TextProps.baseDir builder", () => {
  test("sets baseDir on Text node", () => {
    const node = Text("مرحبا").baseDir("rtl");
    expect(node.props.baseDir).toBe("rtl");
  });

  test("sets auto baseDir on Text node", () => {
    const node = Text("مرحبا").baseDir("auto");
    expect(node.props.baseDir).toBe("auto");
  });
});

// ---------------------------------------------------------------------------
// RTL rendering: segment positions
// ---------------------------------------------------------------------------
describe("RTL segment positioning", () => {
  function makeRTLProps() {
    return {
      size: 20,
      font: ["NotoSansArabic"],
      color: "black",
      lineHeight: 1.2,
      indentSize: 0,
      hangingIndentSize: 0,
      tabStops: [],
      align: "right" as const,
      baseDir: "rtl" as const,
    };
  }

  test("RTL paragraph has no line wider than paragraph width", () => {
    const blocks = createParagraph(
      ["مرحبا بالعالم"],
      300,
      makeRTLProps(),
      renderer.measureText,
      renderer.breakIterator,
    );
    const paragraph = blocks[0].paragraph;
    for (const line of paragraph.lines) {
      expect(line.width).toBeLessThanOrEqual(300);
    }
  });

  test("RTL paragraph produces non-empty lines", () => {
    const blocks = createParagraph(
      ["مرحبا بالعالم"],
      300,
      makeRTLProps(),
      renderer.measureText,
      renderer.breakIterator,
    );
    const paragraph = blocks[0].paragraph;
    expect(paragraph.lines.length).toBeGreaterThan(0);
    for (const line of paragraph.lines) {
      expect(line.segments.length).toBeGreaterThan(0);
    }
  });

  test("Hebrew RTL paragraph has rtl baseDir", () => {
    const props = { ...makeRTLProps(), font: ["NotoSansHebrew"] };
    const blocks = createParagraph(
      ["שלום עולם"],
      300,
      props,
      renderer.measureText,
      renderer.breakIterator,
    );
    expect(blocks[0].paragraph.baseDir).toBe("rtl");
  });

  test("RTL auto-detection produces rtl paragraph", () => {
    const props = { ...makeRTLProps(), baseDir: "auto" as const };
    const blocks = createParagraph(
      ["مرحبا بالعالم"],
      300,
      props,
      renderer.measureText,
      renderer.breakIterator,
    );
    expect(blocks[0].paragraph.baseDir).toBe("rtl");
  });

  test("mixed RTL paragraph with span textDir", () => {
    // A span can declare its own textDir for fine-grained control
    const arabicSpan = Span("مرحبا").textDir("rtl");
    const props = makeRTLProps();
    const blocks = createParagraph(
      [arabicSpan],
      300,
      props,
      renderer.measureText,
      renderer.breakIterator,
    );
    expect(blocks[0].paragraph.lines[0].segments.length).toBeGreaterThan(0);
  });
});
