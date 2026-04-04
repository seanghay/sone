import { Column, Row, Text } from "sone";

const telegram = {
  chat: {
    title: "Design Ops",
    subtitle: "128 members",
    accent: "#229ed9",
  },
  messages: [
    {
      sender: "Nadia",
      text: "Morning. I pushed the updated onboarding cards. Can someone sanity check spacing on mobile?",
      time: "9:12",
      mine: false,
    },
    {
      sender: "You",
      text: "Looking now. First impression: much cleaner. The headline wrap feels better too.",
      time: "9:14",
      mine: true,
    },
    {
      sender: "Nadia",
      text: "Nice. I also removed the third tooltip because it was slowing people down.",
      time: "9:15",
      mine: false,
    },
    {
      sender: "You",
      text: "Good call. Ship it after you tighten the bottom padding under the CTA.",
      time: "9:16",
      mine: true,
    },
  ] as const,
};

export default function Root() {
  const avatar = () =>
    Column(
      Text("✈").size(15).weight("700").color("white").align("center"),
    )
      .size(34)
      .bg(telegram.chat.accent)
      .cornerRadius(17);

  const bubble = (
    sender: string,
    text: string,
    time: string,
    mine: boolean,
  ) =>
    Column(
      mine
        ? null
        : Text(sender).size(10).weight("700").color("#229ed9").marginBottom(6),
      Text(text)
        .size(12)
        .lineHeight(1.5)
        .color("#111827")
        .maxWidth(235),
      Text(time)
        .size(9)
        .color("#6b7280")
        .align("right")
        .marginTop(6),
    )
      .paddingTop(10)
      .paddingBottom(8)
      .paddingLeft(12)
      .paddingRight(12)
      .bg(mine ? "#d9fdd3" : "white")
      .cornerRadius(mine ? 16 : 16, 16, mine ? 4 : 16, mine ? 16 : 4)
      .borderWidth(1)
      .borderColor("rgba(148,163,184,0.35)");

  const messageRow = (
    sender: string,
    text: string,
    time: string,
    mine: boolean,
  ) =>
    mine
      ? Row(Column().grow(1), bubble(sender, text, time, mine))
          .alignItems("flex-end")
      : Row(bubble(sender, text, time, mine), Column().grow(1))
          .alignItems("flex-end");

  return Column(
    Row(
      Row(
        avatar(),
        Column(
          Text(telegram.chat.title).size(13).weight("700").color("#111827"),
          Text(telegram.chat.subtitle).size(10).color("#6b7280").marginTop(2),
        ).gap(0),
      ).gap(10).alignItems("center").grow(1),
      Text("⋮").size(16).color("#6b7280"),
    )
      .alignItems("center")
      .padding(16)
      .bg("white")
      .borderWidth(1)
      .borderColor("#edf2f7"),

    Column(
      Text("Today").size(10).weight("700").color("#6b7280"),
      ...telegram.messages.map((message) =>
        messageRow(
          message.sender,
          message.text,
          message.time,
          message.mine,
        ).marginTop(12)
      ),
    )
      .grow(1)
      .padding(16)
      .bg("#e7f1f8"),

    Row(
      Text("Message").size(12).color("#9ca3af").grow(1),
      Column(
        Text("Send").size(11).weight("700").color("white"),
      )
        .paddingTop(8)
        .paddingBottom(8)
        .paddingLeft(14)
        .paddingRight(14)
        .bg(telegram.chat.accent)
        .cornerRadius(16),
    )
      .alignItems("center")
      .paddingTop(10)
      .paddingBottom(10)
      .paddingLeft(14)
      .paddingRight(10)
      .bg("white")
      .cornerRadius(18)
      .borderWidth(1)
      .borderColor("#d1d5db"),
  )
    .padding(16)
    .gap(14)
    .bg("#dfeaf3")
    .width(390)
    .height(760);
}
