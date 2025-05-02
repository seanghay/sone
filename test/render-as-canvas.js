import fs from "node:fs/promises";
import { renderAsCanvas, Column, Text, Span } from "../src/sone.js";

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
const document = Document();

const canvas = renderAsCanvas(Document(), undefined, undefined);
await fs.writeFile("test/output.png", canvas.toBuffer("image/png"));

const canvas2 = renderAsCanvas(document, undefined, undefined, "pdf");
await fs.writeFile("test/output.pdf", canvas2.toBuffer("application/pdf"));
