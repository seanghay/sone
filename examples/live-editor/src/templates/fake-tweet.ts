import { Column, Path, Row, Text } from "sone";

const tweet = {
  author: {
    name: "Lena Park",
    handle: "@lenabuilds",
    time: "2h",
    verified: true,
  },
  body: [
    "Shipping small product improvements every week compounds faster than most teams expect.",
    "",
    "The trick is to keep the scope brutally narrow, then stack the wins until momentum becomes visible.",
  ],
  stats: {
    replies: "184",
    reposts: "1.2K",
    likes: "8.9K",
    bookmarks: "602",
  },
  meta: {
    views: "314.5K",
    source: "Web App",
  },
};

export default function Root() {
  const xIcon = () =>
    Path("m17.687 3.063l-4.996 5.711l-4.32-5.711H2.112l7.477 9.776l-7.086 8.099h3.034l5.469-6.25l4.78 6.25h6.102l-7.794-10.304l6.625-7.571zm-1.064 16.06L5.654 4.782h1.803l10.846 14.34z")
      .fill("white")
      .size(24);

  const iconBubble = (label: string, color: string) =>
    Row(
      Column().size(16).bg(color).cornerRadius(8),
      Text(label).size(11).color("#6b7280"),
    ).gap(8).alignItems("center");

  return Column(
    Row(
      Column(
        xIcon(),
      )
        .size(48)
        .bg("#111827")
        .alignItems("center")
        .justifyContent("center")
        .cornerRadius(24),
      Column(
        Row(
          Text(tweet.author.name).size(15).weight("700").color("#111827"),
          tweet.author.verified
            ? Column(
                Text("✓").size(10).weight("700").color("white").align("center"),
              )
                .size(16)
                .bg("#1d9bf0")
                .cornerRadius(8)
            : null,
          Text(tweet.author.handle).size(13).color("#6b7280"),
          Text("·").size(13).color("#9ca3af"),
          Text(tweet.author.time).size(13).color("#6b7280"),
        ).gap(6).alignItems("center"),
        Text(...tweet.body.map((line, index) =>
          index === 0
            ? line
            : index % 2 === 0
              ? line
              : "\n\n"
        ))
          .size(16)
          .lineHeight(1.55)
          .color("#111827")
          .marginTop(10)
          .maxWidth(500),
        Row(
          Text("10:42 AM").size(12).color("#6b7280"),
          Text("·").size(12).color("#9ca3af"),
          Text("Apr 3, 2026").size(12).color("#6b7280"),
          Text("·").size(12).color("#9ca3af"),
          Text(tweet.meta.source).size(12).color("#1d9bf0"),
        ).gap(6).alignItems("center").marginTop(16),
      ).grow(1),
    ).gap(14).alignItems("flex-start"),

    Column().height(1).bg("#e5e7eb").marginTop(18).marginBottom(14),

    Row(
      Text(`${tweet.stats.likes} Likes`).size(13).weight("700").color("#111827"),
      Text(`${tweet.meta.views} Views`).size(13).color("#6b7280"),
    ).gap(16).alignItems("center"),

    Column().height(1).bg("#e5e7eb").marginTop(14).marginBottom(14),

    Row(
      iconBubble(tweet.stats.replies, "#dbeafe"),
      iconBubble(tweet.stats.reposts, "#dcfce7"),
      iconBubble(tweet.stats.likes, "#fce7f3"),
      iconBubble(tweet.stats.bookmarks, "#ede9fe"),
    ).justifyContent("space-between").alignItems("center"),
  )
    .padding(24)
    .bg("white")
    .width(620)
    .cornerRadius(24)
    .shadow("0 10px 30px rgba(17,24,39,0.08)");
}
