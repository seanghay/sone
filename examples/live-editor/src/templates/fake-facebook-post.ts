import { Column, Row, Text } from "sone";

const post = {
  author: {
    name: "Coastal Workshop",
    subtitle: "April 3 at 10:42 AM · Public",
    accent: "#1877f2",
  },
  body: [
    "A small reminder for anyone building online:",
    "",
    "Consistency beats intensity.",
    "",
    "You do not need a giant launch every week. You need clear updates, honest storytelling, and enough repetition for people to remember what you do.",
  ],
  engagement: {
    reactions: "14K",
    comments: "1.8K comments",
    shares: "437 shares",
  },
};

export default function Root() {
  const badge = (label: string) =>
    Column(
      Text(label).size(11).weight("700").color("#111827"),
    )
      .paddingTop(6)
      .paddingBottom(6)
      .paddingLeft(12)
      .paddingRight(12)
      .bg("#f3f4f6")
      .cornerRadius(999);

  const action = (label: string) =>
    Row(
      Column().size(16).bg("#dbeafe").cornerRadius(8),
      Text(label).size(13).weight("600").color("#4b5563"),
    )
      .gap(8)
      .alignItems("center")
      .grow(1)
      .justifyContent("center")
      .paddingTop(10)
      .paddingBottom(10)
      .cornerRadius(10);

  return Column(
    Row(
      Row(
        Column(
          Text("f").size(28).weight("800").color("white").align("center"),
        )
          .size(44)
          .bg(post.author.accent)
          .cornerRadius(22),
        Column(
          Text(post.author.name).size(15).weight("700").color("#111827"),
          Text(post.author.subtitle).size(11).color("#6b7280").marginTop(3),
        ).gap(0),
      )
        .gap(12)
        .alignItems("center")
        .grow(1),
      badge("Follow"),
    ).alignItems("center"),

    Text(...post.body.map((line, index) =>
      index === 0 ? line : line === "" ? "\n\n" : line
    ))
      .size(16)
      .lineHeight(1.55)
      .color("#111827")
      .marginTop(18),

    Column(
      Column()
        .height(280)
        .bg("linear-gradient(135deg, #1877f2 0%, #8b5cf6 100%)")
        .cornerRadius(18),
      Column(
        Text("BUILD TRUST").size(26).weight("800").color("white").letterSpacing(-1),
        Text("through repetition, not noise")
          .size(15)
          .color("rgba(255,255,255,0.78)")
          .marginTop(6),
      )
        .padding(24)
        .bg("rgba(17,24,39,0.18)")
        .cornerRadius(16)
        .maxWidth(270)
        .marginTop(-112)
        .marginLeft(18),
    ).marginTop(18),

    Row(
      Row(
        Column(
          Text("👍").size(10).align("center"),
        )
          .size(18)
          .bg("#1877f2")
          .cornerRadius(9),
        Column(
          Text("❤").size(10).align("center"),
        )
          .size(18)
          .bg("#ef4444")
          .cornerRadius(9)
          .marginLeft(-6),
        Text(post.engagement.reactions).size(12).color("#6b7280").marginLeft(8),
      ).alignItems("center"),
      Row(
        Text(post.engagement.comments).size(12).color("#6b7280"),
        Text(post.engagement.shares).size(12).color("#6b7280"),
      ).gap(14).alignItems("center"),
    )
      .justifyContent("space-between")
      .alignItems("center")
      .marginTop(18),

    Column().height(1).bg("#e5e7eb").marginTop(12).marginBottom(8),

    Row(
      action("Like"),
      action("Comment"),
      action("Share"),
    )
      .gap(8)
      .alignItems("center"),
  )
    .padding(22)
    .bg("white")
    .width(620)
    .cornerRadius(20)
    .shadow("0 12px 30px rgba(17,24,39,0.08)");
}
