import { fileURLToPath } from "node:url";
import { Font } from "../../src/node.ts";

const relative = (p: string) => fileURLToPath(new URL(p, import.meta.url));

let loaded = false;

export async function loadVisualTestFonts() {
  if (loaded) return;

  await Font.load("NotoSansKhmer", relative("../font/NotoSansKhmer.ttf"));
  await Font.load("GeistMono", relative("../font/GeistMono-Regular.ttf"));

  loaded = true;
}
