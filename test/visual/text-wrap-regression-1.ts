import { Column, Row, Span, Text } from "../../src/node.ts";
import { loadVisualTestFonts } from "./load-test-fonts.ts";
import { writeCanvasToFile } from "./utils.ts";

await loadVisualTestFonts();

const card = (title: string, note: string, node: ReturnType<typeof Text>) =>
  Column(
    Text(title).font("GeistMono").size(18).weight("bold").color("#4a1d0c"),
    Text(note).font("GeistMono").size(12).lineHeight(1.4).color("#9a3412"),
    node,
  )
    .gap(10)
    .width(320)
    .padding(18)
    .bg("white")
    .borderWidth(2)
    .borderColor("#fdba74")
    .rounded(22);

const root = Column(
  Text("Text wrap regression board")
    .font("GeistMono")
    .size(30)
    .weight("bold")
    .color("#431407"),
  Text(
    "Focused snapshots for leading-space trimming, span-boundary wraps, hanging indents, and justify expansion.",
  )
    .font("GeistMono")
    .size(16)
    .lineHeight(1.45)
    .color("#9a3412")
    .maxWidth(900),
  Row(
    card(
      "trim-leading-space",
      "Second line must start with $Beta, not a leading space.",
      Text("Alpha $Beta")
        .font("GeistMono")
        .size(22)
        .width(130)
        .lineHeight(1.35)
        .bg("#fff7ed")
        .padding(14)
        .rounded(16)
        .color("#1f2937"),
    ),
    card(
      "span-boundary-wrap",
      "Styled span begins after wrap without carrying its original leading space.",
      Text("Alpha", Span(" $Beta").color("#b91c1c").weight("bold"))
        .font("GeistMono")
        .size(22)
        .width(130)
        .lineHeight(1.35)
        .bg("#fff7ed")
        .padding(14)
        .rounded(16)
        .color("#1f2937"),
    ),
    card(
      "indent-hanging-indent",
      "First line shifts less than wrapped lines.",
      Text("Alpha Beta Gamma Delta")
        .font("GeistMono")
        .size(20)
        .width(180)
        .lineHeight(1.35)
        .indent(14)
        .hangingIndent(36)
        .bg("#fff7ed")
        .padding(14)
        .rounded(16)
        .color("#1f2937"),
    ),
  )
    .gap(20)
    .wrap("wrap"),
  Row(
    card(
      "justify-non-final-only",
      "Only the first wrapped line should stretch to the card width.",
      Text("Alpha Beta Gamma Delta")
        .font("GeistMono")
        .size(20)
        .width(180)
        .lineHeight(1.35)
        .align("justify")
        .bg("#fff7ed")
        .padding(14)
        .rounded(16)
        .color("#1f2937"),
    ),
    card(
      "centered-wrap",
      "Wrapped lines should stay centered independently.",
      Text("Alpha Beta Gamma Delta")
        .font("GeistMono")
        .size(20)
        .width(180)
        .lineHeight(1.35)
        .align("center")
        .bg("#fff7ed")
        .padding(14)
        .rounded(16)
        .color("#1f2937"),
    ),
    card(
      "ellipsis-trim",
      "Clamped line should end with an ellipsis and no stray space before it.",
      Text("Alpha Beta     Gamma Delta Epsilon Zeta Eta Theta")
        .font("GeistMono")
        .size(20)
        .width(180)
        .lineHeight(1.35)
        .maxLines(2)
        .textOverflow("ellipsis")
        .bg("#fff7ed")
        .padding(14)
        .rounded(16)
        .color("#1f2937"),
    ),
  )
    .gap(20)
    .wrap("wrap"),
)
  .gap(22)
  .padding(36)
  .bg("#fffbeb");

await writeCanvasToFile(root, import.meta.url);
