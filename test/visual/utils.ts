import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { SoneNode } from "../../src/node.ts";
import { sone } from "../../src/node.ts";

export const relative = (p: string) =>
  fileURLToPath(new URL(p, import.meta.url));

export async function writeCanvasToFile(root: SoneNode, url: string) {
  const file = path.parse(fileURLToPath(url));
  const { canvas } = await sone(root).canvasWithMetadata();

  await fs.writeFile(
    path.join(file.dir, `${file.name}.jpg`),
    // @ts-expect-error
    await canvas.toBuffer("jpg", { density: 2 }),
  );
}
