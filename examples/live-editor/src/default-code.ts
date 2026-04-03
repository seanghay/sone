export const DEFAULT_CODE = `import { Column, Row, Text, Span } from "sone";

export default function Root() {
  const Card = (title: string, subtitle: string, color: string) =>
    Column(
      Row(
        Column()
          .size(40)
          .bg(color)
          .cornerRadius(20),
        Column(
          Text(title).size(14).weight("bold").color("#111"),
          Text(subtitle).size(12).color("#888"),
        ).gap(2).grow(1),
      ).gap(12).alignItems("center"),
    )
    .padding(16)
    .bg("white")
    .cornerRadius(12)
    .shadow("0 2px 8px rgba(0,0,0,0.08)");

  return Column(
    Text(
      Span("Sone").weight("bold"),
      Span(" Live Editor").color("#555"),
    ).size(28).color("#000"),
    Text("Write code. See it instantly.")
      .size(14)
      .color("#888"),
    Column(
      Card("Design System", "Components & tokens", "#6366f1"),
      Card("Typography", "Fonts & text styles", "#f59e0b"),
      Card("Layout Engine", "Flexbox + CSS Grid", "#10b981"),
    ).gap(8),
  )
  .padding(32)
  .gap(20)
  .bg("#f9f9f9")
  .width(380);
}
`;
