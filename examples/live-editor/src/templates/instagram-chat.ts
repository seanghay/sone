import { Column, Row, Text } from "sone";

const chat = {
  profile: {
    name: "maya.studio",
    subtitle: "Active 2m ago",
    accent: "#fd1d1d",
    accentSoft: "#fda085",
  },
  messages: [
    {
      side: "left",
      text: "Hey, do you have the updated carousel copy for tomorrow's launch?",
      time: "9:14 AM",
    },
    {
      side: "right",
      text: "Yep, just wrapped it. I also tightened the CTA on slide four.",
      time: "9:16 AM",
    },
    {
      side: "left",
      text: "Perfect. Send me the final version here and I'll hand it off to social.",
      time: "9:17 AM",
    },
    {
      side: "right",
      text: "Uploading now. Want the reel caption in the same doc?",
      time: "9:18 AM",
    },
    {
      side: "left",
      text: "Yes please. Keep the tone warm, short, and a little playful.",
      time: "9:19 AM",
    },
    {
      side: "right",
      text: "Done. Shared both. If you want, I can mock the first story frame too.",
      time: "9:20 AM",
    },
  ] as const,
};

export default function Root() {
  const avatar = () =>
    Column(
      Column().size(28).bg(chat.profile.accentSoft).cornerRadius(14),
    )
      .size(32)
      .bg(chat.profile.accent)
      .padding(2)
      .cornerRadius(16);

  const bubble = (
    text: string,
    time: string,
    side: "left" | "right",
  ) => {
    const card = Column(
      Text(text)
        .size(12)
        .lineHeight(1.5)
        .color(side === "right" ? "white" : "#111827")
        .maxWidth(220),
      Text(time)
        .size(9)
        .color(side === "right" ? "rgba(255,255,255,0.7)" : "#9ca3af")
        .marginTop(6),
    )
      .paddingTop(10)
      .paddingBottom(10)
      .paddingLeft(12)
      .paddingRight(12)
      .bg(side === "right" ? "#d62976" : "white")
      .shadow("0 2px 10px rgba(17,24,39,0.08)");
    return side === "right"
      ? card.cornerRadius(18, 18, 6, 18)
      : card.cornerRadius(18, 18, 18, 6);
  };

  const row = (
    text: string,
    time: string,
    side: "left" | "right",
  ) =>
    side === "left"
      ? Row(bubble(text, time, side), Column().grow(1))
          .alignItems("flex-end")
          .gap(12)
      : Row(Column().grow(1), bubble(text, time, side))
          .alignItems("flex-end")
          .gap(12);

  return Column(
    Row(
      Row(
        avatar(),
        Column(
          Text(chat.profile.name).size(13).weight("700").color("#111827"),
          Text(chat.profile.subtitle).size(10).color("#6b7280").marginTop(2),
        ).gap(0),
      ).gap(10).alignItems("center").grow(1),
      Text("Details").size(11).weight("600").color("#d62976"),
    )
      .alignItems("center")
      .padding(18)
      .paddingBottom(14)
      .bg("white")
      .borderWidth(1)
      .borderColor("#f3f4f6"),

    Column(
      Text("Today").size(10).weight("600").color("#9ca3af").align("center"),
      ...chat.messages.map((message) =>
        row(message.text, message.time, message.side).marginTop(12)
      ),
    )
      .grow(1)
      .paddingLeft(16)
      .paddingRight(16)
      .paddingTop(18)
      .paddingBottom(18)
      .bg("#f5f7fb"),

    Row(
      Text("Message...").size(12).color("#9ca3af").grow(1),
      Column(
        Text("Send").size(11).weight("700").color("white"),
      )
        .bg("#d62976")
        .paddingTop(8)
        .paddingBottom(8)
        .paddingLeft(14)
        .paddingRight(14)
        .cornerRadius(16),
    )
      .alignItems("center")
      .paddingTop(10)
      .paddingBottom(10)
      .paddingLeft(14)
      .paddingRight(10)
      .bg("white")
      .cornerRadius(20)
      .shadow("0 2px 12px rgba(17,24,39,0.08)"),
  )
    .padding(16)
    .gap(14)
    .bg("#eef2f7")
    .width(390)
    .height(780);
}
