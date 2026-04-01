import { Column, Row, renderer, Text } from "../../src/node.ts";
import { loadVisualTestFonts } from "./load-test-fonts.ts";
import { writeCanvasToFile } from "./utils.ts";

await loadVisualTestFonts();

const baseProps = {
  color: "#201a17",
  font: ["GeistMono"],
  lineHeight: 1.35,
  size: 20,
} as const;

const samples = [
  {
    expectedFirstLine: "Alpha",
    label: "control-space",
    lineBreak: "greedy" as const,
    text: "Alpha Beta Gamma",
    title: "Control / Greedy",
  },
  {
    expectedFirstLine: "Alpha Beta",
    label: "control-space-knuth",
    lineBreak: "knuth-plass" as const,
    text: "Alpha Beta Gamma",
    title: "Control / Knuth-Plass",
  },
  {
    expectedFirstLine: "Alpha\u2060 Beta",
    label: "joiner-before-space",
    lineBreak: "greedy" as const,
    text: "Alpha\u2060 Beta Gamma",
    title: "WJ Before Space / Greedy",
  },
  {
    expectedFirstLine: "Alpha\u2060 Beta",
    label: "joiner-before-space-knuth",
    lineBreak: "knuth-plass" as const,
    text: "Alpha\u2060 Beta Gamma",
    title: "WJ Before Space / Knuth-Plass",
  },
  {
    expectedFirstLine: "Alpha \u2060Beta",
    label: "joiner-after-space",
    lineBreak: "greedy" as const,
    text: "Alpha \u2060Beta Gamma",
    title: "WJ After Space / Greedy",
  },
  {
    expectedFirstLine: "Alpha \u2060Beta",
    label: "joiner-after-space-knuth",
    lineBreak: "knuth-plass" as const,
    text: "Alpha \u2060Beta Gamma",
    title: "WJ After Space / Knuth-Plass",
  },
  {
    expectedFirstLine: "Alpha \u2060 Beta",
    label: "joiner-around-space",
    lineBreak: "greedy" as const,
    text: "Alpha \u2060 Beta Gamma",
    title: "WJ Around Space / Greedy",
  },
  {
    expectedFirstLine: "Alpha \u2060 Beta",
    label: "joiner-around-space-knuth",
    lineBreak: "knuth-plass" as const,
    text: "Alpha \u2060 Beta Gamma",
    title: "WJ Around Space / Knuth-Plass",
  },
  {
    expectedFirstLine: "Alpha\u00a0Beta",
    label: "nbsp",
    lineBreak: "greedy" as const,
    text: "Alpha\u00a0Beta Gamma",
    title: "NBSP / Greedy",
  },
  {
    expectedFirstLine: "Alpha\u00a0Beta",
    label: "nbsp-knuth",
    lineBreak: "knuth-plass" as const,
    text: "Alpha\u00a0Beta Gamma",
    title: "NBSP / Knuth-Plass",
  },
  {
    expectedFirstLine: "Alpha \u00a0Beta",
    label: "nbsp-after-space",
    lineBreak: "greedy" as const,
    text: "Alpha \u00a0Beta Gamma",
    title: "NBSP After Space / Greedy",
  },
  {
    expectedFirstLine: "Alpha \u00a0Beta",
    label: "nbsp-after-space-knuth",
    lineBreak: "knuth-plass" as const,
    text: "Alpha \u00a0Beta Gamma",
    title: "NBSP After Space / Knuth-Plass",
  },
];

const card = ({
  expectedFirstLine,
  label,
  lineBreak,
  text,
  title,
}: (typeof samples)[number]) => {
  const width =
    Math.ceil(renderer.measureText(expectedFirstLine, baseProps).width) + 1;

  return Column(
    Text(title).font("GeistMono").size(16).weight("bold").color("#6d4c41"),
    Text(label).font("GeistMono").size(12).color("#8b6b5a"),
    Text(text)
      .font(...baseProps.font)
      .size(baseProps.size)
      .lineHeight(baseProps.lineHeight)
      .width(width)
      .lineBreak(lineBreak)
      .color(baseProps.color),
  )
    .gap(10)
    .width(width + 40)
    .padding(20)
    .bg("white")
    .borderColor("#d7c4b6")
    .borderWidth(2)
    .rounded(24)
    .tag(label);
};

const root = Column(
  Text("Glue character regression board")
    .font("GeistMono")
    .size(30)
    .weight("bold")
    .color("#2f241f"),
  Text(
    "The control cards wrap at normal spaces. The word-joiner and NBSP cards should keep the glued span on the first line and push only Gamma to the second line.",
  )
    .font("GeistMono")
    .size(16)
    .maxWidth(900)
    .lineHeight(1.4)
    .color("#6d4c41"),
  Row(...samples.map(card))
    .gap(24)
    .wrap("wrap"),
)
  .gap(24)
  .padding(40)
  .bg("#f5eee6");

await writeCanvasToFile(root, import.meta.url);
