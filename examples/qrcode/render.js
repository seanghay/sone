import fs from "node:fs/promises";
import { sone, Column, Text, Photo, qrcode } from "sone";

function Widget() {
  return Column(
    Column(
      Photo(
        qrcode("https://github.com/seanghay/sone", {
          margin: 0,
          background: null,
          color: "white",
          ecl: "H",
          size: 350,
        }),
      ),
      Text("npm install sone")
        .size(32)
        .align("center")
        .color("white")
        .font("Geist Mono"),
    )
      .padding(44)
      .bg("linear-gradient(to top, #1e3c72 0%, #1e3c72 1%, #2a5298 100%)")
      .gap(32)
      .cornerRadius(24)
      .cornerSmoothing(0.7),
  ).padding(10);
}

await fs.writeFile("out.png", await sone(Widget).png());
await fs.writeFile("out.pdf", await sone(Widget).pdf());
