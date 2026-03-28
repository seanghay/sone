import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Column, Row, Span, sone, Text } from "../../src/node.ts";
import type { SonePageInfo } from "../../src/renderer.ts";

const dir = path.dirname(fileURLToPath(import.meta.url));

// ── Page geometry ─────────────────────────────────────────────────────────────
const PAGE_H = 1123; // A4 @ 96 dpi
const CONTENT_W = 640; // 794 − 2 × 77 (comfortable reading column)
const MARGIN = 77; // 0.8 in left/right

// ── Palette ───────────────────────────────────────────────────────────────────
const W = "#ffffff";
const INK = "#1d1d1f"; // Apple near-black
const SUB = "#6e6e73"; // Apple secondary
const DIM = "#86868b"; // Apple tertiary
const RULE = "#d2d2d7"; // Apple separator
const BLUE = "#0071e3"; // Apple blue
const GREEN = "#1a7f37"; // positive delta
const AMBER = "#b45309"; // in-progress

// ── Typography ────────────────────────────────────────────────────────────────
const eyebrow = (t: string) => Text(t).size(9).weight("bold").color(DIM);

const display = (t: string) =>
  Text(t).size(32).weight("bold").color(W).lineHeight(1.15);

const sectionHead = (label: string, title: string) =>
  Column(
    eyebrow(label),
    Row().height(1).bg(RULE).alignSelf("stretch").marginTop(8).marginBottom(10),
    Text(title).size(18).weight("bold").color(INK),
  ).gap(0);

const body = (t: string) => Text(t).size(12).color(SUB).lineHeight(1.7);

const caption = (t: string) => Text(t).size(10).color(DIM).lineHeight(1.5);

const rule = () => Row().height(1).bg(RULE).alignSelf("stretch");

const kv = (label: string, value: string, vc = INK) =>
  Row(
    Text(label).size(11).color(DIM).width(200).shrink(0),
    Text(value).size(11).weight("bold").color(vc),
  )
    .padding(10, 0)
    .alignItems("flex-start");

// ── Cover ─────────────────────────────────────────────────────────────────────
const cover = Column(
  eyebrow("ATLAS MERIDIAN CORPORATION").color("rgba(255,255,255,0.4)"),
  display("Q1 2025\nProduct Report"),
  Text("Engineering & Product Division  ·  March 28, 2025")
    .size(12)
    .color("rgba(255,255,255,0.45)")
    .marginTop(6),
)
  .bg("#1c1c1e")
  .padding(44, 40, 40, 40)
  .gap(14);

// ── Executive Summary ─────────────────────────────────────────────────────────
const executiveSummary = Column(
  sectionHead("01", "Executive Summary"),
  body(
    "Q1 2025 demonstrated strong momentum across all product lines. Monthly active " +
      "users grew 18% quarter-over-quarter to 1.24 million, driven by accelerated " +
      "enterprise onboarding in EMEA and sustained organic growth in the SMB segment. " +
      "The platform processed 4.7 billion API calls during the quarter, maintaining " +
      "99.97% uptime against a 99.9% SLA target.",
  ),
  body(
    "The engineering team shipped 14 major releases and resolved 312 customer-reported " +
      "issues — a 23% improvement in resolution velocity compared to Q4 2024. Migration " +
      "to the new event-streaming architecture, completed in February, reduced median " +
      "API latency from 38 ms to 11 ms for read-heavy workloads.",
  ),
  body(
    "Revenue contribution grew to $9.4 M for the quarter, up 31% year-over-year. " +
      "Net Revenue Retention held at 118%, indicating strong expansion within the " +
      "existing customer base despite intensifying competition.",
  ),
)
  .bg(W)
  .padding(36, 40)
  .gap(12);

