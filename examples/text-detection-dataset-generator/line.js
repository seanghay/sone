import fs from "node:fs/promises";
import { Canvas, FontLibrary } from "skia-canvas";

FontLibrary.use("CustomFont", "fonts/Battambang-Regular.ttf");

const canvas = new Canvas(512, 224);
const ctx = canvas.getContext("2d");

ctx.fillStyle = "#eee";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.font = "44px Noto Serif Khmer";

const text = "មនុស្សខ្មែរ";
const metrics = ctx.measureText(text);

const y = 100;
const height = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
const mul = height / 44;
const lineHeight = mul;
console.log({ lineHeight });
const offset = (mul - lineHeight) / mul;

ctx.strokeStyle = "red";
ctx.strokeRect(100, y, metrics.width, 44 * lineHeight);

ctx.fillStyle = "#000";
ctx.fillText(
  text,
  100,
  y + metrics.fontBoundingBoxAscent - (offset * height) / 2,
);

await fs.writeFile("image.png", await canvas.toBuffer("png", { density: 2 }));

function Span(value) {
  const props = {
    size: 14,
    color: "black",
    font: "Arial",
  };

  return {
    type: "span",
    value,
    props,
    color(value) {
      props.color = value;
      return this;
    },
    size(value) {
      props.size = value;
      return this;
    },
    font(value) {
      props.font = value;
      return this;
    },
  };
}

function Paragraph(...children) {
  return {
    type: "text",
    children,
  };
}

const root = Paragraph(
  Span("Hello, world").color("red"),
  //
  Span("this is awesome").size(44),
);

console.dir(root, { depth: 11 });
