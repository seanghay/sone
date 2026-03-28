import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Column,
  Font,
  List,
  ListItem,
  PageBreak,
  Photo,
  Row,
  Span,
  sone,
  Text,
} from "../../src/node.ts";
import type { SonePageInfo } from "../../src/renderer.ts";

const dir = path.dirname(fileURLToPath(import.meta.url));
const relative = (p: string) => fileURLToPath(new URL(p, import.meta.url));

await Font.load("GeistMono", relative("../font/GeistMono-Regular.ttf"));
await Font.load("GeistMono", [relative("../font/GeistMono-Bold.ttf")], {
  weight: "bold",
});

// ── Page geometry ──────────────────────────────────────────────────────────────
const PAGE_H = 1056; // Letter @ 96 dpi (8.5 × 11 in)
const CONTENT_W = 680;

// ── Palette — monochrome ───────────────────────────────────────────────────────
const W = "#ffffff";
const INK = "#0a0a0a";
const SUB = "#525252";
const DIM = "#a3a3a3";
const RULE = "#e5e5e5";
const MUTED_BG = "#f7f7f7";

// ── Primitives ─────────────────────────────────────────────────────────────────
const rule = () => Row().height(1).bg(RULE).alignSelf("stretch");

const label = (t: string) => Text(t).size(9).weight("bold").color(DIM);

const sectionHead = (num: string, title: string, subtitle?: string) =>
  Column(
    Row(
      label(num),
      Row().flex(1).height(1).bg(RULE).alignSelf("center").marginLeft(10),
    ).alignItems("center"),
    Text(title).size(18).weight("bold").color(INK).marginTop(6),
    ...(subtitle
      ? [Text(subtitle).size(11).color(SUB).lineHeight(1.5).marginTop(3)]
      : []),
  ).gap(0);

const card = (...children: Parameters<typeof Column>) =>
  Column(...children)
    .padding(16)
    .bg(W)
    .borderWidth(1)
    .borderColor(RULE);

const mono = (t: string) => Text(t).size(10).color(INK).font("GeistMono");

// ── PAGE 1 — Cover ─────────────────────────────────────────────────────────────
const cover = Column(
  Column(
    label("FEATURE SHOWCASE").color("rgba(255,255,255,0.35)"),
    Row(
      Photo(relative("../../test/image/sone.svg"))
        .width(60)
        .height(70)
        .shrink(0),
      Text("Sone").size(80).weight("bold").color(W).lineHeight(1),
    )
      .gap(20)
      .alignItems("center")
      .marginTop(16),
    Text("Canvas Layout Engine")
      .size(20)
      .color("rgba(255,255,255,0.4)")
      .marginTop(8),
    Text("Declarative. Multi-page. Node.js & browser.")
      .size(13)
      .color("rgba(255,255,255,0.3)")
      .lineHeight(1.6)
      .marginTop(16),
  )
    .padding(44, 52, 0, 52)
    .gap(0),

  Column(
    Row(label("TOPICS").color("rgba(255,255,255,0.3)")),
    Row(
      ...[
        "Page Layout",
        "Multi-Page PDF",
        "Tab Stops",
        "Text Orientation",
        "Lists",
        "Borders",
      ].map((t) => Text(t).size(11).color("rgba(255,255,255,0.55)").flex(1)),
    )
      .gap(20)
      .wrap("wrap")
      .marginTop(8),
  )
    .padding(32, 52)
    .gap(0)
    .marginTop("auto"),

  Row(Text("March 2026").size(10).color("rgba(255,255,255,0.2)")).padding(
    24,
    52,
  ),
)
  .bg(INK)
  .height(PAGE_H)
  .gap(0)
  .pageBreak("avoid");

