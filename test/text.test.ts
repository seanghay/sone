import { fileURLToPath } from "node:url";
import { beforeAll, expect, test } from "vitest";
import type { TextNode, TextProps } from "../src/core.ts";
import type { SoneMetadata } from "../src/metadata.ts";
import {
  compile,
  renderer,
  renderWithMetadata,
  SoneCompileContext,
  Span,
  Text,
} from "../src/node.ts";
import {
  createBlocks,
  createMultilineParagraph,
  createParagraph,
  createTextRuns,
} from "../src/text.ts";

const relative = (p: string) => fileURLToPath(new URL(p, import.meta.url));

beforeAll(() => {
  renderer.registerFont("NotoSansKhmer", relative("font/NotoSansKhmer.ttf"));
  renderer.registerFont("GeistMono", relative("font/GeistMono-Regular.ttf"));
});

function createContext(): SoneCompileContext {
  return {
    defaultTextProps: renderer.getDefaultTextProps(),
    breakIterator: renderer.breakIterator,
    loadImage: renderer.loadImage,
    createId: () => 0,
  };
}

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

function getTextParagraphs(metadata: SoneMetadata) {
  if (metadata.type !== "text") {
    throw new Error(`Expected text metadata, got ${metadata.type}`);
  }

  const props = metadata.props as TextProps;
  if (props.blocks == null) {
    throw new Error("Expected compiled paragraph blocks");
  }

  return props.blocks;
}

function getLineTexts(paragraph: {
  lines: Array<{ segments: Array<{ text: string }> }>;
}) {
  return paragraph.lines.map((line) =>
    line.segments.map((segment) => segment.text).join(""),
  );
}

function getLineText(line: { segments: Array<{ text: string }> }) {
  return line.segments.map((segment) => segment.text).join("");
}

function createLayoutStub(width: number): Parameters<typeof createTextRuns>[1] {
  return {
    getComputedWidth: () => width,
    getComputedBorder: () => 0,
    getComputedPadding: () => 0,
  } as unknown as Parameters<typeof createTextRuns>[1];
}

async function compileTextNodeWithBlocks(node: TextNode, maxWidth: number) {
  const compiledNode = await compile(node, createContext());
  if (compiledNode == null || compiledNode.type !== "text") {
    throw new Error("Expected compiled text node");
  }

  compiledNode.props.blocks = createParagraph(
    compiledNode.children,
    maxWidth,
    compiledNode.props,
    renderer.measureText,
    renderer.breakIterator,
  );
  return compiledNode;
}

function getLastRunRight(line: {
  segments: Array<{ run?: { x: number; width: number } }>;
}) {
  const run = line.segments[line.segments.length - 1]?.run;
  if (run == null) throw new Error("Expected run metadata");
  return run.x + run.width;
}

test("create paragraph without max width", async () => {
  const node = Text(
    "លោកសាស្ត្រាចារ្យ ឈាង រ៉ា រដ្ឋមន្ត្រីក្រសួងសុខាភិបាល បានប្រកាសថា ក្រុមគ្រូពេទ្យកម្ពុជាគឺជាលោកសាស្ត្រាចារ្យ",
    Span("ឈាង រ៉ា រដ្ឋមន្ត្រីក្រសួងសុខាភិបាល បានប្រកាសថា ក្រុមគ្រូពេទ្យកម្ពុជាគឺជា").size(32),
    "លោកសាស្ត្រាចារ្យ ឈាង រ៉ា រដ្ឋមន្ត្រីក្រសួងសុខាភិបាល",
    Span("ឈាង រ៉ា រដ្ឋមន្ត្រីក្រសួងសុខាភិបាល បានប្រកាសថា"),
  )
    .font("NotoSansKhmer")
    .size(14);

  const compiledNode = await compile(node, createContext());

  const blocks = createParagraph(
    compiledNode!.children,
    Number.NaN,
    renderer.getDefaultTextProps(),
    renderer.measureText,
    renderer.breakIterator,
  );

  const paragraph = blocks[0].paragraph;
  expect(Math.round(paragraph.width) > 0).toBe(true);
  expect(Math.round(paragraph.height) > 0).toBe(true);
});

test("createMultilineParagraph with simple text", () => {
  const spans = ["Hello World"];
  const paragraph = createMultilineParagraph(
    spans,
    [[]],
    Number.POSITIVE_INFINITY,
    textProps({ size: 14, font: ["sans-serif"] }),
    renderer.measureText,
  );

  expect(paragraph.lines).toHaveLength(1);
  expect(paragraph.lines[0].segments).toHaveLength(1);
  expect(paragraph.lines[0].segments[0].text).toBe("Hello World");
  expect(paragraph.width).toBeGreaterThan(0);
  expect(paragraph.height).toBeGreaterThan(0);
});

test("createMultilineParagraph with mixed spans", () => {
  const spans = ["Hello ", Span("World").size(18).color("red"), "!"];

  const paragraph = createMultilineParagraph(
    spans,
    [[], [], []],
    Number.POSITIVE_INFINITY,
    textProps({ size: 14, font: ["NotoSansKhmer"] }),
    renderer.measureText,
  );

  expect(paragraph.lines).toHaveLength(1);
  expect(paragraph.lines[0].segments).toHaveLength(3);
  expect(paragraph.lines[0].segments[0].text).toBe("Hello ");
  expect(paragraph.lines[0].segments[1].text).toBe("World");
  expect(paragraph.lines[0].segments[2].text).toBe("!");
});

test("createMultilineParagraph with line height multiplier", () => {
  const spans = ["Test"];
  const normalParagraph = createMultilineParagraph(
    spans,
    [[]],
    Number.POSITIVE_INFINITY,
    textProps({ size: 14, font: ["NotoSansKhmer"], lineHeight: 1.0 }),
    renderer.measureText,
  );
  const largeParagraph = createMultilineParagraph(
    spans,
    [[]],
    Number.POSITIVE_INFINITY,
    textProps({ size: 14, font: ["NotoSansKhmer"], lineHeight: 2.0 }),
    renderer.measureText,
  );

  expect(largeParagraph.height).toBeGreaterThan(normalParagraph.height);
});

