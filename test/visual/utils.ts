import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SoneNode, sone } from "../../src/node.ts";

export const relative = (p: string) =>
  fileURLToPath(new URL(p, import.meta.url));

export async function writeCanvasToFile(root: SoneNode, url: string) {
  const file = path.parse(fileURLToPath(url));
  const { canvas, metadata } = await sone(root).canvasWithMetadata();

  await fs.writeFile(
    path.join(file.dir, `${file.name}.jpg`),
    await canvas.toBuffer("jpg"),
  );

  await fs.writeFile(
    path.join(file.dir, `${file.name}.json`),
    JSON.stringify(metadata, null, 2),
  );
}