// ── PAGE 2 — Page Layout ───────────────────────────────────────────────────────
const pageLayoutSection = Column(
  sectionHead(
    "01 — PAGE LAYOUT",
    "Multi-Page PDF Engine",
    "Automatic page breaking, repeating headers and footers, margins, and explicit page breaks.",
  ),

  // 2-up feature descriptions
  Row(
    card(
      label("AUTOMATIC BREAKING"),
      Text("Smart page splitting")
        .size(13)
        .weight("bold")
        .color(INK)
        .marginTop(6),
      Text(
        "computePageBreaks() walks the Yoga layout tree to find clean split points at block boundaries. Leaf nodes and avoid-marked elements are kept atomic — no mid-element cuts.",
      )
        .size(11)
        .color(SUB)
        .lineHeight(1.5)
        .marginTop(6),
    ).flex(1),
    card(
      label("PAGEBREAK() NODE"),
      Text("Explicit breaks").size(13).weight("bold").color(INK).marginTop(4),
      Text(
        'A zero-height Column with pageBreak("before") that forces a new page at any position in the layout tree. Use wherever a hard break is needed.',
      )
        .size(11)
        .color(SUB)
        .lineHeight(1.5)
        .marginTop(6),
    ).flex(1),
  )
    .gap(0)
    .borderWidth(1)
    .borderColor(RULE),

  Row(
    card(
      label("HEADER & FOOTER"),
      Text("Repeating bands").size(13).weight("bold").color(INK).marginTop(4),
      Text(
        "Pass a static SoneNode or a function (info: SonePageInfo) => SoneNode. Each band is clipped to its own vertical slice and composited onto every page canvas.",
      )
        .size(11)
        .color(SUB)
        .lineHeight(1.5)
        .marginTop(6),
    ).flex(1),
    card(
      label("MARGINS"),
      Text("Per-side control").size(13).weight("bold").color(INK).marginTop(4),
      Text(
        "margin accepts a uniform number or an object { top, right, bottom, left }. Left and right expand the canvas; top and bottom inset the content band.",
      )
        .size(11)
        .color(SUB)
        .lineHeight(1.5)
        .marginTop(6),
    ).flex(1),
  )
    .gap(0)
    .borderWidth(0, 1, 1, 1)
    .borderColor(RULE),

  // pageBreak prop reference
  card(
    label("PAGEBREAK PROP"),
    Row(
      Text("Value").size(10).weight("bold").color(DIM).width(120).shrink(0),
      Text("Effect").size(10).weight("bold").color(DIM).flex(1),
    )
      .padding(10, 0, 8, 0)
      .marginTop(8),
    rule(),
    ...[
      ['"before"', "Force a page break before this element"],
      ['"after"', "Force a page break after this element"],
      ['"avoid"', "Keep the element on a single page — atomic"],
    ].flatMap(([val, desc]) => [
      Row(
        mono(val).width(140).shrink(0),
        Text(desc).size(11).color(SUB).flex(1),
      )
        .padding(8, 0)
        .alignItems("center"),
      rule(),
    ]),
  ),

  // lastPageHeight
  card(
    label("LASTPAGEHEIGHT"),
    Row(
      Column(
        Text('"uniform"').size(11).weight("bold").color(INK).font("GeistMono"),
        Text(
          "Default. All page canvases share the same height — ideal for PDF where consistent dimensions are required.",
        )
          .size(11)
          .color(SUB)
          .lineHeight(1.5)
          .marginTop(4),
      )
        .flex(1)
        .padding(12)
        .bg(MUTED_BG),
      Column(
        Text('"content"').size(11).weight("bold").color(INK).font("GeistMono"),
        Text(
          "The last page canvas is trimmed to its actual content height — useful when generating individual page images.",
        )
          .size(11)
          .color(SUB)
          .lineHeight(1.5)
          .marginTop(4),
      )
        .flex(1)
        .padding(12)
        .bg(MUTED_BG)
        .borderWidth(0, 0, 0, 1)
        .borderColor(RULE),
    )
      .gap(0)
      .marginTop(10)
      .borderWidth(1)
      .borderColor(RULE),
  ),
)
  .bg(W)
  .padding(32, 40)
  .gap(0);

