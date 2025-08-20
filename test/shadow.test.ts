import { expect, test } from "vitest";
import { parseShadow } from "../src/shadow.ts";

test("parseShadow parses simple box shadow", () => {
  const result = parseShadow("2px 4px 6px rgba(0,0,0,0.3)");

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    offsetX: 2,
    offsetY: 4,
    blurRadius: 6,
    spreadRadius: undefined,
    color: "rgba(0,0,0,0.3)",
    inset: false,
  });
});

test("parseShadow parses shadow with spread", () => {
  const result = parseShadow("1px 2px 3px 4px red");

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    offsetX: 1,
    offsetY: 2,
    blurRadius: 3,
    spreadRadius: 4,
    color: "red",
    inset: false,
  });
});

test("parseShadow parses inset shadow", () => {
  const result = parseShadow("inset 2px 4px 6px blue");

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    offsetX: 2,
    offsetY: 4,
    blurRadius: 6,
    spreadRadius: undefined,
    color: "blue",
    inset: true,
  });
});

test("parseShadow handles negative values", () => {
  const result = parseShadow("-2px -4px 6px green");

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    offsetX: -2,
    offsetY: -4,
    blurRadius: 6,
    spreadRadius: undefined,
    color: "green",
    inset: false,
  });
});

test("parseShadow parses multiple shadows", () => {
  const result = parseShadow("2px 2px 4px red, -1px -1px 2px blue");

  expect(result).toHaveLength(2);
  expect(result[0].color).toBe("red");
  expect(result[1].color).toBe("blue");
});
