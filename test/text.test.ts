import { fileURLToPath } from "node:url";
import { beforeAll, expect, test } from "vitest";
import type { TextProps } from "../src/core.ts";
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
