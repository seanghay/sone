import { Column, Row, Text, Span, Path } from "sone";

export default function Root() {
  const borderPath =
    "M 0 0 L 560 0 L 560 400 L 0 400 Z";

  const medal = () =>
    Column(
      Text("★").size(28).color("#d97706").align("center"),
    )
    .size(56)
    .bg("#fef3c7")
    .cornerRadius(28)
    .alignItems("center")
    .justifyContent("center")
    .borderWidth(1)
    .borderColor("#d1d5db");

  const line = (w: number) =>
    Column().width(w).height(2).bg("#e5e7eb").cornerRadius(1);

  const ornament = () =>
    Row(
      line(40),
      Text("✦").size(10).color("#d1d5db").marginLeft(8).marginRight(8),
      line(40),
    ).alignItems("center");

  return Column(
    // Outer border decoration
    Column(
      // Inner content
      Column(
        medal(),

        Text("Certificate of Achievement").size(11).weight("700").color("#9ca3af").letterSpacing(3).marginTop(20),

        Row(line(48), Column().width(8), line(48)).alignItems("center").marginTop(8).marginBottom(8),

        Text("This certificate is proudly presented to").size(12).color("#6b7280").marginTop(4),

        Text("Alexandra Chen").size(32).weight("700").color("#111827").letterSpacing(-0.5).marginTop(8),

        ornament().marginTop(6).marginBottom(6),

        Text(
          Span("In recognition of outstanding performance and "),
          Span("exceptional dedication ").weight("600").color("#374151"),
          Span("in completing the"),
        ).size(12).color("#6b7280").align("center").lineHeight(1.7).maxWidth(340).marginTop(4),

        Text("Advanced UI/UX Design Program").size(16).weight("700").color("#111827").marginTop(10).marginBottom(10),

        Row(line(80)).marginBottom(20),

        Row(
          Column(
            Column().width(120).height(1).bg("#d1d5db").marginBottom(6),
            Text("James Wilson").size(11).weight("600").color("#374151").align("center"),
            Text("Program Director").size(9).color("#9ca3af").letterSpacing(1).align("center").marginTop(1),
          ).alignItems("center"),

          Column().width(40),

          Column(
            Column().width(120).height(1).bg("#d1d5db").marginBottom(6),
            Text("Maria Santos").size(11).weight("600").color("#374151").align("center"),
            Text("Chief Academic Officer").size(9).color("#9ca3af").letterSpacing(1).align("center").marginTop(1),
          ).alignItems("center"),
        ).alignItems("flex-end"),

        Row(
          Text("December 2024").size(9).color("#9ca3af").letterSpacing(0.5),
          Column().grow(1),
          Text("ID: CERT-2024-7842").size(9).color("#9ca3af").letterSpacing(0.5),
        ).marginTop(20).alignItems("center"),
      )
      .padding(40)
      .alignItems("center"),
    )
    .borderWidth(6)
    .borderColor("#f59e0b")
    .cornerRadius(4)
    .bg("white"),
  )
  .padding(12)
  .bg("#fef3c7")
  .width(560);
}
