import { expect, test } from "vitest";
import { renderer } from "../src/node.ts";
import {
  createSmoothRoundRect,
  getBoundingBoxRectRotation,
  parseRadius,
} from "../src/rect.ts";

test("getBoundingBoxRectRotation calculates rotated bounding box", () => {
  const result = getBoundingBoxRectRotation(100, 200, 45);

  expect(result).toHaveLength(2);
  expect(result[0]).toBeGreaterThan(200); // new width
  expect(result[1]).toBeGreaterThan(200); // new height
});

test("getBoundingBoxRectRotation handles no rotation", () => {
  const result = getBoundingBoxRectRotation(100, 200, 0);

  expect(result).toEqual([100, 200]);
});

test("parseRadius handles single radius value", () => {
  const result = parseRadius([10], 50);

  expect(result).toEqual([10]);
});

test("parseRadius clamps values to maxRadius", () => {
  const result = parseRadius([100], 50);

  expect(result[0]).toBe(25); // maxRadius / 2
});

test("parseRadius handles multiple values", () => {
  const result = parseRadius([10, 20, 30, 40], 100);

  expect(result).toEqual([10, 20, 30, 40]);
});

test("parseRadius ensures minimum zero", () => {
  const result = parseRadius([-10, 5], 50);

  expect(result[0]).toBe(0);
  expect(result[1]).toBe(5);
});

test("createSmoothRoundRect creates Path2D", () => {
  const result = createSmoothRoundRect(
    renderer,
    100,
    200,
    [10, 10, 10, 10],
    0.5,
  );

  expect(result).toBeInstanceOf(renderer.Path2D);
});
