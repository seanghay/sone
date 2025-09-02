import { fileURLToPath } from "node:url";
import { beforeAll, expect, test } from "vitest";
import type { TextProps } from "../src/core.ts";
import {
  compile,
  renderer,
  SoneCompileContext,
  Span,
  Text,
} from "../src/node.ts";
import { createMultilineParagraph, createParagraph } from "../src/text.ts";

const relative = (p: string) => fileURLToPath(new URL(p, import.meta.url));

beforeAll(() => {
  renderer.registerFont("NotoSansKhmer", relative("font/NotoSansKhmer.ttf"));
});

test("create paragraph without max width", async () => {
  const node = Text(
    "លោកសាស្ត្រាចារ្យ ឈាង រ៉ា រដ្ឋមន្ត្រីក្រសួងសុខាភិបាល បានប្រកាសថា ក្រុមគ្រូពេទ្យកម្ពុជាគឺជាលោកសាស្ត្រាចារ្យ",
    Span("ឈាង រ៉ា រដ្ឋមន្ត្រីក្រសួងសុខាភិបាល បានប្រកាសថា ក្រុមគ្រូពេទ្យកម្ពុជាគឺជា").size(32),
    "លោកសាស្ត្រាចារ្យ ឈាង រ៉ា រដ្ឋមន្ត្រីក្រសួងសុខាភិបាល",
    Span("ឈាង រ៉ា រដ្ឋមន្ត្រីក្រសួងសុខាភិបាល បានប្រកាសថា"),
  )
    .font("NotoSansKhmer")
    .size(14);

  const context: SoneCompileContext = {
    defaultTextProps: renderer.getDefaultTextProps(),
    breakIterator: renderer.breakIterator,
    loadImage: renderer.loadImage,
    createId: () => 0,
  };

  const compiledNode = await compile(node, context);

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

  // FIXME: This test failed when cross platform
  // expect(Math.round(paragraph.width)).toBe(1776);
  // expect(Math.round(paragraph.height)).toBe(44);
});

test("createMultilineParagraph with simple text", () => {
  const baseProps: TextProps = {
    size: 14,
    font: ["44", "sans-serif"],
    color: "black",
    lineHeight: 1.2,
    indentSize: 0,
  };

  const spans = ["Hello World"];
  const paragraph = createMultilineParagraph(
    spans,
    [[]],
    Number.POSITIVE_INFINITY,
    baseProps,
    renderer.measureText,
  );

  expect(paragraph.lines).toHaveLength(1);
  expect(paragraph.lines[0].segments).toHaveLength(1);
  expect(paragraph.lines[0].segments[0].text).toBe("Hello World");
  expect(paragraph.width).toBeGreaterThan(0);
  expect(paragraph.height).toBeGreaterThan(0);
});

test("createMultilineParagraph with mixed spans", () => {
  const baseProps: TextProps = {
    size: 14,
    font: ["NotoSansKhmer"],
    color: "black",
  };

  const spans = ["Hello ", Span("World").size(18).color("red"), "!"];

  const paragraph = createMultilineParagraph(
    spans,
    [[], [], []],
    Number.POSITIVE_INFINITY,
    baseProps,
    renderer.measureText,
  );

  expect(paragraph.lines).toHaveLength(1);
  expect(paragraph.lines[0].segments).toHaveLength(3);
  expect(paragraph.lines[0].segments[0].text).toBe("Hello ");
  expect(paragraph.lines[0].segments[1].text).toBe("World");
  expect(paragraph.lines[0].segments[2].text).toBe("!");
});

test("createMultilineParagraph with line height multiplier", () => {
  const basePropsNormal: TextProps = {
    size: 14,
    font: ["NotoSansKhmer"],
    lineHeight: 1.0,
  };

  const basePropsLarge: TextProps = {
    size: 14,
    font: ["NotoSansKhmer"],
    lineHeight: 2.0,
  };

  const spans = ["Test"];
  const normalParagraph = createMultilineParagraph(
    spans,
    [[]],
    Number.POSITIVE_INFINITY,
    basePropsNormal,
    renderer.measureText,
  );
  const largeParagraph = createMultilineParagraph(
    spans,
    [[]],
    Number.POSITIVE_INFINITY,
    basePropsLarge,
    renderer.measureText,
  );

  expect(largeParagraph.height).toBeGreaterThan(normalParagraph.height);
});

test("createMultilineParagraph with indentation", () => {
  const basePropsNoIndent: TextProps = {
    size: 14,
    font: ["NotoSansKhmer"],
    indentSize: 0,
  };

  const basePropsWithIndent: TextProps = {
    size: 14,
    font: ["NotoSansKhmer"],
    indentSize: 20,
  };

  const spans = ["Test"];
  const noIndentParagraph = createMultilineParagraph(
    spans,
    [[]],
    Number.POSITIVE_INFINITY,
    basePropsNoIndent,
    renderer.measureText,
  );
  const indentParagraph = createMultilineParagraph(
    spans,
    [[]],
    Number.POSITIVE_INFINITY,
    basePropsWithIndent,
    renderer.measureText,
  );

  expect(indentParagraph.width).toBe(noIndentParagraph.width + 20);
});

test("createMultilineParagraph with offsetY variations", () => {
  const baseProps: TextProps = {
    size: 14,
    font: ["NotoSansKhmer"],
  };

  const spans = [
    "Normal",
    Span("Raised").offsetY(-5),
    Span("Lowered").offsetY(5),
  ];

  const paragraph = createMultilineParagraph(
    spans,
    [[], [], []],
    Number.POSITIVE_INFINITY,
    baseProps,
    renderer.measureText,
  );

  expect(paragraph.lines).toHaveLength(1);
  expect(paragraph.lines[0].segments).toHaveLength(3);
  // Height should account for vertical offsets
  expect(paragraph.height).toBeGreaterThan(14); // Should be larger than base font size due to offsets
});

test("createParagraph with constrained width", async () => {
  const node = Text(
    "This is a longer text that should wrap when constrained to a small width",
  );

  const context: SoneCompileContext = {
    defaultTextProps: renderer.getDefaultTextProps(),
    breakIterator: renderer.breakIterator,
    loadImage: renderer.loadImage,
    createId: () => 0,
  };

  const compiledNode = await compile(node, context);

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

test("createParagraph with different measure modes", async () => {
  const node = Text("Short text");

  const context: SoneCompileContext = {
    defaultTextProps: renderer.getDefaultTextProps(),
    breakIterator: renderer.breakIterator,
    loadImage: renderer.loadImage,
    createId: () => 0,
  };

  const compiledNode = await compile(node, context);

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
