/**
 * Visual test: English hyphenation vs. default line breaking
 * Shows how .hyphenate() improves narrow-column typography.
 */
import { Column, Row, Span, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const NARROW = 200;

const BODY =
  "The internationalization of software development requires careful consideration of typographical rules, hyphenation algorithms, and text layout engines.";

const HEADING = "Extraordinary Accomplishments";

function Label(t: string) {
  return Text(t)
    .font("sans-serif")
    .size(10)
    .weight("bold")
    .color("#9ca3af")
    .letterSpacing(1);
}

function Card(label: string, children: ReturnType<typeof Column>) {
  return Column(Label(label), children)
    .gap(10)
    .bg("white")
    .padding(20)
    .rounded(12)
    .flex(1);
}

const root = Column(
  Text("Hyphenation demo — English (en-us)")
    .font("sans-serif")
    .size(13)
    .weight("bold")
    .color("#6b7280")
    .alignSelf("flex-start"),

  // ── Body text comparison ─────────────────────────────────────────────────
  Row(
    Card(
      "NO HYPHENATION",
      Column(
        Text(BODY)
          .font("sans-serif")
          .size(15)
          .lineHeight(1.6)
          .color("#111")
          .maxWidth(NARROW),
      ),
    ),
    Card(
      "hyphenate('en')",
      Column(
        Text(BODY)
          .font("sans-serif")
          .size(15)
          .lineHeight(1.6)
          .color("#111")
          .maxWidth(NARROW)
          .hyphenate("en"),
      ),
    ),
  ).gap(16),

  // ── Heading at different sizes ───────────────────────────────────────────
  Row(
    Card(
      "NO HYPHENATION",
      Column(
        Text(HEADING)
          .font("sans-serif")
          .size(36)
          .weight("bold")
          .lineHeight(1.2)
          .color("#111")
          .maxWidth(NARROW),
      ),
    ),
    Card(
      "hyphenate()",
      Column(
        Text(HEADING)
          .font("sans-serif")
          .size(36)
          .weight("bold")
          .lineHeight(1.2)
          .color("#111")
          .maxWidth(NARROW)
          .hyphenate(),
      ),
    ),
  ).gap(16),

  // ── Mixed spans ──────────────────────────────────────────────────────────
  Column(
    Label("HYPHENATION WITH STYLED SPANS"),
    Text(
      "The ",
      Span("internationalization").color("royalblue").weight("bold"),
      " of typography benefits from ",
      Span("hyphenation").color("tomato").weight("bold"),
      " algorithms that understand word structure.",
    )
      .font("sans-serif")
      .size(16)
      .lineHeight(1.6)
      .color("#222")
      .maxWidth(NARROW * 2 + 16)
      .hyphenate("en"),
  )
    .gap(10)
    .bg("white")
    .padding(20)
    .rounded(12),
)
  .gap(20)
  .bg("#f3f4f6")
  .padding(40);

await writeCanvasToFile(root, import.meta.url);
