/**
 * Visual test: balanced text in card/blog-post layouts
 * Shows how balance helps article cards with varying title lengths
 */
import { Column, Row, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

interface CardProps {
  category: string;
  categoryColor: string;
  title: string;
  excerpt: string;
  balanced: boolean;
}

function Card({
  category,
  categoryColor,
  title,
  excerpt,
  balanced,
}: CardProps) {
  return Column(
    Text(category)
      .font("sans-serif")
      .size(10)
      .weight("bold")
      .color(categoryColor)
      .letterSpacing(1.5),
    Text(title)
      .font("sans-serif")
      .size(22)
      .weight("bold")
      .lineHeight(1.3)
      .color("#111")
      .maxWidth(260)
      .apply(balanced ? { textWrap: "balance" } : {}),
    Text(excerpt)
      .font("sans-serif")
      .size(13)
      .lineHeight(1.6)
      .color("#666")
      .maxWidth(260)
      .apply(balanced ? { textWrap: "balance" } : {}),
    Row(
      Text("Read more →")
        .font("sans-serif")
        .size(12)
        .weight("bold")
        .color(categoryColor),
    ).marginTop(4),
  )
    .gap(10)
    .bg("white")
    .padding(24)
    .rounded(16)
    .width(308)
    .shadow("0 2px 12px rgba(0,0,0,.08)");
}

const CARDS: CardProps[] = [
  {
    category: "TECHNOLOGY",
    categoryColor: "#6366f1",
    title: "The Future of AI in Everyday Life",
    excerpt:
      "Artificial intelligence is quietly reshaping how we work, communicate, and make decisions every day.",
    balanced: false,
  },
  {
    category: "SCIENCE",
    categoryColor: "#10b981",
    title: "Deep-Sea Creatures That Glow in the Dark",
    excerpt:
      "Bioluminescence in the ocean depths reveals a hidden world of spectacular light-producing organisms.",
    balanced: false,
  },
  {
    category: "CULTURE",
    categoryColor: "#f59e0b",
    title: "Why Vinyl Records Are Making a Comeback",
    excerpt:
      "Sales of vinyl records have surpassed CDs for the first time since the 1980s — here is why.",
    balanced: false,
  },
];

const root = Column(
  Text("Blog card layout — greedy vs. balanced titles")
    .font("sans-serif")
    .size(13)
    .weight("bold")
    .color("#888")
    .alignSelf("flex-start"),

  // ── Greedy row ───────────────────────────────────────────────────────────
  Column(
    Text("default (greedy)")
      .font("sans-serif")
      .size(11)
      .weight("bold")
      .color("#bbb"),
    Row(...CARDS.map((c) => Card({ ...c, balanced: false }))).gap(16),
  ).gap(12),

  // ── Balanced row ────────────────────────────────────────────────────────
  Column(
    Text("textWrap('balance')")
      .font("sans-serif")
      .size(11)
      .weight("bold")
      .color("#bbb"),
    Row(...CARDS.map((c) => Card({ ...c, balanced: true }))).gap(16),
  ).gap(12),
)
  .gap(32)
  .bg("#f8f8fb")
  .padding(40);

await writeCanvasToFile(root, import.meta.url);
