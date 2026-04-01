import { expect, test } from "vitest";
import type { SoneMetadata } from "../src/metadata.ts";
import type { SoneCompileContext, SpanNode, TextNode } from "../src/node.ts";
import {
  Column,
  compile,
  List,
  ListItem,
  renderer,
  renderWithMetadata,
  Span,
  Table,
  TableCell,
  TableRow,
  Text,
  TextDefault,
} from "../src/node.ts";

const defaultContext: SoneCompileContext = {
  defaultTextProps: renderer.getDefaultTextProps(),
  loadImage: renderer.loadImage,
  breakIterator: renderer.breakIterator,
  createId: () => 0,
};

function findByTag(node: SoneMetadata, tag: string): SoneMetadata {
  if (node.props.tag === tag) return node;
  if (!Array.isArray(node.children)) {
    throw new Error(`Tag ${tag} not found`);
  }

  for (const child of node.children) {
    if (typeof child === "string") continue;
    try {
      return findByTag(child as SoneMetadata, tag);
    } catch {
      //
    }
  }

  throw new Error(`Tag ${tag} not found`);
}

test("compile applies decimal list markers and marker gap", async () => {
  const node = await compile(
    List(ListItem(Text("First")), ListItem(Text("Second")))
      .listStyle("decimal")
      .startIndex(3)
      .markerGap(12),
    defaultContext,
  );

  expect(node!.props.flexDirection).toBe("column");
  const firstItem = node!.children[0]!;
  expect(firstItem.props.flexDirection).toBe("row");
  expect(firstItem.props.gap).toBe(12);
  const marker = firstItem.children[0] as TextNode;
  expect(marker.children[0]).toBe("3.");
});

test("compile replaces placeholder markers in custom span lists", async () => {
  const node = await compile(
    List(ListItem(Text("First")), ListItem(Text("Second")))
      .listStyle(Span("{}.").weight("bold"))
      .startIndex(5),
    defaultContext,
  );

  const secondItem = node!.children[1]!;
  const marker = secondItem.children[0] as TextNode;
  expect((marker.children[0] as SpanNode).children).toBe("6.");
});

test("compile uses arrow function listStyle for dynamic markers", async () => {
  const labels = ["alpha", "beta", "gamma"];
  const node = await compile(
    List(
      ListItem(Text("First")),
      ListItem(Text("Second")),
      ListItem(Text("Third")),
    ).listStyle((index) => Span(`${labels[index]}.`)),
    defaultContext,
  );

  for (let i = 0; i < 3; i++) {
    const item = node!.children[i]!;
    const marker = item.children[0] as TextNode;
    expect((marker.children[0] as SpanNode).children).toBe(`${labels[i]}.`);
  }
});

test("arrow function listStyle receives 0-based index", async () => {
  const received: number[] = [];
  await compile(
    List(
      ListItem(Text("A")),
      ListItem(Text("B")),
      ListItem(Text("C")),
    ).listStyle((index) => {
      received.push(index);
      return Span(`${index}.`);
    }),
    defaultContext,
  );

  expect(received).toEqual([0, 1, 2]);
});

test("compile applies styled span from arrow function listStyle", async () => {
  const node = await compile(
    List(ListItem(Text("X")), ListItem(Text("Y"))).listStyle((index) =>
      Span(`${index + 1})`)
        .weight("bold")
        .color("red"),
    ),
    defaultContext,
  );

  const item = node!.children[0]!;
  const marker = item.children[0] as TextNode;
  const span = marker.children[0] as SpanNode;
  expect(span.children).toBe("1)");
  expect(span.props.weight).toBe("bold");
  expect(span.props.color).toBe("red");
});

test("arrow function listStyle span inherits TextDefault props", async () => {
  const node = await compile(
    Column(
      TextDefault(
        List(ListItem(Text("Item")), ListItem(Text("Item 2"))).listStyle(
          (index) => Span(`${index + 1}.`),
        ),
      )
        .size(24)
        .color("navy"),
    ),
    defaultContext,
  );

  // Column -> List -> ListItem -> marker TextNode -> SpanNode
  const list = node!.children[0] as ReturnType<typeof List>;
  const item = list.children[0]!;
  const marker = item.children[0] as TextNode;
  const span = marker.children[0] as SpanNode;

  // marker text node should have TextDefault's size and color
  expect(marker.props.size).toBe(24);
  expect(marker.props.color).toBe("navy");
  // span inherits from the marker text node
  expect(span.props.size).toBe(24);
  expect(span.props.color).toBe("navy");
});

