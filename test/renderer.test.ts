import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import {
  Column,
  ColumnNode,
  Photo,
  PhotoNode,
  Row,
  Span,
  SpanNode,
  Text,
  TextDefault,
  TextNode,
} from "../src/core.ts";
import { renderer } from "../src/node.ts";
import { compile, findFonts, SoneCompileContext } from "../src/renderer.ts";

const sampleImageFile = fileURLToPath(
  new URL("./image/kouprey.jpg", import.meta.url),
);

let id = 0;

const defaultContext: SoneCompileContext = {
  defaultTextProps: renderer.getDefaultTextProps(),
  loadImage: renderer.loadImage,
  breakIterator: renderer.breakIterator,
  createId: () => id++,
};

test("compile get ids", async () => {
  let currentId = 0;
  const node = await compile(
    Column(Column(Column()), Column(Column()), Column(Column())),
    {
      defaultTextProps: renderer.getDefaultTextProps(),
      loadImage: renderer.loadImage,
      breakIterator: renderer.breakIterator,
      createId: () => currentId++,
    },
  );

  expect(node!.id).toBe(0);
  // @ts-expect-error
  expect(node!.children[0]!.id).toBe(1);
  // @ts-expect-error
  expect(node!.children[1]!.id).toBe(3);
});

test("compile undefined component", async () => {
  const node = await compile(null, defaultContext);
  expect(node).toBeUndefined();
});

test("compile a simple Column node", async () => {
  const node = await compile(Column(), defaultContext);

  expect(node).not.toBeNull();

  // it's the default.
  expect(node!.props.flexDirection).not.toBeDefined();
});

test("compile a simple Row node", async () => {
  const node = await compile(Row(), defaultContext);

  expect(node).not.toBeNull();
  expect(node!.props.flexDirection).toBe("row");
});

test("resolve async photo loading", async () => {
  const node = await compile(Photo(sampleImageFile), defaultContext);

  expect(node).not.toBeNull();
  expect(node!.props.image).toBeDefined();
  expect(node!.props.width).toEqual(473);
  expect(node!.props.height).toEqual(283);
});

test("resolve async photo with preserveAspectRatio", async () => {
  const node = await compile(
    Photo(sampleImageFile).preserveAspectRatio().width(100),
    defaultContext,
  );

  expect(node).not.toBeNull();
  expect(node!.props.image).toBeDefined();
  expect(node!.props.width).toEqual(100);
  expect(node!.props.height).toEqual(60);
});

test("compile a simple Row node with direction override", async () => {
  const node = await compile(Row().direction("column"), defaultContext);

  expect(node).not.toBeNull();
  expect(node!.props.flexDirection).toBe("column");
});

test("compile TextDefault - rootless component", async () => {
  const node = await compile(
    Row(
      TextDefault(
        Column(Text("1"), Text("1"), Text("1")),
        Column(Text("1"), Text("1"), Text("1")),
        Column(Text("1"), Text("1"), Text("1")),
      ),
    ),
    defaultContext,
  );

  expect(node).toBeDefined();
  expect(node!.children.length).toEqual(3);
});

test("compile text cascading into spans", async () => {
  const node = await compile(
    Column(
      Text(
        "hello",
        //
        Span("world!"),
        //
        Span("world!").color("green"),
      ).color("red"),
    ),
    defaultContext,
  );

  expect(node).toBeDefined();
  expect(node!.children[0]!.props!).include({ color: "red" });
  const textNode = node!.children[0]! as TextNode;
  expect(textNode.children[0]).toBe("hello");
  expect((textNode.children[1] as SpanNode).props.color).toBe("red");
  expect((textNode.children[2] as SpanNode).props.color).toBe("green");
});

test("compile Text node will include default flex-shrink", async () => {
  let node = await compile(Text(), defaultContext);
  expect(node).toBeDefined();
  expect(node!.props.flexShrink).toBe(1);

  // override
  node = await compile(Text().shrink(2), defaultContext);
  expect(node).toBeDefined();
  expect(node!.props.flexShrink).toBe(2);
});

test("compile TextDefault cascading into Text", async () => {
  const node = await compile(
    Column(
      //
      TextDefault(
        //
        Column(Text("Hello"), Text("Hello"), Text("Hello")),
        //
        Column(Text("Hello"), Text("Hello"), Text("Hello")),
      )
        .color("red")
        .size(22)
        .font("monospace")
        .lineHeight(2),
    ),
    defaultContext,
  );

  expect(node).toBeDefined();

  const columnNode = node!.children[0] as ColumnNode;
  const textNodes = columnNode.children as TextNode[];

  for (const textNode of textNodes) {
    expect(textNode.props.color).toBe("red");
    expect(textNode.props.lineHeight).toBe(2);
    expect(textNode.props.font).toEqual(["monospace"]);
    expect(textNode.props.size).toBe(22);
  }
});

test("find fonts recursively", async () => {
  const node = await compile(
    Column(
      Column(
        Row(
          Column(
            Text(Span("example").font("abc")).font("monospace"),
            Text().font("serif"),
          ),
          Text().font("serif"),
        ),
        Text().font("serif"),
        Text("sample"),
      ),
    ),
    defaultContext,
  );

  const fonts = findFonts(node);
  expect(fonts).toBeDefined();
  expect(Array.from(fonts!).sort()).toStrictEqual([
    "abc",
    "monospace",
    "sans-serif",
    "serif",
  ]);
});

test("compile the background image", async () => {
  const root = await compile(
    //
    Column().bg(Photo(sampleImageFile)),
    defaultContext,
  );

  expect(root).toBeDefined();
  expect(root!.props.background).toBeDefined();

  const bg = root!.props.background!;
  expect(bg[0]).toBeDefined();
  const photo = bg[0] as PhotoNode;

  expect(photo.type).toBe("photo");
  expect(photo.props.image).toBeDefined();
});
