import { expect, test } from "vitest";
import { colors } from "../src/color.ts";

test("colors object contains standard colors", () => {
  expect(colors.red).toBe("#ff0000");
  expect(colors.blue).toBe("#0000ff");
  expect(colors.green).toBe("#008000");
  expect(colors.black).toBe("#000000");
  expect(colors.white).toBe("#ffffff");
});
