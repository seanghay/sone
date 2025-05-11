import { Span, Column, Text } from "sonejs";

export default function Simple() {
  return Column(
    Column(
      Text("Hello, ", Span("ភាសាខ្មែr").weight("bold").color("white"))
        .font("Inter Khmer")
        .size(56)
        .lineHeight(1.3)
        .color("red"),
    )
      .padding(10, 20)
      .strokeColor("slateblue")
      .strokeWidth(10)
      .bg("#333")
      .cornerRadius(25)
      .cornerSmoothing(0.7),
  ).padding(10);
}
