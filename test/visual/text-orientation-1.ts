import { Column, Row, Text } from "../../src/node.ts";
import { loadVisualTestFonts } from "./load-test-fonts.ts";
import { writeCanvasToFile } from "./utils.ts";

await loadVisualTestFonts();

const pillar = (
  label: string,
  orientation: 0 | 90 | 180 | 270,
  color: string,
) =>
  Text(label)
    .font("GeistMono")
    .size(26)
    .orientation(orientation)
    .padding(16, 20)
    .borderColor(color)
    .borderWidth(3)
    .color(color)
    .bg("white")
    .rounded(18)
    .tag(`orientation-${orientation}`);

const root = Column(
  Text("Orientation regression board")
    .font("GeistMono")
    .size(30)
    .weight("bold")
    .color("#2f241f"),
  Text(
    "The same short label is rendered at 0, 90, 180, and 270 degrees to catch footprint and drawing regressions.",
  )
    .font("GeistMono")
    .size(16)
    .maxWidth(760)
    .lineHeight(1.4)
    .color("#6d4c41"),
  Row(
    pillar("NORTH", 0, "#2d6a4f"),
    pillar("EAST", 90, "#1d3557"),
    pillar("SOUTH", 180, "#8a2d3b"),
    pillar("WEST", 270, "#7c5c1d"),
  )
    .gap(28)
    .alignItems("center")
    .padding(28)
    .bg("white")
    .borderColor("#d7c4b6")
    .borderWidth(2)
    .rounded(24),
)
  .gap(22)
  .padding(40)
  .bg("#eef1f4");

await writeCanvasToFile(root, import.meta.url);
