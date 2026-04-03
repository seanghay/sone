import { Column, Row, Text } from "../../src/node.ts";
import { loadVisualTestFonts } from "./load-test-fonts.ts";
import { writeCanvasToFile } from "./utils.ts";

await loadVisualTestFonts();

const card = (title: string, note: string, node: ReturnType<typeof Text>) =>
  Column(
    Text(title).font("GeistMono").size(18).weight("bold").color("#172554"),
    Text(note).font("GeistMono").size(12).lineHeight(1.4).color("#334155"),
    node,
  )
    .gap(10)
    .width(300)
    .padding(18)
    .bg("white")
    .borderWidth(2)
    .borderColor("#bfdbfe")
    .rounded(22);

const sample = (text: string, font: string, width: number, size: number) =>
  Text(text)
    .font(font)
    .size(size)
    .width(width)
    .lineHeight(1.35)
    .bg("#eff6ff")
    .padding(14)
    .rounded(16)
    .color("#0f172a");

const latin = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const khmer = "កកកកកកកកកកកកកកកកកកកកកកកកកកកកកក";
const lao = "ກກກກກກກກກກກກກກກກກກກກກກກກ";

const root = Column(
  Text("Tight no-space wrap regression board")
    .font("GeistMono")
    .size(30)
    .weight("bold")
    .color("#172554"),
  Text(
    "Long runs without spaces should still wrap inside very narrow widths instead of overflowing on a single line.",
  )
    .font("GeistMono")
    .size(16)
    .lineHeight(1.45)
    .color("#334155")
    .maxWidth(920),
  Row(
    card(
      "latin-tight-wrap",
      "ASCII text should split into short wrapped segments at grapheme boundaries.",
      sample(latin, "GeistMono", 72, 22),
    ),
    card(
      "khmer-tight-wrap",
      "Khmer without spaces should still wrap on a very narrow width.",
      sample(khmer, "NotoSansKhmer", 72, 22),
    ),
    card(
      "lao-tight-wrap",
      "Lao without spaces should also wrap instead of overflowing.",
      sample(lao, "sans-serif", 72, 22),
    ),
  )
    .gap(20)
    .wrap("wrap"),
)
  .gap(22)
  .padding(36)
  .bg("#f8fbff");

await writeCanvasToFile(root, import.meta.url);
