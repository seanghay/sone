import { expect, test } from "vitest";
import { Row } from "../src/core.ts";

test("simple plain Row", () => {
  const root = Row();
  expect(root.type).toBe("row");
  expect(root.children.length).toBe(0);
  expect(root.props).toEqual({});
});

test("Row with nullish children", () => {
  const root = Row(Row(), null, undefined, Row());
  expect(root.children.length).toBe(4);
});

test("simple plain Row with some props", () => {
  const root = Row().borderColor("red").alignItems("center").aspectRatio(1);
  expect(root.props).toEqual({
    borderColor: "red",
    alignItems: "center",
    aspectRatio: 1,
  });
});
