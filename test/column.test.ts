import { expect, test } from "vitest";
import { Column } from "../src/core.ts";

test("simple plain Column", () => {
  const root = Column();
  expect(root.type).toBe("column");
  expect(root.children.length).toBe(0);
  expect(root.props).toEqual({});
});

test("Column with nullish children", () => {
  const root = Column(Column(), null, undefined, Column());
  expect(root.children.length).toBe(4);
});

test("simple plain Column with some props", () => {
  const root = Column().borderColor("red").alignItems("center").aspectRatio(1);
  expect(root.props).toEqual({
    borderColor: "red",
    alignItems: "center",
    aspectRatio: 1,
  });
});