test("createMultilineParagraph with indentation", () => {
  const spans = ["Test"];
  const noIndentParagraph = createMultilineParagraph(
    spans,
    [[]],
    Number.POSITIVE_INFINITY,
    textProps({ size: 14, font: ["NotoSansKhmer"], indentSize: 0 }),
    renderer.measureText,
  );
  const indentParagraph = createMultilineParagraph(
    spans,
    [[]],
    Number.POSITIVE_INFINITY,
    textProps({ size: 14, font: ["NotoSansKhmer"], indentSize: 20 }),
    renderer.measureText,
  );

  expect(indentParagraph.width).toBe(noIndentParagraph.width + 20);
});

test("createMultilineParagraph with offsetY variations", () => {
  const spans = [
    "Normal",
    Span("Raised").offsetY(-5),
    Span("Lowered").offsetY(5),
  ];

  const paragraph = createMultilineParagraph(
    spans,
    [[], [], []],
    Number.POSITIVE_INFINITY,
    textProps({ size: 14, font: ["NotoSansKhmer"] }),
    renderer.measureText,
  );

  expect(paragraph.lines).toHaveLength(1);
  expect(paragraph.lines[0].segments).toHaveLength(3);
  // Height should account for vertical offsets
  expect(paragraph.height).toBeGreaterThan(14); // Should be larger than base font size due to offsets
});

test("createBlocks splits explicit newlines and preserves span styling", () => {
  const span = Span("Gamma\nDelta").weight("bold").color("red");
  const [blocks] = createBlocks(["Alpha\nBeta", span], renderer.breakIterator);

  expect(blocks).toHaveLength(3);
  expect(blocks[0]).toEqual(["Alpha"]);
  expect(blocks[1][0]).toBe("Beta");
  expect(blocks[1][1]).not.toBe(span);
  expect((blocks[1][1] as typeof span).children).toBe("Gamma");
  expect((blocks[1][1] as typeof span).props.weight).toBe("bold");
  expect((blocks[2][0] as typeof span).children).toBe("Delta");
  expect((blocks[2][0] as typeof span).props.color).toBe("red");
});

test("createMultilineParagraph trims trailing whitespace from the last segment", () => {
  const baseProps = textProps();
  const paragraph = createMultilineParagraph(
    ["Alpha   ", "Beta   "],
    [[], []],
    Number.POSITIVE_INFINITY,
    baseProps,
    renderer.measureText,
  );

  expect(paragraph.lines).toHaveLength(1);
  expect(paragraph.lines[0].segments[0].text).toBe("Alpha   ");
  expect(paragraph.lines[0].segments[1].text).toBe("Beta");

  const expectedWidth =
    renderer.measureText("Alpha   ", baseProps).width +
    renderer.measureText("Beta", baseProps).width;
  expect(paragraph.width).toBeCloseTo(expectedWidth, 3);
});

test("createParagraph with constrained width", async () => {
  const node = Text(
    "This is a longer text that should wrap when constrained to a small width",
  );
  const compiledNode = await compile(node, createContext());

  // Test with constrained width
  const constrainedBlocks = createParagraph(
    compiledNode!.children,
    100, // Small width to force wrapping
    renderer.getDefaultTextProps(),
    renderer.measureText,
    renderer.breakIterator,
  );

  const constrainedParagraph = constrainedBlocks[0].paragraph;

  // Should have multiple lines due to wrapping
  expect(constrainedParagraph.lines.length).toBeGreaterThan(1);
  expect(constrainedParagraph.width).toBeLessThanOrEqual(100);
});

