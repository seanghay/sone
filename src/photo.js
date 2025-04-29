import Yoga from "yoga-layout";
import { createNode } from "./core.js";
import { DrawSymbol } from "./utils.js";

export function Photo(src) {
  const node = Yoga.Node.create();
  return createNode(
    {
      type: Photo,
      style: {},
      src,
      [DrawSymbol]: ({ ctx, component, x, y }) => {
        ctx.drawImage(
          component.src,
          x,
          y,
          component.node.getComputedWidth(),
          component.node.getComputedHeight(),
        );
      },
    },
    node,
  );
}
