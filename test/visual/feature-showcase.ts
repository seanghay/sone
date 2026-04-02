import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Column,
  Font,
  List,
  ListItem,
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
await Font.load("GeistMono", [relative("../font/GeistMono-Bold.ttf")]);

// ── Page geometry ──────────────────────────────────────────────────────────────
const PAGE_W = 816; // Letter @ 96 dpi (8.5 in × 96)
const PAGE_H = 1056; // Letter @ 96 dpi (11 in × 96)
const CONTENT_W = PAGE_W; // full letter width — sections use internal padding
const HEADER_H = 34; // padding(6,20) + photo height 21 + border
const FOOTER_H = 27; // padding(6,20) + text ~14 + border
const BAND_GAP = 16; // margin top/bottom between header/footer and content
const COVER_H = PAGE_H - HEADER_H - FOOTER_H - BAND_GAP * 2;

// ── Palette — monochrome ───────────────────────────────────────────────────────
const W = "#ffffff";
const INK = "#0a0a0a";
const SUB = "#404040";
const DIM = "#737373";
const RULE = "#e5e5e5";
const MUTED_BG = "#f7f7f7";

// ── Primitives ─────────────────────────────────────────────────────────────────
const rule = () => Row().height(1).bg(RULE).alignSelf("stretch");

const label = (t: string) =>
  Text(t).size(9).weight("bold").color(DIM).font("GeistMono");

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
const code = (t: string) => Span(t).font("GeistMono").color(INK);

// ── PAGE 1 — Cover ─────────────────────────────────────────────────────────────
const cover = Column(
  Column(
    label("FEATURE SHOWCASE"),
    Row(
      Photo(relative("../../test/image/sone.svg"))
        .width(60)
        .height(70)
        .shrink(0),
      Text("Sone").size(80).weight("bold").color(INK).lineHeight(1),
    )
      .gap(20)
      .alignItems("center")
      .marginTop(16),
    Text("Canvas Layout Engine").size(20).color(SUB).marginTop(8),
    Text("Declarative. Multi-page. Node.js & browser.")
      .size(13)
      .color(DIM)
      .lineHeight(1.6)
      .marginTop(16),
  )
    .padding(44, 52, 0, 52)
    .gap(0),

  Column(
    Row(label("TOPICS")),
    Row(
      ...[
        "Page Layout",
        "Multi-Page PDF",
        "Tab Stops",
        "Text Orientation",
        "Lists",
        "Borders",
      ].map((t) => Text(t).size(11).color(SUB).flex(1)),
    )
      .gap(20)
      .wrap("wrap")
      .marginTop(8),
  )
    .padding(32, 52)
    .gap(0)
    .marginTop("auto"),

  Row(Text("March 2026").size(10).color(DIM)).padding(24, 52),
)
  .bg("linear-gradient(160deg, #f0f0f0 0%, #ffffff 60%)")
  .height(COVER_H)
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
        code("computePageBreaks()"),
        " walks the Yoga layout tree to find clean split points at block boundaries. Leaf nodes and ",
        code("avoid"),
        "-marked elements are kept atomic — no mid-element cuts.",
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
        "A zero-height Column with ",
        code('pageBreak("before")'),
        " that forces a new page at any position in the layout tree. Use wherever a hard break is needed.",
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
        "Pass a static ",
        code("SoneNode"),
        " or a function ",
        code("(info: SonePageInfo) => SoneNode"),
        ". Each band is clipped to its own vertical slice and composited onto every page canvas.",
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
        code("margin"),
        " accepts a uniform number or an object ",
        code("{ top, right, bottom, left }"),
        ". Left and right expand the canvas; top and bottom inset the content band.",
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
    code("\\t"),
    " characters snap to predefined x positions via ",
    code(".tabStops()"),
    ". Useful for financial statements, receipts, and aligned data.",
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

