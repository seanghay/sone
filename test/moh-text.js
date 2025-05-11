import { sone, Column, Text } from "../src/sone.js";
import fs from "node:fs/promises";

function Root() {
  return Column(
    Text("Hello\nworld world\nworld").size(22).align("center").color("red"),
    Text("Hello\nworld world world").size(22).align("left").color("green"),
    Text("Hello\nworld world world").size(22).align("right").color("blue"),
    //
    Text("Hello world world\nworld")
      .size(44)
      .align("center")
      .color("red"),
    Text("Hello world world\nworld").size(44).align("left").color("green"),
    Text("Hello world world\nworld").size(44).align("right").color("blue"),
  )
    .padding(20)
    .gap(18);
}

await fs.writeFile("test/moh-text.jpg", await sone(Root).jpg());
await fs.writeFile("test/moh-text.pdf", await sone(Root).pdf());