// ── Key metrics ───────────────────────────────────────────────────────────────
const metrics = Column(
  sectionHead("02", "Key Metrics"),
  Row(
    // dividers between cells handled by right border
    ...[
      ["MAU", "1.24 M", "+18% QoQ", BLUE],
      ["Uptime", "99.97%", "SLA 99.9%", GREEN],
      ["p50 Latency", "11 ms", "↓ from 38 ms", GREEN],
      ["NRR", "118%", "Target 110%", INK],
    ].map(([label, value, sub, vc], i, arr) =>
      Column(
        Text(label).size(9).weight("bold").color(DIM).marginBottom(6),
        Text(value)
          .size(28)
          .weight("bold")
          .color(vc as string),
        Text(sub).size(10).color(GREEN).marginTop(3),
      )
        .flex(1)
        .padding(0, 20, 0, i === 0 ? 0 : 20)
        .borderWidth(0, i < arr.length - 1 ? 1 : 0, 0, 0)
        .borderColor(RULE),
    ),
  ),
)
  .bg(W)
  .padding(36, 40)
  .gap(20)
  .borderWidth(1, 0, 0, 0)
  .borderColor(RULE);

// ── Engineering highlights ────────────────────────────────────────────────────
const engineering = Column(
  sectionHead("03", "Engineering Highlights"),
  Column(
    Row(
      Text("Initiative").size(10).weight("bold").color(DIM).flex(1),
      Text("Status").size(10).weight("bold").color(DIM).width(100).shrink(0),
      Text("Impact").size(10).weight("bold").color(DIM).width(130).shrink(0),
    ).padding(0, 0, 8, 0),
    rule(),
    ...[
      [
        "Event-Streaming Architecture Migration",
        "Shipped",
        "−71% read latency",
      ],
      ["Multi-Region Failover (EU-West + AP-South)", "Shipped", "RPO < 30 s"],
      ["Zero-Downtime Schema Migrations", "Shipped", "0 maintenance windows"],
      [
        "Automated Canary Rollout Pipeline",
        "Shipped",
        "Error budget preserved",
      ],
      ["WebAssembly Compute Layer (Beta)", "In Progress", "Target Q2 2025"],
      ["Federated Search Index v2", "In Progress", "Target Q2 2025"],
      ["FIPS 140-2 Compliant Encryption", "Planned", "Target Q3 2025"],
    ].flatMap(([init, status, impact]) => [
      Row(
        Text(init).size(11).color(INK).flex(1).lineHeight(1.45),
        Text(status)
          .size(10)
          .weight("bold")
          .color(
            status === "Shipped"
              ? GREEN
              : status === "In Progress"
                ? AMBER
                : DIM,
          )
          .width(100)
          .shrink(0),
        Text(impact).size(11).color(SUB).width(130).shrink(0),
      )
        .padding(10, 0)
        .alignItems("center"),
      rule(),
    ]),
  ).gap(0),
)
  .bg(W)
  .padding(36, 40)
  .gap(20)
  .borderWidth(1, 0, 0, 0)
  .borderColor(RULE);

// ── Reliability ───────────────────────────────────────────────────────────────
const reliability = Column(
  sectionHead("04", "Reliability & Incident Summary"),
  body(
    "Three severity-2 incidents occurred during the quarter, all resolved within the " +
      "4-hour response SLA. No severity-1 (customer-impacting) incidents were recorded. " +
      "MTTR for S2 incidents improved to 52 minutes, down from 1h 41m in Q4 2024.",
  ),
  Column(
    kv("Total incidents (S1 / S2 / S3)", "0 / 3 / 11"),
    rule(),
    kv("MTTR — S2 incidents", "52 min", GREEN),
    rule(),
    kv("Error budget consumed", "14 % of 30-day window", GREEN),
    rule(),
    kv("Change failure rate", "0.8 %", GREEN),
    rule(),
    kv("Deployment frequency", "3.2 per day", BLUE),
  ).gap(0),
  caption(
    "Error budget represents 100 % minus achieved uptime over a 30-day rolling window. " +
      "A result below 50 % consumed indicates a healthy release cadence.",
  ),
)
  .bg(W)
  .padding(36, 40)
  .gap(20)
  .borderWidth(1, 0, 0, 0)
  .borderColor(RULE);

