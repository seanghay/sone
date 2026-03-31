import { Column, Row, Span, Text } from "../../src/node.ts";
import { loadVisualTestFonts } from "./load-test-fonts.ts";
import { writeCanvasToFile } from "./utils.ts";

await loadVisualTestFonts();

const sample = "AAAA aaaa AAAA aaaa AAAA aaaa AAAA aaaa AAAA aaaa AAAA aaaa.";
const compareSample =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor";
const khmerJustifySample =
  "ក្រសួងការពារជាតិកម្ពុជា បានគូសបញ្ជាក់ថា ការប្រើប្រាស់សព្វាវុធធុនធ្ងន់គ្រប់ប្រភេទ និងការដាក់ពង្រាយទាហានយ៉ាងច្រើនលើសលុប គឺជាការរំលោភច្បាស់លាស់លើធម្មនុញ្ញអង្គការសហប្រជាជាតិ និងធម្មនុញ្ញអាស៊ាន។";
const mixedSample = Text(
  "lorem ",
  Span("ipsum dolor ").color("#a62121"),
  "sit amet consectetur adipiscing",
)
  .font("GeistMono")
  .size(22)
  .width(300)
  .lineHeight(1.35)
  .lineBreak("knuth-plass")
  .color("#201a17");

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
    "Focused visual checks for alignment, justification, first-line indent, hanging indent, explicit line breaks, nowrap, and Khmer justified line breaking.",
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
      "justify-greedy",
      Text(sample)
        .font("GeistMono")
        .size(22)
        .width(300)
        .align("justify")
        .lineBreak("greedy")
        .lineHeight(1.35)
        .color("#201a17"),
    ),
    card(
      "justify-knuth-plass",
      Text(sample)
        .font("GeistMono")
        .size(22)
        .width(300)
        .align("justify")
        .lineBreak("knuth-plass")
        .lineHeight(1.35)
        .color("#201a17"),
    ),
  )
    .gap(24)
    .wrap("wrap"),
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
    card(
      "greedy-compare",
      Text(compareSample)
        .font("GeistMono")
        .size(20)
        .width(300)
        .lineBreak("greedy")
        .lineHeight(1.35)
        .color("#201a17"),
    ),
  )
    .gap(24)
    .wrap("wrap"),
  Row(
    card(
      "knuth-plass-compare",
      Text(compareSample)
        .font("GeistMono")
        .size(20)
        .width(300)
        .lineBreak("knuth-plass")
        .lineHeight(1.35)
        .color("#201a17"),
    ),
    card("mixed-spans-knuth-plass", mixedSample),
    card(
      "tabs-fallback",
      Text("Label\tValue\tTail")
        .font("GeistMono")
        .size(22)
        .width(300)
        .tabStops(140, 220)
        .lineBreak("knuth-plass")
        .color("#201a17"),
    ),
  )
    .gap(24)
    .wrap("wrap"),
  Row(
    card(
      "khmer-justify-greedy",
      Text(khmerJustifySample)
        .font("NotoSansKhmer")
        .size(22)
        .width(300)
        .align("justify")
        .lineBreak("greedy")
        .lineHeight(1.45)
        .color("#201a17"),
    ),
    card(
      "khmer-justify-knuth-plass",
      Text(khmerJustifySample)
        .font("NotoSansKhmer")
        .size(22)
        .width(300)
        .align("justify")
        .lineBreak("knuth-plass")
        .lineHeight(1.45)
        .color("#201a17"),
    ),
  )
    .gap(24)
    .wrap("wrap"),
)
  .gap(24)
  .padding(40)
  .bg("#f5eee6");

await writeCanvasToFile(root, import.meta.url);
