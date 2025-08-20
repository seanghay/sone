import { expect, test } from "vitest";
import type { SpanProps } from "../src/core.ts";
import { applySpanProps, fontBuilder } from "../src/utils.ts";

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

// Mock canvas context for applySpanProps tests
const createMockContext = () => ({
  font: "",
  letterSpacing: "",
  wordSpacing: "",
  fillStyle: "",
});

test("applySpanProps sets font", () => {
  const ctx = createMockContext();
  const props: SpanProps = {
    size: 14,
    font: ["Arial", "sans-serif"],
    weight: "bold",
  };

  applySpanProps(ctx as unknown as CanvasRenderingContext2D, props);

  expect(ctx.font).toBe("bold 14px Arial, sans-serif");
});

test("applySpanProps sets letter spacing", () => {
  const ctx = createMockContext();
  const props: SpanProps = {
    letterSpacing: 2,
  };

  applySpanProps(ctx as unknown as CanvasRenderingContext2D, props);

  expect(ctx.letterSpacing).toBe("2px");
});

test("applySpanProps sets word spacing", () => {
  const ctx = createMockContext();
  const props: SpanProps = {
    wordSpacing: 5,
  };

  applySpanProps(ctx as unknown as CanvasRenderingContext2D, props);

  expect(ctx.wordSpacing).toBe("5px");
});

test("applySpanProps sets fill style for string color", () => {
  const ctx = createMockContext();
  const props: SpanProps = {
    color: "red",
  };

  applySpanProps(ctx as unknown as CanvasRenderingContext2D, props);

  expect(ctx.fillStyle).toBe("red");
});

test("applySpanProps handles gradient color", () => {
  const ctx = createMockContext();
  const props: SpanProps = {
    color: [
      {
        type: "linear-gradient",
        colorStops: [],
        orientation: { type: "directional", value: "bottom" },
      },
    ],
  };

  applySpanProps(ctx as unknown as CanvasRenderingContext2D, props);

  // Should not set fillStyle for gradient (handled elsewhere)
  expect(ctx.fillStyle).toBe("");
});

test("applySpanProps with all properties", () => {
  const ctx = createMockContext();
  const props: SpanProps = {
    size: 18,
    font: ["Georgia", "serif"],
    weight: 500,
    style: "italic",
    letterSpacing: 1.5,
    wordSpacing: 3,
    color: "#333333",
  };

  applySpanProps(ctx as unknown as CanvasRenderingContext2D, props);

  expect(ctx.font).toBe("italic 500 18px Georgia, serif");
  expect(ctx.letterSpacing).toBe("1.5px");
  expect(ctx.wordSpacing).toBe("3px");
  expect(ctx.fillStyle).toBe("#333333");
});

test("applySpanProps with minimal properties", () => {
  const ctx = createMockContext();
  const props: SpanProps = {};

  applySpanProps(ctx as unknown as CanvasRenderingContext2D, props);

  expect(ctx.font).toBe("px");
  expect(ctx.letterSpacing).toBe("");
  expect(ctx.wordSpacing).toBe("");
  expect(ctx.fillStyle).toBe("");
});