// ── PAGE 3 — Typography ────────────────────────────────────────────────────────
const tabDemo = card(
  label("TAB STOPS"),
  Text("Column alignment without a Table node")
    .size(13)
    .weight("bold")
    .color(INK)
    .marginTop(6),
  Text(
    "\\t characters snap to predefined x positions via .tabStops(). " +
      "Useful for financial statements, receipts, and aligned data.",
  )
    .size(11)
    .color(SUB)
    .lineHeight(1.6)
    .marginTop(6),

  Column(
    label("INCOME STATEMENT — Q1 2026").marginBottom(6).marginTop(12),
    Row(
      Text("Account\tQ1 2026\tQ4 2025\tΔ%")
        .size(10)
        .weight("bold")
        .color(DIM)
        .tabStops(240, 340, 420)
        .font("GeistMono"),
    ),
    rule(),
    ...[
      ["Revenue", "$9.4 M", "$7.2 M", "+31%"],
      ["Cost of Revenue", "$2.1 M", "$1.8 M", "+17%"],
      ["Gross Profit", "$7.3 M", "$5.4 M", "+35%"],
      ["Operating Expenses", "$4.6 M", "$4.1 M", "+12%"],
      ["Net Income", "$2.7 M", "$1.3 M", "+108%"],
    ].flatMap(([acct, q1, q4, delta]) => [
      Row(
        Text(
          Span(acct).color(INK),
          "\t",
          Span(q1).color(INK),
          "\t",
          Span(q4).color(DIM),
          "\t",
          Span(delta).weight("bold").color(INK),
        )
          .size(11)
          .tabStops(240, 340, 420)
          .font("GeistMono"),
      ).padding(7, 0),
      rule(),
    ]),
  ).gap(0),
);

const orientationDemo = card(
  label("ORIENTATION"),
  Text("Layout-aware text rotation")
    .size(13)
    .weight("bold")
    .color(INK)
    .marginTop(6),
  Text(
    "Text can be rotated 0°/90°/180°/270°. At 90° and 270° the Yoga footprint swaps width and height so surrounding elements flow naturally around the rotated block.",
  )
    .size(11)
    .color(SUB)
    .lineHeight(1.6)
    .marginTop(6),

  Row(
    ...[
      { deg: 0, label: "Normal" },
      { deg: 90, label: "Clockwise" },
      { deg: 180, label: "Flipped" },
      { deg: 270, label: "Counter-CW" },
    ].map(({ deg, label: lbl }) =>
      Column(
        Text(`${deg}°`)
          .size(18)
          .weight("bold")
          .color(INK)
          .orientation(deg as 0 | 90 | 180 | 270),
        Text(lbl).size(9).color(DIM).marginTop(6),
      )
        .flex(1)
        .alignItems("center")
        .justifyContent("center")
        .padding(14)
        .bg(MUTED_BG)
        .borderWidth(0, 1, 0, 0)
        .borderColor(RULE),
    ),
  )
    .gap(0)
    .marginTop(12)
    .borderWidth(1)
    .borderColor(RULE),
);

const whitespaceDemo = card(
  label("WHITESPACE"),
  Text("Preserve leading & trailing spaces")
    .size(13)
    .weight("bold")
    .color(INK)
    .marginTop(6),
  Text(
    "Text nodes no longer trim whitespace at wrap boundaries. Intentional spacing within Span sequences is faithfully preserved.",
  )
    .size(11)
    .color(SUB)
    .lineHeight(1.6)
    .marginTop(6),
  Row(
    Column(
      label("BEFORE").marginBottom(8),
      Text(
        Span("Hello").color(INK),
        Span("  ·  ").color(DIM),
        Span("World").color(INK),
      )
        .size(15)
        .weight("bold"),
      Text("Spaces trimmed at wrap points").size(9).color(DIM).marginTop(6),
    )
      .flex(1)
      .padding(14)
      .bg(MUTED_BG),
    Column(
      label("AFTER").marginBottom(8),
      Text(
        Span("Hello").color(INK),
        Span("  ·  ").color(SUB),
        Span("World").color(INK),
      )
        .size(15)
        .weight("bold"),
      Text("Whitespace preserved as written").size(9).color(DIM).marginTop(6),
    )
      .flex(1)
      .padding(14)
      .bg(MUTED_BG)
      .borderWidth(0, 0, 0, 1)
      .borderColor(RULE),
  )
    .gap(0)
    .marginTop(12)
    .borderWidth(1)
    .borderColor(RULE),
);

