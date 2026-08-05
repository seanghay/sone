import { Column, Span, Text } from "../../src/index.ts";
import { writeCanvasToFile } from "./utils.ts";

const row = (...children: Parameters<typeof Text>) =>
  Text(...children)
    .size(26)
    .lineHeight(1.9)
    .color("#0f172a");

const root = Column(
  Text("Text Decorations").size(30).weight("bold").color("#0f172a"),
  Text("Underline, overline, strike, highlight, tracking, and outline.")
    .size(13)
    .color("#475569")
    .marginTop(4)
    .marginBottom(20),

  row(
    Span("underline ").underline(2).underlineColor("#2563eb"),
    Span("overline ").overline(2).overlineColor("#16a34a"),
    Span("strike").lineThrough(2).lineThroughColor("#dc2626"),
  ),
  row(
    "a ",
    Span("highlighted").highlight("#fde047"),
    " and ",
    Span("coloured").color("#7c3aed").weight("bold"),
    " run",
  ),
  row(
    Span("tight").letterSpacing(-1),
    "  normal  ",
    Span("l o o s e").letterSpacing(4),
  ),
  Text("wide  word  spacing  demo").size(26).wordSpacing(14).color("#0f172a"),

  // Outline / stroked text
  Text("OUTLINE")
    .size(72)
    .weight("bold")
    .color("transparent")
    .strokeColor("#0ea5e9")
    .strokeWidth(2)
    .marginTop(10),
  Text("FILL + STROKE")
    .size(56)
    .weight("bold")
    .color("#f8fafc")
    .strokeColor("#0f172a")
    .strokeWidth(3),
)
  .bg("linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)")
  .padding(40)
  .gap(10);

await writeCanvasToFile(root, import.meta.url);
