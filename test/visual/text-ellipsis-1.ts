import { Column, Row, Span, Text } from "../../src/node.ts";
import { loadVisualTestFonts } from "./load-test-fonts.ts";
import { writeCanvasToFile } from "./utils.ts";

await loadVisualTestFonts();

const latin = "Alpha Beta Gamma Delta Epsilon Zeta Eta Theta Iota Kappa Lambda";
const khmer =
  "ក្រសួងការពារជាតិកម្ពុជា បានគូសបញ្ជាក់ថា ការប្រើប្រាស់សព្វាវុធធុនធ្ងន់គ្រប់ប្រភេទ និងការដាក់ពង្រាយទាហានយ៉ាងច្រើនលើសលុប គឺជាការរំលោភច្បាស់លាស់។";

const card = (title: string, node: ReturnType<typeof Text>) =>
  Column(
    Text(title).font("GeistMono").size(18).weight("bold").color("#7c2d12"),
    node,
  )
    .gap(10)
    .width(320)
    .padding(18)
    .bg("white")
    .borderWidth(2)
    .borderColor("#fed7aa")
    .rounded(22);

const root = Column(
  Text("Text ellipsis regression board")
    .font("GeistMono")
    .size(30)
    .weight("bold")
    .color("#431407"),
  Text("Single-line, multi-line, mixed-style, and Khmer truncation snapshots.")
    .font("GeistMono")
    .size(16)
    .color("#9a3412"),
  Row(
    card(
      "nowrap-ellipsis",
      Text(latin)
        .font("GeistMono")
        .size(22)
        .width(260)
        .nowrap()
        .textOverflow("ellipsis")
        .color("#1f2937"),
    ),
    card(
      "two-line-clamp",
      Text(latin)
        .font("GeistMono")
        .size(20)
        .width(260)
        .maxLines(2)
        .textOverflow("ellipsis")
        .lineHeight(1.35)
        .color("#1f2937"),
    ),
    card(
      "mixed-style",
      Text("Status: ", Span("delayed departure to gate 24").color("#b91c1c"))
        .font("GeistMono")
        .size(20)
        .width(260)
        .maxLines(1)
        .textOverflow("ellipsis")
        .color("#1f2937"),
    ),
  )
    .gap(20)
    .wrap("wrap"),
  Row(
    card(
      "khmer-clamp",
      Text(khmer)
        .font("NotoSansKhmer")
        .size(22)
        .width(260)
        .maxLines(2)
        .textOverflow("ellipsis")
        .lineHeight(1.45)
        .color("#1f2937"),
    ),
    card(
      "unclamped-reference",
      Text(`Reference:\n${latin}`)
        .font("GeistMono")
        .size(20)
        .width(260)
        .lineHeight(1.35)
        .color("#1f2937"),
    ),
  )
    .gap(20)
    .wrap("wrap"),
)
  .gap(22)
  .padding(36)
  .bg("#fff7ed");

await writeCanvasToFile(root, import.meta.url);