const typographySection = Column(
  sectionHead(
    "02 — TYPOGRAPHY",
    "Text Layout Features",
    "Tab stops, text orientation, and whitespace preservation.",
  ),
  tabDemo,
  orientationDemo,
  whitespaceDemo,
)
  .bg(W)
  .padding(32, 40)
  .gap(0);

// ── PAGE 4 — Lists & Borders ───────────────────────────────────────────────────
const listsDemo = card(
  label("LIST STYLE"),
  Text("SpanNode markers").size(13).weight("bold").color(INK).marginTop(6),
  Text(
    "listStyle() now accepts a Span(...) node for full typographic control over the marker — color, weight, size, and font.",
  )
    .size(11)
    .color(SUB)
    .lineHeight(1.6)
    .marginTop(6),

  Row(
    Column(
      label("DISC (built-in)").marginBottom(10),
      List(
        ListItem(
          Text("Automatic page breaking").size(11).color(SUB).lineHeight(1.5),
        ),
        ListItem(
          Text("Dynamic header & footer").size(11).color(SUB).lineHeight(1.5),
        ),
        ListItem(
          Text("Per-page SonePageInfo").size(11).color(SUB).lineHeight(1.5),
        ),
        ListItem(
          Text("lastPageHeight option").size(11).color(SUB).lineHeight(1.5),
        ),
      )
        .listStyle("disc")
        .markerGap(10)
        .gap(8),
    )
      .flex(1)
      .padding(16)
      .bg(MUTED_BG),

    Column(
      label("SPAN (custom)").marginBottom(10),
      List(
        ListItem(
          Text("Tab stops alignment").size(11).color(SUB).lineHeight(1.5),
        ),
        ListItem(
          Text("Text orientation 90°/270°").size(11).color(SUB).lineHeight(1.5),
        ),
        ListItem(
          Text("Whitespace preservation").size(11).color(SUB).lineHeight(1.5),
        ),
        ListItem(
          Text("Span-styled markers").size(11).color(SUB).lineHeight(1.5),
        ),
      )
        .listStyle(Span("→").color(INK).weight("bold"))
        .markerGap(10)
        .gap(8),
    )
      .flex(1)
      .padding(16)
      .bg(MUTED_BG)
      .borderWidth(0, 0, 0, 1)
      .borderColor(RULE),
  )
    .gap(0)
    .marginTop(12)
    .borderWidth(1)
    .borderColor(RULE),

  Column(
    label("NUMBERED WITH SPAN").marginBottom(10),
    List(
      ListItem(Text("npm install sone").size(10).color(SUB).font("GeistMono")),
      ListItem(
        Text("import { Column, Row, Text, sone } from 'sone'")
          .size(10)
          .color(SUB)
          .font("GeistMono"),
      ),
      ListItem(
        Text("Compose your node tree declaratively").size(11).color(SUB),
      ),
      ListItem(
        Text("sone(root, { pageHeight }).pdf()")
          .size(10)
          .color(SUB)
          .font("GeistMono"),
      ),
    )
      .listStyle(Span("").color(INK).weight("bold"))
      .startIndex(1)
      .markerGap(12)
      .gap(10),
  )
    .padding(16)
    .bg(MUTED_BG)
    .marginTop(0)
    .borderWidth(0, 1, 1, 1)
    .borderColor(RULE),

  Column(
    label("NESTED LISTS").marginBottom(10),
    List(
      ListItem(
        Text("Page Layout").size(11).color(INK).weight("bold"),
        List(
          ListItem(
            Text("pageHeight — enables multi-page output")
              .size(11)
              .color(SUB)
              .lineHeight(1.5),
          ),
          ListItem(
            Text("header / footer — repeating bands")
              .size(11)
              .color(SUB)
              .lineHeight(1.5),
          ),
          ListItem(
            Text("PageBreak() — explicit page break node")
              .size(11)
              .color(SUB)
              .lineHeight(1.5),
          ),
        )
          .listStyle(Span("·").color(DIM))
          .markerGap(8)
          .gap(4)
          .marginTop(4),
      ),
      ListItem(
        Text("Typography").size(11).color(INK).weight("bold"),
        List(
          ListItem(
            Text("tabStops() — column alignment via \\t")
              .size(11)
              .color(SUB)
              .lineHeight(1.5),
          ),
          ListItem(
            Text("orientation() — 0 / 90 / 180 / 270°")
              .size(11)
              .color(SUB)
              .lineHeight(1.5),
          ),
        )
          .listStyle(Span("·").color(DIM))
          .markerGap(8)
          .gap(4)
          .marginTop(4),
      ),
      ListItem(
        Text("Lists & Borders").size(11).color(INK).weight("bold"),
        List(
          ListItem(
            Text("listStyle(Span(...)) — full marker styling")
              .size(11)
              .color(SUB)
              .lineHeight(1.5),
          ),
          ListItem(
            Text("borderWidth(top, right, bottom, left)")
              .size(11)
              .color(SUB)
              .lineHeight(1.5),
          ),
        )
          .listStyle(Span("·").color(DIM))
          .markerGap(8)
          .gap(4)
          .marginTop(4),
      ),
    )
      .listStyle(Span("→").color(INK).weight("bold"))
      .markerGap(10)
      .gap(14),
  )
    .padding(16)
    .bg(MUTED_BG)
    .marginTop(0)
    .borderWidth(0, 1, 1, 1)
    .borderColor(RULE),
);

