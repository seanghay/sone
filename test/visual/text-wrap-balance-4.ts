/**
 * Visual test: balanced text at different font sizes and container widths
 * Shows that balance works correctly across a wide range of configurations
 */
import { Column, Row, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const TEXT =
  "Typography shapes how readers experience content — balance makes it look intentional.";

function Sample(
  label: string,
  size: number,
  maxWidth: number,
  balanced: boolean,
  accent: string,
) {
  return Column(
    Text(label)
      .font("sans-serif")
      .size(10)
      .weight("bold")
      .color(accent)
      .letterSpacing(1),
    Text(TEXT)
      .font("sans-serif")
      .size(size)
      .lineHeight(1.45)
      .color("#1f2937")
      .maxWidth(maxWidth)
      .apply(balanced ? { textWrap: "balance" } : {}),
    // ruler to show the container width
    Row()
      .height(2)
      .width(maxWidth)
      .bg(balanced ? accent : "#e5e7eb")
      .rounded(1),
  )
    .gap(8)
    .bg("white")
    .padding(20)
    .rounded(12);
}

const SIZES = [12, 16, 22, 30];
const WIDTHS = [200, 340, 500];

const root = Column(
  Text("Balance across font sizes & container widths")
    .font("sans-serif")
    .size(13)
    .weight("bold")
    .color("#888")
    .alignSelf("flex-start"),

  // ── Vary font size at fixed width ────────────────────────────────────────
  Column(
    Text("varying font size  (container = 360px)")
      .font("sans-serif")
      .size(11)
      .weight("bold")
      .color("#d1d5db"),
    Row(
      ...SIZES.map((size) =>
        Column(
          Sample(`${size}px — greedy`, size, 360, false, "#9ca3af"),
          Sample(`${size}px — balanced`, size, 360, true, "#6366f1"),
        )
          .gap(12)
          .flex(1),
      ),
    )
      .gap(16)
      .alignItems("flex-start"),
  ).gap(10),

  // ── Vary container width at fixed size ───────────────────────────────────
  Column(
    Text("varying container width  (font = 18px)")
      .font("sans-serif")
      .size(11)
      .weight("bold")
      .color("#d1d5db"),
    Row(
      ...WIDTHS.map((w) =>
        Column(
          Sample(`${w}px — greedy`, 18, w, false, "#9ca3af"),
          Sample(`${w}px — balanced`, 18, w, true, "#10b981"),
        )
          .gap(12)
          .flex(1),
      ),
    )
      .gap(16)
      .alignItems("flex-start"),
  ).gap(10),
)
  .gap(32)
  .bg("#f9fafb")
  .padding(40);

await writeCanvasToFile(root, import.meta.url);
