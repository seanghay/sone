/**
 * Verify YOLO bbox correctness by converting normalised coords back to pixels
 * and drawing them on a fresh render of the same scene.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Column,
  Row,
  Span,
  sone,
  Text,
  toYoloDataset,
} from "../../src/node.ts";

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
const T2 = [280, 380, 480] as const;

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

// ── Render ────────────────────────────────────────────────────────────────────
const { canvas, metadata } = await sone(root).canvasWithMetadata();
const ctx = (canvas as any).getContext("2d") as CanvasRenderingContext2D;

// ── Build YOLO dataset ────────────────────────────────────────────────────────
const ds = toYoloDataset(metadata, {
  granularity: "segment",
  include: ["text"],
  catchAllClass: null,
});

// ── Class → colour mapping ────────────────────────────────────────────────────
const CLASS_COLORS: Record<string, string> = {
  "col-header": "#06b6d4",
  section: "#a855f7",
  row: "#3b82f6",
  subtotal: "#f59e0b",
  total: "#ef4444",
  "margin-row": "#22c55e",
  change: "#f97316",
  delta: "#ec4899",
};
const FALLBACK_COLORS = ["#64748b", "#0ea5e9", "#84cc16", "#f43f5e"];
const colorForClass = (name: string, id: number) =>
  CLASS_COLORS[name] ?? FALLBACK_COLORS[id % FALLBACK_COLORS.length];

// ── Draw boxes from normalised YOLO coords ────────────────────────────────────
const { imageWidth: iw, imageHeight: ih } = ds;
const LABEL_H = 9;

for (const b of ds.boxes) {
  // Convert normalised → pixel
  const px = b.cx * iw - (b.w * iw) / 2;
  const py = b.cy * ih - (b.h * ih) / 2;
  const pw = b.w * iw;
  const ph = b.h * ih;

  const color = colorForClass(b.className, b.classId);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);

  // Label chip
  ctx.font = `bold ${LABEL_H}px monospace`;
  const label = `${b.classId}:${b.className}`;
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = color;
  ctx.fillRect(px, py - LABEL_H - 1, tw + 4, LABEL_H + 2);
  ctx.fillStyle = "white";
  ctx.fillText(label, px + 2, py - 2);
  ctx.restore();
}

// ── Save ──────────────────────────────────────────────────────────────────────
const outFile = path.join(
  path.parse(fileURLToPath(import.meta.url)).dir,
  "tab-stops-1-bbox-yolo.jpg",
);

await fs.writeFile(
  outFile,
  // @ts-expect-error skia-canvas Buffer API
  await (canvas as any).toBuffer("jpg", { density: 2 }),
);

console.log(`saved → ${outFile}`);
console.log(`boxes: ${ds.boxes.length}  classes: ${ds.classes.size}`);