const bordersDemo = card(
  label("PER-SIDE BORDERS"),
  Text("Independent border widths per side")
    .size(13)
    .weight("bold")
    .color(INK)
    .marginTop(6),
  Text(
    "borderWidth(top, right, bottom, left) now correctly applies each side independently. Previously, only uniform borders were rendered.",
  )
    .size(11)
    .color(SUB)
    .lineHeight(1.6)
    .marginTop(6),

  Row(
    ...[
      { label: "Top", bw: [3, 0, 0, 0] as [number, number, number, number] },
      { label: "Right", bw: [0, 3, 0, 0] as [number, number, number, number] },
      { label: "Bottom", bw: [0, 0, 3, 0] as [number, number, number, number] },
      { label: "Left", bw: [0, 0, 0, 3] as [number, number, number, number] },
      { label: "T + B", bw: [3, 0, 3, 0] as [number, number, number, number] },
    ].map(({ label: lbl, bw }) =>
      Column(
        Text(lbl).size(9).color(DIM).marginBottom(8),
        Row()
          .flex(1)
          .height(44)
          .bg(MUTED_BG)
          .borderWidth(...bw)
          .borderColor(INK),
      )
        .flex(1)
        .gap(0)
        .alignItems("stretch"),
    ),
  )
    .gap(12)
    .marginTop(16),
);

const listsSection = Column(
  sectionHead(
    "03 — LISTS & BORDERS",
    "Smart Lists & Per-Side Borders",
    "Full Span styling for list markers, and precise per-side border widths.",
  ),
  listsDemo,
  bordersDemo,
)
  .bg(W)
  .padding(32, 40)
  .gap(0);

