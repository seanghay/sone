import { fileURLToPath } from "node:url";
import { Column, Photo, qrcode, Row } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const relative = (p: string) => fileURLToPath(new URL(p, import.meta.url));

const imageUrl = relative("../image/kouprey.jpg");
const svgUrl = relative("../image/tiger.svg");

console.time("render to file");

const root = Column(
  //
  Column(
    //
    Column()
      .flex(1)
      .cornerRadius(20)
      .cornerSmoothing(0.7)
      .bg("white"),
    //
    Row(
      Column()
        .bg("lightgreen")
        .size(50)
        .borderRadius(14)
        .borderColor("teal")
        .borderWidth(2),
      Column().bg("salmon").height(50).borderRadius(14).flex(1),
      Column().bg("orange").size(50).borderRadius(14),
    ).gap(10),
  )
    .gap(20)
    .padding(20)
    .size(420, 300)
    .bg("khaki")
    .cornerRadius(28)
    .borderColor("chocolate")
    .borderWidth(4)
    .rotate(20),
  // image
  Photo(imageUrl)
    .width(300)
    .preserveAspectRatio()
    .cornerRadius(30)
    .cornerSmoothing(0.7)
    .flipVertical()
    .flipHorizontal()
    .borderColor("tomato")
    .borderWidth(4),
  Row(
    //
    Photo(imageUrl)
      .size(200)
      .scaleType("cover")
      .cornerRadius(40)
      .cornerSmoothing(0.7)
      .scaleType("contain")
      .bg("thistle"),
    //
    Photo(imageUrl)
      .size(300, 200)
      .scaleType("cover"),
  ).gap(20),
  //
  Photo(imageUrl)
    .size(150, 220)
    .scaleType("cover"),
  Photo(svgUrl).width(400).preserveAspectRatio(),
  Photo(qrcode("hello")),
)
  .bg("tan")
  .padding(20)
  .gap(20);

await writeCanvasToFile(root, import.meta.url);
