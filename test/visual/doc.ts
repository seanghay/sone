/**
 * Sone — Full Feature Documentation
 * Outputs to test/visual/doc.pdf
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ClipGroup,
  Column,
  Grid,
  List,
  ListItem,
  Path,
  Photo,
  qrcode,
  Row,
  Span,
  sone,
  Table,
  TableCell,
  TableRow,
  Text,
  TextDefault,
} from "../../src/node.ts";
import type { SonePageInfo } from "../../src/renderer.ts";

const dir = path.dirname(fileURLToPath(import.meta.url));

// ── Page geometry ─────────────────────────────────────────────────────────────
const PAGE_W = 816; // Letter @ 96 dpi
const PAGE_H = 1056;
const HEADER_H = 36;
const FOOTER_H = 28;
const BAND_GAP = 16;

// ── Palette ───────────────────────────────────────────────────────────────────
const W = "#ffffff";
const INK = "#111111";
const SUB = "#444444";
const DIM = "#888888";
const RULE = "#e5e5e5";
const ACCENT = "#0070f3";
const CODE_BG = "#f4f4f5";
const CODE_INK = "#c0392b";
const MUTED = "#f9f9f9";
const GREEN = "#16a34a";
const AMBER = "#d97706";
const PURPLE = "#7c3aed";

// ── Typography helpers ────────────────────────────────────────────────────────
const h2 = (t: string) => Text(t).size(18).weight("bold").color(INK);
const h3 = (t: string) => Text(t).size(13).weight("bold").color(INK);
const body = (t: string) => Text(t).size(11).color(SUB).lineHeight(1.65);
const caption = (t: string) => Text(t).size(9).color(DIM).lineHeight(1.5);
const eyebrow = (t: string) =>
  Text(t).size(9).weight("bold").color(DIM).font("monospace");
const rule = () => Row().height(1).bg(RULE).alignSelf("stretch");

const sectionHead = (num: string, title: string, subtitle?: string) =>
  Column(
    Row(
      eyebrow(num),
      Row().flex(1).height(1).bg(RULE).alignSelf("center").marginLeft(10),
    ).alignItems("center"),
    h2(title).marginTop(8),
    ...(subtitle ? [body(subtitle).marginTop(4)] : []),
  ).gap(0);

const card = (...children: Parameters<typeof Column>) =>
  Column(...children)
    .padding(16)
    .bg(W)
    .borderWidth(1)
    .borderColor(RULE)
    .rounded(6);

const labelBox = (t: string, bg: string, c = W) =>
  Row(Text(t).size(9).weight("bold").color(c))
    .bg(bg)
    .padding(3, 8)
    .rounded(3)
    .alignSelf("flex-start");

const codeBlock = (t: string) =>
  Column(Text(t).size(10).font("monospace").color(INK).lineHeight(1.7))
    .bg(CODE_BG)
    .padding(12)
    .rounded(6)
    .borderWidth(1)
    .borderColor(RULE);

// ── Cover ─────────────────────────────────────────────────────────────────────
const cover = Column(
  Column(
    eyebrow("DECLARATIVE CANVAS LAYOUT ENGINE"),
    Row(
      Column().size(8, 56).bg(ACCENT).rounded(4).marginRight(16).shrink(0),
      Text("Sone").size(72).weight("bold").color(INK).lineHeight(1),
    )
      .alignItems("center")
      .marginTop(20),
    Text("Build rich PDFs & images declaratively with a fluent Flexbox API")
      .size(15)
      .color(SUB)
      .lineHeight(1.6)
      .marginTop(12),
    Row(
      labelBox("Node.js", ACCENT),
      labelBox("Browser", PURPLE),
      labelBox("Multi-Page PDF", GREEN),
      labelBox("Flexbox Layout", AMBER),
    )
      .gap(8)
      .marginTop(20)
      .wrap("wrap"),
  )
    .padding(60, 52, 0, 52)
    .gap(0),

  Column(
    Row(
      eyebrow("FEATURES"),
      Row().flex(1).height(1).bg(RULE).alignSelf("center").marginLeft(10),
    )
      .alignItems("center")
      .marginBottom(12),
    Grid(
      ...(
        [
          ["Column / Row / Grid", "Flexbox layout containers"],
          ["Text & Span", "Rich inline typography"],
          ["TextDefault", "Inherit text styles"],
          ["Photo", "Images with scaleType"],
          ["Path", "SVG paths with fills"],
          ["Table / TableRow / TableCell", "Structured data tables"],
          ["List / ListItem", "Ordered & unordered lists"],
          ["ClipGroup", "SVG clip paths"],
          ["Multi-Page PDF", "pageHeight, header, footer"],
          ["Transforms", "rotate, scale, translate"],
          ["Filters", "blur, grayscale, invert…"],
          ["QR Codes", "qrcode() built-in"],
        ] as [string, string][]
      ).map(([feat, desc]) =>
        Column(h3(feat).color(ACCENT), body(desc).marginTop(2))
          .padding(12)
          .bg(MUTED)
          .borderWidth(1)
          .borderColor(RULE)
          .rounded(4),
      ),
    )
      .columns("1fr", "1fr", "1fr")
      .columnGap(10)
      .rowGap(10),
  )
    .padding(40, 52)
    .marginTop("auto")
    .gap(0),

  Row(caption("Sone Documentation  ·  April 2026")).padding(24, 52),
)
  .bg("linear-gradient(160deg, #f0f7ff 0%, #ffffff 50%)")
  .height(PAGE_H - HEADER_H - FOOTER_H - BAND_GAP * 2)
  .gap(0)
  .pageBreak("avoid");

// ── Page 1 — Quick Start ──────────────────────────────────────────────────────
const quickStart = Column(
  sectionHead(
    "01 — QUICK START",
    "Installation & Basic Usage",
    "Everything you need to render your first layout.",
  ),

  card(
    h3("Install"),
    codeBlock("npm install sone\n# or\npnpm add sone").marginTop(8),
  ),

  card(
    h3("Minimal example"),
    codeBlock(
      `import { Column, Row, Text, sone } from 'sone';\n\nconst root = Column(\n  Text("Hello, World!").size(32).weight("bold"),\n  Row(\n    Text("Left").flex(1),\n    Text("Right"),\n  ).gap(16).marginTop(12),\n).padding(40).bg("white");\n\nawait sone(root).png();\n// → Buffer (PNG)`,
    ).marginTop(8),
  ),

  card(
    h3("sone() — output formats"),
    Column(
      Row(
        Text("Method").size(10).weight("bold").color(DIM).width(140).shrink(0),
        Text("Returns").size(10).weight("bold").color(DIM).flex(1),
      ).padding(8, 0),
      rule(),
      ...(
        [
          [".png()", "Promise<Buffer> — PNG image"],
          [".jpg(quality?)", "Promise<Buffer> — JPEG (0.0 – 1.0)"],
          [".pdf()", "Promise<Buffer> — PDF (multi-page when pageHeight set)"],
          [".svg()", "Promise<Buffer> — SVG vector"],
          [".webp()", "Promise<Buffer> — WebP image"],
          [".raw()", "Promise<Buffer> — Raw pixel data"],
          [".canvas()", "Promise<Canvas> — skia-canvas Canvas instance"],
        ] as [string, string][]
      ).flatMap(([m, d]) => [
        Row(
          Text(m)
            .size(10)
            .font("monospace")
            .color(CODE_INK)
            .width(140)
            .shrink(0),
          body(d).flex(1),
        )
          .padding(7, 0)
          .alignItems("center"),
        rule(),
      ]),
    )
      .gap(0)
      .marginTop(8),
  ),

  card(
    h3("SoneRenderConfig"),
    Column(
      Row(
        Text("Option").size(10).weight("bold").color(DIM).width(160).shrink(0),
        Text("Description").size(10).weight("bold").color(DIM).flex(1),
      ).padding(8, 0),
      rule(),
      ...(
        [
          ["width / height", "Override canvas dimensions"],
          ["background", "Canvas background color"],
          ["pageHeight", "Enable multi-page output (px per page)"],
          ["header / footer", "Static node or (SonePageInfo) => SoneNode"],
          ["margin", "number or { top, right, bottom, left }"],
          ["lastPageHeight", '"uniform" | "content"'],
          ["cache", "Map for image caching across renders"],
        ] as [string, string][]
      ).flatMap(([opt, desc]) => [
        Row(
          Text(opt)
            .size(10)
            .font("monospace")
            .color(CODE_INK)
            .width(160)
            .shrink(0),
          body(desc).flex(1),
        )
          .padding(7, 0)
          .alignItems("center"),
        rule(),
      ]),
    )
      .gap(0)
      .marginTop(8),
  ),
)
  .bg(W)
  .padding(32, 40)
  .gap(12);

// ── Page 2 — Layout: Column & Row ─────────────────────────────────────────────
const layoutSection = Column(
  sectionHead(
    "02 — LAYOUT",
    "Column, Row & Flexbox",
    "All layout containers are flexbox-based. Column stacks children vertically; Row lays them out horizontally.",
  ),

  card(
    h3("Column — vertical stack"),
    codeBlock(
      `Column(\n  Text("Top"),\n  Text("Middle"),\n  Text("Bottom"),\n).gap(8).padding(16).bg("white")`,
    ).marginTop(8),
    Row(
      // Live example
      Column(
        ...(["Top", "Middle", "Bottom"] as const).map((t) =>
          Row(Text(t).size(11).color(INK))
            .bg(CODE_BG)
            .padding(6, 12)
            .rounded(4),
        ),
      )
        .gap(8)
        .padding(16)
        .bg(MUTED)
        .borderWidth(1)
        .borderColor(RULE)
        .rounded(6),
      Column(
        body("Children stacked top-to-bottom."),
        body(".gap(n) sets spacing between items."),
        body(".alignItems() controls cross-axis."),
        body(".justifyContent() controls main-axis."),
      )
        .gap(4)
        .flex(1)
        .padding(0, 0, 0, 16)
        .justifyContent("center"),
    )
      .gap(0)
      .marginTop(12)
      .alignItems("stretch"),
  ),

  card(
    h3("Row — horizontal stack"),
    codeBlock(
      `Row(\n  Text("A").flex(1),\n  Text("B").flex(2),\n  Text("C").flex(1),\n).gap(8)`,
    ).marginTop(8),
    Row(
      Row(
        ...(["A  flex(1)", "B  flex(2)", "C  flex(1)"] as const).map((t, i) =>
          Row(Text(t).size(10).color(INK))
            .flex(i === 1 ? 2 : 1)
            .bg([ACCENT + "22", ACCENT + "44", ACCENT + "22"][i])
            .padding(8)
            .rounded(4)
            .justifyContent("center"),
        ),
      )
        .gap(8)
        .padding(12)
        .bg(MUTED)
        .borderWidth(1)
        .borderColor(RULE)
        .rounded(6)
        .flex(1),
      Column(
        body(".flex(n) distributes remaining space."),
        body(".shrink(0) prevents compression."),
        body(".wrap() enables line wrapping."),
        body(".alignSelf() overrides per-child."),
      )
        .gap(4)
        .flex(1)
        .padding(0, 0, 0, 16)
        .justifyContent("center"),
    )
      .gap(0)
      .marginTop(12)
      .alignItems("stretch"),
  ),

  card(
    h3("Layout properties reference"),
    Grid(
      ...(
        [
          ["flex(n)", "Flex shorthand"],
          ["flexGrow / grow(n)", "Grow factor"],
          ["flexShrink / shrink(n)", "Shrink factor"],
          ["flexBasis / basis(n)", "Base size"],
          ["gap / rowGap / columnGap", "Spacing between children"],
          ["padding(…)", "CSS shorthand (1–4 values)"],
          ["margin(…)", "CSS shorthand (1–4 values)"],
          ["width / height", "Fixed or 'auto' or '%'"],
          ["size(w, h?)", "Set both at once (square if h omitted)"],
          ["minWidth / maxWidth", "Size constraints"],
          ["position()", "static | relative | absolute"],
          ["inset / top / left…", "Absolute offsets"],
          ["alignItems / alignSelf", "Cross-axis alignment"],
          ["justifyContent", "Main-axis alignment"],
          ["alignContent", "Multi-line alignment"],
          ["wrap()", "Enable flex wrapping"],
          ["overflow('hidden')", "Clip overflowing children"],
          ["display('none')", "Hide without removing from layout"],
        ] as [string, string][]
      ).map(([prop, desc]) =>
        Row(
          Text(prop)
            .size(9)
            .font("monospace")
            .color(CODE_INK)
            .width(160)
            .shrink(0),
          Text(desc).size(9).color(DIM).flex(1),
        ).padding(5, 0),
      ),
    )
      .columns("1fr", "1fr")
      .columnGap(24)
      .marginTop(10),
  ),
)
  .bg(W)
  .padding(32, 40)
  .gap(12);

// ── Page 3 — Grid ─────────────────────────────────────────────────────────────
const gridSection = Column(
  sectionHead(
    "03 — GRID",
    "CSS Grid Layout",
    "Grid supports fixed, auto, and fractional (fr) track sizes, explicit placement, and spanning.",
  ),

  card(
    h3("Basic grid"),
    codeBlock(
      `Grid(\n  Column(Text("A")),   // auto-placed\n  Column(Text("B")),\n  Column(Text("C")),\n)\n  .columns("1fr", "2fr", "1fr")\n  .columnGap(12)\n  .rowGap(12)`,
    ).marginTop(8),
    Row(
      Grid(
        ...(
          [
            ["A", ACCENT + "33"],
            ["B", GREEN + "33"],
            ["C", AMBER + "33"],
            ["D", PURPLE + "33"],
            ["E", ACCENT + "22"],
            ["F", GREEN + "22"],
          ] as [string, string][]
        ).map(([t, bg]) =>
          Column(Text(t).size(14).weight("bold").color(INK))
            .padding(16)
            .bg(bg)
            .rounded(4)
            .alignItems("center"),
        ),
      )
        .columns("1fr", "2fr", "1fr")
        .columnGap(8)
        .rowGap(8)
        .flex(1),
      Column(
        body("Tracks: fixed(px), auto, fr"),
        body(".columns(...) — column sizes"),
        body(".rows(...) — row sizes"),
        body(".autoRows() — implicit rows"),
        body(".columnGap() / .rowGap()"),
      )
        .gap(4)
        .flex(0)
        .width(170)
        .padding(0, 0, 0, 16)
        .justifyContent("center"),
    )
      .marginTop(12)
      .alignItems("stretch"),
  ),

  card(
    h3("Explicit placement & spanning"),
    codeBlock(
      `Grid(\n  Column(Text("Hero")).gridColumn(1, 2).gridRow(1),  // spans 2 cols\n  Column(Text("Side")).gridColumn(3).gridRow(1),\n  Column(Text("Full width")).gridColumn(1, 3),      // spans all 3\n).columns("1fr", "1fr", "200px")`,
    ).marginTop(8),
    Row(
      Grid(
        Column(
          Text("Hero").size(11).weight("bold").color(W),
          caption("gridColumn(1, 2)  ·  spans 2"),
        )
          .padding(16)
          .bg(ACCENT)
          .rounded(4)
          .gridColumn(1, 2)
          .gridRow(1),
        Column(
          Text("Side").size(11).weight("bold").color(W),
          caption("gridColumn(3)"),
        )
          .padding(16)
          .bg(PURPLE)
          .rounded(4)
          .gridColumn(3)
          .gridRow(1),
        Column(
          Text("Full Width").size(11).weight("bold").color(INK),
          caption("gridColumn(1, 3)  ·  spans all"),
        )
          .padding(16)
          .bg(CODE_BG)
          .borderWidth(1)
          .borderColor(RULE)
          .rounded(4)
          .gridColumn(1, 3),
      )
        .columns("1fr", "1fr", 140)
        .columnGap(8)
        .rowGap(8)
        .flex(1),
      Column(
        body(".gridColumn(start, span?)"),
        body(".gridRow(start, span?)"),
        body("Explicit placement mixes"),
        body("with auto-flow."),
      )
        .gap(4)
        .width(150)
        .shrink(0)
        .padding(0, 0, 0, 16)
        .justifyContent("center"),
    )
      .marginTop(12)
      .alignItems("stretch"),
  ),

  card(
    h3("Track size types"),
    Row(
      ...(
        [
          ["150", "Fixed pixels", ACCENT],
          ['"auto"', "Fit content", GREEN],
          ['"2fr"', "Fractional", AMBER],
        ] as [string, string, string][]
      ).map(([val, desc, color]) =>
        Column(
          Text(val).size(14).weight("bold").color(color).font("monospace"),
          body(desc).marginTop(4),
        )
          .flex(1)
          .padding(12)
          .bg(MUTED)
          .rounded(4),
      ),
    ).gap(8),
  ),
)
  .bg(W)
  .padding(32, 40)
  .gap(12);

// ── Page 4 — Text & Typography ────────────────────────────────────────────────
const textSection = Column(
  sectionHead(
    "04 — TEXT",
    "Text, Span & TextDefault",
    "Rich inline text with per-span styling, decorations, gradients, and advanced layout options.",
  ),

  card(
    h3("Text — basic"),
    codeBlock(
      `Text("Hello world")         // plain string\nText("Hello", " world")    // multiple strings/spans\nText(Span("bold").weight("bold"), " normal")`,
    ).marginTop(8),
    Row(
      Column(
        Text("Hello world").size(14).color(INK),
        Text(Span("Hello ").weight("bold").color(ACCENT), "world")
          .size(14)
          .color(INK),
        Text("Center").size(14).color(INK).align("center").width(100),
        Text("Right").size(14).color(INK).align("right").width(100),
        Text(
          "Justify — this line is long enough to show justification in action here",
        )
          .size(11)
          .color(SUB)
          .align("justify")
          .lineBreak("knuth-plass")
          .lineHeight(1.6)
          .maxWidth(220),
      )
        .gap(8)
        .padding(12)
        .bg(MUTED)
        .rounded(6)
        .flex(1),
      Column(
        body(".size(px) — font size"),
        body(".color(value) — text color"),
        body(".weight() — bold, 100–900"),
        body(".font(...) — font stack"),
        body(".style('italic') — font style"),
        body(".align() — left/center/right/justify"),
        body(".lineHeight(n) — line height multiplier"),
        body(".lineBreak() — greedy | knuth-plass"),
      )
        .gap(4)
        .flex(1)
        .padding(0, 0, 0, 16)
        .justifyContent("center"),
    )
      .gap(0)
      .marginTop(12)
      .alignItems("stretch"),
  ),

  card(
    h3("Span — inline styling"),
    codeBlock(
      `Text(\n  Span("Underline").underline(1.5),\n  Span("Strike").lineThrough(),\n  Span("Overline").overline(),\n  Span("Highlight").highlight("yellow"),\n  Span("Shadow").dropShadow("2px 2px 4px rgba(0,0,0,0.3)"),\n  Span("Stroke").strokeColor("blue").strokeWidth(1.5),\n  Span("Raised").offsetY(-6),\n)`,
    ).marginTop(8),
    Row(
      Text(
        Span("Underline").underline(1.5).color(ACCENT),
        "  ",
        Span("Strike").lineThrough().color(CODE_INK),
        "  ",
        Span("Overline").overline(1.2).color(GREEN),
        "\n",
        Span("Highlight").highlight("#fef08a").color(AMBER),
        "  ",
        Span("Shadow").dropShadow("2px 2px 0px rgba(0,0,0,0.25)").color(INK),
        "  ",
        Span("Stroke").strokeColor(PURPLE).strokeWidth(1.2).color(W),
        "\n",
        Span("Raised").offsetY(-6).color(ACCENT).size(16),
        "  normal  ",
        Span("Lowered").offsetY(6).color(CODE_INK),
        "  ",
        Span("Wide").letterSpacing(3).color(DIM),
      )
        .size(13)
        .lineHeight(2.2)
        .padding(16)
        .bg(MUTED)
        .rounded(6)
        .flex(1),
    ).marginTop(12),
  ),

  card(
    h3("Text layout options"),
    Grid(
      ...(
        [
          ["nowrap()", "Prevent line wrapping"],
          ["maxLines(n)", "Clamp visible lines"],
          ["textOverflow('ellipsis')", "Show … when clamped"],
          ["indent(px)", "First-line indent"],
          ["hangingIndent(px)", "Subsequent lines indent"],
          ["tabStops(...px)", "Tab stop positions"],
          ["tabLeader(char)", 'Fill gaps e.g. "." for dot leader'],
          ["orientation(0|90|180|270)", "Layout-aware rotation"],
          ["autofit()", "Scale font to fit container"],
          ["clipImage(Photo(...))", "Image through letterforms"],
          ["wordSpacing(px)", "Extra space between words"],
          ["letterSpacing(px)", "Extra space between chars"],
        ] as [string, string][]
      ).map(([m, d]) =>
        Column(
          Text(m).size(9).font("monospace").color(CODE_INK),
          body(d).marginTop(2),
        )
          .padding(8)
          .bg(MUTED)
          .rounded(4),
      ),
    )
      .columns("1fr", "1fr")
      .columnGap(10)
      .rowGap(8)
      .marginTop(10),
  ),

  card(
    h3("TextDefault — inherit text styles"),
    codeBlock(
      `TextDefault(\n  Column(\n    Text("Inherits size & color"),\n    Text("from TextDefault"),\n  ),\n).size(14).color("navy")`,
    ).marginTop(8),
    Row(
      TextDefault(
        Column(
          Text("Inherits size & color").color(ACCENT),
          Text("From TextDefault").lineHeight(1.5),
          Text("Override per node").size(9).color(DIM),
        )
          .gap(4)
          .padding(12)
          .bg(MUTED)
          .rounded(6)
          .flex(1),
      )
        .size(13)
        .color(INK)
        .lineHeight(1.4),
    ).marginTop(8),
  ),
)
  .bg(W)
  .padding(32, 40)
  .gap(12);

// ── Page 5 — Styling ──────────────────────────────────────────────────────────
const stylingSection = Column(
  sectionHead(
    "05 — STYLING",
    "Backgrounds, Shadows, Filters & Transforms",
    "Any layout node can have rich visual styling applied via the fluent builder API.",
  ),

  card(
    h3("Background — colors, gradients, images"),
    codeBlock(
      `Column().bg("red")\nColumn().bg("linear-gradient(135deg, #667eea, #764ba2)")\nColumn().bg("radial-gradient(circle, yellow, orange)")\nColumn().bg(Photo("image.jpg").scaleType("cover"))  // image bg`,
    ).marginTop(8),
    Row(
      ...(
        [
          ["Solid", "#0070f3"],
          ["Linear", "linear-gradient(135deg, #667eea, #764ba2)"],
          ["Radial", "radial-gradient(circle at 30% 40%, #f093fb, #f5576c)"],
          [
            "Multi-stop",
            "linear-gradient(180deg, #43e97b 0%, #38f9d7 50%, #4facfe 100%)",
          ],
        ] as [string, string][]
      ).map(([label, bg]) =>
        Column(caption(label))
          .flex(1)
          .height(60)
          .bg(bg)
          .rounded(6)
          .justifyContent("flex-end")
          .padding(6),
      ),
    )
      .gap(8)
      .marginTop(12),
  ),

  card(
    h3("Shadows"),
    codeBlock(
      `Column().shadow("0 4px 12px rgba(0,0,0,0.15)")\nColumn().shadow("2px 2px 0px black")        // hard\nColumn().shadow("0 0 20px #0070f3")         // glow`,
    ).marginTop(8),
    Row(
      ...(
        [
          ["Soft", "0 4px 20px rgba(0,0,0,0.15)", W],
          ["Hard", "3px 3px 0px #111", W],
          ["Glow", `0 0 20px ${ACCENT}`, "#f0f7ff"],
          ["Colored", "4px 4px 0px #ef4444", W],
        ] as [string, string, string][]
      ).map(([lbl, shadow, bg]) =>
        Column(Text(lbl).size(11).weight("bold").color(INK))
          .flex(1)
          .padding(16)
          .bg(bg)
          .rounded(6)
          .shadow(shadow)
          .alignItems("center"),
      ),
    )
      .gap(16)
      .padding(16)
      .marginTop(12),
  ),

  card(
    h3("CSS Filters"),
    codeBlock(
      `.blur(4)          // blur(4px)\n.brightness(1.4)  // brightness(1.4)\n.contrast(1.5)    // contrast(1.5)\n.grayscale(1)     // grayscale(1)\n.invert(1)        // invert(1)\n.sepia(1)         // sepia(1)\n.saturate(2)      // saturate(2)\n.huerotate(180)   // hue-rotate(180)`,
    ).marginTop(8),
    Row(
      ...(
        [
          ["Normal", undefined],
          ["grayscale", (c: any) => c.grayscale(1)],
          ["sepia", (c: any) => c.sepia(1)],
          ["invert", (c: any) => c.invert(1)],
          ["huerotate", (c: any) => c.huerotate(120)],
        ] as [string, ((c: any) => any) | undefined][]
      ).map(([lbl, f]) => {
        const base = Column(Text(lbl).size(9).color(W))
          .flex(1)
          .height(44)
          .bg("linear-gradient(135deg, #0070f3, #7c3aed)")
          .rounded(4)
          .justifyContent("flex-end")
          .padding(4, 6);
        return f ? f(base) : base;
      }),
    )
      .gap(8)
      .marginTop(12),
  ),

  card(
    h3("Transforms"),
    codeBlock(
      `.rotate(45)          // rotation in degrees\n.scale(1.2)          // uniform scale\n.scale(1.5, 0.8)     // x / y scale\n.translateX(20)      // horizontal offset\n.translateY(-10)     // vertical offset\n.opacity(0.5)        // 0.0 – 1.0`,
    ).marginTop(8),
    Row(
      Column(Text("rotate(15)").size(9).color(W))
        .size(60)
        .bg(ACCENT)
        .rounded(4)
        .alignItems("center")
        .justifyContent("center")
        .rotate(15),
      Column(Text("scale(1.3)").size(9).color(W))
        .size(60)
        .bg(GREEN)
        .rounded(4)
        .alignItems("center")
        .justifyContent("center")
        .scale(1.3),
      Column(Text("opacity(.4)").size(9).color(INK))
        .size(60)
        .bg(AMBER)
        .rounded(4)
        .alignItems("center")
        .justifyContent("center")
        .opacity(0.4),
      Column(Text("translateX").size(9).color(W))
        .size(60)
        .bg(PURPLE)
        .rounded(4)
        .alignItems("center")
        .justifyContent("center")
        .translateX(20),
    )
      .gap(24)
      .padding(16)
      .marginTop(12)
      .alignItems("center"),
  ),
)
  .bg(W)
  .padding(32, 40)
  .gap(12);

// ── Page 6 — Borders & Corners ────────────────────────────────────────────────
const bordersSection = Column(
  sectionHead(
    "06 — BORDERS & CORNERS",
    "Per-Side Borders and Corner Styles",
    "borderWidth accepts 1–4 values (CSS shorthand). Corners support radius, squircle smoothing, and cut style.",
  ),

  card(
    h3("borderWidth — CSS shorthand"),
    codeBlock(
      `.borderWidth(2)             // all 4 sides\n.borderWidth(2, 8)          // top/bottom=2, left/right=8\n.borderWidth(2, 8, 4)       // top=2, left/right=8, bottom=4\n.borderWidth(2, 4, 6, 8)    // top, right, bottom, left`,
    ).marginTop(8),
    Row(
      ...[
        { label: "All", bw: [2, 2, 2, 2] as [number, number, number, number] },
        {
          label: "Top only",
          bw: [3, 0, 0, 0] as [number, number, number, number],
        },
        {
          label: "Bottom only",
          bw: [0, 0, 3, 0] as [number, number, number, number],
        },
        {
          label: "Left only",
          bw: [0, 0, 0, 4] as [number, number, number, number],
        },
        {
          label: "T + B",
          bw: [3, 0, 3, 0] as [number, number, number, number],
        },
        {
          label: "L + R",
          bw: [0, 3, 0, 3] as [number, number, number, number],
        },
      ].map(({ label, bw }) =>
        Column(
          caption(label),
          Row()
            .flex(1)
            .height(36)
            .bg(CODE_BG)
            .borderWidth(bw[0], bw[1], bw[2], bw[3])
            .borderColor(ACCENT),
        )
          .gap(4)
          .flex(1)
          .alignItems("stretch"),
      ),
    )
      .gap(8)
      .marginTop(12),
  ),

  card(
    h3("Corner styles"),
    codeBlock(
      `.rounded(8)                // uniform radius\n.rounded(8, 0, 8, 0)       // top-left, top-right, bottom-right, bottom-left\n.cornerSmoothing(0.6)      // squircle (0 – 1)\n.corner("cut")             // chamfered cut corners`,
    ).marginTop(8),
    Row(
      ...[
        { label: "rounded(8)", fn: (c: any) => c.rounded(8) },
        { label: "rounded(24)", fn: (c: any) => c.rounded(24) },
        { label: "rounded(999)", fn: (c: any) => c.rounded(999) },
        {
          label: "smoothing(.6)",
          fn: (c: any) => c.rounded(16).cornerSmoothing(0.6),
        },
        { label: "cut corners", fn: (c: any) => c.rounded(12).corner("cut") },
        { label: "asymmetric", fn: (c: any) => c.rounded(24, 4, 24, 4) },
      ].map(({ label, fn }) =>
        Column(
          caption(label),
          fn(
            Row()
              .flex(1)
              .height(44)
              .bg(ACCENT + "22")
              .borderWidth(2)
              .borderColor(ACCENT),
          ),
        )
          .gap(4)
          .flex(1)
          .alignItems("stretch"),
      ),
    )
      .gap(8)
      .marginTop(12),
  ),

  card(
    h3("overflow('hidden') — clip children"),
    codeBlock(
      `Row(\n  Photo("image.jpg").size(200, 100),\n).rounded(16).overflow("hidden")  // clips to rounded border`,
    ).marginTop(8),
    Row(
      Row(
        Column().size(120, 60).bg("linear-gradient(135deg, #0070f3, #7c3aed)"),
        Column().size(120, 60).bg("linear-gradient(135deg, #16a34a, #43e97b)"),
      )
        .rounded(24)
        .overflow("hidden")
        .borderWidth(2)
        .borderColor(RULE),
      Column(
        body("overflow('hidden') clips"),
        body("child content to the node's"),
        body("border-box. Works with"),
        body("cornerRadius as well."),
      )
        .gap(4)
        .flex(1)
        .padding(0, 0, 0, 16)
        .justifyContent("center"),
    )
      .gap(0)
      .marginTop(12)
      .alignItems("center"),
  ),
)
  .bg(W)
  .padding(32, 40)
  .gap(12);

// ── Page 7 — Images, Paths, ClipGroup ─────────────────────────────────────────
const visualSection = Column(
  sectionHead(
    "07 — PHOTO, PATH & CLIPGROUP",
    "Images, SVG Paths and Clip Groups",
    "Render images with flexible scaling, draw SVG paths with gradient fills, and clip arbitrary shapes.",
  ),

  card(
    h3("Photo — image display"),
    codeBlock(
      `Photo("./image.jpg").size(200, 120).scaleType("cover")\nPhoto(buffer).scaleType("contain").preserveAspectRatio()\nPhoto("icon.svg").size(32).fill("gray")  // fallback color`,
    ).marginTop(8),
    Row(
      ...(["cover", "contain", "fill"] as const).map((t) =>
        Column(
          caption(t),
          Column()
            .size(80, 60)
            .bg("linear-gradient(135deg, #667eea, #764ba2)")
            .rounded(4),
          caption(
            t === "cover"
              ? "crops to fill"
              : t === "contain"
                ? "letterboxed"
                : "stretches",
          ),
        )
          .gap(4)
          .alignItems("center"),
      ),
      Column(
        body("Photo props:"),
        body("· src: url | Buffer"),
        body("· scaleType: cover | contain | fill"),
        body("· preserveAspectRatio"),
        body("· flipHorizontal / flipVertical"),
        body("· clipPath: SVG path string"),
        body("· fill: placeholder color"),
      )
        .gap(3)
        .flex(1)
        .padding(0, 0, 0, 24)
        .justifyContent("center"),
    )
      .gap(16)
      .marginTop(12)
      .alignItems("flex-start"),
  ),

  card(
    h3("Path — SVG path with fills"),
    codeBlock(
      `Path("M 0 10 L 20 0 L 40 10 L 20 20 Z")\n  .fill("linear-gradient(135deg, #ff6b6b, #feca57)")\n  .stroke("#333")\n  .strokeWidth(2)\n  .size(80, 80)`,
    ).marginTop(8),
    Row(
      Row(
        Path(
          "M 12 21.593 C 6 15.345 1 11.075 1 7 C 1 3.134 3.134 1 7 1 C 9.257 1 11.312 2.5 12 4 C 12.688 2.5 14.743 1 17 1 C 20.866 1 23 3.134 23 7 C 23 11.075 17.945 15.345 12 21.593 Z",
        )
          .fill("linear-gradient(135deg, #ff6b6b, #feca57)")
          .size(64),
        Path(
          "M 12 2 L 15.09 8.26 L 22 9.27 L 17 14.14 L 18.18 21.02 L 12 17.77 L 5.82 21.02 L 7 14.14 L 2 9.27 L 8.91 8.26 Z",
        )
          .fill("linear-gradient(180deg, #48dbfb, #0abde3)")
          .size(64),
        Path("M 0 8 L 14 8 L 14 4 L 24 12 L 14 20 L 14 16 L 0 16 Z")
          .fill("linear-gradient(90deg, #1dd1a1, #10ac84)")
          .size(64),
        Path(
          "M 50 10 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z",
        )
          .fill("linear-gradient(135deg, #f9ca24, #f0932b)")
          .size(64),
      )
        .gap(16)
        .padding(16)
        .bg(MUTED)
        .rounded(6)
        .flex(1),
      Column(
        body("Path props:"),
        body("· d: SVG path string"),
        body("· fill: color or gradient"),
        body("· stroke: color"),
        body("· strokeWidth: number"),
        body("· size(w, h?) — fit bounds"),
      )
        .gap(4)
        .flex(1)
        .padding(0, 0, 0, 16)
        .justifyContent("center"),
    )
      .gap(0)
      .marginTop(12)
      .alignItems("stretch"),
  ),

  card(
    h3("ClipGroup — clip children to SVG path"),
    codeBlock(
      `ClipGroup(\n  "M 75 0 L 150 150 L 0 150 Z",   // triangle clip path\n  Photo("image.jpg").size(150, 150),\n  Text("Clipped!").color("white").padding(8),\n).size(150, 150).overflow("hidden")`,
    ).marginTop(8),
    Row(
      Row(
        ClipGroup(
          "M 75 0 L 150 150 L 0 150 Z",
          Column()
            .size(150, 150)
            .bg("linear-gradient(135deg, #0070f3, #7c3aed)"),
        ).size(150, 150),
        ClipGroup(
          "M 75 5 L 95 65 L 150 65 L 105 100 L 120 150 L 75 115 L 30 150 L 45 100 L 0 65 L 55 65 Z",
          Column()
            .size(150, 150)
            .bg("linear-gradient(135deg, #16a34a, #43e97b)"),
        ).size(150, 150),
        ClipGroup(
          "M 75 0 L 150 75 L 75 150 L 0 75 Z",
          Column()
            .size(150, 150)
            .bg("linear-gradient(135deg, #f9ca24, #f0932b)"),
        ).size(150, 150),
      )
        .gap(16)
        .padding(16)
        .bg(MUTED)
        .rounded(6),
      Column(
        body("ClipGroup clips all children"),
        body("to an SVG path shape."),
        body("· Triangle, star, diamond…"),
        body("· Any valid SVG path string"),
        body("· Mix Photo + Text inside"),
        body("· overflow('hidden') for"),
        body("  tight clipping"),
      )
        .gap(4)
        .flex(1)
        .padding(0, 0, 0, 16)
        .justifyContent("center"),
    )
      .gap(0)
      .marginTop(12)
      .alignItems("center"),
  ),
)
  .bg(W)
  .padding(32, 40)
  .gap(12);

// ── Page 8 — Tables ───────────────────────────────────────────────────────────
const tableSection = Column(
  sectionHead(
    "08 — TABLES",
    "Table, TableRow & TableCell",
    "Structured data rendering with per-cell styling, column spans, and TextDefault inheritance.",
  ),

  card(
    h3("Basic table"),
    codeBlock(
      `Table(\n  TableRow(\n    TableCell(Text("Name")),\n    TableCell(Text("Role")),\n  ).bg("#f0f0f0"),\n  TableRow(\n    TableCell(Text("Alice")),\n    TableCell(Text("Engineer")),\n  ),\n).borderWidth(1).borderColor("#ccc").spacing(24, 10)`,
    ).marginTop(8),
    Row(
      TextDefault(
        Table(
          TableRow(
            TextDefault(
              TableCell(Text("Name")),
              TableCell(Text("Role")),
              TableCell(Text("Status")),
            )
              .color(DIM)
              .weight("bold"),
          ).bg(CODE_BG),
          TableRow(
            TableCell(Text("Alice Chen")),
            TableCell(Text("Engineer")),
            TableCell(
              Row(Text("Active").size(9).weight("bold").color(GREEN))
                .bg(GREEN + "20")
                .padding(2, 6)
                .rounded(3),
            ).alignItems("center"),
          ),
          TableRow(
            TableCell(Text("Bob Smith")),
            TableCell(Text("Designer")),
            TableCell(
              Row(Text("Active").size(9).weight("bold").color(GREEN))
                .bg(GREEN + "20")
                .padding(2, 6)
                .rounded(3),
            ).alignItems("center"),
          ).bg(MUTED),
          TableRow(
            TableCell(Text("Carol Wu")),
            TableCell(Text("Manager")),
            TableCell(
              Row(Text("Away").size(9).weight("bold").color(AMBER))
                .bg(AMBER + "20")
                .padding(2, 6)
                .rounded(3),
            ).alignItems("center"),
          ),
        )
          .borderWidth(1)
          .borderColor(RULE)
          .spacing(20, 10),
      )
        .size(11)
        .color(INK),
      Column(
        body("Table structure:"),
        body("· Table(...rows)"),
        body("· TableRow(...cells)"),
        body("· TableCell(...nodes)"),
        body(""),
        body(".spacing(h, v) sets"),
        body("cell padding."),
        body(".borderWidth / .borderColor"),
        body("for outer border."),
      )
        .gap(4)
        .flex(1)
        .padding(0, 0, 0, 24)
        .justifyContent("center"),
    )
      .gap(0)
      .marginTop(12)
      .alignItems("flex-start"),
  ),

  card(
    h3("Column & row spanning"),
    codeBlock(
      `TableCell(Text("Spans 2 cols")).colSpan(2)\nTableCell(Text("Spans 2 rows")).rowSpan(2)`,
    ).marginTop(8),
    Row(
      TextDefault(
        Table(
          TableRow(
            TextDefault(
              TableCell(Text("Header spans 2 cols").align("center")).colspan(2),
              TableCell(Text("Col C")),
            ).weight("bold"),
          ).bg(`${ACCENT}22`),
          TableRow(
            TableCell(Text("A1")),
            TableCell(Text("Spans 2 rows")).rowspan(2).bg(`${GREEN}20`),
            TableCell(Text("C1")),
          ),
          TableRow(TableCell(Text("A2")), TableCell(Text("C2"))).bg(MUTED),
        )
          .borderWidth(1)
          .borderColor(RULE)
          .spacing(16, 10),
      )
        .size(11)
        .color(INK),
      Column(
        body(".colSpan(n) — merge cols"),
        body(".rowSpan(n) — merge rows"),
        body(""),
        body("TableRow also supports:"),
        body("· .bg() — row background"),
        body("· .color() via TextDefault"),
        body("· .weight() via TextDefault"),
        body(""),
        body("TableCell supports:"),
        body("· .alignItems() — vertical"),
        body("· .bg() — cell background"),
      )
        .gap(4)
        .flex(1)
        .padding(0, 0, 0, 24)
        .justifyContent("center"),
    )
      .gap(0)
      .marginTop(12)
      .alignItems("flex-start"),
  ),
)
  .bg(W)
  .padding(32, 40)
  .gap(12);

// ── Page 9 — Lists ────────────────────────────────────────────────────────────
const listSection = Column(
  sectionHead(
    "09 — LISTS",
    "List & ListItem",
    "Ordered and unordered lists with built-in marker styles or fully custom Span markers.",
  ),

  Row(
    card(
      h3("Built-in styles"),
      codeBlock(
        `List(...items).listStyle("disc")\nList(...items).listStyle("circle")\nList(...items).listStyle("decimal")`,
      ).marginTop(8),
      Column(
        ...(["disc", "circle", "decimal"] as const).map((style) =>
          Column(
            caption(style),
            TextDefault(
              List(
                ListItem(Text("First item")),
                ListItem(Text("Second item")),
                ListItem(Text("Third item")),
              )
                .listStyle(style)
                .markerGap(8)
                .gap(4),
            )
              .size(11)
              .color(SUB),
          ).gap(4),
        ),
      )
        .gap(12)
        .padding(12)
        .bg(MUTED)
        .rounded(6)
        .marginTop(8),
    ).flex(1),

    card(
      h3("Custom Span markers"),
      codeBlock(
        `List(...items)\n  .listStyle(Span("→").color("blue"))\n\n// Dynamic per-item:\n.listStyle((i) =>\n  Span(\`\${i+1}.\`).color(colors[i]))`,
      ).marginTop(8),
      Column(
        caption("Span marker"),
        TextDefault(
          List(
            ListItem(Text("Install the package")),
            ListItem(Text("Configure settings")),
            ListItem(Text("Render your layout")),
          )
            .listStyle(Span("→").color(ACCENT).weight("bold"))
            .markerGap(10)
            .gap(6),
        )
          .size(11)
          .color(SUB),
        caption("Function marker").marginTop(8),
        TextDefault(
          List(
            ListItem(Text("High priority task")),
            ListItem(Text("Medium priority task")),
            ListItem(Text("Low priority task")),
          )
            .listStyle((i) =>
              Span(`${i + 1}.`)
                .weight("bold")
                .color([CODE_INK, AMBER, GREEN][i] ?? DIM),
            )
            .markerGap(10)
            .gap(6),
        )
          .size(11)
          .color(SUB),
      )
        .padding(12)
        .bg(MUTED)
        .rounded(6)
        .marginTop(8),
    ).flex(1),
  ).gap(12),

  card(
    h3("Nested lists"),
    codeBlock(
      `List(\n  ListItem(\n    Text("Parent item"),\n    List(\n      ListItem(Text("Child A")),\n      ListItem(Text("Child B")),\n    ).listStyle("circle").markerGap(6).gap(2).marginTop(4),\n  ),\n).listStyle("disc").markerGap(8).gap(8)`,
    ).marginTop(8),
    Row(
      Column(
        TextDefault(
          List(
            ListItem(
              Text("Page Layout"),
              List(
                ListItem(Text("pageHeight — enable multi-page")),
                ListItem(Text("header / footer — repeating bands")),
                ListItem(Text("PageBreak() — explicit breaks")),
              )
                .listStyle(Span("·").color(DIM))
                .markerGap(8)
                .gap(3)
                .marginTop(4),
            ),
            ListItem(
              Text("Typography"),
              List(
                ListItem(Text("tabStops() — column alignment")),
                ListItem(Text("orientation(90|270) — rotated text")),
              )
                .listStyle(Span("·").color(DIM))
                .markerGap(8)
                .gap(3)
                .marginTop(4),
            ),
          )
            .listStyle(Span("→").color(ACCENT).weight("bold"))
            .markerGap(10)
            .gap(10),
        )
          .size(11)
          .color(INK)
          .lineHeight(1.4),
      ).flex(1),
      Column(
        body("List props:"),
        body("· listStyle(style | Span | fn)"),
        body("· startIndex(n) — first index for numbered"),
        body("· markerGap(px) — space between marker & text"),
        body("· markerOffset(px) — vertical alignment"),
        body("· gap(px) — spacing between items"),
        body(""),
        body("ListItem: any SoneNode children"),
        body("including nested List nodes."),
      )
        .gap(4)
        .flex(1)
        .bg("white")
        .padding(0, 0, 0, 24)
        .justifyContent("center"),
    )
      .gap(0)
      .marginTop(12)
      .alignItems("flex-start"),
  ),
)
  .bg(W)
  .padding(32, 40)
  .gap(12);

// ── Page 10 — Multi-Page PDF ──────────────────────────────────────────────────
const pdfSection = Column(
  sectionHead(
    "10 — MULTI-PAGE PDF",
    "Pagination, Headers & Footers",
    "When pageHeight is set, Sone automatically splits content across pages with optional repeating header/footer bands.",
  ),

  card(
    h3("Enabling multi-page output"),
    codeBlock(
      `await sone(root, {\n  pageHeight: 1056,           // A4/Letter page height in px\n  width: 816,                // optional canvas width\n  margin: { top: 16, bottom: 16 }, // space around header/footer\n}).pdf();`,
    ).marginTop(8),
  ),

  card(
    h3("Header & footer"),
    codeBlock(
      `// Static node — same on every page\nconst header = Row(\n  Text("My Document").size(10),\n  Text("Confidential").size(9).color("gray"),\n).justifyContent("space-between").padding(8, 16)\n  .borderWidth(0,0,1,0).borderColor("#e5e5e5");\n\n// Dynamic — receives { pageNumber, totalPages }\nconst footer = ({ pageNumber, totalPages }: SonePageInfo) =>\n  Row(\n    Text("My Corp").size(9),\n    Text(\`\${pageNumber} / \${totalPages}\`).size(9),\n  ).justifyContent("space-between").padding(8, 16)\n    .borderWidth(1,0,0,0).borderColor("#e5e5e5");\n\nawait sone(root, { pageHeight, header, footer }).pdf();`,
    ).marginTop(8),
  ),

  card(
    h3("pageBreak prop"),
    Column(
      Row(
        Text("Value").size(10).weight("bold").color(DIM).width(130).shrink(0),
        Text("Effect").size(10).weight("bold").color(DIM).flex(1),
      ).padding(8, 0),
      rule(),
      ...(
        [
          ['"before"', "Force a page break before this element"],
          ['"after"', "Force a page break after this element"],
          ['"avoid"', "Keep element on one page — never split"],
        ] as [string, string][]
      ).flatMap(([val, desc]) => [
        Row(
          Text(val)
            .size(10)
            .font("monospace")
            .color(CODE_INK)
            .width(130)
            .shrink(0),
          body(desc).flex(1),
        )
          .padding(7, 0)
          .alignItems("center"),
        rule(),
      ]),
    )
      .gap(0)
      .marginTop(8),
    codeBlock(
      `// Explicit break node\nPageBreak()  // alias for Column().height(0).pageBreak("before")\n\n// Prop on any node\nColumn(...).pageBreak("avoid")\nColumn(...).pageBreak("before")`,
    ).marginTop(12),
  ),

  card(
    h3("lastPageHeight"),
    Row(
      Column(
        Text('"uniform"').size(11).weight("bold").color(INK).font("monospace"),
        body(
          "All pages have the same height. Default — required for multi-page PDF with skia-canvas.",
        ),
      )
        .flex(1)
        .padding(12)
        .bg(MUTED)
        .rounded(4),
      Column(
        Text('"content"').size(11).weight("bold").color(INK).font("monospace"),
        body(
          "Last page canvas is trimmed to actual content height. Ideal for individual page images.",
        ),
      )
        .flex(1)
        .padding(12)
        .bg(MUTED)
        .rounded(4)
        .borderWidth(0, 0, 0, 1)
        .borderColor(RULE),
    )
      .gap(0)
      .borderWidth(1)
      .borderColor(RULE)
      .rounded(4),
  ),
)
  .bg(W)
  .padding(32, 40)
  .gap(12);

// ── Page 11 — QR Codes & Advanced ────────────────────────────────────────────
const advancedSection = Column(
  sectionHead(
    "11 — QR CODES & ADVANCED",
    "QR Codes, Tab Stops, Text Orientation & Clip Image",
    "Built-in QR code generation and advanced text layout features.",
  ),

  card(
    h3("qrcode() — built-in QR generation"),
    codeBlock(
      `import { qrcode, Photo } from 'sone';\n\n// Returns SVG as Buffer\nconst svg = qrcode("https://example.com", {\n  pixelSize: 6,\n  blackColor: "#000000",\n  whiteColor: "#ffffff",\n});\n\n// Embed in layout as a Photo node\nPhoto(svg).size(120).scaleType("cover")`,
    ).marginTop(8),
    Row(
      Column(
        caption("QR Code (SVG)"),
        Photo(qrcode("https://sone.dev", { pixelSize: 5 }))
          .size(100)
          .scaleType("contain"),
      )
        .gap(6)
        .alignItems("center")
        .padding(16)
        .bg(MUTED)
        .rounded(6),
      Column(
        body("qrcode(data, options?) returns a Buffer"),
        body("containing an SVG QR code ready to"),
        body("embed as a Photo node."),
        body(""),
        body("Options:"),
        body("· pixelSize — module size in px (default 4)"),
        body("· blackColor — dark module color"),
        body("· whiteColor — light module color"),
      )
        .gap(4)
        .flex(1)
        .padding(0, 0, 0, 16)
        .justifyContent("center"),
    )
      .gap(0)
      .marginTop(12)
      .alignItems("center"),
  ),

  card(
    h3("Tab stops — column alignment with \\t"),
    codeBlock(
      `Text("Name\\tScore\\tRank")\n  .tabStops(180, 280)       // x positions\n  .tabLeader(".")           // dot leader fill`,
    ).marginTop(8),
    TextDefault(
      Column(
        Text("Name\tScore\tRank")
          .size(10)
          .weight("bold")
          .color(DIM)
          .font("monospace")
          .tabStops(200, 290),
        rule(),
        ...(
          [
            ["Alice Chen", "9,840", "1st"],
            ["Bob Smith", "8,120", "2nd"],
            ["Carol Wu", "7,655", "3rd"],
          ] as [string, string, string][]
        ).flatMap(([name, score, rank]) => [
          Text(
            Span(name).color(INK),
            "\t",
            Span(score).color(GREEN),
            "\t",
            Span(rank).weight("bold").color(ACCENT),
          )
            .size(11)
            .font("monospace")
            .tabStops(200, 290),
          rule(),
        ]),
      )
        .gap(0)
        .padding(12)
        .bg(MUTED)
        .rounded(6)
        .marginTop(8),
    ).lineHeight(1.8),
  ),

  card(
    h3("Text orientation — layout-aware rotation"),
    codeBlock(
      `Text("Rotated").size(16).orientation(90)  // swaps width/height in Yoga`,
    ).marginTop(8),
    Row(
      ...(
        [
          { deg: 0, label: "0°" },
          { deg: 90, label: "90°" },
          { deg: 180, label: "180°" },
          { deg: 270, label: "270°" },
        ] as { deg: 0 | 90 | 180 | 270; label: string }[]
      ).map(({ deg, label }) =>
        Column(
          Text(label).size(16).weight("bold").color(ACCENT).orientation(deg),
          caption(label),
        )
          .flex(1)
          .alignItems("center")
          .justifyContent("center")
          .padding(16)
          .bg(MUTED)
          .rounded(4)
          .gap(8),
      ),
    )
      .gap(8)
      .marginTop(12),
  ),

  card(
    h3("clipImage — image through letterforms"),
    codeBlock(
      `Text("SONE")\n  .size(90)\n  .weight("bold")\n  .clipImage(Photo("image.jpg").scaleType("cover"))`,
    ).marginTop(8),
    Column(
      body("clipImage() fills text letterforms with an image."),
      body("The Photo is clipped to the exact shape of each glyph."),
      body("Any scaleType works: cover / contain / fill."),
    )
      .gap(4)
      .padding(12)
      .bg(MUTED)
      .rounded(6)
      .marginTop(8),
  ),
)
  .bg(W)
  .padding(32, 40)
  .gap(12);

// ── Page 12 — API Reference ───────────────────────────────────────────────────
const referenceSection = Column(
  sectionHead(
    "12 — API REFERENCE",
    "Complete Node & Builder Reference",
    "All exported node factory functions and their key builder methods.",
  ),

  card(
    h3("Node factory functions"),
    Grid(
      ...(
        [
          ["Column(...children)", "Vertical flex container"],
          ["Row(...children)", "Horizontal flex container"],
          ["Grid(...children)", "CSS Grid container"],
          ["Text(...parts)", "Text block with inline spans"],
          ["Span(text)", "Inline styled text segment"],
          ["TextDefault(...children)", "Set default text styles for subtree"],
          ["Photo(src)", "Image node"],
          ["Path(d)", "SVG path node"],
          ["Table(...rows)", "Table container"],
          ["TableRow(...cells)", "Table row"],
          ["TableCell(...children)", "Table cell"],
          ["List(...items)", "List container"],
          ["ListItem(...children)", "List item"],
          ["ClipGroup(path, ...children)", "SVG clip group"],
          ["PageBreak()", "Explicit page break"],
          ["qrcode(data, opts?)", "QR code → Buffer (SVG)"],
          ["Font.load(name, src)", "Register custom font"],
          ["sone(root, config?)", "Create render context"],
        ] as [string, string][]
      ).map(([name, desc]) =>
        Column(
          Text(name).size(9).font("monospace").color(CODE_INK),
          body(desc).size(9).marginTop(2),
        )
          .padding(8)
          .bg(MUTED)
          .rounded(4),
      ),
    )
      .columns("1fr", "1fr")
      .columnGap(10)
      .rowGap(8)
      .marginTop(10),
  ),

  card(
    h3("LayoutProps — all layout nodes"),
    Grid(
      ...(
        [
          ["position()", "static | relative | absolute"],
          ["inset / top / left / right / bottom", "Absolute position offsets"],
          ["display()", "none | flex | contents"],
          ["overflow()", "visible | hidden | scroll"],
          ["bg() / background()", "Colors, gradients, images"],
          ["opacity(0–1)", "Element opacity"],
          ["shadow(...css)", "CSS box shadows"],
          ["blur / brightness / contrast…", "CSS filters"],
          ["rotate(deg)", "Rotation in degrees"],
          ["scale(x, y?)", "Scale transform"],
          ["translateX / translateY", "Translation"],
          ["tag(name)", "Debug identifier"],
          ["pageBreak()", "before | after | avoid"],
          ["aspectRatio(n)", "Width/height ratio"],
          ["borderWidth(…)", "CSS shorthand 1–4 values"],
          ["borderColor(value)", "Border color"],
          ["rounded(…) / cornerRadius(…)", "Corner radii"],
          ["cornerSmoothing(0–1)", "Squircle smoothing"],
          ["corner('cut')", "Chamfered corners"],
        ] as [string, string][]
      ).map(([name, desc]) =>
        Row(
          Text(name)
            .size(9)
            .font("monospace")
            .color(CODE_INK)
            .width(190)
            .shrink(0),
          body(desc).size(9).flex(1),
        ).padding(5, 0),
      ),
    )
      .columns("1fr", "1fr")
      .columnGap(24)
      .marginTop(10),
  ),

  Row(
    Column(
      Text("Sone — Declarative Canvas Layout for Node.js & the browser")
        .size(10)
        .color(DIM)
        .align("center"),
      Text("github.com/yourusername/sone  ·  MIT License")
        .size(9)
        .color(DIM)
        .align("center")
        .marginTop(4),
    )
      .flex(1)
      .alignItems("center"),
  ).marginTop(8),
)
  .bg(W)
  .padding(32, 40)
  .gap(12);

// ── Header & Footer ───────────────────────────────────────────────────────────
const pageHeader = Row(
  Row(
    Row(Text("S").size(10).weight("bold").color(W))
      .size(20)
      .bg(ACCENT)
      .rounded(4)
      .alignItems("center")
      .justifyContent("center")
      .shrink(0),
    Text("Sone Documentation").size(10).weight("bold").color(INK),
  )
    .gap(8)
    .alignItems("center"),
  Text("Declarative Canvas Layout Engine").size(9).color(DIM),
)
  .bg(W)
  .padding(8, 16)
  .justifyContent("space-between")
  .alignItems("center")
  .borderWidth(0, 0, 1, 0)
  .borderColor(RULE);

const pageFooter = ({ pageNumber, totalPages }: SonePageInfo) =>
  Row(
    Text("Sone  ·  Full Feature Documentation").size(9).color(DIM),
    Text(Span(`${pageNumber}`).weight("bold").color(INK), ` / ${totalPages}`)
      .size(9)
      .color(DIM),
  )
    .bg(W)
    .padding(8, 16)
    .justifyContent("space-between")
    .alignItems("center")
    .borderWidth(1, 0, 0, 0)
    .borderColor(RULE);

// ── Root ──────────────────────────────────────────────────────────────────────
const root = Column(
  cover,
  quickStart,
  layoutSection,
  gridSection,
  textSection,
  stylingSection,
  bordersSection,
  visualSection,
  tableSection,
  listSection,
  pdfSection,
  advancedSection,
  referenceSection,
)
  .width(PAGE_W)
  .bg(W)
  .gap(0);

// ── Render ────────────────────────────────────────────────────────────────────
const pdfBuf = await sone(root, {
  pageHeight: PAGE_H,
  header: pageHeader,
  footer: pageFooter,
  lastPageHeight: "content",
  width: PAGE_W,
  margin: { top: BAND_GAP, bottom: BAND_GAP },
}).pdf();

const outPath = path.join(dir, "doc.pdf");
await fs.writeFile(outPath, pdfBuf);
console.log(`PDF → ${outPath}`);
