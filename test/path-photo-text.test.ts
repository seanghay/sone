import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import type { SoneMetadata } from "../src/metadata.ts";
import {
  Column,
  Path,
  Photo,
  renderer,
  renderWithMetadata,
  Text,
} from "../src/node.ts";

const testImage = fileURLToPath(
  new URL("./image/kouprey.jpg", import.meta.url),
);

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

test("path gradient fill renders without error", async () => {
  const { metadata } = await renderWithMetadata(
    Column(
      Path("M 0 0 L 100 0 L 100 100 L 0 100 Z")
        .fill("linear-gradient(90deg, red, blue)")
        .size(120)
        .tag("rect-path"),
    ).size(140),
    renderer,
  );
  const p = findByTag(metadata, "rect-path");
  expect(p.type).toBe("path");
});

test("path solid fill still works after gradient support added", async () => {
  const { metadata } = await renderWithMetadata(
    Column(
      Path("M 0 0 L 50 0 L 50 50 L 0 50 Z")
        .fill("#ff0000")
        .size(60)
        .tag("solid-path"),
    ).size(80),
    renderer,
  );
  const p = findByTag(metadata, "solid-path");
  expect(p.type).toBe("path");
});

test("photo with clipPath renders without error", async () => {
  const { metadata } = await renderWithMetadata(
    Column(
      Photo(testImage)
        .width(200)
        .height(200)
        .clipPath("M 100 0 L 200 200 L 0 200 Z")
        .tag("clipped-photo"),
    ),
    renderer,
  );
  const p = findByTag(metadata, "clipped-photo");
  expect(p.type).toBe("photo");
});

test("photo without clipPath still renders with default rounded rect clip", async () => {
  const { metadata } = await renderWithMetadata(
    Column(
      Photo(testImage)
        .width(200)
        .height(200)
        .cornerRadius(16)
        .tag("rounded-photo"),
    ),
    renderer,
  );
  const p = findByTag(metadata, "rounded-photo");
  expect(p.type).toBe("photo");
});

test("text with clipImage renders without error", async () => {
  const { metadata } = await renderWithMetadata(
    Column(
      Text("HELLO")
        .size(60)
        .weight("bold")
        .clipImage(Photo(testImage).scaleType("cover"))
        .tag("clip-text"),
    ).padding(10),
    renderer,
  );
  const t = findByTag(metadata, "clip-text");
  expect(t.type).toBe("text");
});

test("text without clipImage renders normally", async () => {
  const { metadata } = await renderWithMetadata(
    Column(Text("WORLD").size(40).tag("plain-text")).padding(10),
    renderer,
  );
  const t = findByTag(metadata, "plain-text");
  expect(t.type).toBe("text");
});
