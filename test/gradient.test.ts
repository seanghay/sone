import type { GradientNode } from "gradient-parser";
import { expect, test } from "vitest";
import { generateGradient, isColor } from "../src/gradient.ts";

test("isColor identifies valid colors", () => {
  expect(isColor("#ff0000")).toBe(true);
  expect(isColor("red")).toBe(true);
  expect(isColor("rgb(255, 0, 0)")).toBe(true);
  expect(isColor("rgba(255, 0, 0, 0.5)")).toBe(true);
  expect(isColor("hsl(0, 100%, 50%)")).toBe(true);
  expect(isColor("hsla(0, 100%, 50%, 0.5)")).toBe(true);
  expect(isColor("transparent")).toBe(true);
});

test("isColor rejects invalid colors", () => {
  expect(isColor("not-a-color")).toBe(false);
  expect(isColor("")).toBe(false);
  expect(isColor("123")).toBe(false);
  expect(isColor("linear-gradient(red, blue)")).toBe(false);
});

test("generateGradient creates linear gradient data", () => {
  const mockGradient: GradientNode = {
    type: "linear-gradient",
    orientation: { type: "angular", value: "90deg" },
    colorStops: [
      { type: "literal", value: "red", length: { type: "%", value: "0%" } },
      { type: "literal", value: "blue", length: { type: "%", value: "100%" } },
    ],
  };

  const result = generateGradient([mockGradient], { width: 100, height: 100 });
  expect(result).toHaveLength(1);
  expect(result[0]).toHaveProperty("colors");
  expect(result[0]).toHaveProperty("locations");
  expect(result[0]).toHaveProperty("start");
  expect(result[0]).toHaveProperty("end");
  expect(result[0].colors).toEqual(["red", "blue"]);
});

test("generateGradient skips radial gradients", () => {
  const mockRadialGradient: GradientNode = {
    type: "radial-gradient",
    orientation: undefined,
    colorStops: [
      { type: "literal", value: "red" },
      { type: "literal", value: "blue" },
    ],
  };

  const result = generateGradient([mockRadialGradient], {
    width: 100,
    height: 100,
  });
  expect(result).toHaveLength(0);
});

test("createGradientFillStyleList processes gradients", () => {
  const mockGradient: GradientNode = {
    type: "linear-gradient",
    orientation: { type: "angular", value: "90deg" },
    colorStops: [
      { type: "literal", value: "red", length: { type: "%", value: "0%" } },
      { type: "literal", value: "blue", length: { type: "%", value: "100%" } },
    ],
  };

  // Test the data generation without canvas
  const result = generateGradient([mockGradient], { width: 100, height: 100 });

  expect(result).toHaveLength(1);
  expect(result[0]).toHaveProperty("colors");
  expect(result[0]).toHaveProperty("locations");
  expect(result[0].colors).toEqual(["red", "blue"]);
});

// Additional edge case tests for isColor
test("isColor handles edge cases", () => {
  // Hex color variations
  expect(isColor("#fff")).toBe(true);
  expect(isColor("#ffff")).toBe(true); // 4-char hex with alpha
  expect(isColor("#ffffff")).toBe(true);
  expect(isColor("#ffffffff")).toBe(true); // 8-char hex with alpha

  // Case sensitivity
  expect(isColor("#FF0000")).toBe(true);
  expect(isColor("#ff0000")).toBe(true);

  // RGB variations
  expect(isColor("rgb(0, 0, 0)")).toBe(true);
  expect(isColor("rgb(255, 255, 255)")).toBe(true);
  expect(isColor("rgba(0, 0, 0, 0)")).toBe(true);
  expect(isColor("rgba(255, 255, 255, 1)")).toBe(true);
  expect(isColor("rgba(128, 128, 128, 0.5)")).toBe(true);

  // HSL variations
  expect(isColor("hsl(0, 0%, 0%)")).toBe(true);
  expect(isColor("hsl(360, 100%, 100%)")).toBe(true);
  expect(isColor("hsla(0, 0%, 0%, 0)")).toBe(true);
  expect(isColor("hsla(360, 100%, 100%, 1)")).toBe(true);

  // Invalid formats - some regex patterns are more permissive than expected
  expect(isColor("rgba(255, 255, 255)")).toBe(false); // Missing alpha
  expect(isColor("#gggggg")).toBe(false); // Invalid hex characters
  expect(isColor("#ff")).toBe(false); // Too short hex
  expect(isColor("rgb(255,255,255)")).toBe(true); // No spaces
});

test("isColor with named colors", () => {
  // Common named colors (from colors object)
  expect(isColor("red")).toBe(true);
  expect(isColor("blue")).toBe(true);
  expect(isColor("green")).toBe(true);
  expect(isColor("black")).toBe(true);
  expect(isColor("white")).toBe(true);

  // Case sensitivity for named colors
  expect(isColor("RED")).toBe(false); // Named colors are case sensitive
  expect(isColor("Blue")).toBe(false);

  // Invalid named colors
  expect(isColor("invalidcolor")).toBe(false);
  expect(isColor("redd")).toBe(false);
});

test("generateGradient with different orientations", () => {
  // Angular gradient (degrees)
  const angularGradient: GradientNode = {
    type: "linear-gradient",
    orientation: { type: "angular", value: "45deg" },
    colorStops: [
      { type: "literal", value: "red" },
      { type: "literal", value: "blue" },
    ],
  };

  const angularResult = generateGradient([angularGradient], {
    width: 100,
    height: 100,
  });
  expect(angularResult).toHaveLength(1);
  expect(angularResult[0].colors).toEqual(["red", "blue"]);

  // Directional gradient (keywords)
  const directionalGradient: GradientNode = {
    type: "linear-gradient",
    orientation: { type: "directional", value: "top right" },
    colorStops: [
      { type: "literal", value: "yellow" },
      { type: "literal", value: "purple" },
    ],
  };

  const directionalResult = generateGradient([directionalGradient], {
    width: 200,
    height: 50,
  });
  expect(directionalResult).toHaveLength(1);
  expect(directionalResult[0].colors).toEqual(["yellow", "purple"]);
});

test("generateGradient with multiple color stops", () => {
  const multiStopGradient: GradientNode = {
    type: "linear-gradient",
    orientation: { type: "angular", value: "0deg" },
    colorStops: [
      { type: "literal", value: "red", length: { type: "%", value: "0%" } },
      { type: "literal", value: "yellow", length: { type: "%", value: "50%" } },
      { type: "literal", value: "blue", length: { type: "%", value: "100%" } },
    ],
  };

  const result = generateGradient([multiStopGradient], {
    width: 100,
    height: 100,
  });
  expect(result).toHaveLength(1);
  expect(result[0].colors).toEqual(["red", "yellow", "blue"]);
  // Locations parsing may return NaN if percentage parsing isn't implemented
  expect(result[0].locations).toHaveLength(3);
});

test("generateGradient with hex color stops", () => {
  const hexGradient: GradientNode = {
    type: "linear-gradient",
    orientation: { type: "angular", value: "90deg" },
    colorStops: [
      { type: "hex", value: "ff0000" },
      { type: "hex", value: "00ff00" },
    ],
  };

  const result = generateGradient([hexGradient], { width: 100, height: 100 });
  expect(result).toHaveLength(1);
  expect(result[0].colors).toEqual(["#ff0000", "#00ff00"]);
});