// ── Roadmap ───────────────────────────────────────────────────────────────────
const roadmap = Column(
  sectionHead("05", "Q2 2025 Roadmap Commitments"),
  body(
    "The following commitments have been reviewed by engineering leads and approved " +
      "by the product steering committee. Scope adjustments require VP-level sign-off.",
  ),
  ...[
    [
      "WebAssembly Compute Layer — GA",
      "Enables sandboxed edge compute with sub-millisecond cold-start. " +
        "12 design partners in beta. GA gated on compliance attestation and a 72-hour soak.",
    ],
    [
      "Federated Search Index v2",
      "Purpose-built inverted index with cross-tenant queries and row-level security. " +
        "Expected 5× throughput improvement for large-catalogue customers.",
    ],
    [
      "SOC 2 Type II Recertification",
      "Audit window opens April 7. Evidence collection automated via Vanta. " +
        "No scope changes vs. the prior-year audit.",
    ],
    [
      "Self-Serve Usage Analytics",
      "Customer-facing dashboard for API usage, error rates, and latency percentiles. " +
        "Targets a 20 % reduction in support tickets.",
    ],
  ].map(([title, desc], i, arr) =>
    Column(Text(title).size(12).weight("bold").color(INK), body(desc))
      .gap(6)
      .padding(16, 0, i < arr.length - 1 ? 16 : 0, 0)
      .borderWidth(0, 0, i < arr.length - 1 ? 1 : 0, 0)
      .borderColor(RULE),
  ),
)
  .bg(W)
  .padding(36, 40)
  .gap(0)
  .borderWidth(1, 0, 0, 0)
  .borderColor(RULE);

// ── Approvals ─────────────────────────────────────────────────────────────────
const approvals = Column(
  sectionHead("06", "Approvals & Distribution"),
  Column(
    kv("Prepared by", "Platform Engineering · Product Division"),
    rule(),
    kv("Reviewed by", "VP Engineering, VP Product"),
    rule(),
    kv("Report date", "March 28, 2025"),
    rule(),
    kv("Classification", "Internal — Do Not Distribute"),
  ).gap(0),
  Row(
    Text("Authorised signatory: _________________________")
      .size(11)
      .color(DIM)
      .flex(1),
    Text("Date: ____________________").size(11).color(DIM).width(170).shrink(0),
  ).marginTop(28),
)
  .bg(W)
  .padding(36, 40)
  .gap(20)
  .borderWidth(1, 0, 0, 0)
  .borderColor(RULE);

// ── Repeating page header ─────────────────────────────────────────────────────
const pageHeader = Row(
  // Logo mark + company / document title
  Row(
    Row(Text("AM").size(8).weight("bold").color(W))
      .bg("black")
      .width(20)
      .height(20)
      .rounded(100)
      .alignItems("center")
      .justifyContent("center")
      .shrink(0),
    Column(
      Text("Atlas Meridian").size(9).weight("bold").color(INK),
      Text("Q1 2025 Product Report").size(8).color(DIM),
    ).gap(1),
  )
    .gap(8)
    .alignItems("center"),
  // Confidential badge
  Row(Text("CONFIDENTIAL").size(8).weight("bold").color("white"))
    .padding(3, 7)
    .rounded(3)
    .bg("orange")
    .alignSelf("center"),
)
  .bg(W)
  .padding(10, 16)
  .justifyContent("space-between")
  .alignItems("center")
  .borderWidth(0, 0, 1, 0)
  .borderColor("#c7c7cc");

// ── Dynamic footer with page number ──────────────────────────────────────────
const pageFooter = ({ pageNumber, totalPages }: SonePageInfo) =>
  Row(
    Column(
      Text("Atlas Meridian Corporation").size(9).weight("bold").color(INK),
      Text("Internal — Do Not Distribute").size(8).color(DIM),
    ).gap(2),
    Text(Span(`${pageNumber}`).weight("bold").color(INK), ` of ${totalPages}`),
  )
    .bg(W)
    .padding(10, 16)
    .justifyContent("space-between")
    .alignItems("center")
    .borderWidth(1, 0, 0, 0)
    .borderColor("#c7c7cc");

// ── Root ──────────────────────────────────────────────────────────────────────
const root = Column(
  cover,
  executiveSummary,
  metrics,
  engineering,
  reliability,
  roadmap,
  approvals,
)
  .width(CONTENT_W)
  .bg(W)
  .gap(0);

// ── Render & export ───────────────────────────────────────────────────────────
const pdfBuf = await sone(root, {
  pageHeight: PAGE_H,
  header: pageHeader,
  footer: pageFooter,
  margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
}).pdf();

const outPath = path.join(dir, "a4-report.pdf");
await fs.writeFile(outPath, pdfBuf);
console.log(`PDF → ${outPath}`);
