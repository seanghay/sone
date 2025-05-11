import fs from "node:fs/promises";
import { sone, Column, Text, Span } from "../src/sone.js";

function Document() {
  return Column(
    Text(
      "Hello world! ",
      Span("Sone.")
        .color("orange")
        .weight("bold")
        .shadow("2px 2px 0px rgba(0,0,0,.2)"),
      " 😍 🇰🇭",
    ).size(34),
  ).padding(40);
}

const canvas = sone(Document).canvas();
await fs.writeFile("test/output.png", await canvas.toBuffer("image/png"));
await fs.writeFile("test/output.pdf", await canvas.toBuffer("application/pdf"));
