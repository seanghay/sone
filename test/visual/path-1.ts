import { Column, Path, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

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

await writeCanvasToFile(root, import.meta.url);
