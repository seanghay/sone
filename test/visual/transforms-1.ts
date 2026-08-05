import { Column, Row, Text } from "../../src/index.ts";
import { writeCanvasToFile } from "./utils.ts";

const card = (label: string) =>
  Column(Text(label).size(14).weight("bold").font("GeistMono").color("#0f172a"))
    .size(120, 80)
    .rounded(12)
    .bg("linear-gradient(135deg, #fef08a 0%, #fb923c 100%)")
    .alignItems("center")
    .justifyContent("center")
    .shadow("0 10px 24px rgba(0,0,0,0.35)");

const cell = (label: string, ...children: Parameters<typeof Column>) =>
  Column(
    Column(...children)
      .size(220, 180)
      .rounded(16)
      .bg("#0b1220")
      .borderWidth(1)
      .borderColor("rgba(255,255,255,0.08)")
      .alignItems("center")
      .justifyContent("center"),
    Text(label)
      .size(11)
      .weight("bold")
      .font("GeistMono")
      .color("#94a3b8")
      .marginTop(8),
  ).alignItems("center");

const root = Column(
  Text("Transforms").size(30).weight("bold").color("#f8fafc"),
  Text("rotate · scale · translate, each around the element center.")
    .size(13)
    .color("#94a3b8")
    .marginTop(4),
  Row(
    cell("rotate(-12)", card("−12°").rotate(-12)),
    cell("rotate(20)", card("20°").rotate(20)),
    cell("scale(1.4)", card("1.4×").scale(1.4)),
    cell("scale(1.6, 0.7)", card("x/y").scale(1.6, 0.7)),
    cell(
      "translate + rotate",
      card("shift").translateX(24).translateY(-16).rotate(8),
    ),
  )
    .gap(20)
    .marginTop(24)
    .wrap("wrap"),
)
  .bg("linear-gradient(180deg, #020617 0%, #111827 100%)")
  .padding(36)
  .gap(0);

await writeCanvasToFile(root, import.meta.url);
