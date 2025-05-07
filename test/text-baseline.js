import fs from "node:fs/promises";
import { Canvas, loadImage } from "skia-canvas";

const svg = await loadImage("test/Flag_of_Cambodia.svg");

console.time("render");
const canvas = new Canvas(750, 300);
const ctx = canvas.getContext("2d");

ctx.fillStyle = "#fff";
ctx.textBaseline = "alphabetic";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const text = (t, x, y, size, font, offsetY = 0, color = 'black') => {
  ctx.font = `550 ${size}px ${font}`;
  ctx.fillStyle = color;

  const m = ctx.measureText(t);
  const h = size * 0.75;

  ctx.rect(x, y + offsetY, m.width, h);

  ctx.strokeStyle = "red";
  ctx.lineWidth = 1;

  ctx.stroke();
  ctx.fillText(t, x, y + h + offsetY);

  return m.width + x;
};

const largeSize = 16 * 3;
const smallSize = 16 * 2;

const w = 200;

ctx.save();
ctx.rotate(50);
ctx.drawImage(svg, 40, 100, w, (w * svg.height) / svg.width);
ctx.restore();

text(
  "លោក សុខ ក្រោម",
  text("ក្នុងការប្រើប្រាស់ 😂 English ", 30, 30, smallSize, "Kantumruy Pro"),
  30,
  largeSize,
  "Moul",
  (smallSize - largeSize) * 0.75,
  "red"
);

console.timeEnd("render");

await fs.writeFile("test/text-baseline.pdf", await canvas.toBuffer("pdf"));
