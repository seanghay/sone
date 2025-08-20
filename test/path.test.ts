import { expect, test } from "vitest";
import { Path } from "../src/core.ts";

test("simple Path", () => {
  const node = Path("M 10 10 L 20 20");
  expect(node.type).toBe("path");
  expect(node.props.d).toBe("M 10 10 L 20 20");
  expect(node.props).toEqual({ d: "M 10 10 L 20 20" });
});

test("Path with stroke properties", () => {
  const node = Path("M 0 0 L 100 100")
    .stroke("red")
    .strokeWidth(2)
    .strokeLineCap("round")
    .strokeLineJoin("miter")
    .strokeMiterLimit(4);

  expect(node.props.stroke).toBe("red");
  expect(node.props.strokeWidth).toBe(2);
  expect(node.props.strokeLineCap).toBe("round");
  expect(node.props.strokeLineJoin).toBe("miter");
  expect(node.props.strokeMiterLimit).toBe(4);
});

test("Path with fill properties", () => {
  const node = Path("M 0 0 L 100 100")
    .fill("blue")
    .fillOpacity(0.5)
    .fillRule("evenodd");

  expect(node.props.fill).toBe("blue");
  expect(node.props.fillOpacity).toBe(0.5);
  expect(node.props.fillRule).toBe("evenodd");
});

test("Path with dash properties", () => {
  const node = Path("M 0 0 L 100 100")
    .strokeDashArray(5, 10, 15)
    .strokeDashOffset(2);

  expect(node.props.strokeDashArray).toEqual([5, 10, 15]);
  expect(node.props.strokeDashOffset).toBe(2);
});

test("Path with layout and transform properties", () => {
  const node = Path("M 0 0 L 100 100")
    .size(200, 150)
    .scalePath(2)
    .rotate(45)
    .opacity(0.8);

  expect(node.props.width).toBe(200);
  expect(node.props.height).toBe(150);
  expect(node.props.scalePath).toBe(2);
  expect(node.props.rotation).toBe(45);
  expect(node.props.opacity).toBe(0.8);
});

test("Path with complex SVG path", () => {
  const complexPath = "M 150 50 A 100 100 0 1 1 50 150 L 150 50 Z";
  const node = Path(complexPath).fill("orange").stroke("#333").strokeWidth(3);

  expect(node.props.d).toBe(complexPath);
  expect(node.props.fill).toBe("orange");
  expect(node.props.stroke).toBe("#333");
  expect(node.props.strokeWidth).toBe(3);
});

test("Path with bounds property", () => {
  const node = Path("M 0 0 L 100 100");
  expect(node.props.bounds).toBeUndefined();

  // Test setting bounds manually (typically set by renderer)
  node.props.bounds = [10, 20, 200, 150];
  expect(node.props.bounds).toEqual([10, 20, 200, 150]);
});

test("Path edge cases", () => {
  // Empty path data
  const emptyPath = Path("");
  expect(emptyPath.props.d).toBe("");
  expect(emptyPath.type).toBe("path");

  // Single move command
  const moveOnly = Path("M 10 10");
  expect(moveOnly.props.d).toBe("M 10 10");

  // Path with only whitespace
  const whitespace = Path("   ");
  expect(whitespace.props.d).toBe("   ");
});

test("Path with gradient fills", () => {
  const gradientFill = "linear-gradient(45deg, red 0%, blue 100%)";
  const node = Path("M 0 0 L 100 100").fill(gradientFill);

  expect(node.props.fill).toBe(gradientFill);
});

test("Path method chaining edge cases", () => {
  // Test chaining with same property multiple times
  const node = Path("M 0 0 L 100 100")
    .fill("red")
    .fill("blue")
    .strokeWidth(1)
    .strokeWidth(5)
    .strokeDashArray(1, 2, 3)
    .strokeDashArray(4, 5);

  expect(node.props.fill).toBe("blue");
  expect(node.props.strokeWidth).toBe(5);
  expect(node.props.strokeDashArray).toEqual([4, 5]);

  // Test long chain
  const longChain = Path("M 0 0 L 100 100")
    .fill("red")
    .stroke("blue")
    .strokeWidth(2)
    .strokeLineCap("round")
    .strokeLineJoin("bevel")
    .strokeMiterLimit(10)
    .strokeDashArray(5, 10)
    .strokeDashOffset(3)
    .fillOpacity(0.8)
    .fillRule("evenodd")
    .scalePath(1.5)
    .size(200, 300)
    .opacity(0.9);

  expect(longChain.type).toBe("path");
  expect(longChain.props.fill).toBe("red");
  expect(longChain.props.stroke).toBe("blue");
  expect(longChain.props.opacity).toBe(0.9);
});