const khmerDemo = card(
  label("CUSTOM FONT — KHMER"),
  Text("ភាសាខ្មែរ")
    .size(13)
    .weight("bold")
    .color(INK)
    .marginTop(6)
    .font("Inter Khmer"),
  Text(
    "Sone supports custom font loading via ",
    code("Font.load()"),
    ". Any language or script can be rendered by registering the appropriate typeface.",
  )
    .size(11)
    .color(SUB)
    .lineHeight(1.6)
    .marginTop(6),
  Row(
    Column(
      label("HEADLINE").marginBottom(8),
      Text("ប្រព័ន្ធរចនា Canvas")
        .size(20)
        .weight("bold")
        .color(INK)
        .font("Inter Khmer")
        .lineHeight(1.4),
      Text("Canvas Layout Engine").size(11).color(DIM).marginTop(4),
    )
      .flex(1)
      .padding(14)
      .bg(MUTED_BG),
    Column(
      label("BODY").marginBottom(8),
      Text(
        "សូននៅជាម៉ាស៊ីនរចនាប្លង់ Canvas សម្រាប់ Node.js និង Browser " +
          "ដែលអនុញ្ញាតឱ្យបង្កើត PDF ច្រើនទំព័រ។",
      )
        .size(11)
        .color(SUB)
        .font("Inter Khmer")
        .lineHeight(1.8),
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
    "Tab stops, text orientation, whitespace preservation, and custom fonts.",
  ),
  tabDemo,
  orientationDemo,
  whitespaceDemo,
  khmerDemo,
)
  .bg(W)
  .padding(32, 40)
  .gap(0);

// ── PAGE 4 — Lists & Borders ───────────────────────────────────────────────────
const listsDemo = card(
  label("LIST STYLE"),
  Text("SpanNode markers").size(13).weight("bold").color(INK).marginTop(6),
  Text(
    code("listStyle()"),
    " now accepts a ",
    code("Span(...)"),
    " node for full typographic control over the marker — color, weight, size, and font.",
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
        ).alignItems("center"),
        ListItem(
          Text("Dynamic header & footer").size(11).color(SUB).lineHeight(1.5),
        ).alignItems("center"),
        ListItem(
          Text("Per-page SonePageInfo").size(11).color(SUB).lineHeight(1.5),
        ).alignItems("center"),
        ListItem(
          Text("lastPageHeight option").size(11).color(SUB).lineHeight(1.5),
        ).alignItems("center"),
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
        ).alignItems("center"),
        ListItem(
          Text("Text orientation 90°/270°").size(11).color(SUB).lineHeight(1.5),
        ).alignItems("center"),
        ListItem(
          Text("Whitespace preservation").size(11).color(SUB).lineHeight(1.5),
        ).alignItems("center"),
        ListItem(
          Text("Span-styled markers").size(11).color(SUB).lineHeight(1.5),
        ).alignItems("center"),
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
      ListItem(
        Text("npm install sone").size(10).color(SUB).font("GeistMono"),
      ).alignItems("center"),
      ListItem(
        Text("import { Column, Row, Text, sone } from 'sone'")
          .size(10)
          .color(SUB)
          .font("GeistMono"),
      ).alignItems("center"),
      ListItem(
        Text("Compose your node tree declaratively").size(11).color(SUB),
      ).alignItems("center"),
      ListItem(
        Text("sone(root, { pageHeight }).pdf()")
          .size(10)
          .color(SUB)
          .font("GeistMono"),
      ).alignItems("center"),
    )
      .listStyle(Span("{}.").color(INK).weight("bold"))
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
            Text(code("pageHeight"), " — enables multi-page output")
              .size(11)
              .color(SUB)
              .lineHeight(1.5),
          ).alignItems("center"),
          ListItem(
            Text(code("header"), " / ", code("footer"), " — repeating bands")
              .size(11)
              .color(SUB)
              .lineHeight(1.5),
          ).alignItems("center"),
          ListItem(
            Text(code("PageBreak()"), " — explicit page break node")
              .size(11)
              .color(SUB)
              .lineHeight(1.5),
          ).alignItems("center"),
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
            Text(code("tabStops()"), " — column alignment via ", code("\\t"))
              .size(11)
              .color(SUB)
              .lineHeight(1.5),
          ).alignItems("center"),
          ListItem(
            Text(code("orientation()"), " — 0 / 90 / 180 / 270°")
              .size(11)
              .color(SUB)
              .lineHeight(1.5),
          ).alignItems("center"),
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
            Text(code("listStyle(Span(...))"), " — full marker styling")
              .size(11)
              .color(SUB)
              .lineHeight(1.5),
          ).alignItems("center"),
          ListItem(
            Text(code("borderWidth(top, right, bottom, left)"))
              .size(11)
              .color(SUB)
              .lineHeight(1.5),
          ).alignItems("center"),
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
    code("borderWidth(top, right, bottom, left)"),
    " now correctly applies each side independently. Previously, only uniform borders were rendered.",
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
        ["pageHeight", " in SoneRenderConfig — enables multi-page output"],
        ["pageBreak", ' prop: "before" | "after" | "avoid"'],
        ["PageBreak()", " — explicit break node"],
        ["header / footer", " — static node or (SonePageInfo) => SoneNode"],
        ["margin", " — number or { top, right, bottom, left }"],
        ["lastPageHeight", ': "uniform" | "content"'],
        ["pdf()", " uses drawCanvas — no rasterisation artefacts"],
      ],
    },
    {
      category: "Typography",
      items: [
        [".tabStops(...values)", " — \\t snaps to x positions"],
        [".orientation(0 | 90 | 180 | 270)", " — layout-aware rotation"],
        ["Yoga footprint swaps at 90°/270° for natural element flow"],
        ["Whitespace preserved at line-wrap boundaries"],
      ],
    },
    {
      category: "Lists",
      items: [
        ["listStyle(Span(...))", " — full marker typography control"],
        [
          "Removed: markerColor, markerSize, markerFont, markerWeight, markerStyle",
        ],
        ["Retained: markerGap, startIndex"],
      ],
    },
    {
      category: "Borders",
      items: [["borderWidth(top, right, bottom, left)", " — truly per-side"]],
    },
  ].map(({ category, items }) =>
    Column(
      Text(category).size(13).weight("bold").color(INK),
      List(
        ...items.map((parts) =>
          ListItem(
            Text(
              ...parts.map((p, i) => (i === 0 ? code(p) : Span(p).color(SUB))),
            )
              .size(11)
              .color(SUB)
              .lineHeight(1.55),
          ).alignItems("center"),
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
  typographySection,
  listsSection,
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
  width: PAGE_W,
  margin: { top: BAND_GAP, bottom: BAND_GAP },
}).pdf();

const outPath = path.join(dir, "feature-showcase.pdf");
await fs.writeFile(outPath, pdfBuf);
console.log(`PDF → ${outPath}`);
