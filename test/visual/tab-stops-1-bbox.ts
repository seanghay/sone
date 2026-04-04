import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TextProps } from "../../src/core.ts";
import type { SoneMetadata } from "../../src/metadata.ts";
import { Column, Row, Span, sone, Text } from "../../src/node.ts";

// ── Palette ───────────────────────────────────────────────────────────────────
const INK = "#0f172a";
const MUTED = "#64748b";
const RULE = "#e2e8f0";
const ACCENT = "#1d4ed8";
const GREEN = "#15803d";
const RED = "#b91c1c";
const HEADER_BG = "#1e3a5f";
const ALT_BG = "#f8fafc";

const T = [340, 460, 560] as const;

const divider = (color = RULE, h = 1) =>
  Row().height(h).bg(color).alignSelf("stretch");

const colHeader = (label: string) =>
  Text(label)
    .size(11)
    .weight("bold")
    .color("white")
    .tabStops(...T)
    .tag("col-header");

const sectionLabel = (label: string) =>
  Text(label)
    .size(12)
    .weight("bold")
    .color(ACCENT)
    .marginTop(10)
    .marginBottom(2)
    .tag("section");

type ChangeStyle = "up" | "down" | "flat";

const row = (
  label: string,
  a: string,
  b: string,
  change: string,
  style: ChangeStyle = "flat",
  bold = false,
  rowTag?: string,
) => {
  const changeColor = style === "up" ? GREEN : style === "down" ? RED : MUTED;
  return Text(
    label,
    "\t",
    a,
    "\t",
    b,
    "\t",
    Span(change)
      .color(changeColor)
      .weight(bold ? "bold" : "normal")
      .tag("change"),
  )
    .tabStops(...T)
    .size(13)
    .color(bold ? INK : "#334155")
    .weight(bold ? "bold" : "normal")
    .tag(rowTag ?? "row");
};

const subtotalRow = (
  label: string,
  a: string,
  b: string,
  change: string,
  style: ChangeStyle = "flat",
) =>
  Column(
    divider("#cbd5e1"),
    row(label, a, b, change, style, true, "subtotal"),
  ).gap(4);

const totalRow = (
  label: string,
  a: string,
  b: string,
  change: string,
  style: ChangeStyle = "flat",
) =>
  Column(
    divider(ACCENT, 2),
    row(label, a, b, change, style, true, "total"),
    divider(ACCENT),
  ).gap(5);

const T2 = [280, 380, 480] as const;

const marginRow = (
  label: string,
  fy23: string,
  fy24: string,
  delta: string,
  up: boolean,
) =>
  Text(
    label,
    "\t",
    fy23,
    "\t",
    fy24,
    "\t",
    Span(delta)
      .color(up ? GREEN : RED)
      .tag("delta"),
  )
    .tabStops(...T2)
    .size(13)
    .color("#334155")
    .tag("margin-row");

