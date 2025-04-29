import Yoga, { FlexDirection } from "yoga-layout";
import { createNode } from "./core.js";
import { parseFlexDirection } from "./utils.js";

export function Row(...children) {
  const node = Yoga.Node.create();
  node.setFlexDirection(FlexDirection.Row);

  for (const item of children) {
    node.insertChild(item.node, node.getChildCount());
  }

  return createNode(
    {
      type: Row,
      children,
    },
    node,
  );
}

export function Column(...children) {
  const node = Yoga.Node.create();
  node.setFlexDirection(FlexDirection.Column);

  for (const item of children) {
    node.insertChild(item.node, node.getChildCount());
  }

  return createNode(
    {
      type: Column,
      children,
    },
    node,
  );
}

export function Flex(...children) {
  const node = Yoga.Node.create();

  for (const item of children) {
    node.insertChild(item.node, node.getChildCount());
  }

  return createNode(
    {
      type: Flex,
      children,
      direction(value) {
        node.setFlexDirection(parseFlexDirection(value));
        return this;
      },
    },
    node,
  );
}