test("Path with combined stroke and fill properties", () => {
  const node = Path("M 0 0 L 100 50 L 50 100 Z")
    .fill("rgba(255, 0, 0, 0.5)")
    .fillOpacity(0.7)
    .fillRule("evenodd")
    .stroke("#00FF00")
    .strokeWidth(3)
    .strokeLineCap("round")
    .strokeLineJoin("round")
    .strokeDashArray(10, 5, 2, 5)
    .strokeDashOffset(8)
    .strokeMiterLimit(2);

  // Fill properties
  expect(node.props.fill).toBe("rgba(255, 0, 0, 0.5)");
  expect(node.props.fillOpacity).toBe(0.7);
  expect(node.props.fillRule).toBe("evenodd");

  // Stroke properties
  expect(node.props.stroke).toBe("#00FF00");
  expect(node.props.strokeWidth).toBe(3);
  expect(node.props.strokeLineCap).toBe("round");
  expect(node.props.strokeLineJoin).toBe("round");
  expect(node.props.strokeDashArray).toEqual([10, 5, 2, 5]);
  expect(node.props.strokeDashOffset).toBe(8);
  expect(node.props.strokeMiterLimit).toBe(2);
});

test("Path with inherited layout properties", () => {
  const node = Path("M 0 0 L 100 100")
    .position("absolute")
    .top(10)
    .left(20)
    .margin(5)
    .padding(15)
    .bg("yellow")
    .borderWidth(2)
    .borderColor("black")
    .borderRadius(8);

  expect(node.props.position).toBe("absolute");
  expect(node.props.top).toBe(10);
  expect(node.props.left).toBe(20);
  expect(node.props.margin).toBe(5);
  expect(node.props.padding).toBe(15);
  expect(node.props.background).toEqual(["yellow"]);
  expect(node.props.borderWidth).toBe(2);
  expect(node.props.borderColor).toBe("black");
  expect(node.props.cornerRadius).toEqual([8]);
});

test("Path with various SVG path commands", () => {
  // Test different path commands
  const pathCommands = [
    "M 10 10", // Move to
    "L 50 50", // Line to
    "H 80", // Horizontal line
    "V 100", // Vertical line
    "C 10 20 30 40 50 60", // Cubic Bézier curve
    "S 70 80 90 100", // Smooth cubic Bézier
    "Q 120 140 160 180", // Quadratic Bézier curve
    "T 200 220", // Smooth quadratic Bézier
    "A 25 25 0 1 1 250 250", // Elliptical arc
    "Z", // Close path
  ];

  for (const command of pathCommands) {
    const node = Path(command);
    expect(node.props.d).toBe(command);
    expect(node.type).toBe("path");
  }

  // Complex path with multiple commands
  const complexPath =
    "M 100 100 L 200 200 Q 300 100 400 200 A 50 50 0 1 0 500 100 Z";
  const complexNode = Path(complexPath)
    .fill("purple")
    .stroke("orange")
    .strokeWidth(2);

  expect(complexNode.props.d).toBe(complexPath);
  expect(complexNode.props.fill).toBe("purple");
  expect(complexNode.props.stroke).toBe("orange");
});

test("Path with strokeDashArray variations", () => {
  // Single value
  const singleDash = Path("M 0 0 L 100 100").strokeDashArray(5);
  expect(singleDash.props.strokeDashArray).toEqual([5]);

  // Multiple values
  const multiDash = Path("M 0 0 L 100 100").strokeDashArray(5, 10, 15, 20);
  expect(multiDash.props.strokeDashArray).toEqual([5, 10, 15, 20]);

  // Empty array (no dashes)
  const noDash = Path("M 0 0 L 100 100").strokeDashArray();
  expect(noDash.props.strokeDashArray).toEqual([]);
});

test("Path with all stroke line cap options", () => {
  const buttCap = Path("M 0 0 L 100 100").strokeLineCap("butt");
  expect(buttCap.props.strokeLineCap).toBe("butt");

  const roundCap = Path("M 0 0 L 100 100").strokeLineCap("round");
  expect(roundCap.props.strokeLineCap).toBe("round");

  const squareCap = Path("M 0 0 L 100 100").strokeLineCap("square");
  expect(squareCap.props.strokeLineCap).toBe("square");
});

test("Path with all stroke line join options", () => {
  const bevelJoin = Path("M 0 0 L 50 50 L 100 0").strokeLineJoin("bevel");
  expect(bevelJoin.props.strokeLineJoin).toBe("bevel");

  const miterJoin = Path("M 0 0 L 50 50 L 100 0").strokeLineJoin("miter");
  expect(miterJoin.props.strokeLineJoin).toBe("miter");

  const roundJoin = Path("M 0 0 L 50 50 L 100 0").strokeLineJoin("round");
  expect(roundJoin.props.strokeLineJoin).toBe("round");
});

test("Path with all fill rule options", () => {
  const evenodd = Path("M 0 0 L 100 100 L 0 100 Z").fillRule("evenodd");
  expect(evenodd.props.fillRule).toBe("evenodd");

  const nonzero = Path("M 0 0 L 100 100 L 0 100 Z").fillRule("nonzero");
  expect(nonzero.props.fillRule).toBe("nonzero");
});