test("colspan cell width spans multiple columns", async () => {
  const { metadata } = await renderWithMetadata(
    Table(
      TableRow(
        TableCell(Text("AB")).colspan(2).tag("span-cell"),
        TableCell(Text("C")),
      ),
      TableRow(
        TableCell(Text("A")).tag("cell-a"),
        TableCell(Text("B")).tag("cell-b"),
        TableCell(Text("C")),
      ),
    ),
    renderer,
  );

  const spanCell = findByTag(metadata, "span-cell");
  const cellA = findByTag(metadata, "cell-a");
  const cellB = findByTag(metadata, "cell-b");
  expect(spanCell.width).toBeGreaterThanOrEqual(cellA.width + cellB.width);
});

test("colspan=3 cell spans all three columns", async () => {
  const { metadata } = await renderWithMetadata(
    Table(
      TableRow(TableCell(Text("Header")).colspan(3).tag("header")),
      TableRow(
        TableCell(Text("A")).tag("a"),
        TableCell(Text("B")).tag("b"),
        TableCell(Text("C")).tag("c"),
      ),
    ),
    renderer,
  );

  const header = findByTag(metadata, "header");
  const a = findByTag(metadata, "a");
  const c = findByTag(metadata, "c");
  // header should span from same x as "a" to at least the right edge of "c"
  expect(header.width).toBeGreaterThanOrEqual(a.width + c.width);
});

test("rowspan cell height spans multiple rows", async () => {
  const { metadata } = await renderWithMetadata(
    Table(
      TableRow(
        TableCell(Text("Span")).rowspan(2).tag("span-cell"),
        TableCell(Text("R0C1")).tag("r0c1"),
      ),
      TableRow(TableCell(Text("R1C1")).tag("r1c1")),
    ),
    renderer,
  );

  const spanCell = findByTag(metadata, "span-cell");
  const r0c1 = findByTag(metadata, "r0c1");
  const r1c1 = findByTag(metadata, "r1c1");
  expect(spanCell.height).toBeGreaterThanOrEqual(r0c1.height + r1c1.height);
});

test("rowspan cell y position matches its host row", async () => {
  const { metadata } = await renderWithMetadata(
    Table(
      TableRow(
        TableCell(Text("Span")).rowspan(2).tag("span-cell"),
        TableCell(Text("R0C1")).tag("r0c1"),
      ),
      TableRow(TableCell(Text("R1C1"))),
    ),
    renderer,
  );

  const spanCell = findByTag(metadata, "span-cell");
  const r0c1 = findByTag(metadata, "r0c1");
  // Both cells start in the same row, so same y
  expect(spanCell.y).toBe(r0c1.y);
});

test("colspan and rowspan together", async () => {
  const { metadata } = await renderWithMetadata(
    Table(
      TableRow(
        TableCell(Text("Top-Left")).colspan(2).rowspan(2).tag("tl"),
        TableCell(Text("Top-Right")),
      ),
      TableRow(TableCell(Text("Mid-Right"))),
      TableRow(
        TableCell(Text("Bot-Left")).tag("bl"),
        TableCell(Text("Bot-Mid")),
        TableCell(Text("Bot-Right")),
      ),
    ),
    renderer,
  );

  const tl = findByTag(metadata, "tl");
  const bl = findByTag(metadata, "bl");
  expect(tl.width).toBeGreaterThan(bl.width);
  expect(tl.height).toBeGreaterThan(0);
});

test("table spacing becomes cell padding metadata", async () => {
  const { metadata } = await renderWithMetadata(
    Table(
      TableRow(TableCell(Text("A")).tag("cell-a"), TableCell(Text("B"))),
    ).spacing(10, 20),
    renderer,
  );

  const cell = findByTag(metadata, "cell-a");

  expect(cell.type).toBe("table-cell");
  expect(cell.padding.left).toBe(10);
  expect(cell.padding.right).toBe(10);
  expect(cell.padding.top).toBe(20);
  expect(cell.padding.bottom).toBe(20);
});