// ── Same root as tab-stops-1.ts ───────────────────────────────────────────────
const root = Column(
  Column(
    Text("ATLAS MERIDIAN CORPORATION")
      .size(22)
      .weight("bold")
      .color("white")
      .letterSpacing(1),
    Text("Consolidated Income Statement  ·  Years ended December 31")
      .size(13)
      .color("rgba(255,255,255,0.75)")
      .marginTop(4),
    Text("Amounts in USD thousands  ·  Unaudited")
      .size(11)
      .color("rgba(255,255,255,0.5)")
      .marginTop(2),
  )
    .bg(HEADER_BG)
    .padding(28, 32),

  Column(
    colHeader("Account\tFY 2023\tFY 2024\tYoY Change"),
    divider("rgba(255,255,255,0.25)"),
  )
    .bg(HEADER_BG)
    .padding(6, 32, 8),

  Column(
    sectionLabel("REVENUE"),
    row("  Software subscriptions", "84,210", "103,450", "+22.8%", "up"),
    row("  Professional services", "12,880", " 15,320", "+18.9%", "up"),
    row("  Hardware & other", " 6,740", "  7,090", " +5.2%", "up"),
    row("  Contra revenue / refunds", "(1,205)", "(1,380)", " +14.5%", "down"),
    subtotalRow("Total Revenue", "102,625", "124,480", "+21.3%", "up"),

    sectionLabel("COST OF REVENUE"),
    row("  Cloud infrastructure", "18,320", " 21,900", "+19.5%", "down"),
    row("  Support & operations", " 7,460", "  8,110", " +8.7%", "down"),
    row("  Third-party licenses", " 3,210", "  3,580", "+11.5%", "down"),
    subtotalRow("Total Cost of Revenue", "28,990", "33,590", "+15.9%", "down"),

    Row().height(4),
    totalRow("Gross Profit", " 73,635", " 90,890", "+23.4%", "up"),

    sectionLabel("OPERATING EXPENSES"),
    row("  Sales & marketing", "22,180", " 26,340", "+18.7%", "down"),
    row("  Research & development", "18,950", " 24,610", "+29.9%", "down"),
    row("  General & administrative", " 9,320", " 10,050", " +7.8%", "down"),
    row("  Restructuring charges", "    —", "  1,200", "  n/m", "down"),
    row("  Stock-based compensation", " 6,840", "  8,120", "+18.7%", "down"),
    subtotalRow("Total OpEx", "57,290", " 70,320", "+22.7%", "down"),

    Row().height(4),
    totalRow("Operating Income (EBIT)", "16,345", " 20,570", "+25.9%", "up"),
    row("  D&A add-back", " 4,210", "  5,330", "+26.6%", "up"),
    subtotalRow("EBITDA", "20,555", " 25,900", "+26.0%", "up"),

    sectionLabel("BELOW THE LINE"),
    row("  Interest income", "   620", "  1,140", "+83.9%", "up"),
    row("  Interest expense", "(2,450)", "(2,280)", " −7.3%", "up"),
    row("  FX gain / (loss)", "  (340)", "    280", "n/m", "up"),
    row("  Other income", "   180", "    220", "+22.2%", "up"),

    Row().height(4),
    totalRow("Pre-tax Income", "14,355", " 19,930", "+38.8%", "up"),
    row("  Income tax provision", "(3,230)", "(4,630)", "+43.3%", "down"),
    Row().height(4),
    totalRow("Net Income", "11,125", " 15,300", "+37.5%", "up"),

    Row().height(6),
    sectionLabel("PER SHARE DATA"),
    row("  Basic EPS", "  $2.41", "  $3.29", "+36.5%", "up"),
    row("  Diluted EPS", "  $2.37", "  $3.23", "+36.3%", "up"),
    row("  Weighted avg shares (M)", "  46.2", "  46.5", "+0.6%", "flat"),
  )
    .padding(16, 32, 20)
    .bg("white")
    .gap(3),

  Column(
    Text("KEY MARGIN ANALYSIS")
      .size(11)
      .weight("bold")
      .color("white")
      .letterSpacing(0.5),
    divider("rgba(255,255,255,0.2)"),
    Text("Metric\tFY 2023\tFY 2024\tChange")
      .size(11)
      .weight("bold")
      .color("rgba(255,255,255,0.7)")
      .tabStops(...T2)
      .tag("col-header"),
  )
    .bg("#1e3a5f")
    .padding(12, 32, 8)
    .gap(6),

  Column(
    marginRow("Gross Margin", "71.8%", "73.0%", "+1.2 pp", true),
    marginRow("EBITDA Margin", "20.0%", "20.8%", "+0.8 pp", true),
    marginRow("Operating Margin", "15.9%", "16.5%", "+0.6 pp", true),
    marginRow("Net Margin", "10.8%", "12.3%", "+1.4 pp", true),
    marginRow("R&D as % of Revenue", "18.5%", "19.8%", "+1.3 pp", false),
    marginRow("S&M as % of Revenue", "21.6%", "21.2%", "−0.4 pp", true),
  )
    .padding(10, 32, 16)
    .bg(ALT_BG)
    .gap(5),

  Row(
    Text("This statement is for illustrative purposes only.")
      .size(10)
      .color(MUTED),
    Text("Prepared with Sone canvas engine")
      .size(10)
      .color(MUTED)
      .alignSelf("flex-end"),
  )
    .padding(10, 32)
    .bg("#f1f5f9")
    .justifyContent("space-between")
    .alignItems("center"),
)
  .width(680)
  .bg("white")
  .borderWidth(1)
  .borderColor(RULE)
  .rounded(6)
  .shadow("0 4px 24px rgba(0,0,0,0.10)");

