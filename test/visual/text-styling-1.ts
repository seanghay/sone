import { Column, Span, Text } from "../../src/node.ts";
import { loadVisualTestFonts } from "./load-test-fonts.ts";
import { writeCanvasToFile } from "./utils.ts";

await loadVisualTestFonts();

const root = Column(
  Text("Text styling regression board")
    .font("GeistMono")
    .size(30)
    .weight("bold")
    .color("#2f241f"),
  Text(
    Span("Underline").underline(1.4).underlineColor("#1d3557"),
    "  ",
    Span("Overline").overline(1.4).overlineColor("#2d6a4f"),
    "  ",
    Span("Strike").lineThrough(1.6).lineThroughColor("#8a2d3b"),
  )
    .font("GeistMono")
    .size(30)
    .padding(24)
    .bg("white")
    .borderColor("#d7c4b6")
    .borderWidth(2)
    .rounded(24)
    .color("#1f1a17"),
  Text(
    Span("Highlight").highlight("#ffe08a"),
    "  ",
    Span("Stroke").strokeColor("#1d3557").strokeWidth(2).color("white"),
    "  ",
    Span("Shadow").dropShadow("3px 3px 0px rgba(29,53,87,0.45)"),
  )
    .font("GeistMono")
    .size(34)
    .padding(24)
    .bg("white")
    .borderColor("#d7c4b6")
    .borderWidth(2)
    .rounded(24)
    .color("#2f241f"),
  Text(
    Span("Raised").offsetY(-10).color("#1d3557"),
    " baseline ",
    Span("Lowered").offsetY(10).color("#8a2d3b"),
    "\n",
    Span("Wide tracking").letterSpacing(2.4),
    " / ",
    Span("wide words").wordSpacing(8),
  )
    .font("GeistMono")
    .size(28)
    .lineHeight(1.5)
    .padding(24)
    .bg("white")
    .borderColor("#d7c4b6")
    .borderWidth(2)
    .rounded(24)
    .color("#2f241f"),
)
  .gap(22)
  .padding(40)
  .bg("#f7f3ec");

await writeCanvasToFile(root, import.meta.url);
