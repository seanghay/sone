/**
 * Visual test: multi-language hyphenation
 * French, German, Spanish, Dutch, Russian side by side.
 */
import { Column, Row, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const W = 180;

interface Sample {
  lang: string;
  locale: string;
  text: string;
  color: string;
}

const SAMPLES: Sample[] = [
  {
    lang: "English",
    locale: "en",
    text: "The internationalization of software development requires careful typographical consideration.",
    color: "#3b82f6",
  },
  {
    lang: "French",
    locale: "fr",
    text: "Le développement international de logiciels nécessite une typographie soignée et sophistiquée.",
    color: "#8b5cf6",
  },
  {
    lang: "German",
    locale: "de",
    text: "Die Internationalisierung der Softwareentwicklung erfordert sorgfältige typografische Überlegungen.",
    color: "#10b981",
  },
  {
    lang: "Spanish",
    locale: "es",
    text: "La internacionalización del desarrollo de software requiere consideraciones tipográficas cuidadosas.",
    color: "#f59e0b",
  },
  {
    lang: "Dutch",
    locale: "nl",
    text: "De internationalisering van softwareontwikkeling vereist zorgvuldige typografische overwegingen.",
    color: "#ef4444",
  },
];

function LangCard({ lang, locale, text, color }: Sample) {
  return Column(
    // Header
    Column(
      Text(lang).font("sans-serif").size(12).weight("bold").color("white"),
      Text(`locale: "${locale}"`)
        .font("sans-serif")
        .size(10)
        .color("rgba(255,255,255,0.7)"),
    )
      .gap(2)
      .bg(color)
      .padding(10, 14)
      .rounded(8, 8, 0, 0),

    // Without hyphenation
    Column(
      Text("default")
        .font("sans-serif")
        .size(9)
        .weight("bold")
        .color("#9ca3af")
        .letterSpacing(1),
      Text(text)
        .font("sans-serif")
        .size(13)
        .lineHeight(1.55)
        .color("#374151")
        .maxWidth(W),
    )
      .gap(6)
      .padding(14)
      .bg("white"),

    // With hyphenation
    Column(
      Text("hyphenate()")
        .font("sans-serif")
        .size(9)
        .weight("bold")
        .color(color)
        .letterSpacing(1),
      Text(text)
        .font("sans-serif")
        .size(13)
        .lineHeight(1.55)
        .color("#374151")
        .maxWidth(W)
        .hyphenate(locale),
    )
      .gap(6)
      .padding(14)
      .bg("#fafafa")
      .rounded(0, 0, 8, 8),
  )
    .shadow("0 2px 8px rgba(0,0,0,.08)")
    .rounded(8)
    .overflow("hidden")
    .flex(1);
}

const root = Column(
  Text("Multi-language hyphenation")
    .font("sans-serif")
    .size(13)
    .weight("bold")
    .color("#6b7280")
    .alignSelf("flex-start"),

  Row(...SAMPLES.map((s) => LangCard(s)))
    .gap(12)
    .alignItems("flex-start"),
)
  .gap(20)
  .bg("#f9fafb")
  .padding(40);

await writeCanvasToFile(root, import.meta.url);
