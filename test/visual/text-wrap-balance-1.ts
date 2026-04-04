import { Column, Row, Span, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const SAMPLE =
  "The quick brown fox jumps over the lazy dog near the river bank on a sunny afternoon.";

const HEADING =
  "Breaking News: Scientists Discover New Species in the Amazon Rainforest";

const W = 480;

const root = Column(
  // ── Section label ──────────────────────────────────────────────────────────
  Text("text-wrap: balance demo")
    .font("sans-serif")
    .size(13)
    .weight("bold")
    .color("#888")
    .alignSelf("flex-start"),

  // ── Side-by-side comparison ─────────────────────────────────────────────
  Row(
    // Default (greedy)
    Column(
      Text("default (greedy)")
        .font("sans-serif")
        .size(11)
        .color("#aaa")
        .weight("bold"),
      Text(SAMPLE)
        .font("sans-serif")
        .size(16)
        .lineHeight(1.5)
        .color("#111")
        .maxWidth(W),
    )
      .gap(8)
      .flex(1)
      .bg("white")
      .padding(20)
      .rounded(12),

    // Balanced
    Column(
      Text("textWrap('balance')")
        .font("sans-serif")
        .size(11)
        .color("#aaa")
        .weight("bold"),
      Text(SAMPLE)
        .font("sans-serif")
        .size(16)
        .lineHeight(1.5)
        .color("#111")
        .maxWidth(W)
        .textWrap("balance"),
    )
      .gap(8)
      .flex(1)
      .bg("white")
      .padding(20)
      .rounded(12),
  ).gap(20),

  // ── Longer heading ───────────────────────────────────────────────────────
  Row(
    Column(
      Text("default (greedy)")
        .font("sans-serif")
        .size(11)
        .color("#aaa")
        .weight("bold"),
      Text(HEADING)
        .font("sans-serif")
        .size(28)
        .weight("bold")
        .lineHeight(1.3)
        .color("#111")
        .maxWidth(W),
    )
      .gap(8)
      .flex(1)
      .bg("white")
      .padding(20)
      .rounded(12),

    Column(
      Text("textWrap('balance')")
        .font("sans-serif")
        .size(11)
        .color("#aaa")
        .weight("bold"),
      Text(HEADING)
        .font("sans-serif")
        .size(28)
        .weight("bold")
        .lineHeight(1.3)
        .color("#111")
        .maxWidth(W)
        .textWrap("balance"),
    )
      .gap(8)
      .flex(1)
      .bg("white")
      .padding(20)
      .rounded(12),
  ).gap(20),

  // ── Multi-span balanced text ─────────────────────────────────────────────
  Column(
    Text("balanced with mixed spans")
      .font("sans-serif")
      .size(11)
      .color("#aaa")
      .weight("bold"),
    Text(
      "A ",
      Span("balanced").color("royalblue").weight("bold"),
      " layout distributes text evenly across lines, reducing the ",
      Span("ragged-right").color("tomato").weight("bold"),
      " effect common in typesetting.",
    )
      .font("sans-serif")
      .size(20)
      .lineHeight(1.6)
      .color("#222")
      .maxWidth(W * 2 + 20)
      .textWrap("balance"),
  )
    .gap(8)
    .bg("white")
    .padding(20)
    .rounded(12),
)
  .gap(20)
  .bg("#f4f4f4")
  .padding(40);

await writeCanvasToFile(root, import.meta.url);
