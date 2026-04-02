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

// --- END_SYM: trailing punctuation must not start a new line ---

test("comma does not start a new line", () => {
  // Segmenter: 0=foo, 3=comma, 4=bar — position 3 suppressed by END_SYM ','
  expect(Array.from(defaultLineBreakerIterator("foo,bar"))).toEqual([0, 4]);
});

test("semicolon does not start a new line", () => {
  expect(Array.from(defaultLineBreakerIterator("foo;bar"))).toEqual([0, 4]);
});

test("colon does not start a new line", () => {
  // Intl.Segmenter treats "foo:bar" as a single word-like token
  expect(Array.from(defaultLineBreakerIterator("foo:bar"))).toEqual([0]);
});

// --- START_SYM: sigil must stay with its following word ---

test("hash sign stays attached to following word", () => {
  // Break between '#' and 'bar' (index 5) suppressed because text[4]==='#'
  expect(Array.from(defaultLineBreakerIterator("foo #bar"))).toEqual([0, 3, 4]);
});

test("at sign stays attached to following word", () => {
  // Break between '@' and 'user' (index 7) suppressed because text[6]==='@'
  expect(Array.from(defaultLineBreakerIterator("hello @user"))).toEqual([
    0, 5, 6,
  ]);
});

// --- URL protection ---

test("https URL internal breaks are suppressed", () => {
  // URL "https://example.com" spans indices 6-24; internal positions protected
  expect(
    Array.from(defaultLineBreakerIterator("visit https://example.com today")),
  ).toEqual([0, 5, 6, 25, 26]);
});

test("www URL internal breaks are suppressed", () => {
  // URL "www.example.com" spans indices 4-18
  expect(
    Array.from(defaultLineBreakerIterator("see www.example.com here")),
  ).toEqual([0, 3, 4, 19, 20]);
});

test("URL with path and query string is fully protected", () => {
  // Single-token text: only position 0 is yielded
  expect(
    Array.from(defaultLineBreakerIterator("https://example.com/path?q=1")),
  ).toEqual([0]);
});

// --- Phone number protection ---

test("digit-hyphen-digit suppresses break at separator", () => {
  expect(Array.from(defaultLineBreakerIterator("555-1234"))).toEqual([0]);
});

test("digit-dot-digit suppresses break at separator", () => {
  expect(Array.from(defaultLineBreakerIterator("123.456"))).toEqual([0]);
});

test("multi-segment phone number suppresses all internal separators", () => {
  expect(Array.from(defaultLineBreakerIterator("555-123-4567"))).toEqual([0]);
});

// --- No false positives: word–hyphen–word still allows breaks ---

test("word-hyphen-word allows breaks at hyphen (no digit neighbors)", () => {
  // PHONE_SEP_PATTERN requires digits on both sides — letters are not protected
  expect(Array.from(defaultLineBreakerIterator("well-known"))).toEqual([
    0, 4, 5,
  ]);
});

test("compound hyphenated word allows breaks at each hyphen", () => {
  expect(Array.from(defaultLineBreakerIterator("state-of-the-art"))).toEqual([
    0, 5, 6, 8, 9, 12, 13,
  ]);
});
