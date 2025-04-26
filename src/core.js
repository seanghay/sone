import { createCanvas } from "canvas";
import fs from "node:fs/promises";
import { Align, Direction } from "yoga-layout";
import { renderPattern } from "./utils.js";
import { Box, Column, renderToCanvas, Row } from "./layout.js";

export function Document() {
  return Column(
    Box().margin(20, 20, 20, 20).size("100%", 200).backgroundColor("red"),
    Box()
      .size(200, 200)
      .marginRight(100)
      .alignSelf(Align.FlexEnd)
      .backgroundColor("blue"),
    Box().size(400, 300).alignSelf(Align.Center).backgroundColor("green"),
    Row(
      Box().size(500, 500).backgroundColor("orange"),
      Box().size(200, 200).backgroundColor("lime"),
      Box().size(200, 200).backgroundColor("deepskyblue"),
      Box().size(200, 200).backgroundColor("salmon"),
      Box().size(200, "100%").backgroundColor("darkred"),
    )
      .gap(20)
      .padding(20, 20, 20, 20),
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
console.timeEnd("render");

await fs.mkdir("examples", { recursive: true });
await fs.writeFile(
  "examples/image.jpg",
  canvas.toBuffer("image/jpeg", { quality: 1 }),
);
