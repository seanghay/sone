import fs from "node:fs/promises";
import { renderAsCanvas, Column, Text, Span } from "sonejs";

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
const canvas = renderAsCanvas(Document(), undefined, undefined);
await fs.writeFile("output.png", canvas.toBuffer("image/png"));

// save as PDF
const canvas2 = renderAsCanvas(Document(), undefined, undefined, "pdf");
await fs.writeFile("output.pdf", canvas2.toBuffer("application/pdf"));

