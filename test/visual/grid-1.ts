import { Column, Grid, Row, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const surface = (...children: Parameters<typeof Column>) =>
  Column(...children)
    .padding(22)
    .rounded(24)
    .borderWidth(1)
    .borderColor("rgba(255,255,255,0.12)")
    .shadow("0 18px 48px rgba(15,23,42,0.22)");

const metric = (eyebrow: string, value: string, note: string, accent: string) =>
  surface(
    Text(eyebrow).size(11).weight("bold").font("monospace").color("#94a3b8"),
    Text(value).size(34).weight("bold").color("#f8fafc"),
    Row(
      Column().size(9).bg(accent).rounded(999),
      Text(note).size(11).color("#cbd5e1"),
    )
      .gap(8)
      .alignItems("center"),
  )
    .gap(12)
    .bg("linear-gradient(180deg, #0f172a 0%, #111827 100%)");

const ribbon = (label: string, value: string, fill: string) =>
  Column(
    Row(
      Text(label).size(10).weight("bold").font("monospace").color("#64748b"),
      Text(value).size(10).weight("bold").color("#e2e8f0"),
    ).justifyContent("space-between"),
    Column().height(10).bg(fill).rounded(999),
  ).gap(10);

const root = Column(
  Row(
    Column(
      Text("GRID SYSTEM / 01")
        .size(12)
        .weight("bold")
        .font("monospace")
        .color("#f97316"),
      Text("Night Shift Control Room").size(42).weight("bold").color("#f8fafc"),
    ).gap(10),
    Text(
      "Auto placement, spans, and fixed/fr tracks rendered as a live dashboard.",
    )
      .size(14)
      .lineHeight(1.5)
      .color("#94a3b8")
      .width(320),
  ).justifyContent("space-between"),
  Grid(
    surface(
      Text("OVERVIEW")
        .size(11)
        .weight("bold")
        .font("monospace")
        .color("#fdba74"),
      Text("All systems stable. Dispatch pressure is down 18% from yesterday.")
        .size(30)
        .weight("bold")
        .lineHeight(1.25)
        .color("#fff7ed"),
      Text(
        "This hero block spans two columns and anchors the composition with a higher-contrast background and a denser typographic rhythm.",
      )
        .size(13)
        .lineHeight(1.6)
        .color("rgba(255,247,237,0.8)"),
      Grid(
        ribbon("Response", "89%", "#fb923c"),
        ribbon("Routing", "74%", "#facc15"),
        ribbon("Staffing", "63%", "#38bdf8"),
      )
        .columns("1fr", "1fr", "1fr")
        .columnGap(12)
        .width("100%"),
    )
      .gridColumn(1, 2)
      .height(250)
      .gap(18)
      .bg("linear-gradient(135deg, #7c2d12 0%, #111827 55%, #0f172a 100%)"),
    metric("REVENUE", "$82.4K", "Night window +6.3%", "#34d399")
      .gridColumn(3)
      .gridRow(1),
    metric("QUEUE", "148", "Backlog cleared", "#f59e0b")
      .gridColumn(3)
      .gridRow(2),
    surface(
      Text("ACTIVE USERS")
        .size(11)
        .weight("bold")
        .font("monospace")
        .color("#94a3b8"),
      Text("12.8K").size(34).weight("bold").color("#f8fafc"),
      Text("Blue shift occupancy peaks at 03:20.")
        .size(12)
        .lineHeight(1.5)
        .color("#cbd5e1"),
    )
      .gap(12)
      .bg("linear-gradient(160deg, #0f172a 0%, #172554 100%)"),
    surface(
      Text("PIPELINE")
        .size(11)
        .weight("bold")
        .font("monospace")
        .color("#94a3b8"),
      Grid(
        ribbon("Ingest", "96%", "#38bdf8"),
        ribbon("Transform", "71%", "#818cf8"),
        ribbon("Publish", "54%", "#f472b6"),
      )
        .columns(150, 150, "1fr")
        .columnGap(14),
      Text(
        "Three differently sized tracks make the lower span feel more editorial than strictly tabular.",
      )
        .size(12)
        .lineHeight(1.6)
        .color("#cbd5e1"),
    )
      .gridColumn(1, 2)
      .height(158)
      .gap(16)
      .bg("linear-gradient(180deg, #111827 0%, #1f2937 100%)"),
    surface(
      Text("NOTES").size(11).weight("bold").font("monospace").color("#78350f"),
      Text(
        "Auto-placed into the last slot to prove the grid can mix explicit placement with regular flow.",
      )
        .size(12)
        .lineHeight(1.6)
        .color("#451a03"),
    )
      .height(158)
      .gap(12)
      .bg("linear-gradient(180deg, #fed7aa 0%, #ffedd5 100%)")
      .borderColor("rgba(146,64,14,0.18)"),
  )
    .columns(250, "1fr", 230)
    .columnGap(18)
    .rowGap(18)
    .width(980),
)
  .bg("linear-gradient(180deg, #020617 0%, #111827 100%)")
  .padding(30)
  .gap(26);

await writeCanvasToFile(root, import.meta.url);
