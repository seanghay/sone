import { Column, Photo, Text } from "../../src/node.ts";
import { relative, writeCanvasToFile } from "./utils.ts";

const img = relative("../image/kouprey.jpg");

const root = Column(
  Text("SONE").size(90).weight("bold").clipImage(Photo(img).scaleType("cover")),
  Text("HELLO WORLD")
    .size(60)
    .weight("bold")
    .align("center")
    .clipImage(Photo(img).scaleType("cover")),
)
  .bg("#2d3436")
  .padding(40)
  .gap(30)
  .width(600);

await writeCanvasToFile(root, import.meta.url);
