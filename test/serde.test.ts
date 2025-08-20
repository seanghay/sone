import { expect, test } from "vitest";
import {
  Align,
  Display,
  FlexDirection,
  Justify,
  Overflow,
  PositionType,
  Wrap,
} from "yoga-layout";
import { applyPropsToYogaNode } from "../src/serde.ts";

test("props alignItems", () => {
  const node = applyPropsToYogaNode({
    alignItems: "center",
    alignSelf: "flex-end",
  });
  expect(node.getAlignItems()).toBe(Align.Center);
  expect(node.getAlignSelf()).toBe(Align.FlexEnd);
});

test("flex direction properties", () => {
  const node = applyPropsToYogaNode({
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
  });
  expect(node.getFlexDirection()).toBe(FlexDirection.RowReverse);
  expect(node.getFlexWrap()).toBe(Wrap.Wrap);
  expect(node.getJustifyContent()).toBe(Justify.SpaceBetween);
});

test("size and position properties", () => {
  const node = applyPropsToYogaNode({
    width: 100,
    height: 200,
    position: "absolute",
    left: 10,
    top: 20,
  });
  expect(node.getWidth().value).toBe(100);
  expect(node.getHeight().value).toBe(200);
  expect(node.getPositionType()).toBe(PositionType.Absolute);
});

test("margin and padding properties", () => {
  const node = applyPropsToYogaNode({
    margin: 10,
    padding: 20,
  });
  expect(node).toBeDefined();
});

test("border properties", () => {
  const node = applyPropsToYogaNode({
    borderTopWidth: 10,
  });
  expect(node).toBeDefined();
});

test("flex properties", () => {
  const node = applyPropsToYogaNode({
    flex: 1,
    flexGrow: 2,
    flexShrink: 0.5,
    flexBasis: "auto",
  });
  expect(node.getFlexGrow()).toBe(2);
  expect(node.getFlexShrink()).toBe(0.5);
});

test("overflow and display properties", () => {
  const node = applyPropsToYogaNode({
    overflow: "hidden",
    display: "none",
  });
  expect(node.getOverflow()).toBe(Overflow.Hidden);
  expect(node.getDisplay()).toBe(Display.None);
});

test("gap properties", () => {
  const node = applyPropsToYogaNode({
    gap: 15,
    rowGap: 20,
    columnGap: 25,
  });
  expect(node).toBeDefined();
});

test("percentage values", () => {
  const node = applyPropsToYogaNode({
    width: "50%",
    marginLeft: "10%",
  });
  expect(node.getWidth().value).toBe(50);
  expect(node.getWidth().unit).toBeDefined();
});
