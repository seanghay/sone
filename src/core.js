import { createCanvas } from "canvas";
import fs from "node:fs/promises";
import { Align, Direction, FlexDirection, PositionType } from "yoga-layout";
import { renderPattern } from "./utils.js";
import { Box, Column, renderToCanvas, Row } from "./layout.js";

export function Document() {
  return Column(
    Box().margin(50, 20).size("100%", 200).bg("red"),
    Box().size(200, 20).marginRight(100).alignSelf(Align.FlexEnd).bg("blue"),
    Box().size(400, 300).alignSelf(Align.Center).bg("green"),
    Box().size(400, 300).bg("gray"),
    Box().size(100, 100).bg("gold"),
    Row(
      Box().size(300, 500).bg("orange"),
      Box().size(200, 200).bg("lime"),
      Box().size(200, 200).bg("deepskyblue"),
      Box().size(400).bg("salmon"),
      Box().size(200, "100%").bg("darkred"),
    )
      .gap(20)
      .padding(20),
    Box(
      Box().maxHeight(120).grow(2).bg("red"),
      Box(
        Box()
          .marginLeft(20)
          .marginRight(20)
          .aspectRatio(16 / 9)
          .size("auto", "auto")
          .bg("blue"),
      )
        .paddingTop(20)
        .grow(1)
        .bg("orange"),
    )
      .gap(10)
      .padding(10)
      .size(500, 500)
      .marginLeft(150)
      .marginTop(20)
      .position(PositionType.Absolute)
      .bg("black")
      .direction(FlexDirection.Column),
  );
}

console.time("render");
const root = Document();
root.node.calculateLayout(undefined, undefined, Direction.LTR);

const canvas = createCanvas(
  root.node.getComputedWidth(),
  root.node.getComputedHeight(),
);

const ctx = canvas.getContext("2d");
renderPattern(ctx, canvas.width, canvas.height, 20);
renderToCanvas(ctx, root, 0, 0, canvas.width, canvas.height);
root.node.freeRecursive();
console.timeEnd("render");

await fs.mkdir("examples", { recursive: true });
await fs.writeFile(
  "examples/image.jpg",
  canvas.toBuffer("image/jpeg", { quality: 1 }),
);
