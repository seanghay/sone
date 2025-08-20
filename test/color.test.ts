import { expect, test } from "vitest";
import { colors, randomColor } from "../src/color.ts";

test("colors object contains standard colors", () => {
  expect(colors.red).toBe("#ff0000");
  expect(colors.blue).toBe("#0000ff");
  expect(colors.green).toBe("#008000");
  expect(colors.black).toBe("#000000");
  expect(colors.white).toBe("#ffffff");
});

test("randomColor generates valid hex color", () => {
  const color = randomColor();
  expect(color).toMatch(/^#[0-9a-f]{6}$/i);
});

test("randomColor generates different colors on multiple calls", () => {
  const colors = Array.from({ length: 10 }, () => randomColor());
  const uniqueColors = new Set(colors);
  expect(uniqueColors.size).toBeGreaterThan(1);
});
