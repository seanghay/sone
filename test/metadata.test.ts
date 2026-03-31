import { expect, test } from "vitest";
import type { SoneMetadata } from "../src/metadata.ts";
import type { SpanNode } from "../src/node.ts";
import {
  Column,
  Grid,
  Row,
  renderer,
  renderWithMetadata,
  Span,
  Text,
} from "../src/node.ts";

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

test("renderWithMetadata preserves nested positions, padding, and margins", async () => {
  const { metadata } = await renderWithMetadata(
    Column(
      Row(
        Column()
          .tag("card")
          .width(40)
          .height(20)
          .padding(4)
          .marginTop(3)
          .marginLeft(7),
      ).padding(10),
    ).padding(6),
    renderer,
  );

  const card = findByTag(metadata, "card");

  expect(card.x).toBe(23);
  expect(card.y).toBe(19);
  expect(card.width).toBe(40);
  expect(card.height).toBe(20);
  expect(card.padding.left).toBe(4);
  expect(card.padding.top).toBe(4);
  expect(card.margin.left).toBe(7);
  expect(card.margin.top).toBe(3);
});

test("renderWithMetadata keeps raw text children for text nodes", async () => {
  const { metadata } = await renderWithMetadata(
    Text("Hello ", Span("World").weight("bold")),
    renderer,
  );

  expect(metadata.type).toBe("text");
  expect(metadata.children).toHaveLength(2);
  expect(metadata.children[0]).toBe("Hello ");
  expect((metadata.children[1] as SpanNode).children).toBe("World");
});

test("renderWithMetadata recurses through grid children", async () => {
  const { metadata } = await renderWithMetadata(
    Grid(Column().tag("tile").height(24)).columns(100),
    renderer,
  );

  expect(metadata.type).toBe("grid");
  const tile = findByTag(metadata, "tile");
  expect(tile.x).toBe(0);
  expect(tile.y).toBe(0);
  expect(tile.height).toBe(24);
});
