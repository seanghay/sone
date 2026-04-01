import { expect, test } from "vitest";
import { defaultLineBreakerIterator } from "../src/linebreak.ts";

test("defaultLineBreakerIterator preserves ordinary space breakpoints", () => {
  expect(Array.from(defaultLineBreakerIterator("foo bar"))).toEqual([0, 3, 4]);
});

test("defaultLineBreakerIterator suppresses breakpoints around word joiners", () => {
  expect(Array.from(defaultLineBreakerIterator("foo\u2060 bar"))).toEqual([0]);
  expect(Array.from(defaultLineBreakerIterator("foo \u2060bar"))).toEqual([0]);
  expect(Array.from(defaultLineBreakerIterator("foo \u2060 bar"))).toEqual([0]);
});

test("defaultLineBreakerIterator suppresses breakpoints around non-breaking spaces", () => {
  expect(Array.from(defaultLineBreakerIterator("foo\u00a0bar"))).toEqual([0]);
  expect(Array.from(defaultLineBreakerIterator("foo\u00a0 bar"))).toEqual([0]);
  expect(Array.from(defaultLineBreakerIterator("foo \u00a0bar"))).toEqual([0]);
  expect(Array.from(defaultLineBreakerIterator("foo \u00a0 bar"))).toEqual([0]);
});
