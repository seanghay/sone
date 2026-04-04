/**
 * Visual test: balanced pull-quotes and editorial callouts
 * Shows how balance improves large display text and pull-quotes
 */
import { Column, Row, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const W = 520;

function Divider() {
  return Row().height(1).bg("#e5e7eb").alignSelf("stretch");
}

function Label(text: string) {
  return Text(text)
    .font("sans-serif")
    .size(10)
    .weight("bold")
    .color("#9ca3af")
    .letterSpacing(1.2);
}

function PullQuote(quote: string, balanced: boolean) {
  return Column(
    Label(balanced ? "BALANCED" : "GREEDY"),
    Text(`"${quote}"`)
      .font("serif")
      .size(32)
      .lineHeight(1.4)
      .color("#1a1a2e")
      .maxWidth(W)
      .apply(balanced ? { textWrap: "balance" } : {}),
  )
    .gap(12)
    .bg("white")
    .padding(32)
    .rounded(16)
    .flex(1);
}

function Stat(value: string, label: string, balanced: boolean) {
  return Column(
    Text(value).font("sans-serif").size(48).weight("bold").color("#6366f1"),
    Text(label)
      .font("sans-serif")
      .size(14)
      .lineHeight(1.4)
      .color("#6b7280")
      .maxWidth(140)
      .apply(balanced ? { textWrap: "balance" } : {}),
  )
    .gap(6)
    .alignItems("center")
    .flex(1)
    .bg("white")
    .padding(24)
    .rounded(16);
}

const QUOTE =
  "The measure of intelligence is the ability to change and adapt in an ever-shifting world.";

const STATS: Array<{ value: string; label: string }> = [
  { value: "3.2×", label: "Faster page load on mobile devices" },
  { value: "98%", label: "Customer satisfaction score worldwide" },
  { value: "40M+", label: "Active users across all platforms" },
];

const root = Column(
  Text("Pull-quotes & stats — balanced vs. greedy")
    .font("sans-serif")
    .size(13)
    .weight("bold")
    .color("#888")
    .alignSelf("flex-start"),

  // ── Pull-quote comparison ────────────────────────────────────────────────
  Text("Pull-quote")
    .font("sans-serif")
    .size(11)
    .weight("bold")
    .color("#d1d5db")
    .alignSelf("flex-start"),
  Row(PullQuote(QUOTE, false), PullQuote(QUOTE, true)).gap(20),

  Divider(),

  // ── Stat cards ───────────────────────────────────────────────────────────
  Column(
    Text("Stat cards — greedy")
      .font("sans-serif")
      .size(11)
      .weight("bold")
      .color("#d1d5db"),
    Row(...STATS.map(({ value, label }) => Stat(value, label, false))).gap(16),
  ).gap(10),

  Column(
    Text("Stat cards — balanced")
      .font("sans-serif")
      .size(11)
      .weight("bold")
      .color("#d1d5db"),
    Row(...STATS.map(({ value, label }) => Stat(value, label, true))).gap(16),
  ).gap(10),

  Divider(),

  // ── Display headline ────────────────────────────────────────────────────
  Column(
    Text("Large display headline")
      .font("sans-serif")
      .size(11)
      .weight("bold")
      .color("#d1d5db"),
    Row(
      Column(
        Label("GREEDY"),
        Text("Designed for humans, built for the future of tomorrow")
          .font("sans-serif")
          .size(40)
          .weight("bold")
          .lineHeight(1.15)
          .color("#111827")
          .maxWidth(W),
      )
        .gap(10)
        .bg("white")
        .padding(28)
        .rounded(16)
        .flex(1),

      Column(
        Label("BALANCED"),
        Text("Designed for humans, built for the future of tomorrow")
          .font("sans-serif")
          .size(40)
          .weight("bold")
          .lineHeight(1.15)
          .color("#111827")
          .maxWidth(W)
          .textWrap("balance"),
      )
        .gap(10)
        .bg("white")
        .padding(28)
        .rounded(16)
        .flex(1),
    ).gap(20),
  ).gap(10),
)
  .gap(24)
  .bg("#f3f4f6")
  .padding(40);

await writeCanvasToFile(root, import.meta.url);
