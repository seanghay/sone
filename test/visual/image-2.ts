import { Photo, Row } from "../../src/node.ts";
import { relative, writeCanvasToFile } from "./utils.ts";

const root = Row(
  Photo(relative("../image/kouprey.jpg"))
    .size(300)
    .scaleType("contain", "start")
    .bg("gray"),
  Photo(relative("../image/kouprey.jpg"))
    .size(300)
    .scaleType("contain", "end")
    .bg("red"),
  Photo(relative("../image/kouprey.jpg"))
    .size(300)
    .scaleType("contain", 0.2)
    .bg("orange"),
)
  .bg("#eee")
  .padding(20)
  .gap(20);

await writeCanvasToFile(root, import.meta.url);
