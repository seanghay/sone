import { expect, test } from "vitest";
import {
  Align,
  Display,
  FlexDirection,
  Justify,
  loadYoga,
  Overflow,
  PositionType,
  Wrap,
} from "yoga-layout/load";
import { applyPropsToYogaNode } from "../src/serde.ts";

const yoga = loadYoga();

const createNode = async () => (await yoga).Node.create();

test("props alignItems", async () => {
  const node = applyPropsToYogaNode(
    {
      alignItems: "center",
      alignSelf: "flex-end",
    },
    await createNode(),
  );

  expect(node.getAlignItems()).toBe(Align.Center);
  expect(node.getAlignSelf()).toBe(Align.FlexEnd);
});

test("flex direction properties", async () => {
  const node = applyPropsToYogaNode(
    {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    await createNode(),
  );
  expect(node.getFlexDirection()).toBe(FlexDirection.RowReverse);
  expect(node.getFlexWrap()).toBe(Wrap.Wrap);
  expect(node.getJustifyContent()).toBe(Justify.SpaceBetween);
});

test("size and position properties", async () => {
  const node = applyPropsToYogaNode(
    {
      width: 100,
      height: 200,
      position: "absolute",
      left: 10,
      top: 20,
    },
    await createNode(),
  );
  expect(node.getWidth().value).toBe(100);
  expect(node.getHeight().value).toBe(200);
  expect(node.getPositionType()).toBe(PositionType.Absolute);
});

test("margin and padding properties", async () => {
  const node = applyPropsToYogaNode(
    {
      margin: 10,
      padding: 20,
    },
    await createNode(),
  );
  expect(node).toBeDefined();
});

test("border properties", async () => {
  const node = applyPropsToYogaNode(
    {
      borderTopWidth: 10,
    },
    await createNode(),
  );
  expect(node).toBeDefined();
});

test("flex properties", async () => {
  const node = applyPropsToYogaNode(
    {
      flex: 1,
      flexGrow: 2,
      flexShrink: 0.5,
      flexBasis: "auto",
    },
    await createNode(),
  );
  expect(node.getFlexGrow()).toBe(2);
  expect(node.getFlexShrink()).toBe(0.5);
});

test("overflow and display properties", async () => {
  const node = applyPropsToYogaNode(
    {
      overflow: "hidden",
      display: "none",
    },
    await createNode(),
  );
  expect(node.getOverflow()).toBe(Overflow.Hidden);
  expect(node.getDisplay()).toBe(Display.None);
});

test("gap properties", async () => {
  const node = applyPropsToYogaNode(
    {
      gap: 15,
      rowGap: 20,
      columnGap: 25,
    },
    await createNode(),
  );
  expect(node).toBeDefined();
});

test("percentage values", async () => {
  const node = applyPropsToYogaNode(
    {
      width: "50%",
      marginLeft: "10%",
    },
    await createNode(),
  );
  expect(node.getWidth().value).toBe(50);
  expect(node.getWidth().unit).toBeDefined();
});
