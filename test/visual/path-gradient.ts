import { Column, Path, Row } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const heartPath =
  "M 12 21.593 C 6.055 15.345 1 11.075 1 7 C 1 3.134 3.134 1 7 1 C 9.257 1 11.312 2.5 12 4 C 12.688 2.5 14.743 1 17 1 C 20.866 1 23 3.134 23 7 C 23 11.075 17.945 15.345 12 21.593 Z";

const starPath =
  "M 12 2 L 15.09 8.26 L 22 9.27 L 17 14.14 L 18.18 21.02 L 12 17.77 L 5.82 21.02 L 7 14.14 L 2 9.27 L 8.91 8.26 Z";

const arrowPath = "M 0 8 L 14 8 L 14 4 L 24 12 L 14 20 L 14 16 L 0 16 Z";

const root = Column(
  Row(
    Path(heartPath).fill("linear-gradient(135deg, #ff6b6b, #feca57)").size(80),
    Path(starPath).fill("linear-gradient(180deg, #48dbfb, #0abde3)").size(80),
    Path(arrowPath).fill("linear-gradient(90deg, #1dd1a1, #10ac84)").size(80),
  ).gap(20),
)
  .bg("#2d3436")
  .padding(30);

await writeCanvasToFile(root, import.meta.url);
