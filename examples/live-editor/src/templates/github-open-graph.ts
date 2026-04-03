import { Column, Row, Text } from "sone";

const card = {
  owner: "octo-labs",
  repo: "canvas-renderer",
  description:
    "A lightweight rendering toolkit for generating social graphics, reports, and document previews from declarative layouts.",
  stats: {
    stars: "12.8k",
    forks: "1.4k",
    language: "TypeScript",
    issues: "28 open",
  },
  accent: "#0969da",
};

export default function Root() {
  const label = (text: string) =>
    Column(
      Text(text)
        .size(11)
        .weight("700")
        .color("#4b5563")
        .letterSpacing(0.8),
    )
      .paddingTop(8)
      .paddingBottom(8)
      .paddingLeft(12)
      .paddingRight(12)
      .bg("rgba(9,105,218,0.08)")
      .cornerRadius(999);

  const stat = (title: string, value: string) =>
    Column(
      Text(title)
        .size(10)
        .weight("700")
        .color("#6b7280")
        .letterSpacing(0.9),
      Text(value)
        .size(19)
        .weight("800")
        .color("#111827")
        .marginTop(8),
    )
      .grow(1)
      .padding(18)
      .bg("linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)")
      .borderWidth(1)
      .borderColor("#dbeafe")
      .cornerRadius(16);

  const repoBadge = () =>
    Column(
      Text("{ }")
        .size(20)
        .weight("800")
        .color(card.accent)
        .letterSpacing(-1)
        .align("center"),
    )
      .size(74)
      .bg("linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)")
      .borderWidth(1)
      .borderColor("#bfdbfe")
      .cornerRadius(20)
      .alignItems("center")
      .justifyContent("center");

  return Column(
    Column(
      Row(
        Row(
          repoBadge(),
          Column(
            Row(
              label("Repository"),
              label(card.stats.language),
            ).gap(10).alignItems("center"),
            Row(
              Text(card.owner)
                .size(16)
                .weight("600")
                .color("#4b5563"),
              Text("/")
                .size(16)
                .color("#9ca3af"),
              Text(card.repo)
                .size(28)
                .weight("800")
                .color("#111827")
                .letterSpacing(-1.2),
            ).gap(8).alignItems("center").marginTop(18),
          ).grow(1),
        ).gap(22).alignItems("flex-start"),
        Column(
          Text("github.com")
            .size(12)
            .weight("700")
            .color("#6b7280"),
          Text(`${card.owner}/${card.repo}`)
            .size(14)
            .weight("700")
            .color("#111827")
            .marginTop(6),
        )
          .padding(16)
          .bg("linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)")
          .borderWidth(1)
          .borderColor("#dbeafe")
          .cornerRadius(16),
      ).alignItems("flex-start"),

      Text(card.description)
        .size(16)
        .lineHeight(1.55)
        .color("#4b5563")
        .maxWidth(620)
        .marginTop(26),

      Row(
        stat("STARS", card.stats.stars),
        stat("FORKS", card.stats.forks),
        stat("ISSUES", card.stats.issues),
      )
        .gap(14)
        .alignItems("stretch")
        .marginTop(28),
    )
      .paddingTop(34)
      .paddingBottom(34)
      .paddingLeft(32)
      .paddingRight(32)
      .bg("linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.98) 100%)")
      .borderWidth(1)
      .borderColor("#dbeafe")
      .cornerRadius(24),

    Row(
      Text("Open source")
        .size(12)
        .weight("700")
        .color("#4b5563"),
      Text("Built for social graphics, reports, and preview generation")
        .size(12)
        .color("#6b7280")
        .marginLeft(12),
    )
      .alignItems("center")
      .marginTop(16),
  )
    .paddingTop(42)
    .paddingBottom(42)
    .paddingLeft(40)
    .paddingRight(40)
    .bg(`linear-gradient(135deg, #f8fbff 0%, #eef4ff 62%, #dbeafe 100%)`)
    .width(960)
    .height(520);
}
