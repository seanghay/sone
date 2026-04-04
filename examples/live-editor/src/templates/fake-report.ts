import { Column, Row, Text } from "sone";

const report = {
  header: {
    title: "Q2 Growth Report",
    subtitle: "Performance summary across acquisition, revenue, and retention",
    period: "Apr 1 - Jun 30, 2026",
  },
  metrics: [
    { label: "Revenue", value: "$184.2K", change: "+18.4%" },
    { label: "New Users", value: "12,480", change: "+9.7%" },
    { label: "Retention", value: "74.8%", change: "+4.1%" },
  ],
  insights: [
    "Paid acquisition became more efficient after the onboarding flow was shortened.",
    "Referral traffic improved conversion quality and produced the highest 30-day retention.",
    "Revenue per active account increased after the annual plan upsell was moved earlier.",
  ],
};

export default function Root() {
  const metricCard = (label: string, value: string, change: string) =>
    Column(
      Text(label).size(11).weight("600").color("#6b7280"),
      Text(value).size(24).weight("800").color("#111827").marginTop(8),
      Text(change).size(11).weight("700").color("#16a34a").marginTop(6),
    )
      .grow(1)
      .padding(18)
      .bg("linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(239,246,255,0.92) 100%)")
      .cornerRadius(16)
      .borderWidth(1)
      .borderColor("#d1d5db");

  const bar = (label: string, width: number, value: string, color: string) =>
    Column(
      Row(
        Text(label).size(11).weight("600").color("#374151").grow(1),
        Text(value).size(11).color("#6b7280"),
      ).alignItems("center"),
      Column(
        Column()
          .height(10)
          .width(width)
          .bg(`linear-gradient(90deg, ${color} 0%, #7dd3fc 100%)`)
          .cornerRadius(999),
      )
        .height(10)
        .bg("linear-gradient(90deg, #e5e7eb 0%, #f8fafc 100%)")
        .cornerRadius(999)
        .marginTop(8),
    ).marginTop(14);

  const bullet = (text: string) =>
    Row(
      Column().size(8).bg("#2563eb").cornerRadius(4).marginTop(5),
      Text(text).size(12).lineHeight(1.55).color("#374151").grow(1),
    ).gap(10).alignItems("flex-start");

  return Column(
    Row(
      Column(
        Text(report.header.title).size(28).weight("800").color("#0f172a"),
        Text(report.header.subtitle)
          .size(13)
          .lineHeight(1.5)
          .color("#64748b")
          .marginTop(8)
          .maxWidth(420),
      ).grow(1),
      Column(
        Text("Reporting Period").size(10).weight("700").color("#94a3b8"),
        Text(report.header.period).size(12).weight("600").color("#0f172a").marginTop(4),
      )
        .padding(14)
        .bg("linear-gradient(135deg, #ffffff 0%, #dbeafe 100%)")
        .cornerRadius(14)
        .borderWidth(1)
        .borderColor("#d1d5db"),
    ).alignItems("flex-start"),

    Row(
      ...report.metrics.map((metric) =>
        metricCard(metric.label, metric.value, metric.change)
      ),
    )
      .gap(14)
      .marginTop(22),

    Row(
      Column(
        Text("Channel Mix").size(14).weight("700").color("#0f172a"),
        bar("Organic", 220, "48%", "#2563eb"),
        bar("Paid", 156, "34%", "#0ea5e9"),
        bar("Referral", 82, "18%", "#38bdf8"),
      )
        .grow(1)
        .padding(20)
        .bg("linear-gradient(180deg, #ffffff 0%, #eff6ff 100%)")
        .cornerRadius(18)
        .borderWidth(1)
        .borderColor("#d1d5db"),
      Column(
        Text("Key Insights").size(14).weight("700").color("#0f172a"),
        ...report.insights.map((item) => bullet(item).marginTop(14)),
      )
        .width(260)
        .padding(20)
        .bg("white")
        .cornerRadius(18)
        .borderWidth(1)
        .borderColor("#d1d5db"),
    )
      .gap(14)
      .marginTop(18),

    Column(
      Text("Executive Summary").size(14).weight("700").color("#0f172a"),
      Text(
        "Growth remained healthy throughout the quarter, with the strongest gains coming from onboarding and pricing improvements. The next focus should be increasing referral volume while protecting activation quality."
      )
        .size(12)
        .lineHeight(1.65)
        .color("#475569")
        .marginTop(10),
    )
      .padding(20)
      .bg("white")
      .cornerRadius(18)
      .borderWidth(1)
      .borderColor("#d1d5db")
      .marginTop(18),
  )
    .padding(26)
    .bg("linear-gradient(135deg, #eff6ff 0%, #dbeafe 52%, #e0f2fe 100%)")
    .width(760);
}
