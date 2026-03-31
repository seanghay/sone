import { Column, Grid, Row, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const sheet = (...children: Parameters<typeof Column>) =>
  Column(...children)
    .padding(20)
    .rounded(22)
    .borderWidth(1)
    .borderColor("rgba(91,33,24,0.10)")
    .shadow("0 14px 36px rgba(120,53,15,0.10)");

const capsule = (label: string, tone: string, bg: string) =>
  Row(Text(label).size(11).weight("bold").font("monospace").color(tone))
    .padding(7, 11)
    .bg(bg)
    .rounded(999);

const brief = (title: string, value: string, note: string, accent: string) =>
  sheet(
    Text(title).size(11).weight("bold").font("monospace").color("#9a3412"),
    Text(value).size(28).weight("bold").color("#431407"),
    Text(note).size(11).lineHeight(1.5).color(accent),
  )
    .gap(8)
    .bg("#fffaf2");

const dotLine = (color: string, text: string) =>
  Row(
    Column().size(12).bg(color).rounded(999),
    Text(text).size(12).color("#44403c"),
  )
    .gap(10)
    .alignItems("center");

const root = Column(
  Row(
    Column(
      Text("GRID SYSTEM / 02")
        .size(12)
        .weight("bold")
        .font("monospace")
        .color("#b45309"),
      Text("Editorial Planning Board").size(40).weight("bold").color("#3f1d14"),
    ).gap(10),
    Text(
      "Nested grids with explicit spans, softer contrast, and a warmer material palette.",
    )
      .size(14)
      .lineHeight(1.5)
      .color("#7c5a46")
      .width(320),
  ).justifyContent("space-between"),
  Grid(
    sheet(
      Text("STATUS").size(11).weight("bold").font("monospace").color("#92400e"),
      Text("Stable").size(42).weight("bold").color("#3f1d14"),
      Row(
        capsule("API OK", "#166534", "#dcfce7"),
        capsule("Queue Normal", "#1d4ed8", "#dbeafe"),
        capsule("Alerts 2", "#b91c1c", "#fee2e2"),
      )
        .gap(10)
        .wrap("wrap"),
      Text(
        "A tall single-column span creates the left-hand anchor for the entire page.",
      )
        .size(12)
        .lineHeight(1.6)
        .color("#7c5a46"),
    )
      .gridColumn(1)
      .gridRow(1, 2)
      .height(356)
      .gap(16)
      .bg("linear-gradient(180deg, #fef3c7 0%, #fff7ed 100%)"),
    sheet(
      Row(
        Text("WEEKLY SUMMARY")
          .size(11)
          .weight("bold")
          .font("monospace")
          .color("#9a3412"),
        Text("Issue 18").size(11).weight("bold").color("#b45309"),
      ).justifyContent("space-between"),
      Grid(
        brief("Deploys", "18", "Compared to last week", "#15803d"),
        brief("Errors", "3", "Escalated but contained", "#b91c1c"),
        brief("Latency", "187ms", "Holding steady", "#1d4ed8"),
        brief("Uptime", "99.98%", "No action required", "#7c3aed"),
      )
        .columns("1fr", "1fr")
        .columnGap(14)
        .rowGap(14),
    )
      .gridColumn(2, 2)
      .gridRow(1)
      .gap(14)
      .bg("white"),
    sheet(
      Text("TIMELINE")
        .size(11)
        .weight("bold")
        .font("monospace")
        .color("#9a3412"),
      Column(
        dotLine("#22c55e", "Backup completed"),
        dotLine("#3b82f6", "Release candidate deployed"),
        dotLine("#f59e0b", "Review scheduled for 14:00"),
      ).gap(14),
    )
      .height(164)
      .gap(14)
      .bg("#fffaf2"),
    sheet(
      Text("AUTO-PLACED NOTE")
        .size(11)
        .weight("bold")
        .font("monospace")
        .color("#9a3412"),
      Text(
        "This card is intentionally left unpositioned so it falls into the next open slot after the timeline panel.",
      )
        .size(12)
        .lineHeight(1.7)
        .color("#6b4f3f"),
    )
      .height(164)
      .gap(14)
      .bg("linear-gradient(180deg, #ffffff 0%, #fff7ed 100%)"),
    sheet(
      Row(
        Column(
          Text("FOOTER STRIP")
            .size(11)
            .weight("bold")
            .font("monospace")
            .color("#9a3412"),
          Text("Three-column span across the closing row.")
            .size(13)
            .color("#6b4f3f"),
        ).gap(8),
        Text("Layout remains readable even with a wide spanning block.")
          .size(12)
          .lineHeight(1.6)
          .color("#7c5a46")
          .width(260),
      ).justifyContent("space-between"),
    )
      .gridColumn(1, 3)
      .height(120)
      .bg("linear-gradient(90deg, #fcd34d 0%, #fed7aa 45%, #fff7ed 100%)"),
  )
    .columns(220, "1fr", "1fr")
    .columnGap(18)
    .rowGap(18)
    .width(980),
)
  .bg("linear-gradient(180deg, #fffaf2 0%, #f8efe2 100%)")
  .padding(30)
  .gap(24);

await writeCanvasToFile(root, import.meta.url);
