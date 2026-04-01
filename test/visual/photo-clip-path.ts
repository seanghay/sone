import { Column, Photo, Row } from "../../src/node.ts";
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
  Row(
    Photo(img).width(150).height(150).clipPath(trianglePath),
    Photo(img).width(150).height(150).clipPath(starPath),
    Photo(img).width(150).height(150).clipPath(diamondPath),
  ).gap(20),
)
  .bg("#dfe6e9")
  .padding(30);

await writeCanvasToFile(root, import.meta.url);
