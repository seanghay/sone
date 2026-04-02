import { ClipGroup, Column, Photo, Row, Text } from "../../src/node.ts";
import { relative, writeCanvasToFile } from "./utils.ts";

const img = relative("../image/kouprey.jpg");

// Triangle clip path
const trianglePath = "M 75 0 L 150 150 L 0 150 Z";
// Star clip path
const starPath =
  "M 75 5 L 95 65 L 150 65 L 105 100 L 120 150 L 75 115 L 30 150 L 45 100 L 0 65 L 55 65 Z";
// Diamond clip path
const diamondPath = "M 75 0 L 150 75 L 75 150 L 0 75 Z";

const root = Column(
  // photo + label clipped together to a triangle
  Row(
    ClipGroup(trianglePath, Photo(img).width(150).height(150)).size(150, 150),
    ClipGroup(starPath, Photo(img).width(150).height(150)).size(150, 150),
    ClipGroup(diamondPath, Photo(img).width(150).height(150)).size(150, 150),
  ).gap(20),
  // mixed children: photo + text both clipped
  Row(
    ClipGroup(
      "M 0 75 L 75 0 L 150 75 L 75 150 Z",
      Photo(img).width(150).height(150),
      Text("Clipped").color("white").size(16).weight("bold").padding(8),
    )
      .size(150, 150)
      .overflow("hidden"),
  ).gap(20),
)
  .bg("#dfe6e9")
  .padding(30)
  .gap(20);

await writeCanvasToFile(root, import.meta.url);
