import { Column, Row, Text, Span } from "sone";

const content = {
  front: {
    greeting: "GREETINGS FROM",
    city: "San Francisco",
    state: "California, USA",
    caption: "Wish you were here!",
    subtext: ["The fog rolls in each morning,", "golden hour lasts forever."],
  },
  back: {
    labelMessage: "MESSAGE",
    recipient: "Dear Alex,",
    body: [
      "What an incredible trip this has been! ",
      "The city is absolutely breathtaking—",
      "the bay, the bridges, the food.",
    ],
    closing: "Miss you lots,",
    sender: "Jordan",
  },
  address: {
    labelTo: "TO:",
    name: "Alex Rivera",
    lines: ["742 Maple Avenue", "Austin, TX 78701", "United States"],
  },
};

export default function Root() {
  const stamp = () =>
    Column(Column().width(36).height(36).bg("#e5e7eb").cornerRadius(2))
      .width(48)
      .height(56)
      .bg("white")
      .borderWidth(1)
      .borderColor("#d1d5db")
      .cornerRadius(2)
      .padding(6);

  const dotted = () =>
    Column().height(1).bg("transparent").borderWidth(1).borderColor("#d1d5db");

  return Column(
    // Front side
    Column(
      Column(
        Text(content.front.greeting).size(9).weight("700").color("rgba(255,255,255,0.7)").letterSpacing(2),
        Text(content.front.city).size(36).weight("800").color("white").letterSpacing(-1),
        Text(content.front.state).size(11).color("rgba(255,255,255,0.8)").letterSpacing(0.5)
      )
        .padding(24)
        .paddingBottom(32)
        .gap(4)
        .bg("#3b82f6")
        .cornerRadius(8, 8, 0, 0),

      Row(
        Column(
          Text(content.front.caption).size(12).color("#374151").weight("500"),
          ...content.front.subtext.map((line) =>
            Text(line).size(10).color("#6b7280").marginTop(4)
          )
        )
          .grow(1)
          .paddingRight(16),
        Column(
          dotted(),
          dotted().marginTop(8),
          dotted().marginTop(8),
          dotted().marginTop(8)
        )
          .width(120)
          .gap(0)
      )
        .padding(20)
        .bg("white")
        .alignItems("flex-start")
    )
      .borderWidth(1)
      .borderColor("#d1d5db")
      .cornerRadius(8)
      .overflow("hidden"),

    // Back side
    Row(
      // Left — message
      Column(
        Text(content.back.labelMessage).size(8).weight("700").color("#9ca3af").letterSpacing(1.5).marginBottom(12),
        Text(content.back.recipient).size(11).color("#374151").weight("500"),
        Text(...content.back.body.map((str) => Span(str)))
          .size(10)
          .color("#6b7280")
          .lineHeight(1.6)
          .marginTop(6)
          .maxWidth(160),
        Text(content.back.closing).size(10).color("#374151").marginTop(12),
        Text(content.back.sender).size(11).weight("600").color("#111827")
      )
        .grow(1)
        .paddingRight(16),

      // Divider
      Column().width(1).bg("#e5e7eb"),

      // Right — address + stamp
      Column(
        Row(Column().grow(1), stamp()).alignItems("flex-start").marginBottom(16),
        Text(content.address.labelTo).size(8).weight("700").color("#9ca3af").letterSpacing(1.5).marginBottom(8),
        Text(content.address.name).size(11).weight("600").color("#111827"),
        ...content.address.lines.map((line) =>
          Text(line).size(10).color("#6b7280").marginTop(2)
        )
      )
        .width(160)
        .paddingLeft(16)
    )
      .padding(20)
      .bg("white")
      .cornerRadius(8)
      .borderWidth(1)
      .borderColor("#d1d5db")
      .alignItems("stretch")
      .marginTop(16)
  )
    .padding(24)
    .bg("#f3f4f6")
    .gap(0)
    .width(400);
}
