import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Column, Row, sone, Text } from "../../src/node.ts";

const dir = path.dirname(fileURLToPath(import.meta.url));

// ── Palette ──────────────────────────────────────────────────────────────────
const BG = "#f8fafc";
const INK = "#0f172a";
const MUTED = "#64748b";
const ACCENT = "#2563eb";
const GREEN = "#15803d";
const RED_BG = "#fef2f2";
const RED_BORDER = "#fca5a5";

// ── Helpers ───────────────────────────────────────────────────────────────────
const divider = () => Row().height(1).bg("#e2e8f0").alignSelf("stretch");

const sectionTitle = (n: string, title: string) =>
  Row(
    Text(n).size(11).weight("bold").color("white").bg(ACCENT).padding(4, 10),
    Text(title).size(17).weight("bold").color(INK).alignSelf("center"),
  )
    .gap(12)
    .alignItems("center")
    .padding(0, 0, 8);

const bodyText = (text: string) =>
  Text(text).size(13).color("#334155").lineHeight(1.6);

const kv = (label: string, value: string, valueColor = INK) =>
  Row(
    Text(label).size(12).color(MUTED).width(140).shrink(0),
    Text(value).size(12).weight("bold").color(valueColor).shrink(1),
  ).alignItems("flex-start");

// ── Sections ──────────────────────────────────────────────────────────────────

const header = Column(
  Text("ANNUAL FINANCIAL REPORT").size(26).weight("bold").color("white"),
  Text("Atlas Meridian Corporation  ·  Fiscal Year 2024")
    .size(13)
    .color("rgba(255,255,255,0.75)")
    .marginTop(6),
  Text("Confidential — For internal distribution only")
    .size(11)
    .color("rgba(255,255,255,0.5)")
    .marginTop(3),
)
  .bg("#1e3a5f")
  .padding(32, 36);

const executiveSummary = Column(
  sectionTitle("01", "Executive Summary"),
  bodyText(
    "Fiscal year 2024 marked a transformational period for Atlas Meridian Corporation. " +
      "Revenue grew 21.3% year-over-year to $124.5 million, driven by strong demand " +
      "across our three core verticals: software subscriptions (+22.8%), professional " +
      "services (+18.9%), and hardware solutions (+5.2%).",
  ),
  bodyText(
    "Net income reached $15.3 million, a 37.5% increase versus the prior year, " +
      "reflecting disciplined cost management and operating leverage in our subscription " +
      "business. EBITDA expanded to $25.9 million with a margin of 20.8%, up 80 basis " +
      "points year-over-year.",
  ),
  bodyText(
    "We ended the year with $42.1 million in cash and equivalents, no long-term debt, " +
      "and a workforce of 412 full-time employees across 9 countries. The board has " +
      "approved a $10 million share-buyback programme commencing Q1 2025.",
  ),
)
  .bg("white")
  .padding(28, 36)
  .gap(12)
  .borderWidth(0, 0, 0, 4)
  .borderColor(ACCENT);

// This section is tagged pageBreak: "before" to always start a new page
const financialHighlights = Column(
  sectionTitle("02", "Financial Highlights"),
  Row(
    Column(
      Text("Revenue").size(11).color(MUTED).weight("bold"),
      Text("$124.5M").size(28).weight("bold").color(ACCENT),
      Text("+21.3% YoY").size(12).color(GREEN),
    )
      .bg("#eff6ff")
      .padding(18, 22)
      .gap(4)
      .flex(1),
    Column(
      Text("Net Income").size(11).color(MUTED).weight("bold"),
      Text("$15.3M").size(28).weight("bold").color(GREEN),
      Text("+37.5% YoY").size(12).color(GREEN),
    )
      .bg("#f0fdf4")
      .padding(18, 22)
      .gap(4)
      .flex(1),
    Column(
      Text("EBITDA").size(11).color(MUTED).weight("bold"),
      Text("$25.9M").size(28).weight("bold").color(INK),
      Text("+26.0% YoY").size(12).color(GREEN),
    )
      .bg("#f8fafc")
      .padding(18, 22)
      .gap(4)
      .flex(1),
    Column(
      Text("Gross Margin").size(11).color(MUTED).weight("bold"),
      Text("73.0%").size(28).weight("bold").color(INK),
      Text("+1.2 pp YoY").size(12).color(GREEN),
    )
      .bg("#fefce8")
      .padding(18, 22)
      .gap(4)
      .flex(1),
  ).gap(12),
)
  .bg("white")
  .padding(28, 36)
  .gap(20)
  .pageBreak("before");

