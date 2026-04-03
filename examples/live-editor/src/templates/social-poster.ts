import { Column, Row, Text, Span } from "sone";

const content = {
  header: {
    title: "DESIGN WEEKLY",
    issue: "Issue #48",
    badge: "LIVE",
  },
  hero: {
    tags: ["TREND", "2024"],
    headline: {
      bold: "Design\n",
      faded: "Trends",
    },
    description: "Shaping the future of digital interfaces and visual communication in the modern era.",
  },
  stats: [
    { value: "12.4K", label: "READERS" },
    { value: "248", label: "ARTICLES" },
    { value: "96%", label: "SATISFACTION" },
  ],
  footer: {
    ctaTitle: "Read this week's edition",
    ctaUrl: "designweekly.io/issue-48",
    buttonText: "READ NOW →",
  },
};

export default function Root() {
  const tag = (label: string) =>
    Text(label)
      .size(10)
      .weight("600")
      .color("rgba(255,255,255,0.7)")
      .bg("rgba(255,255,255,0.15)")
      .paddingTop(4)
      .paddingBottom(4)
      .paddingLeft(10)
      .paddingRight(10)
      .cornerRadius(20);

  const stat = (value: string, label: string) =>
    Column(
      Text(value).size(22).weight("800").color("white"),
      Text(label).size(9).color("rgba(255,255,255,0.6)").letterSpacing(1).weight("600"),
    ).alignItems("center").gap(2);

  const divider = () =>
    Column().width(1).height(32).bg("rgba(255,255,255,0.2)");

  return Column(
    // Top bar
    Row(
      Column(
        Text(content.header.title).size(9).weight("700").color("rgba(255,255,255,0.6)").letterSpacing(2),
        Text(content.header.issue).size(10).color("rgba(255,255,255,0.4)"),
      ).grow(1),
      Column(
        Row(
          Column().size(6).bg("#4ade80").cornerRadius(3),
          Text(content.header.badge).size(9).weight("700").color("white").letterSpacing(1),
        ).gap(5).alignItems("center")
        .bg("rgba(255,255,255,0.1)")
        .paddingTop(5).paddingBottom(5).paddingLeft(10).paddingRight(10)
        .cornerRadius(20),
      ),
    ).alignItems("center").marginBottom(32),

    // Main headline
    Column(
      Row(...content.hero.tags.map(tag)).gap(8).marginBottom(16),
      Text(
        Span(content.hero.headline.bold).weight("800"),
        Span(content.hero.headline.faded).weight("800").color("rgba(255,255,255,0.35)"),
      ).size(52).color("white").lineHeight(1.05).letterSpacing(-2),
      Text(content.hero.description)
        .size(13)
        .color("rgba(255,255,255,0.65)")
        .lineHeight(1.6)
        .marginTop(16)
        .maxWidth(340),
    ).marginBottom(40),

    // Stats row
    Row(
      ...content.stats.flatMap((s, i) => 
        i === 0 ? [stat(s.value, s.label)] : [divider(), stat(s.value, s.label)]
      )
    ).gap(24).alignItems("center").justifyContent("center").marginBottom(40),

    // Bottom CTA
    Row(
      Column(
        Text(content.footer.ctaTitle).size(12).weight("600").color("white"),
        Text(content.footer.ctaUrl).size(10).color("rgba(255,255,255,0.5)").marginTop(2),
      ).grow(1),
      Column(
        Text(content.footer.buttonText).size(10).weight("700").color("#1a1a2e"),
      )
      .bg("white")
      .paddingTop(10).paddingBottom(10).paddingLeft(18).paddingRight(18)
      .cornerRadius(24),
    ).alignItems("center")
    .bg("rgba(255,255,255,0.08)")
    .padding(16)
    .cornerRadius(16),
  )
  .padding(32)
  .bg("#1a1a2e")
  .width(420)
  .height(420);
}