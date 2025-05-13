import fs from "node:fs/promises";
import { sone, Column, Text, Photo, loadImage } from "sone";
import QRCode from "qrcode-svg";

const qrcode = new QRCode({
  content: "This is awesome!",
  padding: 0,
  background: "slateblue",
  color: "white",
  join: true,
});

const svg = await loadImage(Buffer.from(qrcode.svg()));

function Widget() {
  return Column(
    Column(
      Photo(svg),
      Text("Hello world").size(24).align("center").color("white"),
    )
      .padding(24)
      .bg("slateblue")
      .gap(20)
      .cornerRadius(24)
      .cornerSmoothing(0.7),
  ).padding(10);
}

await fs.writeFile(
  "out.png",
  await sone(Widget, { backgroundColor: null }).png(),
);
await fs.writeFile("out.pdf", await sone(Widget).pdf());
