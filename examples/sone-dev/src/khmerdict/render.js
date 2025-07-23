import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Column, Photo, Row, Span, Text } from "sone";

export const config = {
  debug: false,
};

const assetsDir = join(dirname(fileURLToPath(import.meta.url)), "assets");

export async function loader({ req, loadAsset, isDev }) {
  const icon = await loadAsset(join(assetsDir, "icon.png"));
  return {
    icon,
    title: "វចនានុក្រមខ្មែរ",
    desc: "រហ័ស គ្មានពាណិជ្ជកម្ម និងងាយស្រួលប្រើប្រាស់",
    url: "khmerdict.com/",
    word: "មោទនភាព",
    sponsor: "រឹម ស៊ីឡា",
    definition: "ភាពជាទីគួរឱ្យកោតស្ញប់ស្ញែង ជាទីគួរឱ្យគោរពកោតសរសើរ",
    example: "គាត់មានមោទនភាពដោយកូនប្រឡងជាប់, អង្គរវត្តជាមោទនភាពជាតិខ្មែរ។",
    partOfSpeech: "ន.",
    pronunciation: "អានថា៖ [មោ-ទៈ-នៈ-ភាប]",
  };
}

/**
 * @param {Awaited<ReturnType<loader>>} param
 */
export default function ({
  icon,
  title,
  desc,
  url,
  word,
  sponsor,
  definition,
  example,
  partOfSpeech,
  pronunciation,
}) {
  return Column(
    Row(
      Photo(icon).size(72),
      Column(
        Text(title).size(34).color("white").font("Inter Khmer").weight(600),
        Text(desc).size(22).color("rgba(255,255,255,.7)").font("Inter Khmer"),
      )
        .gap(20)
        .grow(1),
      Column(
        Text(url, Span(word).color("white"))
          .size(24)
          .weight(500)
          .align("right")
          .color("rgba(255,255,255,.7)")
          .font("Inter Khmer"),

        Column(
          Text("ឧបត្ថម្ភដោយ៖ ", Span(sponsor).color("gold").weight("bold"))
            .size(25)
            .weight(500)
            .color("rgba(255,255,255,.7)")
            .align("right")
            .font("Inter Khmer"),
        )
          .bg("rgba(255,255,255,.1)")
          .padding(8, 10, 12, 10)
          .cornerRadius(10)
          .cornerSmoothing(0.7)
          .alignSelf("flex-end"),
      ).gap(20),
    )
      .alignItems("center")
      .gap(20)
      .bg("rgba(255,255,255,.06)")
      .padding(28, 36),
    Column().height(2).bg("rgba(255,255,255,.15)"),
    Column(
      Row(
        Text(word).size(36).color("white").font("Inter Khmer").weight("bold"),
        Column(
          Text(partOfSpeech)
            .size(24)
            .color("white")
            .nowrap()
            .font("Inter Khmer"),
        )
          .bg("rgba(255,255,255,.15)")
          .padding(8, 6)
          .cornerRadius(10)
          .cornerSmoothing(0.7),

        Column().grow(1),
        Column(Text(pronunciation).size(22).color("white").font("Inter Khmer"))
          .bg("rgba(255,255,255,.1)")
          .padding(8, 10, 10, 10)
          .cornerRadius(10)
          .cornerSmoothing(0.7),
      )
        .gap(6)

        .alignItems("center"),

      Text(definition)
        .color("rgba(255,255,255,.9)")
        .font("Inter Khmer")
        .size(28)
        .lineHeight(1.6),

      Column(
        Text(example)
          .color("rgba(255,255,255,.9)")
          .font("Inter Khmer")
          .size(28)
          .weight("italic")
          .lineHeight(1.6),
      )
        .bg("rgba(255,255,255,.1)")
        .padding(14)
        .alignSelf("flex-start")
        .cornerRadius(14)
        .cornerSmoothing(0.7),
    )
      .padding(34, 44)
      .gap(30)
      .grow(1),
    Column().height(2).bg("rgba(255,255,255,.1)").marginTop(10),
    Column(
      Text(
        "Dynamic Image Generation powered by ",
        Span("Sone.js").weight(700).color("white"),
      )
        .font("Inter Khmer")
        .size(20)
        .color("rgba(255,255,255,.8)"),
    )
      .bg("rgba(0,0,0,.3)")
      .padding(14, 10)
      .alignItems("center"),
  )
    .width(1000)
    .minHeight(1000 / 2)
    .bg("linear-gradient(to bottom, #1a2131 0%, #0e161f 100%)");
}
