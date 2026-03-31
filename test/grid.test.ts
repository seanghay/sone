import { expect, test } from "vitest";
import { Column, Grid, Text } from "../src/core.ts";
import type { SoneMetadata } from "../src/metadata.ts";
import { renderer, renderWithMetadata } from "../src/node.ts";

function findByTag(node: SoneMetadata, tag: string): SoneMetadata {
  if (node.props.tag === tag) return node;
  if (!Array.isArray(node.children)) {
    throw new Error(`Tag ${tag} not found`);
  }

  for (const child of node.children) {
    if (typeof child === "string") continue;
    const metadata = child as SoneMetadata;
    try {
      return findByTag(metadata, tag);
    } catch {
      //
    }
  }

  throw new Error(`Tag ${tag} not found`);
}

test("Grid builder stores track and placement props", () => {
  const root = Grid(Text("A").gridColumn(2, 2).gridRow(3, 1))
    .columns(120, "1fr")
    .rows("auto", 80)
    .autoRows(40)
    .autoColumns("auto");

  expect(root.type).toBe("grid");
  expect(root.props.columns).toEqual([120, "1fr"]);
  expect(root.props.rows).toEqual(["auto", 80]);
  expect(root.props.autoRows).toEqual([40]);
  expect(root.props.autoColumns).toEqual(["auto"]);
  expect(root.children[0]!.props.gridColumnStart).toBe(2);
  expect(root.children[0]!.props.gridColumnSpan).toBe(2);
  expect(root.children[0]!.props.gridRowStart).toBe(3);
});

test("Grid auto placement creates new rows", async () => {
  const { metadata } = await renderWithMetadata(
    Grid(
      Column().tag("a").height(20),
      Column().tag("b").height(30),
      Column().tag("c").height(25),
    )
      .columns(100, 100)
      .columnGap(10)
      .rowGap(5),
    renderer,
  );

  const a = findByTag(metadata, "a");
  const b = findByTag(metadata, "b");
  const c = findByTag(metadata, "c");

  expect(a.x).toBe(0);
  expect(a.y).toBe(0);
  expect(a.width).toBe(100);
  expect(a.height).toBe(20);
  expect(b.x).toBe(110);
  expect(b.y).toBe(0);
  expect(b.height).toBe(30);
  expect(c.x).toBe(0);
  expect(c.y).toBe(35);
});

test("Grid explicit placement and spans resolve to expected bounds", async () => {
  const { metadata } = await renderWithMetadata(
    Grid(
      Column().tag("hero").gridColumn(1, 2).gridRow(1).height(40),
      Column().tag("side").gridColumn(3).gridRow(1, 2),
      Column().tag("footer").gridColumn(1, 2).gridRow(2).height(30),
    )
      .columns(100, 100, 80)
      .columnGap(5)
      .rowGap(10),
    renderer,
  );

  const hero = findByTag(metadata, "hero");
  const side = findByTag(metadata, "side");
  const footer = findByTag(metadata, "footer");

  expect(hero.x).toBe(0);
  expect(hero.y).toBe(0);
  expect(hero.width).toBe(205);
  expect(hero.height).toBe(40);
  expect(side.x).toBe(210);
  expect(side.y).toBe(0);
  expect(side.width).toBe(80);
  expect(side.height).toBe(80);
  expect(footer.x).toBe(0);
  expect(footer.y).toBe(50);
  expect(footer.width).toBe(205);
});

test("Grid distributes fr tracks inside a definite width", async () => {
  const { metadata } = await renderWithMetadata(
    Grid(Column().tag("fixed").height(20), Column().tag("flex").height(20))
      .columns(100, "1fr")
      .columnGap(20)
      .width(320),
    renderer,
  );

  const fixed = findByTag(metadata, "fixed");
  const flex = findByTag(metadata, "flex");

  expect(metadata.width).toBe(320);
  expect(fixed.width).toBe(100);
  expect(flex.x).toBe(120);
  expect(flex.width).toBe(200);
});

test("Grid rejects invalid placement values", async () => {
  await expect(
    renderWithMetadata(Grid(Column().gridColumn(0)).columns(100), renderer),
  ).rejects.toThrow("Grid placement values must be greater than 0.");
});
