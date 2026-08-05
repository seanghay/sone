import { Column, Grid, Text } from "../../src/index.ts";
import { writeCanvasToFile } from "./utils.ts";

const chip = (label: string, ...shadows: string[]) =>
  Column(
    Column(
      Text(label).size(11).weight("bold").font("GeistMono").color("#334155"),
    )
      .size(180, 110)
      .rounded(16)
      .bg("#ffffff")
      .padding(12)
      .justifyContent("flex-end")
      .shadow(...shadows),
  ).padding(14);

const root = Column(
  Text("Box Shadows").size(30).weight("bold").color("#0f172a"),
  Text("Offsets, blur, colour, and layered multi-shadows.")
    .size(13)
    .color("#475569")
    .marginTop(4),
  Grid(
    chip("soft", "0 8px 24px rgba(15,23,42,0.18)"),
    chip("tight", "0 2px 4px rgba(15,23,42,0.30)"),
    chip("far", "0 28px 60px rgba(15,23,42,0.28)"),
    chip("directional", "18px 18px 0 rgba(2,132,199,0.35)"),
    chip("coloured", "0 12px 32px rgba(219,39,119,0.45)"),
    chip(
      "layered",
      "0 1px 2px rgba(15,23,42,0.20)",
      "0 8px 16px rgba(15,23,42,0.14)",
      "0 24px 48px rgba(15,23,42,0.12)",
    ),
  )
    .columns("1fr", "1fr", "1fr")
    .columnGap(18)
    .rowGap(18)
    .marginTop(24),
)
  .bg("linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)")
  .padding(40)
  .gap(0);

await writeCanvasToFile(root, import.meta.url);
