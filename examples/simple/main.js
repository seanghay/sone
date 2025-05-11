import fs from "node:fs/promises";
import { sone, Column, Text, Span } from "sonejs";

function Document() {
  return Column(
    Text(
      "Hello world! ",
      Span("Sone.")
        .color("orange")
        .weight("bold")
        .shadow("2px 2px 0px rgba(0,0,0,.2)"),
      " 😍🇰🇭",
    ).size(34),
  ).padding(40);
}

// save as Image
await fs.writeFile("output.png", await sone(Document).png());
await fs.writeFile("output.png", await sone(Document).pdf());