test("createParagraph drops leading wrap whitespace on the next line", async () => {
  const node = Text("Alpha Beta").font("GeistMono").size(20);
  const compiledNode = await compile(node, createContext());

  const paragraph = createParagraph(
    compiledNode!.children,
    71,
    compiledNode!.props,
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(getLineTexts(paragraph)).toEqual(["Alpha", "Beta"]);
  expect(paragraph.lines[0].width).toBeCloseTo(
    renderer.measureText("Alpha", compiledNode!.props).width,
    3,
  );
  expect(paragraph.lines[1].width).toBeCloseTo(
    renderer.measureText("Beta", compiledNode!.props).width,
    3,
  );
});

test("createParagraph trims wrap whitespace from remaining text", async () => {
  const node = Text("Alpha $Beta").font("GeistMono").size(20);
  const compiledNode = await compile(node, createContext());

  const paragraph = createParagraph(
    compiledNode!.children,
    71,
    compiledNode!.props,
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(getLineTexts(paragraph)).toEqual(["Alpha", "$Beta"]);
  expect(getLineText(paragraph.lines[1])).toBe("$Beta");
});

test("createParagraph trims wrap whitespace at span boundaries", async () => {
  const node = Text("Alpha", Span(" $Beta").color("red"))
    .font("GeistMono")
    .size(20);
  const compiledNode = await compile(node, createContext());

  const paragraph = createParagraph(
    compiledNode!.children,
    71,
    compiledNode!.props,
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(getLineTexts(paragraph)).toEqual(["Alpha", "$Beta"]);
  expect(getLineText(paragraph.lines[1])).toBe("$Beta");
});

test("createParagraph wraps long unspaced runs at tight widths across scripts", () => {
  const cases = [
    {
      font: ["GeistMono"],
      size: 20,
      text: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      width: 30,
    },
    {
      font: ["sans-serif"],
      size: 18,
      text: "ກກກກກກກກກກກກກກກກກກກກກກກກ",
      width: 30,
    },
    {
      font: ["NotoSansKhmer"],
      size: 18,
      text: "កកកកកកកកកកកកកកកកកកកកកកកកកកកកកក",
      width: 30,
    },
  ];

  for (const { font, size, text, width } of cases) {
    const paragraph = createParagraph(
      [text],
      width,
      textProps({
        font,
        size,
        lineBreak: "greedy",
      }),
      renderer.measureText,
      renderer.breakIterator,
    )[0].paragraph;

    expect(paragraph.lines.length).toBeGreaterThan(1);
    expect(getLineTexts(paragraph).join("")).toBe(text);
    expect(paragraph.lines.every((line) => line.width <= width)).toBe(true);
    expect(getLineTexts(paragraph).every((line) => line.length > 0)).toBe(true);
  }
});

test("createParagraph falls back from Knuth-Plass to tight wrapping for long unspaced text", () => {
  const text = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const width = 30;
  const greedy = createParagraph(
    [text],
    width,
    textProps({
      font: ["GeistMono"],
      size: 20,
      lineBreak: "greedy",
    }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;
  const knuthPlass = createParagraph(
    [text],
    width,
    textProps({
      font: ["GeistMono"],
      size: 20,
      lineBreak: "knuth-plass",
    }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(getLineTexts(knuthPlass)).toEqual(getLineTexts(greedy));
  expect(knuthPlass.lines.every((line) => line.width <= width)).toBe(true);
});

test("createParagraph keeps word-joined spans intact when wrapping", () => {
  const cases = [
    {
      text: "Alpha\u2060 Beta Gamma",
      firstLine: "Alpha\u2060 Beta",
    },
    {
      text: "Alpha \u2060Beta Gamma",
      firstLine: "Alpha \u2060Beta",
    },
    {
      text: "Alpha \u2060 Beta Gamma",
      firstLine: "Alpha \u2060 Beta",
    },
  ];

  for (const lineBreak of [undefined, "greedy", "knuth-plass"] as const) {
    for (const { text, firstLine } of cases) {
      const props = textProps({
        font: ["GeistMono"],
        lineBreak,
        size: 20,
      });
      const maxWidth = renderer.measureText(firstLine, props).width + 1;
      const paragraph = createParagraph(
        [text],
        maxWidth,
        props,
        renderer.measureText,
        renderer.breakIterator,
      )[0].paragraph;

      expect(getLineTexts(paragraph)).toEqual([firstLine, "Gamma"]);
    }
  }
});

test("createParagraph keeps non-breaking spaces intact when wrapping", () => {
  const cases = [
    {
      text: "Alpha\u00a0Beta Gamma",
      firstLine: "Alpha\u00a0Beta",
    },
    {
      text: "Alpha\u00a0 Beta Gamma",
      firstLine: "Alpha\u00a0 Beta",
    },
    {
      text: "Alpha \u00a0Beta Gamma",
      firstLine: "Alpha \u00a0Beta",
    },
    {
      text: "Alpha \u00a0 Beta Gamma",
      firstLine: "Alpha \u00a0 Beta",
    },
  ];

  for (const lineBreak of [undefined, "greedy", "knuth-plass"] as const) {
    for (const { text, firstLine } of cases) {
      const props = textProps({
        font: ["GeistMono"],
        lineBreak,
        size: 20,
      });
      const maxWidth = renderer.measureText(firstLine, props).width + 1;
      const paragraph = createParagraph(
        [text],
        maxWidth,
        props,
        renderer.measureText,
        renderer.breakIterator,
      )[0].paragraph;

      expect(getLineTexts(paragraph)).toEqual([firstLine, "Gamma"]);
    }
  }
});

test("createParagraph honors nowrap under constrained width", () => {
  const blocks = createParagraph(
    ["AAAA AAAA AAAA AAAA"],
    80,
    textProps({ nowrap: true }),
    renderer.measureText,
    renderer.breakIterator,
  );

  expect(blocks).toHaveLength(1);
  expect(blocks[0].paragraph.lines).toHaveLength(1);
  expect(blocks[0].paragraph.width).toBeGreaterThan(80);
});

test("createParagraph adds ellipsis for nowrap overflow", () => {
  const props = textProps({
    nowrap: true,
    textOverflow: "ellipsis",
    font: ["GeistMono"],
  });
  const paragraph = createParagraph(
    ["AAAA AAAA AAAA AAAA"],
    80,
    props,
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(paragraph.lines).toHaveLength(1);
  expect(getLineText(paragraph.lines[0])).toContain("…");
  expect(paragraph.width).toBeLessThanOrEqual(80);
});

test("createParagraph clamps wrapped text to maxLines with ellipsis", () => {
  const props = textProps({
    font: ["GeistMono"],
    size: 20,
    maxLines: 2,
    textOverflow: "ellipsis",
  });
  const paragraph = createParagraph(
    ["Alpha Beta Gamma Delta Epsilon Zeta Eta Theta"],
    120,
    props,
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(paragraph.lines).toHaveLength(2);
  expect(getLineText(paragraph.lines[1]).endsWith("…")).toBe(true);
  expect(paragraph.width).toBeLessThanOrEqual(120);
});

test("createParagraph does not add ellipsis when content fits", () => {
  const paragraph = createParagraph(
    ["Hello"],
    200,
    textProps({
      font: ["GeistMono"],
      nowrap: true,
      textOverflow: "ellipsis",
    }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(getLineText(paragraph.lines[0])).toBe("Hello");
});

test("maxLines(1) matches nowrap ellipsis behavior", () => {
  const text = "AAAA AAAA AAAA AAAA";
  const nowrap = createParagraph(
    [text],
    80,
    textProps({
      font: ["GeistMono"],
      nowrap: true,
      textOverflow: "ellipsis",
    }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;
  const clamped = createParagraph(
    [text],
    80,
    textProps({
      font: ["GeistMono"],
      maxLines: 1,
      textOverflow: "ellipsis",
    }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(getLineTexts(clamped)).toEqual(getLineTexts(nowrap));
});

test("createParagraph preserves tail span styling on ellipsis", () => {
  const paragraph = createParagraph(
    ["Alpha ", Span("Beta Gamma Delta").color("red")],
    120,
    textProps({
      font: ["GeistMono"],
      size: 20,
      maxLines: 1,
      textOverflow: "ellipsis",
    }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;
  const tail =
    paragraph.lines[0].segments[paragraph.lines[0].segments.length - 1];

  expect(tail.text.endsWith("…")).toBe(true);
  expect(tail.props.color).toBe("red");
});

test("createParagraph trims whitespace before inserting ellipsis", () => {
  const paragraph = createParagraph(
    ["Alpha Beta     Gamma Delta"],
    120,
    textProps({
      font: ["GeistMono"],
      size: 20,
      maxLines: 1,
      textOverflow: "ellipsis",
    }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(getLineText(paragraph.lines[0])).not.toContain(" …");
  expect(getLineText(paragraph.lines[0]).endsWith("…")).toBe(true);
});

test("createTextRuns centers a single line within the layout width", async () => {
  const width = 200;
  const compiledNode = await compileTextNodeWithBlocks(
    Text("Alpha").font("GeistMono").size(20).align("center"),
    width,
  );

  createTextRuns(compiledNode, createLayoutStub(width), 0, 0);

  const run = compiledNode.props.blocks![0].paragraph.lines[0].segments[0].run;
  expect(run).toBeDefined();
  expect(run!.x).toBeCloseTo((width - run!.width) / 2, 3);
});

test("createTextRuns right-aligns a single line within the layout width", async () => {
  const width = 200;
  const compiledNode = await compileTextNodeWithBlocks(
    Text("Alpha").font("GeistMono").size(20).align("right"),
    width,
  );

  createTextRuns(compiledNode, createLayoutStub(width), 0, 0);

  const run = compiledNode.props.blocks![0].paragraph.lines[0].segments[0].run;
  expect(run).toBeDefined();
  expect(run!.x).toBeCloseTo(width - run!.width, 3);
});

test("createTextRuns justifies wrapped non-final lines but leaves the final line ragged", async () => {
  const width = 150;
  const compiledNode = await compileTextNodeWithBlocks(
    Text("Alpha Beta Gamma Delta").font("GeistMono").size(20).align("justify"),
    width,
  );

  createTextRuns(compiledNode, createLayoutStub(width), 0, 0);

  const lines = compiledNode.props.blocks![0].paragraph.lines;
  expect(getLineTexts(compiledNode.props.blocks![0].paragraph)).toEqual([
    "Alpha Beta",
    "Gamma Delta",
  ]);
  expect(getLastRunRight(lines[0])).toBeCloseTo(width, 3);
  expect(getLastRunRight(lines[1])).toBeCloseTo(lines[1].width, 3);
  expect(getLastRunRight(lines[1])).toBeLessThan(width);
});

test("createTextRuns applies indent to the first line and hanging indent to wrapped lines", async () => {
  const width = 100;
  const compiledNode = await compileTextNodeWithBlocks(
    Text("Alpha Beta Gamma")
      .font("GeistMono")
      .size(20)
      .indent(12)
      .hangingIndent(28),
    width,
  );

  createTextRuns(compiledNode, createLayoutStub(width), 0, 0);

  const lines = compiledNode.props.blocks![0].paragraph.lines;
  expect(getLineTexts(compiledNode.props.blocks![0].paragraph)).toEqual([
    "Alpha",
    "Beta",
    "Gamma",
  ]);
  expect(lines[0].segments[0].run?.x).toBeCloseTo(12, 3);
  expect(lines[1].segments[0].run?.x).toBeCloseTo(28, 3);
  expect(lines[2].segments[0].run?.x).toBeCloseTo(28, 3);
});

test("createTextRuns stacks explicit newline paragraphs vertically", async () => {
  const width = 200;
  const compiledNode = await compileTextNodeWithBlocks(
    Text("Alpha\nBeta").font("GeistMono").size(20),
    width,
  );

  createTextRuns(compiledNode, createLayoutStub(width), 0, 0);

  const blocks = compiledNode.props.blocks!;
  expect(blocks).toHaveLength(2);

  const firstRun = blocks[0].paragraph.lines[0].segments[0].run;
  const secondRun = blocks[1].paragraph.lines[0].segments[0].run;

  expect(firstRun).toBeDefined();
  expect(secondRun).toBeDefined();
  expect(secondRun!.y).toBeGreaterThan(firstRun!.y);
  expect(secondRun!.y - firstRun!.y).toBeCloseTo(blocks[0].paragraph.height, 3);
});

test("nowrap + autofit shrinks font to fit within width", async () => {
  const containerWidth = 120;
  const { metadata } = await renderWithMetadata(
    Text("AAAA AAAA AAAA AAAA")
      .font("GeistMono")
      .size(20)
      .width(containerWidth)
      .nowrap()
      .autofit(),
    renderer,
  );

  const blocks = getTextParagraphs(metadata as SoneMetadata);
  const paragraph = blocks[0].paragraph;
  const resolvedSize = (metadata as SoneMetadata).props as TextProps;

  expect(paragraph.lines).toHaveLength(1);
  expect(paragraph.width).toBeLessThanOrEqual(containerWidth);
  expect(resolvedSize.size).toBeLessThan(20);
});

test("nowrap + autofit grows font to fill a wide container", async () => {
  const containerWidth = 800;
  const { metadata } = await renderWithMetadata(
    Text("Hello")
      .font("GeistMono")
      .size(20)
      .width(containerWidth)
      .nowrap()
      .autofit(),
    renderer,
  );

  const blocks = getTextParagraphs(metadata as SoneMetadata);
  const paragraph = blocks[0].paragraph;
  const resolvedSize = (metadata as SoneMetadata).props as TextProps;

  expect(paragraph.lines).toHaveLength(1);
  expect(paragraph.width).toBeLessThanOrEqual(containerWidth);
  expect(resolvedSize.size).toBeGreaterThan(20);
});

test("nowrap + autofit always produces a single line", async () => {
  const containerWidth = 300;
  const { metadata } = await renderWithMetadata(
    Text("The quick brown fox jumps over the lazy dog")
      .font("GeistMono")
      .size(20)
      .width(containerWidth)
      .nowrap()
      .autofit(),
    renderer,
  );

  const blocks = getTextParagraphs(metadata as SoneMetadata);
  expect(blocks[0].paragraph.lines).toHaveLength(1);
  expect(blocks[0].paragraph.width).toBeLessThanOrEqual(containerWidth);
});

test("createParagraph defaults to greedy line breaking", () => {
  const text =
    "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor";

  const implicitGreedy = createParagraph(
    [text],
    300,
    textProps({ size: 20 }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;
  const explicitGreedy = createParagraph(
    [text],
    300,
    textProps({ size: 20, lineBreak: "greedy" }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(getLineTexts(implicitGreedy)).toEqual(getLineTexts(explicitGreedy));
});

test("createParagraph supports Knuth-Plass line breaking", () => {
  const text =
    "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor";

  const greedy = createParagraph(
    [text],
    300,
    textProps({ size: 20, lineBreak: "greedy" }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;
  const knuthPlass = createParagraph(
    [text],
    300,
    textProps({ size: 20, lineBreak: "knuth-plass" }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(getLineTexts(greedy)).toEqual([
    "lorem ipsum dolor sit",
    "amet consectetur",
    "adipiscing elit sed do",
    "eiusmod tempor",
  ]);
  expect(getLineTexts(knuthPlass)).toEqual([
    "lorem ipsum dolor",
    "sit amet consectetur",
    "adipiscing elit sed do",
    "eiusmod tempor",
  ]);
});

test("createParagraph with Knuth-Plass preserves styled spans across lines", () => {
  const paragraph = createParagraph(
    [
      "lorem ",
      Span("ipsum dolor ").color("red"),
      "sit amet consectetur adipiscing",
    ],
    220,
    textProps({ lineBreak: "knuth-plass", size: 18 }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(getLineTexts(paragraph)).toEqual([
    "lorem ipsum dolor",
    "sit amet consectetur",
    "adipiscing",
  ]);
  expect(paragraph.lines[0].segments[1].text).toBe("ipsum dolor");
  expect(paragraph.lines[0].segments[1].props.color).toBe("red");
});

test("createParagraph expands tab stops into synthetic segments", () => {
  const baseProps = textProps({ tabStops: [140, 260] });
  const blocks = createParagraph(
    ["Label\tValue\tTail"],
    Number.POSITIVE_INFINITY,
    baseProps,
    renderer.measureText,
    renderer.breakIterator,
  );

  const segments = blocks[0].paragraph.lines[0].segments;
  const labelWidth = renderer.measureText("Label", baseProps).width;
  const valueWidth = renderer.measureText("Value", baseProps).width;

  expect(segments).toHaveLength(5);
  expect(segments[1].isTab).toBe(true);
  expect(segments[3].isTab).toBe(true);
  expect(segments[1].width).toBeCloseTo(140 - labelWidth, 3);
  expect(segments[3].width).toBeCloseTo(260 - 140 - valueWidth, 3);
});

test("createParagraph with Knuth-Plass falls back to greedy for tab stops", () => {
  const greedy = createParagraph(
    ["Label\tValue\tTail"],
    Number.POSITIVE_INFINITY,
    textProps({ lineBreak: "greedy", tabStops: [140, 260] }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;
  const knuthPlass = createParagraph(
    ["Label\tValue\tTail"],
    Number.POSITIVE_INFINITY,
    textProps({ lineBreak: "knuth-plass", tabStops: [140, 260] }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(getLineTexts(knuthPlass)).toEqual(getLineTexts(greedy));
  expect(
    knuthPlass.lines
      .flatMap((line) => line.segments)
      .some((segment) => segment.isTab),
  ).toBe(true);
});

test("renderWithMetadata distributes justify spacing on non-final lines only", async () => {
  const { metadata } = await renderWithMetadata(
    Text("aaaa aaaa aaaa aaaa aaaa")
      .font("GeistMono")
      .size(20)
      .width(120)
      .align("justify"),
    renderer,
  );

  const paragraph = getTextParagraphs(metadata as SoneMetadata)[0].paragraph;
  const firstLine = paragraph.lines[0];
  const lastLine = paragraph.lines[paragraph.lines.length - 1];

  const firstRunWidth = firstLine.segments.reduce(
    (width, segment) => width + (segment.run?.width ?? 0),
    0,
  );
  const lastRunWidth = lastLine.segments.reduce(
    (width, segment) => width + (segment.run?.width ?? 0),
    0,
  );

  expect(paragraph.lines.length).toBeGreaterThan(1);
  expect(firstLine.spacesCount).toBeGreaterThan(0);
  expect(firstRunWidth).toBeGreaterThan(firstLine.width);
  expect(firstRunWidth).toBeCloseTo(paragraph.width, 3);
  expect(lastRunWidth).toBeCloseTo(lastLine.width, 3);
});

test("renderWithMetadata keeps truncated final line out of justify expansion", async () => {
  const { metadata } = await renderWithMetadata(
    Text("Alpha Beta Gamma Delta Epsilon Zeta Eta Theta")
      .font("GeistMono")
      .size(20)
      .width(120)
      .align("justify")
      .maxLines(2)
      .textOverflow("ellipsis"),
    renderer,
  );

  const paragraph = getTextParagraphs(metadata as SoneMetadata)[0].paragraph;
  const lastLine = paragraph.lines[paragraph.lines.length - 1];
  const lastRunWidth = lastLine.segments.reduce(
    (width, segment) => width + (segment.run?.width ?? 0),
    0,
  );

  expect(paragraph.lines).toHaveLength(2);
  expect(getLineText(lastLine).endsWith("…")).toBe(true);
  expect(lastRunWidth).toBeCloseTo(lastLine.width, 3);
});

test("renderWithMetadata applies first-line and hanging indents to text runs", async () => {
  const { metadata } = await renderWithMetadata(
    Text("aaaa aaaa aaaa aaaa aaaa")
      .font("GeistMono")
      .size(20)
      .maxWidth(120)
      .indent(18)
      .hangingIndent(36),
    renderer,
  );

  const paragraph = getTextParagraphs(metadata as SoneMetadata)[0].paragraph;

  expect(paragraph.lines.length).toBeGreaterThan(1);
  expect(paragraph.lines[0].segments[0].run?.x).toBe(18);
  expect(paragraph.lines[1].segments[0].run?.x).toBe(36);
});

test("renderWithMetadata swaps text footprint for 270 degree orientation", async () => {
  const { metadata: horizontal } = await renderWithMetadata(
    Text("rotate me").font("GeistMono").size(20),
    renderer,
  );
  const { metadata: rotated } = await renderWithMetadata(
    Text("rotate me").font("GeistMono").size(20).orientation(270),
    renderer,
  );

  expect((rotated as SoneMetadata).width).toBeCloseTo(
    (horizontal as SoneMetadata).height,
    3,
  );
  expect((rotated as SoneMetadata).height).toBeCloseTo(
    (horizontal as SoneMetadata).width,
    3,
  );
});

test("createParagraph with different measure modes", async () => {
  const node = Text("Short text");
  const compiledNode = await compile(node, createContext());

  // Test different width constraints
  const undefinedBlocks = createParagraph(
    compiledNode!.children,
    Number.POSITIVE_INFINITY,
    renderer.getDefaultTextProps(),
    renderer.measureText,
    renderer.breakIterator,
  );

  const constrainedBlocks = createParagraph(
    compiledNode!.children,
    200,
    renderer.getDefaultTextProps(),
    renderer.measureText,
    renderer.breakIterator,
  );

  const undefinedMode = undefinedBlocks[0].paragraph;
  const constrainedMode = constrainedBlocks[0].paragraph;

  expect(undefinedMode.lines).toHaveLength(1); // No wrapping
  expect(constrainedMode.width).toBeLessThanOrEqual(200); // At most the specified width
});

test("createParagraph expands tab stops into explicit spacing", async () => {
  const withTabs = Text("Name\tAmount").font("monospace").tabStops(120);
  const withoutTabs = Text("Name Amount").font("monospace");

  const context: SoneCompileContext = {
    defaultTextProps: renderer.getDefaultTextProps(),
    breakIterator: renderer.breakIterator,
    loadImage: renderer.loadImage,
    createId: () => 0,
  };

  const [compiledWithTabs, compiledWithoutTabs] = await Promise.all([
    compile(withTabs, context),
    compile(withoutTabs, context),
  ]);

  const withTabsParagraph = createParagraph(
    compiledWithTabs!.children,
    Number.POSITIVE_INFINITY,
    compiledWithTabs!.props,
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  const withoutTabsParagraph = createParagraph(
    compiledWithoutTabs!.children,
    Number.POSITIVE_INFINITY,
    compiledWithoutTabs!.props,
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(withTabsParagraph.width).toBeGreaterThan(withoutTabsParagraph.width);
  expect(
    withTabsParagraph.lines[0].segments.some((segment) => segment.isTab),
  ).toBe(true);
});

test("text orientation swaps the layout footprint at 90 degrees", async () => {
  const normal = await renderWithMetadata(Text("Rotate me").size(24), renderer);
  const rotated = await renderWithMetadata(
    Text("Rotate me").size(24).orientation(90),
    renderer,
  );

  expect(Math.round((rotated.metadata as SoneMetadata).width)).toBe(
    Math.round((normal.metadata as SoneMetadata).height),
  );
  expect(Math.round((rotated.metadata as SoneMetadata).height)).toBe(
    Math.round((normal.metadata as SoneMetadata).width),
  );
});

test("justified text distributes extra width across every space", async () => {
  const { metadata } = await renderWithMetadata(
    Text("Alpha  Beta   Gamma Delta").size(20).align("justify").width(140),
    renderer,
  );

  const blocks = getTextParagraphs(metadata as SoneMetadata);
  const line = blocks[0].paragraph.lines[0];
  const runWidth = line.segments.reduce(
    (sum: number, segment) => sum + (segment.run?.width ?? 0),
    0,
  );

  expect(blocks[0].paragraph.lines.length).toBeGreaterThan(1);
  expect(line.spacesCount).toBeGreaterThan(0);
  expect(Math.round(runWidth)).toBe(Math.round(blocks[0].paragraph.width));
});

test("justified wrapped lines trim trailing whitespace before layout", async () => {
  const { metadata } = await renderWithMetadata(
    Text("Alpha Beta Gamma Delta").size(20).align("justify").width(120),
    renderer,
  );

  const firstLine = getTextParagraphs(metadata as SoneMetadata)[0].paragraph
    .lines[0];
  const tail = firstLine.segments[firstLine.segments.length - 1];

  expect(firstLine.segments.length).toBeGreaterThan(0);
  expect(tail.text.endsWith(" ")).toBe(false);
});

test("renderWithMetadata keeps Knuth-Plass output in compiled text props", async () => {
  const text =
    "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor";
  const { metadata } = await renderWithMetadata(
    Text(text).font("GeistMono").size(20).width(300).lineBreak("knuth-plass"),
    renderer,
  );

  const paragraph = getTextParagraphs(metadata as SoneMetadata)[0].paragraph;
  expect(((metadata as SoneMetadata).props as TextProps).lineBreak).toBe(
    "knuth-plass",
  );
  expect(getLineTexts(paragraph)).toEqual([
    "lorem ipsum dolor",
    "sit amet consectetur",
    "adipiscing elit sed do",
    "eiusmod tempor",
  ]);
});

test("createParagraph truncates Khmer text with ellipsis", () => {
  const text =
    "ក្រសួងការពារជាតិកម្ពុជា បានគូសបញ្ជាក់ថា ការប្រើប្រាស់សព្វាវុធធុនធ្ងន់គ្រប់ប្រភេទ និងការដាក់ពង្រាយទាហានយ៉ាងច្រើនលើសលុប";
  const paragraph = createParagraph(
    [text],
    150,
    textProps({
      font: ["NotoSansKhmer"],
      size: 18,
      maxLines: 2,
      textOverflow: "ellipsis",
    }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;
  const lastLineText = getLineText(paragraph.lines[paragraph.lines.length - 1]);

  expect(paragraph.lines).toHaveLength(2);
  expect(lastLineText.endsWith("…")).toBe(true);
  expect(lastLineText.includes(" …")).toBe(false);
  expect(paragraph.width).toBeLessThanOrEqual(150);
});

test("createParagraph wraps Khmer text at word boundaries", () => {
  const paragraph = createParagraph(
    ["ក្រសួងការពារជាតិ កម្ពុជា ប្រកាសព័ត៌មានថ្មី"],
    120,
    textProps({
      font: ["NotoSansKhmer"],
      size: 18,
      lineHeight: 1.3,
    }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(getLineTexts(paragraph)).toEqual([
    "ក្រសួងការពារជាតិ",
    "កម្ពុជា ប្រកាស",
    "ព័ត៌មានថ្មី",
  ]);
});

test("createParagraph keeps Khmer punctuation attached when wrapping", () => {
  const paragraph = createParagraph(
    ["ក្រសួងការពារជាតិ កម្ពុជា ប្រកាសព័ត៌មានថ្មី។ សូមប្រុងប្រយ័ត្ន"],
    120,
    textProps({
      font: ["NotoSansKhmer"],
      size: 18,
      lineHeight: 1.3,
    }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(getLineTexts(paragraph)).toEqual([
    "ក្រសួងការពារជាតិ",
    "កម្ពុជា ប្រកាស",
    "ព័ត៌មានថ្មី។ សូម",
    "ប្រុងប្រយ័ត្ន",
  ]);
  expect(getLineTexts(paragraph).some((line) => line.startsWith("។"))).toBe(
    false,
  );
});

test("createParagraph keeps Khmer currency, percent, and reduplication markers attached", () => {
  const cases = [
    {
      text: "តម្លៃសំបុត្រ $៥០ ក្នុងម្នាក់",
      width: 95,
      lines: ["តម្លៃសំបុត្រ", "$៥០ ក្នុងម្នាក់"],
    },
    {
      text: "បញ្ចុះតម្លៃ ១០០% សម្រាប់សិស្ស",
      width: 110,
      lines: ["បញ្ចុះតម្លៃ", "១០០% សម្រាប់", "សិស្ស"],
    },
    {
      text: "ឧទាហរណ៍ រៗ បន្ថែម",
      width: 90,
      lines: ["ឧទាហរណ៍", "រៗ បន្ថែម"],
    },
  ];

  for (const { text, width, lines } of cases) {
    const paragraph = createParagraph(
      [text],
      width,
      textProps({
        font: ["NotoSansKhmer"],
        size: 18,
        lineHeight: 1.3,
      }),
      renderer.measureText,
      renderer.breakIterator,
    )[0].paragraph;

    expect(getLineTexts(paragraph)).toEqual(lines);
    expect(getLineTexts(paragraph).some((line) => line.startsWith(" "))).toBe(
      false,
    );
  }
});

test("createTextRuns centers wrapped Khmer lines within the layout width", async () => {
  const width = 180;
  const compiledNode = await compileTextNodeWithBlocks(
    Text("ក្រសួងការពារជាតិ កម្ពុជា ប្រកាសព័ត៌មានថ្មី")
      .font("NotoSansKhmer")
      .size(18)
      .align("center"),
    width,
  );

  createTextRuns(compiledNode, createLayoutStub(width), 0, 0);

  for (const line of compiledNode.props.blocks![0].paragraph.lines) {
    const run = line.segments[0].run;
    expect(run).toBeDefined();
    expect(run!.x).toBeCloseTo((width - line.width) / 2, 3);
  }
});

test("createTextRuns justifies wrapped Khmer lines but keeps the final line ragged", async () => {
  const width = 180;
  const compiledNode = await compileTextNodeWithBlocks(
    Text("ក្រសួងការពារជាតិ កម្ពុជា ប្រកាសព័ត៌មានថ្មី")
      .font("NotoSansKhmer")
      .size(18)
      .align("justify"),
    width,
  );

  createTextRuns(compiledNode, createLayoutStub(width), 0, 0);

  const lines = compiledNode.props.blocks![0].paragraph.lines;
  expect(getLineTexts(compiledNode.props.blocks![0].paragraph)).toEqual([
    "ក្រសួងការពារជាតិ កម្ពុជា",
    "ប្រកាសព័ត៌មានថ្មី",
  ]);
  expect(lines[0].spacesCount).toBeGreaterThan(0);
  expect(getLastRunRight(lines[0])).toBeCloseTo(width, 3);
  expect(getLastRunRight(lines[1])).toBeCloseTo(lines[1].width, 3);
  expect(getLastRunRight(lines[1])).toBeLessThan(width);
});

test("createParagraph truncates Thai text with ellipsis", () => {
  const text =
    "กระทรวงสาธารณสุขประกาศมาตรการใหม่เพื่อดูแลประชาชนและเพิ่มความปลอดภัยในการเดินทางช่วงเทศกาล";
  const paragraph = createParagraph(
    [text],
    150,
    textProps({
      font: ["sans-serif"],
      size: 18,
      maxLines: 2,
      textOverflow: "ellipsis",
    }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;
  const lastLineText = getLineText(paragraph.lines[paragraph.lines.length - 1]);

  expect(paragraph.lines).toHaveLength(2);
  expect(lastLineText.endsWith("…")).toBe(true);
  expect(paragraph.width).toBeLessThanOrEqual(150);
});

test("createParagraph wraps Lao text at expected break points", () => {
  const paragraph = createParagraph(
    ["ກະຊວງສາທາລະນະສຸກ ປະກາດມາດຕະການໃໝ່"],
    140,
    textProps({
      font: ["sans-serif"],
      size: 18,
      lineHeight: 1.3,
    }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;

  expect(getLineTexts(paragraph)).toEqual([
    "ກະຊວງສາທາລະນະສຸກ",
    "ປະກາດມາດຕະການ",
    "ໃໝ່",
  ]);
});

test("createParagraph keeps Lao currency and percent markers attached when wrapping", () => {
  const cases = [
    {
      text: "ລາຄາ $50 ຕໍ່ຄົນ",
      width: 95,
      lines: ["ລາຄາ $50 ຕໍ່", "ຄົນ"],
    },
    {
      text: "ສ່ວນຫຼຸດ 100% ສຳລັບນັກຮຽນ",
      width: 120,
      lines: ["ສ່ວນຫຼຸດ 100%", "ສຳລັບນັກຮຽນ"],
    },
  ];

  for (const { text, width, lines } of cases) {
    const paragraph = createParagraph(
      [text],
      width,
      textProps({
        font: ["sans-serif"],
        size: 18,
        lineHeight: 1.3,
      }),
      renderer.measureText,
      renderer.breakIterator,
    )[0].paragraph;

    expect(getLineTexts(paragraph)).toEqual(lines);
    expect(getLineTexts(paragraph).some((line) => line.startsWith(" "))).toBe(
      false,
    );
  }
});

test("createParagraph truncates Lao text with ellipsis", () => {
  const text = "ກະຊວງສາທາລະນະສຸກ ປະກາດມາດຕະການໃໝ່ ເພື່ອຄວາມປອດໄພ ແລະ ການເດີນທາງ";
  const paragraph = createParagraph(
    [text],
    150,
    textProps({
      font: ["sans-serif"],
      size: 18,
      maxLines: 2,
      textOverflow: "ellipsis",
    }),
    renderer.measureText,
    renderer.breakIterator,
  )[0].paragraph;
  const lastLineText = getLineText(paragraph.lines[paragraph.lines.length - 1]);

  expect(paragraph.lines).toHaveLength(2);
  expect(lastLineText.endsWith("…")).toBe(true);
  expect(lastLineText.includes(" …")).toBe(false);
  expect(paragraph.width).toBeLessThanOrEqual(150);
});

test("createTextRuns centers wrapped Lao lines within the layout width", async () => {
  const width = 180;
  const compiledNode = await compileTextNodeWithBlocks(
    Text("ກະຊວງສາທາລະນະສຸກ ປະກາດມາດຕະການໃໝ່")
      .font("sans-serif")
      .size(18)
      .align("center"),
    width,
  );

  createTextRuns(compiledNode, createLayoutStub(width), 0, 0);

  for (const line of compiledNode.props.blocks![0].paragraph.lines) {
    const run = line.segments[0].run;
    expect(run).toBeDefined();
    expect(run!.x).toBeCloseTo((width - line.width) / 2, 3);
  }
});

test("createTextRuns justifies non-final Lao lines and leaves the final line ragged", async () => {
  const width = 210;
  const compiledNode = await compileTextNodeWithBlocks(
    Text("ກະຊວງສາທາລະນະສຸກ ປະກາດ ມາດຕະການໃໝ່")
      .font("sans-serif")
      .size(18)
      .align("justify"),
    width,
  );

  createTextRuns(compiledNode, createLayoutStub(width), 0, 0);

  const lines = compiledNode.props.blocks![0].paragraph.lines;
  expect(getLineTexts(compiledNode.props.blocks![0].paragraph)).toEqual([
    "ກະຊວງສາທາລະນະສຸກ ປະກາດ",
    "ມາດຕະການໃໝ່",
  ]);
  expect(lines[0].spacesCount).toBeGreaterThan(0);
  expect(getLastRunRight(lines[0])).toBeCloseTo(width, 3);
  expect(getLastRunRight(lines[1])).toBeCloseTo(lines[1].width, 3);
  expect(getLastRunRight(lines[1])).toBeLessThan(width);
});

test("tab leader segment stores pre-computed leader string", () => {
  const baseProps = textProps({ tabStops: [200], tabLeader: "." });
  const blocks = createParagraph(
    ["Title\tPage"],
    Number.POSITIVE_INFINITY,
    baseProps,
    renderer.measureText,
    renderer.breakIterator,
  );

  const segments = blocks[0].paragraph.lines[0].segments;
  // [Title, <tab>, Page]
  const tabSeg = segments[1];
  expect(tabSeg.isTab).toBe(true);
  expect(typeof tabSeg.tabLeader).toBe("string");
  expect(tabSeg.tabLeader!.length).toBeGreaterThan(0);
  // every character in the leader must be the dot character
  expect([...tabSeg.tabLeader!].every((c) => c === ".")).toBe(true);
});

test("tab leader string fits within tab width", () => {
  const baseProps = textProps({ tabStops: [200], tabLeader: "." });
  const blocks = createParagraph(
    ["Title\tPage"],
    Number.POSITIVE_INFINITY,
    baseProps,
    renderer.measureText,
    renderer.breakIterator,
  );

  const tabSeg = blocks[0].paragraph.lines[0].segments[1];
  const dotWidth = renderer.measureText(".", baseProps).width;
  const leaderWidth = dotWidth * tabSeg.tabLeader!.length;
  expect(leaderWidth).toBeLessThanOrEqual(tabSeg.width + 0.01);
});

test("tab segment has no leader when tabLeader is not set", () => {
  const baseProps = textProps({ tabStops: [200] });
  const blocks = createParagraph(
    ["Title\tPage"],
    Number.POSITIVE_INFINITY,
    baseProps,
    renderer.measureText,
    renderer.breakIterator,
  );

  const tabSeg = blocks[0].paragraph.lines[0].segments[1];
  expect(tabSeg.isTab).toBe(true);
  expect(tabSeg.tabLeader).toBeUndefined();
});

test("tab leader works with dash character", () => {
  const baseProps = textProps({ tabStops: [200], tabLeader: "-" });
  const blocks = createParagraph(
    ["Label\tValue"],
    Number.POSITIVE_INFINITY,
    baseProps,
    renderer.measureText,
    renderer.breakIterator,
  );

  const tabSeg = blocks[0].paragraph.lines[0].segments[1];
  expect(tabSeg.isTab).toBe(true);
  expect([...tabSeg.tabLeader!].every((c) => c === "-")).toBe(true);
});

test("multiple tab stops each get their own leader", () => {
  const baseProps = textProps({ tabStops: [150, 300], tabLeader: "." });
  const blocks = createParagraph(
    ["A\tB\tC"],
    Number.POSITIVE_INFINITY,
    baseProps,
    renderer.measureText,
    renderer.breakIterator,
  );

  const segments = blocks[0].paragraph.lines[0].segments;
  // [A, <tab1>, B, <tab2>, C]
  expect(segments[1].isTab).toBe(true);
  expect(segments[3].isTab).toBe(true);
  expect(typeof segments[1].tabLeader).toBe("string");
  expect(typeof segments[3].tabLeader).toBe("string");
});
