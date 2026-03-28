import { Column, Row, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const ACCENT = "#2563eb";
const MUTED = "#64748b";
const BG = "#f8fafc";

// ── Section header used in the table-like grid ──────────────────────────────
const sectionHeader = (label: string, bg: string) =>
  Text(label)
    .size(13)
    .weight("bold")
    .color("white")
    .bg(bg)
    .padding(6, 14)
    .orientation(270)
    .alignSelf("stretch");

// ── A data cell ──────────────────────────────────────────────────────────────
const cell = (value: string, sub?: string) =>
  Column(
    Text(value).size(22).weight("bold").color("#0f172a"),
    ...(sub ? [Text(sub).size(13).color(MUTED)] : []),
  )
    .padding(14, 18)
    .gap(4)
    .bg("white")
    .borderWidth(1)
    .borderColor("#e2e8f0");

// ── A rotated column header (90°) ─────────────────────────────────────────────
const colHeader = (text: string) =>
  Text(text)
    .size(13)
    .weight("bold")
    .color("white")
    .bg(ACCENT)
    .padding(8, 12)
    .orientation(90);

// ── Paragraph body ───────────────────────────────────────────────────────────
const body = (text: string) =>
  Text(text).size(15).color("#334155").lineHeight(1.6);

// ════════════════════════════════════════════════════════════════════════════
// Layout
// ════════════════════════════════════════════════════════════════════════════

const root = Column(
  // ── Title ─────────────────────────────────────────────────────────────────
  Text("Text Orientation Demo")
    .size(32)
    .weight("bold")
    .color("#0f172a"),
  Text("Showing how 0° / 90° / 180° / 270° blend with surrounding layout.")
    .size(15)
    .color(MUTED),

  // ── Side-label + body block ──────────────────────────────────────────────
  Row(
    sectionHeader("INTRODUCTION", "#7c3aed"),
    Column(
      body(
        "Each orientation value rotates the text AND adjusts the Yoga layout " +
          "footprint accordingly. At 90° and 270° the node's width and height are " +
          "swapped so neighbouring elements flow naturally around the rotated block.",
      ),
      body(
        "At 180° the layout footprint is unchanged — only the canvas transform " +
          "is applied, flipping the text upside-down within the same box.",
      ),
    )
      .gap(12)
      .padding(20)
      .bg("white")
      .borderWidth(1)
      .borderColor("#e2e8f0")
      .shrink(1),
  ).alignItems("stretch"),

  // ── Stats grid with rotated row labels ───────────────────────────────────
  Row(
    // row labels (270° — bottom-to-top)
    Column(
      Text("")
        .size(13)
        .padding(6, 14)
        .bg("transparent"), // spacer for col headers
      sectionHeader("Q1 2025", "#0891b2"),
      sectionHeader("Q2 2025", "#0891b2"),
      sectionHeader("Q3 2025", "#0891b2"),
      sectionHeader("Q4 2025", "#0891b2"),
    ).gap(4),

    // data columns
    Column(
      colHeader("Revenue"),
      cell("$1.2 M", "+12%"),
      cell("$1.4 M", "+17%"),
      cell("$1.7 M", "+21%"),
      cell("$2.1 M", "+24%"),
    ).gap(4),

    Column(
      colHeader("Users"),
      cell("48 k", "↑ 3.2 k"),
      cell("55 k", "↑ 7 k"),
      cell("63 k", "↑ 8 k"),
      cell("79 k", "↑ 16 k"),
    ).gap(4),

    Column(
      colHeader("Churn"),
      cell("4.1 %", "−0.3"),
      cell("3.8 %", "−0.3"),
      cell("3.5 %", "−0.3"),
      cell("3.1 %", "−0.4"),
    ).gap(4),

    Column(
      colHeader("NPS"),
      cell("42", "baseline"),
      cell("47", "+5"),
      cell("51", "+4"),
      cell("58", "+7"),
    ).gap(4),
  )
    .gap(4)
    .alignItems("flex-start"),

  // ── Flipped callout ───────────────────────────────────────────────────────
  Row(
    Column(
      Text("180°").size(11).color(MUTED).alignSelf("center"),
      Text("NOTICE: this text is intentionally upside-down.")
        .size(16)
        .weight("bold")
        .color("white")
        .bg("#dc2626")
        .padding(10, 20)
        .orientation(180),
    )
      .gap(6)
      .alignItems("center"),
    Column(
      body(
        "The 180° orientation is useful for mirrored labels, stamp-style " +
          "annotations, or any design element that needs to appear inverted " +
          "without changing the space it occupies in the flow.",
      ),
    )
      .padding(16)
      .bg("white")
      .borderWidth(1)
      .borderColor("#fca5a5")
      .shrink(1),
  )
    .gap(24)
    .alignItems("center"),

  // ── Mixed inline row ──────────────────────────────────────────────────────
  Row(
    Text("Read →").size(14).color(MUTED).alignSelf("center"),
    Text("Top to bottom")
      .size(14)
      .color(ACCENT)
      .bg("#eff6ff")
      .padding(6, 12)
      .orientation(90),
    Text("or").size(14).color(MUTED).alignSelf("center"),
    Text("Bottom to top")
      .size(14)
      .color("#7c3aed")
      .bg("#f5f3ff")
      .padding(6, 12)
      .orientation(270),
    Text("alongside normal").size(14).color(MUTED).alignSelf("center"),
    Text("left-to-right text.").size(14).color("#0f172a").alignSelf("center"),
  )
    .gap(12)
    .alignItems("flex-end"),

  // ── Footer ────────────────────────────────────────────────────────────────
  Row(
    Text("Generated by ").size(13).color(MUTED).alignSelf("center"),
    Text("Sone")
      .size(13)
      .weight("bold")
      .color("white")
      .bg("#0f172a")
      .padding(4, 10)
      .rounded(6),
    Text("— declarative canvas layout engine")
      .size(13)
      .color(MUTED)
      .alignSelf("center"),
  )
    .gap(8)
    .alignSelf("flex-end"),
)
  .bg(BG)
  .padding(48)
  .gap(32)
  .maxWidth(1000);

await writeCanvasToFile(root, import.meta.url);
