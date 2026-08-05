import { Column, Row, Text } from "../../src/index.ts";
import { writeCanvasToFile } from "./utils.ts";

// Overlapping dots inside one group. With correct *group* opacity the overlap
// composites once (no double-darkening); the group's alpha is applied to the
// flattened result.
const dot = (color: string, x: number) =>
  Column().size(90).rounded(999).bg(color).position("absolute").left(x).top(0);

const cluster = (opacity: number) =>
  Column(
    Column(dot("#ef4444", 0), dot("#3b82f6", 55), dot("#22c55e", 28))
      .size(145, 90)
      .opacity(opacity),
    Text(`opacity ${opacity}`)
      .size(11)
      .weight("bold")
      .font("GeistMono")
      .color("#e2e8f0")
      .marginTop(14),
  ).alignItems("center");

// A simple opacity ramp on solid tiles.
const ramp = (opacity: number) =>
  Column(Text(`${opacity}`).size(11).font("GeistMono").color("#0f172a"))
    .size(72, 72)
    .rounded(12)
    .bg("#f8fafc")
    .opacity(opacity)
    .alignItems("center")
    .justifyContent("center");

const root = Column(
  Text("Opacity").size(30).weight("bold").color("#f8fafc"),
  Text("Group opacity flattens overlapping children before applying alpha.")
    .size(13)
    .color("#94a3b8")
    .marginTop(4),
  Row(cluster(1), cluster(0.6), cluster(0.3)).gap(40).marginTop(28),
  Row(...[0.2, 0.4, 0.6, 0.8, 1].map(ramp))
    .gap(16)
    .marginTop(36),
)
  .bg("linear-gradient(180deg, #020617 0%, #1e1b4b 100%)")
  .padding(40)
  .gap(0);

await writeCanvasToFile(root, import.meta.url);