// ── Render + overlay bboxes ───────────────────────────────────────────────────
const { canvas, metadata } = await sone(root).canvasWithMetadata();
const ctx = (canvas as any).getContext("2d") as CanvasRenderingContext2D;

const PALETTE: Record<string, { stroke: string; fill: string }> = {
  "col-header": { stroke: "#06b6d4", fill: "rgba(6,182,212,0.15)" },
  section: { stroke: "#a855f7", fill: "rgba(168,85,247,0.15)" },
  row: { stroke: "#3b82f6", fill: "rgba(59,130,246,0.12)" },
  subtotal: { stroke: "#f59e0b", fill: "rgba(245,158,11,0.15)" },
  total: { stroke: "#ff4040", fill: "rgba(255,64,64,0.15)" },
  "margin-row": { stroke: "#22c55e", fill: "rgba(34,197,94,0.12)" },
  change: { stroke: "#f97316", fill: "rgba(249,115,22,0.20)" },
  delta: { stroke: "#ec4899", fill: "rgba(236,72,153,0.20)" },
};

const DEFAULT_COLOR = { stroke: "#94a3b8", fill: "rgba(148,163,184,0.10)" };

const LABEL_FONT_SIZE = 8;

function drawLabel(text: string, x: number, y: number, color: string) {
  const pad = 2;
  ctx.save();
  ctx.font = `bold ${LABEL_FONT_SIZE}px monospace`;
  const tw = ctx.measureText(text).width;
  ctx.fillStyle = color;
  ctx.fillRect(x, y - LABEL_FONT_SIZE, tw + pad * 2, LABEL_FONT_SIZE + 1);
  ctx.fillStyle = "white";
  ctx.fillText(text, x + pad, y - 1);
  ctx.restore();
}

function overlayBboxes(node: SoneMetadata) {
  if (node.type === "text") {
    const props = node.props as TextProps;
    const blocks = props.blocks;
    if (!blocks?.length) return;

    const nodeTag = node.tag;
    const nodeColors = (nodeTag && PALETTE[nodeTag]) ?? DEFAULT_COLOR;

    for (const { paragraph } of blocks) {
      for (const line of paragraph.lines) {
        for (const segment of line.segments) {
          const r = segment.run;
          if (r == null || r.width === 0) continue;
          if (segment.isTab || segment.text.trim() === "") continue;

          // Determine color: prefer span tag, fall back to node tag
          const spanTag = segment.props?.tag;
          const { stroke, fill } = (spanTag && PALETTE[spanTag]) ?? nodeColors;

          ctx.save();
          ctx.fillStyle = fill;
          ctx.fillRect(r.x, r.y, r.width, r.height);
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 1;
          ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.width - 1, r.height - 1);
          ctx.restore();

          // Draw label for tagged segments or tagged text nodes
          const label = spanTag ?? nodeTag;
          if (label) {
            drawLabel(label, r.x, r.y, stroke);
          }
        }
      }
    }

    return;
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child != null && typeof child === "object" && "type" in child) {
        overlayBboxes(child as SoneMetadata);
      }
    }
  }
}

overlayBboxes(metadata);

const outFile = path.join(
  path.parse(fileURLToPath(import.meta.url)).dir,
  "tab-stops-1-bbox.jpg",
);

await fs.writeFile(
  outFile,
  // @ts-expect-error skia-canvas Buffer API
  await (canvas as any).toBuffer("jpg", { density: 2 }),
);
