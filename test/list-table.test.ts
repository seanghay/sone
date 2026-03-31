import { expect, test } from "vitest";
import type { SoneMetadata } from "../src/metadata.ts";
import type { SoneCompileContext, SpanNode, TextNode } from "../src/node.ts";
import {
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
