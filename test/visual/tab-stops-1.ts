import { Column, Row, Span, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

// ── Palette ───────────────────────────────────────────────────────────────────
const INK = "#0f172a";
const MUTED = "#64748b";
const RULE = "#e2e8f0";
const ACCENT = "#1d4ed8";
const GREEN = "#15803d";
const RED = "#b91c1c";
const HEADER_BG = "#1e3a5f";
const ALT_BG = "#f8fafc";

// ── Tab stop columns: Description | FY 2023 | FY 2024 | YoY ─────────────────
const T = [340, 460, 560] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
const divider = (color = RULE, h = 1) =>
  Row().height(h).bg(color).alignSelf("stretch");

const colHeader = (label: string) =>
  Text(label)
    .size(11)
    .weight("bold")
    .color("white")
    .tabStops(...T);

const sectionLabel = (label: string) =>
  Text(label)
    .size(12)
    .weight("bold")
    .color(ACCENT)
    .marginTop(10)
    .marginBottom(2);

type ChangeStyle = "up" | "down" | "flat";

const row = (
  label: string,
  a: string,
  b: string,
  change: string,
  style: ChangeStyle = "flat",
  bold = false,
  indent = false,
) => {
  const changeColor = style === "up" ? GREEN : style === "down" ? RED : MUTED;

  return Text(
    indent ? `  ${label}` : label,
    "\t",
    a,
    "\t",
    b,
    "\t",
    Span(change)
      .color(changeColor)
      .weight(bold ? "bold" : "normal"),
  )
    .tabStops(...T)
    .size(13)
    .color(bold ? INK : "#334155")
    .weight(bold ? "bold" : "normal");
};

const subtotalRow = (
  label: string,
  a: string,
  b: string,
  change: string,
  style: ChangeStyle = "flat",
) => Column(divider("#cbd5e1"), row(label, a, b, change, style, true)).gap(4);

const totalRow = (
  label: string,
  a: string,
  b: string,
  change: string,
  style: ChangeStyle = "flat",
) =>
  Column(
    divider(ACCENT, 2),
    row(label, a, b, change, style, true),
    divider(ACCENT),
  ).gap(5);

// ── Margin schedule rows ──────────────────────────────────────────────────────
const T2 = [280, 380, 480] as const;

const marginRow = (
  label: string,
  fy23: string,
  fy24: string,
  delta: string,
  up: boolean,
) =>
  Text(label, "\t", fy23, "\t", fy24, "\t", Span(delta).color(up ? GREEN : RED))
    .tabStops(...T2)
    .size(13)
    .color("#334155");

// ── Document ──────────────────────────────────────────────────────────────────
const root = Column(
  // ── Letterhead ─────────────────────────────────────────────────────────────
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

  // ── Column headers ──────────────────────────────────────────────────────────
  Column(
    colHeader("Account\tFY 2023\tFY 2024\tYoY Change"),
    divider("rgba(255,255,255,0.25)"),
  )
    .bg(HEADER_BG)
    .padding(6, 32, 8),

  // ── Body ────────────────────────────────────────────────────────────────────
  Column(
    // Revenue
    sectionLabel("REVENUE"),
    row(
      "  Software subscriptions",
      "84,210",
      "103,450",
      "+22.8%",
      "up",
      false,
      false,
    ),
    row(
      "  Professional services",
      "12,880",
      " 15,320",
      "+18.9%",
      "up",
      false,
      false,
    ),
    row(
      "  Hardware & other",
      " 6,740",
      "  7,090",
      " +5.2%",
      "up",
      false,
      false,
    ),
    row(
      "  Contra revenue / refunds",
      "(1,205)",
      "(1,380)",
      " +14.5%",
      "down",
      false,
      false,
    ),
    subtotalRow("Total Revenue", "102,625", "124,480", "+21.3%", "up"),

    // Cost of Revenue
    sectionLabel("COST OF REVENUE"),
    row("  Cloud infrastructure", "18,320", " 21,900", "+19.5%", "down"),
    row("  Support & operations", " 7,460", "  8,110", " +8.7%", "down"),
    row("  Third-party licenses", " 3,210", "  3,580", "+11.5%", "down"),
    subtotalRow("Total Cost of Revenue", "28,990", "33,590", "+15.9%", "down"),

    Row().height(4),

    // Gross Profit
    totalRow("Gross Profit", " 73,635", " 90,890", "+23.4%", "up"),

    // Operating Expenses
    sectionLabel("OPERATING EXPENSES"),
    row("  Sales & marketing", "22,180", " 26,340", "+18.7%", "down"),
    row("  Research & development", "18,950", " 24,610", "+29.9%", "down"),
    row("  General & administrative", " 9,320", " 10,050", " +7.8%", "down"),
    row("  Restructuring charges", "    —", "  1,200", "  n/m", "down"),
    row("  Stock-based compensation", " 6,840", "  8,120", "+18.7%", "down"),
    subtotalRow("Total OpEx", "57,290", " 70,320", "+22.7%", "down"),

    Row().height(4),

    // EBIT / EBITDA
    totalRow("Operating Income (EBIT)", "16,345", " 20,570", "+25.9%", "up"),
    row("  D&A add-back", " 4,210", "  5,330", "+26.6%", "up"),
    subtotalRow("EBITDA", "20,555", " 25,900", "+26.0%", "up"),

    // Below-the-line
    sectionLabel("BELOW THE LINE"),
    row("  Interest income", "   620", "  1,140", "+83.9%", "up"),
    row("  Interest expense", "(2,450)", "(2,280)", " −7.3%", "up"),
    row("  FX gain / (loss)", "  (340)", "    280", "n/m", "up"),
    row("  Other income", "   180", "    220", "+22.2%", "up"),

    Row().height(4),

    // Net Income
    totalRow("Pre-tax Income", "14,355", " 19,930", "+38.8%", "up"),
    row("  Income tax provision", "(3,230)", "(4,630)", "+43.3%", "down"),
    Row().height(4),
    totalRow("Net Income", "11,125", " 15,300", "+37.5%", "up"),

    // EPS
    Row().height(6),
    sectionLabel("PER SHARE DATA"),
    row("  Basic EPS", "  $2.41", "  $3.29", "+36.5%", "up"),
    row("  Diluted EPS", "  $2.37", "  $3.23", "+36.3%", "up"),
    row("  Weighted avg shares (M)", "  46.2", "  46.5", "+0.6%", "flat"),
  )
    .padding(16, 32, 20)
    .bg("white")
    .gap(3),

  // ── Margin schedule ─────────────────────────────────────────────────────────
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
      .tabStops(...T2),
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

  // ── Footer ──────────────────────────────────────────────────────────────────
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

await writeCanvasToFile(root, import.meta.url);
