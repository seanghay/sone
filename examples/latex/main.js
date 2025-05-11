import fs from "node:fs/promises";
import { Column, Photo, Text, loadImage, sone } from "sonejs";
import texsvg from "texsvg";
import initUSvg, { optimize } from "usvgjs";

const wasmBuffer = await fs.readFile("node_modules/usvgjs/usvgjs_bg.wasm");
await initUSvg({
  module_or_path: wasmBuffer,
});

let svg = await texsvg("x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}");
svg = optimize(svg);

const image = await loadImage(Buffer.from(svg));

const Document = () =>
  Column(
    Text("Hello world").size(64).color("red"),
    Photo(image).scaleType("fit"),
  )
    .padding(18)
    .bg("#eee")
    .gap(10);

await fs.writeFile("output.png", await sone(Document).png());
await fs.writeFile("output.pdf", await sone(Document).pdf());
