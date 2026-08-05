import { Column, Grid, Text } from "../../src/index.ts";
import { writeCanvasToFile } from "./utils.ts";

const box = (label: string, apply: (c: ReturnType<typeof Column>) => unknown) =>
  Column(
    apply(
      Column(
        Text(label).size(11).weight("bold").font("GeistMono").color("#0f172a"),
      )
        .size(180, 120)
        .bg("linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)")
        .borderWidth(2)
        .borderColor("#047857")
        .padding(12)
        .justifyContent("flex-end"),
    ) as never,
  );

const root = Column(
  Text("Corners & Smoothing").size(30).weight("bold").color("#f8fafc"),
  Text("Uniform and per-corner radius, iOS-style squircles, and cut corners.")
    .size(13)
    .color("#94a3b8")
    .marginTop(4),
  Grid(
    box("radius 0", (c) => c),
    box("radius 24", (c) => c.rounded(24)),
    box("radius 60", (c) => c.rounded(60)),
    box("per-corner", (c) => c.cornerRadius(40, 4, 40, 4)),
    box("smoothing 0.6", (c) => c.rounded(36).cornerSmoothing(0.6)),
    box("smoothing 1.0", (c) => c.rounded(36).cornerSmoothing(1)),
    box("cut corners", (c) => c.rounded(28).corner("cut")),
    box("pill", (c) => c.rounded(999)),
  )
    .columns("1fr", "1fr", "1fr", "1fr")
    .columnGap(20)
    .rowGap(20)
    .marginTop(24),
)
  .bg("linear-gradient(180deg, #020617 0%, #0f172a 100%)")
  .padding(36)
  .gap(0);

await writeCanvasToFile(root, import.meta.url);
