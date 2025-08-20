import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Canvas } from "skia-canvas";
import { Column, Path, render, renderer, Text } from "../../src/node.ts";

const root = Column(
  //
  Path(`M 250 100
       A 45 45, 0, 1, 0, 295 145
       L 295 100 Z`)
    .fill("orange")
    .stroke("#000")
    .strokeDashArray(14)
    .strokeWidth(4)
    .strokeDashOffset(0)
    .scalePath(3.5),
  Text("Path")
    .weight("bold")
    .color("#000")
    .size(64)
    .position("absolute")
    .alignSelf("center"),
)
  .bg("#eee")
  .justifyContent("center")
  .padding(28)
  .position("relative");

const canvas = await render<Canvas>(root, renderer);
const file = path.parse(fileURLToPath(import.meta.url));
const filename = `${file.name}.png`;
await fs.writeFile(path.join(file.dir, filename), await canvas.toBuffer("png"));
