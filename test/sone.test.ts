import { Column, Span, sone, Text } from "sone";
import { expect, test } from "vitest";

test("generate a simple jpeg buffer", async () => {
  function Document() {
    return Column(
      Text("Hello, ", Span("World").color("blue").weight("bold"))
        .size(44)
        .color("black"),
    )
      .padding(24)
      .bg("white");
  }

  // save as buffer
  const buffer = await sone(Document()).jpg();
  expect(buffer).toBeDefined();
});
