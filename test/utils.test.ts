import { expect, test } from "vitest";
import { fontBuilder } from "../src/utils.ts";

test("fontBuilder creates font string", () => {
  const font = fontBuilder({
    size: 16,
    weight: "bold",
    style: "italic",
    font: ["Arial", "sans-serif"],
  });

  expect(font).toBe("italic bold 16px Arial, sans-serif");
});

test("fontBuilder handles minimal props", () => {
  const font = fontBuilder({
    size: 12,
    font: ["monospace"],
  });

  expect(font).toBe("12px monospace");
});

test("fontBuilder handles numeric weight", () => {
  const font = fontBuilder({
    size: 14,
    weight: 600,
    font: ["Georgia"],
  });

  expect(font).toBe("600 14px Georgia");
});

test("fontBuilder handles empty properties", () => {
  const font = fontBuilder({});

  expect(font).toBe("px");
});

test("fontBuilder with style only", () => {
  const font = fontBuilder({
    style: "italic",
    size: 16,
    font: ["Arial"],
  });

  expect(font).toBe("italic  16px Arial"); // Note: fontBuilder has extra space when weight is empty
});
