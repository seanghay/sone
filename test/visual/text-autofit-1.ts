import { Column, Row, Text } from "../../src/node.ts";
import { loadVisualTestFonts } from "./load-test-fonts.ts";
import { writeCanvasToFile } from "./utils.ts";

await loadVisualTestFonts();

const card = (title: string, node: ReturnType<typeof Text>) =>
  Column(
    Text(title)
      .font("GeistMono")
      .size(14)
      .weight("bold")
      .color("#6d4c41")
      .tag(`${title}-title`),
    node,
  )
    .gap(10)
    .width(340)
    .padding(20)
    .bg("white")
    .borderColor("#d7c4b6")
    .borderWidth(2)
    .rounded(20)
    .tag(title);

const root = Column(
  Text("nowrap + autofit visual regression")
    .font("GeistMono")
    .size(26)
    .weight("bold")
    .color("#2f241f"),
  Text("Each card shows text fitted to exactly one line within the card width.")
    .font("GeistMono")
    .size(14)
    .maxWidth(800)
    .color("#6d4c41")
    .lineHeight(1.4),
  Row(
    card(
      "nowrap-autofit-short",
      Text("Hello World")
        .font("GeistMono")
        .size(16)
        .width(300)
        .nowrap()
        .autofit()
        .color("#1a3c5e"),
    ),
    card(
      "nowrap-autofit-long",
      Text("The quick brown fox jumps over the lazy dog")
        .font("GeistMono")
        .size(16)
        .width(300)
        .nowrap()
        .autofit()
        .color("#1a3c5e"),
    ),
    card(
      "nowrap-autofit-very-long",
      Text("AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA")
        .font("GeistMono")
        .size(16)
        .width(300)
        .nowrap()
        .autofit()
        .color("#1a3c5e"),
    ),
  )
    .gap(24)
    .wrap("wrap"),
  Row(
    card(
      "nowrap-only (overflows)",
      Text("NOWRAP NOWRAP NOWRAP NOWRAP NOWRAP")
        .font("GeistMono")
        .size(22)
        .width(300)
        .nowrap()
        .color("#8a2d3b"),
    ),
    card(
      "autofit-height (no nowrap)",
      Text(
        "This text fits into a fixed height box by shrinking the font size automatically.",
      )
        .font("GeistMono")
        .size(22)
        .height(80)
        .autofit()
        .alignSelf("flex-start")
        .color("#2d5e3b"),
    ),
    card(
      "nowrap-autofit-narrow",
      Text("Wide text in a narrow box")
        .font("GeistMono")
        .size(16)
        .width(160)
        .nowrap()
        .autofit()
        .color("#1a3c5e"),
    ),
  )
    .gap(24)
    .wrap("wrap"),
)
  .gap(24)
  .padding(40)
  .bg("#f5eee6");

await writeCanvasToFile(root, import.meta.url);