const segmentPerformance = Column(
  sectionTitle("03", "Segment Performance"),
  Column(
    Row(
      Text("Segment").size(12).weight("bold").color(MUTED).width(180).shrink(0),
      Text("FY 2023").size(12).weight("bold").color(MUTED).width(90).shrink(0),
      Text("FY 2024").size(12).weight("bold").color(MUTED).width(90).shrink(0),
      Text("Growth").size(12).weight("bold").color(MUTED),
    )
      .padding(8, 12)
      .bg("#f1f5f9"),
    divider(),
    ...[
      ["Software Subscriptions", "$84.2M", "$103.5M", "+22.8%"],
      ["Professional Services", "$12.9M", "$15.3M", "+18.9%"],
      ["Hardware & Other", "$6.7M", "$7.1M", "+5.2%"],
      ["Contra / Refunds", "($1.2M)", "($1.4M)", "+14.5%"],
    ].flatMap(([seg, a, b, g], idx) => [
      Row(
        Text(seg).size(12).color(INK).width(180).shrink(0),
        Text(a).size(12).color(MUTED).width(90).shrink(0),
        Text(b).size(12).weight("bold").color(INK).width(90).shrink(0),
        Text(g).size(12).color(GREEN).weight("bold"),
      )
        .padding(9, 12)
        .bg(idx % 2 === 0 ? "white" : "#fafafa"),
      divider(),
    ]),
    Row(
      Text("Total Revenue")
        .size(12)
        .weight("bold")
        .color(INK)
        .width(180)
        .shrink(0),
      Text("$102.6M").size(12).weight("bold").color(INK).width(90).shrink(0),
      Text("$124.5M").size(12).weight("bold").color(ACCENT).width(90).shrink(0),
      Text("+21.3%").size(12).weight("bold").color(GREEN),
    )
      .padding(10, 12)
      .bg("#eff6ff"),
  )
    .borderWidth(1)
    .borderColor("#e2e8f0"),
)
  .bg("white")
  .padding(28, 36)
  .gap(20);

// "avoid" keeps this card from being split across pages
const riskFactors = Column(
  sectionTitle("04", "Key Risk Factors"),
  Row(
    Column(
      Text("Market Risk").size(13).weight("bold").color(INK).marginBottom(4),
      bodyText(
        "Exposure to FX fluctuations across 9 operating currencies. A 5% adverse move " +
          "in EUR/USD would reduce reported revenue by approximately $2.1M.",
      ),
    )
      .bg(RED_BG)
      .padding(16)
      .borderWidth(1)
      .borderColor(RED_BORDER)
      .flex(1),
    Column(
      Text("Regulatory Risk")
        .size(13)
        .weight("bold")
        .color(INK)
        .marginBottom(4),
      bodyText(
        "Evolving data-residency requirements in the EU and APAC regions may require " +
          "additional infrastructure investment of $3–5M over the next 18 months.",
      ),
    )
      .bg(RED_BG)
      .padding(16)
      .borderWidth(1)
      .borderColor(RED_BORDER)
      .flex(1),
  ).gap(16),
)
  .bg("white")
  .padding(28, 36)
  .gap(20)
  .pageBreak("avoid");

const outlook = Column(
  sectionTitle("05", "FY 2025 Guidance"),
  Column(
    kv("Revenue (guided)", "$142–148M", ACCENT),
    divider(),
    kv("EBITDA margin", "21–23%", GREEN),
    divider(),
    kv("Capex", "$6–8M", INK),
    divider(),
    kv("Headcount (end of year)", "450–480", INK),
    divider(),
    kv("Share buyback", "$10M programme", INK),
  )
    .borderWidth(1)
    .borderColor("#e2e8f0"),
  bodyText(
    "Guidance assumes constant currency rates as of January 2025, no material " +
      "M&A activity, and continued global macroeconomic stability. The company " +
      "will provide updated guidance at each quarterly earnings call.",
  ),
)
  .bg("white")
  .padding(28, 36)
  .gap(20)
  .pageBreak("before");

const footer = Row(
  Text("Atlas Meridian Corporation — Confidential").size(10).color(MUTED),
  Text("FY 2024 Annual Report").size(10).color(MUTED),
)
  .padding(12, 36)
  .bg("#f1f5f9")
  .justifyContent("space-between");

// ── Root document ─────────────────────────────────────────────────────────────
const root = Column(
  header,
  executiveSummary,
  financialHighlights,
  segmentPerformance,
  riskFactors,
  outlook,
  footer,
)
  .width(720)
  .bg(BG)
  .gap(2);

// ── Render pages ──────────────────────────────────────────────────────────────
const PAGE_HEIGHT = 900;
const pages = await sone(root, { pageHeight: PAGE_HEIGHT }).pages();

for (let i = 0; i < pages.length; i++) {
  const buf = await pages[i].toBuffer("jpg", { density: 1 });
  const outPath = path.join(dir, `pages-1-p${i + 1}.jpg`);
  await fs.writeFile(outPath, buf);
  console.log(
    `  page ${i + 1}: ${pages[i].width}×${pages[i].height}  →  ${outPath}`,
  );
}

console.log(`\nTotal: ${pages.length} pages`);