// ── PAGE 5 — Summary ───────────────────────────────────────────────────────────
const summarySection = Column(
  sectionHead(
    "04 — SUMMARY",
    "Quick Reference",
    "All features shipped in this release, grouped by area.",
  ),

  ...[
    {
      category: "Page Layout",
      items: [
        "pageHeight in SoneRenderConfig — enables multi-page output",
        'pageBreak prop: "before" | "after" | "avoid"',
        "PageBreak() — explicit break node",
        "header / footer — static node or (SonePageInfo) => SoneNode",
        "margin — number or { top, right, bottom, left }",
        'lastPageHeight: "uniform" | "content"',
        "pdf() uses drawCanvas — no rasterisation artefacts",
      ],
    },
    {
      category: "Typography",
      items: [
        ".tabStops(...values) — \\t snaps to x positions",
        ".orientation(0 | 90 | 180 | 270) — layout-aware rotation",
        "Yoga footprint swaps at 90°/270° for natural element flow",
        "Whitespace preserved at line-wrap boundaries",
      ],
    },
    {
      category: "Lists",
      items: [
        "listStyle(Span(...)) — full marker typography control",
        "Removed: markerColor, markerSize, markerFont, markerWeight, markerStyle",
        "Retained: markerGap, startIndex",
      ],
    },
    {
      category: "Borders",
      items: ["borderWidth(top, right, bottom, left) — truly per-side"],
    },
  ].map(({ category, items }) =>
    Column(
      Text(category).size(13).weight("bold").color(INK),
      List(
        ...items.map((item) =>
          ListItem(Text(item).size(11).color(SUB).lineHeight(1.55)),
        ),
      )
        .listStyle(Span("·").color(DIM).weight("bold"))
        .markerGap(10)
        .gap(5)
        .marginTop(10),
    )
      .padding(16)
      .bg(W)
      .borderWidth(1)
      .borderColor(RULE),
  ),

  Text("Sone — Declarative canvas layout for Node.js & the browser")
    .size(10)
    .color(DIM)
    .alignSelf("center")
    .marginTop(16),
)
  .bg(W)
  .padding(32, 40)
  .gap(0);

// ── Header ─────────────────────────────────────────────────────────────────────
const pageHeader = Row(
  Row(
    Photo(relative("../../test/image/sone.svg")).width(18).height(21).shrink(0),
    Text("Sone").size(10).weight("bold").color(INK),
  )
    .gap(8)
    .alignItems("center"),
  Text("Feature Showcase").size(9).color(DIM),
)
  .bg(W)
  .padding(6, 20)
  .justifyContent("space-between")
  .alignItems("center")
  .borderWidth(0, 0, 1, 0)
  .borderColor(RULE);

// ── Footer ─────────────────────────────────────────────────────────────────────
const pageFooter = ({ pageNumber, totalPages }: SonePageInfo) =>
  Row(
    Text("Sone Feature Showcase").size(9).color(DIM),
    Text(Span(`${pageNumber}`).weight("bold").color(INK), ` / ${totalPages}`)
      .size(10)
      .color(DIM),
  )
    .bg(W)
    .padding(6, 20)
    .justifyContent("space-between")
    .alignItems("center")
    .borderWidth(1, 0, 0, 0)
    .borderColor(RULE);

// ── Root ───────────────────────────────────────────────────────────────────────
const root = Column(
  cover,
  pageLayoutSection,
  PageBreak(),
  typographySection,
  PageBreak(),
  listsSection,
  PageBreak(),
  summarySection,
)
  .width(CONTENT_W)
  .bg(W)
  .gap(0);

const pdfBuf = await sone(root, {
  pageHeight: PAGE_H,
  header: pageHeader,
  footer: pageFooter,
  lastPageHeight: "content",
}).pdf();

const outPath = path.join(dir, "feature-showcase.pdf");
await fs.writeFile(outPath, pdfBuf);
console.log(`PDF → ${outPath}`);
