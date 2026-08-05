import { Column, Grid, Row, Span, Text } from "../../src/index.ts";
import { writeCanvasToFile } from "./utils.ts";

const swatch = (label: string, gradient: string) =>
  Column(Text(label).size(11).weight("bold").font("GeistMono").color("#f8fafc"))
    .size(150, 90)
    .rounded(12)
    .bg(gradient)
    .padding(10)
    .justifyContent("flex-end");

const root = Column(
  Text("Gradients").size(30).weight("bold").color("#f8fafc"),
  Text("Linear angles, multi-stop ramps, and gradient-filled text.")
    .size(13)
    .color("#94a3b8")
    .marginTop(4),

  // Directional angles
  Grid(
    swatch("0deg", "linear-gradient(0deg, #22d3ee, #4f46e5)"),
    swatch("45deg", "linear-gradient(45deg, #f97316, #db2777)"),
    swatch("90deg", "linear-gradient(90deg, #22c55e, #0ea5e9)"),
    swatch("135deg", "linear-gradient(135deg, #a855f7, #ec4899)"),
    swatch("to top", "linear-gradient(to top, #0f172a, #38bdf8)"),
    swatch(
      "3-stop",
      "linear-gradient(90deg, #ef4444 0%, #eab308 50%, #22c55e 100%)",
    ),
    swatch(
      "5-stop",
      "linear-gradient(120deg, #f43f5e, #f59e0b, #84cc16, #06b6d4, #8b5cf6)",
    ),
    swatch(
      "soft",
      "linear-gradient(160deg, #1e293b 0%, #334155 60%, #64748b 100%)",
    ),
  )
    .columns("1fr", "1fr", "1fr", "1fr")
    .columnGap(16)
    .rowGap(16)
    .marginTop(24),

  // Gradient-filled text
  Row(
    Text(
      Span("Gradient ").color(
        "linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)",
      ),
      Span("Text").color("linear-gradient(90deg, #f97316 0%, #ef4444 100%)"),
    )
      .size(64)
      .weight("bold"),
  ).marginTop(28),
)
  .bg("#020617")
  .padding(36)
  .gap(0);

await writeCanvasToFile(root, import.meta.url);
