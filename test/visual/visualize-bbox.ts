import { readFile, writeFile } from "node:fs/promises";
import { Canvas, loadImage } from "skia-canvas";
import type { TextProps } from "../../src/core";
import type { SoneMetadata } from "../../src/metadata";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomColor(): string {
  return `hsl(${randomInt(0, 360)},${randomInt(42, 98)}%,${randomInt(40, 90)}%)`;
}

const image = await loadImage("test/visual/text-2.jpg");
const metadata: SoneMetadata = JSON.parse(
  await readFile("test/visual/text-2.json", "utf8"),
);

const canvas = new Canvas(image.width, image.height);

const ctx = canvas.getContext("2d");
ctx.drawImage(image, 0, 0);

function draw(item: SoneMetadata, depth: number) {
  const color = randomColor();

  if (item.type === "photo") {
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.strokeRect(item.x, item.y, item.width, item.height);
    ctx.restore();
    return;
  }

  if (item.type === "text") {
    const props = item.props as TextProps;
    if (props.blocks) {
      for (const block of props.blocks) {
        for (const line of block.paragraph.lines) {
          for (const segment of line.segments) {
            if (segment.run == null) {
              continue;
            }
            const run = segment.run;
            if (segment.text.trim().length === 0) continue;
            ctx.save();
            ctx.lineWidth = 4;
            ctx.strokeStyle = color;
            ctx.strokeRect(run.x, run.y, run.width, run.height);
            ctx.restore();
          }
        }
      }
    }
  }

  if (item.children) {
    for (const child of item.children) {
      if (typeof child === "string") continue;
      if (child.type === "span") continue;

      draw(child as SoneMetadata, depth + 1);
    }
  }
}

draw(metadata, 0);

await writeFile(
  "test/visual/text-2-annotations.png",
  await canvas.toBuffer("png"),
);
