import { expect, test } from "vitest";
import { Span } from "../src/core.ts";

test("simple Span creation", () => {
  const span = Span("Hello World");

  expect(span.type).toBe("span");
  expect(span.children).toBe("Hello World");
  expect(span.props).toEqual({});
});

test("Span with text styling", () => {
  const span = Span("Styled Text")
    .color("red")
    .size(18)
    .font("Arial", "sans-serif")
    .weight("bold")
    .style("italic");

  expect(span.props.color).toBe("red");
  expect(span.props.size).toBe(18);
  expect(span.props.font).toEqual(["Arial", "sans-serif"]);
  expect(span.props.weight).toBe("bold");
  expect(span.props.style).toBe("italic");
});

test("Span with text decorations", () => {
  const span = Span("Decorated Text")
    .underline()
    .underlineColor("blue")
    .lineThrough(2)
    .lineThroughColor("red")
    .overline()
    .overlineColor("green");

  expect(span.props.underline).toBe(1.0);
  expect(span.props.underlineColor).toBe("blue");
  expect(span.props.lineThrough).toBe(2);
  expect(span.props.lineThroughColor).toBe("red");
  expect(span.props.overline).toBe(1.0);
  expect(span.props.overlineColor).toBe("green");
});

test("Span with text effects", () => {
  const span = Span("Effect Text")
    .strokeColor("black")
    .strokeWidth(2)
    .dropShadow("2px 2px 4px rgba(0,0,0,0.5)")
    .highlight("yellow")
    .offsetY(5)
    .letterSpacing(1.5)
    .wordSpacing(2);

  expect(span.props.strokeColor).toBe("black");
  expect(span.props.strokeWidth).toBe(2);
  expect(span.props.dropShadows).toEqual(["2px 2px 4px rgba(0,0,0,0.5)"]);
  expect(span.props.highlightColor).toBe("yellow");
  expect(span.props.offsetY).toBe(5);
  expect(span.props.letterSpacing).toBe(1.5);
  expect(span.props.wordSpacing).toBe(2);
});

test("Span with multiple drop shadows", () => {
  const span = Span("Shadow Text").dropShadow(
    "1px 1px 2px red",
    "2px 2px 4px blue",
  );

  expect(span.props.dropShadows).toEqual([
    "1px 1px 2px red",
    "2px 2px 4px blue",
  ]);
});
