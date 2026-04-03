import { Column, Row, Text } from "../../src/node.ts";
import { loadVisualTestFonts } from "./load-test-fonts.ts";
import { writeCanvasToFile } from "./utils.ts";

await loadVisualTestFonts();

const card = (title: string, note: string, node: ReturnType<typeof Text>) =>
  Column(
    Text(title).font("GeistMono").size(18).weight("bold").color("#1f2937"),
    Text(note).font("GeistMono").size(12).lineHeight(1.4).color("#475569"),
    node,
  )
    .gap(10)
    .width(340)
    .padding(18)
    .bg("white")
    .borderWidth(2)
    .borderColor("#cbd5e1")
    .rounded(22);

const khmerWrap = "ក្រសួងការពារជាតិ កម្ពុជា ប្រកាសព័ត៌មានថ្មី។ សូមប្រុងប្រយ័ត្ន";
const khmerSymbols = "តម្លៃសំបុត្រ $៥០ ក្នុងម្នាក់ និង បញ្ចុះតម្លៃ ១០០% សម្រាប់សិស្ស";
const laoWrap = "ກະຊວງສາທາລະນະສຸກ ປະກາດມາດຕະການໃໝ່ ເພື່ອຄວາມປອດໄພ";
const laoClamp = "ກະຊວງສາທາລະນະສຸກ ປະກາດມາດຕະການໃໝ່ ເພື່ອຄວາມປອດໄພ ແລະ ການເດີນທາງ";

const root = Column(
  Text("Multilingual text regression board")
    .font("GeistMono")
    .size(30)
    .weight("bold")
    .color("#0f172a"),
  Text(
    "Khmer and Lao snapshots that highlight wrap boundaries, punctuation attachment, symbol glue, and final-line behavior.",
  )
    .font("GeistMono")
    .size(16)
    .lineHeight(1.45)
    .color("#475569")
    .maxWidth(980),
  Row(
    card(
      "khmer-wrap-punctuation",
      "Khmer full stop should stay with the preceding phrase instead of leading a new line.",
      Text(khmerWrap)
        .font("NotoSansKhmer")
        .size(22)
        .width(260)
        .lineHeight(1.45)
        .bg("#f8fafc")
        .padding(14)
        .rounded(16)
        .color("#111827"),
    ),
    card(
      "khmer-symbol-glue",
      "Dollar and percent markers stay attached to Khmer numerals after wrapping.",
      Text(khmerSymbols)
        .font("NotoSansKhmer")
        .size(22)
        .width(260)
        .lineHeight(1.45)
        .bg("#f8fafc")
        .padding(14)
        .rounded(16)
        .color("#111827"),
    ),
  )
    .gap(20)
    .wrap("wrap"),
  Row(
    card(
      "lao-wrap-and-center",
      "Wrapped Lao lines should keep their break points and remain centered per line.",
      Text(laoWrap)
        .font("sans-serif")
        .size(22)
        .width(260)
        .lineHeight(1.45)
        .align("center")
        .bg("#f8fafc")
        .padding(14)
        .rounded(16)
        .color("#111827"),
    ),
    card(
      "lao-ellipsis-and-justify",
      "Justified Lao should stretch only non-final lines; clamped text should still trim before the ellipsis.",
      Text(`${laoWrap}\n\n${laoClamp}`)
        .font("sans-serif")
        .size(20)
        .width(260)
        .lineHeight(1.45)
        .align("justify")
        .maxLines(6)
        .textOverflow("ellipsis")
        .bg("#f8fafc")
        .padding(14)
        .rounded(16)
        .color("#111827"),
    ),
  )
    .gap(20)
    .wrap("wrap"),
)
  .gap(22)
  .padding(36)
  .bg("#f8fafc");

await writeCanvasToFile(root, import.meta.url);
