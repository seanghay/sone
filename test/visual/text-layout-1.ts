import { Column, Row, Text } from "../../src/node.ts";
import { loadVisualTestFonts } from "./load-test-fonts.ts";
import { writeCanvasToFile } from "./utils.ts";

await loadVisualTestFonts();

const sample = "AAAA aaaa AAAA aaaa AAAA aaaa AAAA aaaa AAAA aaaa AAAA aaaa.";

const card = (title: string, node: ReturnType<typeof Text>) =>
  Column(
    Text(title)
      .font("GeistMono")
      .size(18)
      .weight("bold")
      .color("#6d4c41")
      .tag(`${title}-title`),
    node,
  )
    .gap(12)
    .width(340)
    .padding(20)
    .bg("white")
    .borderColor("#d7c4b6")
    .borderWidth(2)
    .rounded(24)
    .tag(title);

const root = Column(
  Text("Text layout regression board")
    .font("GeistMono")
    .size(30)
    .weight("bold")
    .color("#2f241f"),
  Text(
    "Focused visual checks for alignment, justification, first-line indent, hanging indent, explicit line breaks, and nowrap.",
  )
    .font("GeistMono")
    .size(16)
    .maxWidth(900)
    .color("#6d4c41")
    .lineHeight(1.4),
  Row(
    card(
      "left-indent",
      Text(sample)
        .font("GeistMono")
        .size(22)
        .width(300)
        .indent(28)
        .hangingIndent(52)
        .lineHeight(1.35)
        .color("#201a17"),
    ),
    card(
      "justify",
      Text(sample)
        .font("GeistMono")
        .size(22)
        .width(300)
        .align("justify")
        .lineHeight(1.35)
        .color("#201a17"),
    ),
  ).gap(24),
  Row(
    card(
      "center-breaks",
      Text("Line one\nLine two\nLine three")
        .font("GeistMono")
        .size(24)
        .width(300)
        .align("center")
        .lineHeight(1.4)
        .color("#1f3c88"),
    ),
    card(
      "nowrap",
      Text("NOWRAP NOWRAP NOWRAP NOWRAP")
        .font("GeistMono")
        .size(24)
        .width(300)
        .nowrap()
        .color("#8a2d3b"),
    ),
  ).gap(24),
)
  .gap(24)
  .padding(40)
  .bg("#f5eee6");

await writeCanvasToFile(root, import.meta.url);
