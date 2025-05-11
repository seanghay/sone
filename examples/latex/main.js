import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs/promises";
import { Column, Photo, Text, loadImage, sone } from "sonejs";
import texsvg from "texsvg";

const svg = await texsvg("x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}", {
  optimize: true,
});

const resvg = new Resvg(svg, {
  fitTo: {
    mode: "width",
    value: 256,
  },
});

const pngBuffer = resvg.render().asPng();
const image = await loadImage(pngBuffer);

const Document = () =>
  Column(
    Text("Hello world").size(64).color("red"),
    Photo(image).scaleType("fit"),
  )
    .padding(18)
    .bg("#eee")
    .gap(10);

await fs.writeFile("output.png", await sone(Document).png());
