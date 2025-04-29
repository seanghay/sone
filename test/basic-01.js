import fs from "node:fs/promises";
import { Flex, Column, renderAsImageBuffer, Row } from "../src/sone.js";

function Document() {
  return Column(
    Flex().margin(20, 20).size("auto", 200).bg("red"),
    Flex().size(200, 20).marginRight(100).alignSelf("flex-end").bg("blue"),
    Flex().size(400, 300).alignSelf("center").bg("green"),
    Flex().size(400, 300).bg("gray"),
    Flex().size(100, 100).bg("gold"),
    Row(
      Flex().size(300, 500).bg("orange"),
      Flex().size(200, 200).bg("lime"),
      Flex().size(200, 200).bg("deepskyblue"),
      Flex().size(400).bg("salmon"),
      Flex().size(200, "100%").bg("darkred"),
    )
      .gap(20)
      .padding(20),
    Flex(
      Flex().maxHeight(120).grow(2).bg("red"),
      Flex(
        Flex()
          .marginLeft(20)
          .marginRight(20)
          .aspectRatio(16 / 9)
          .size("auto", "auto")
          .bg("blue"),
      )
        .paddingTop(20)
        .grow(1)
        .bg("orange"),
    )
      .gap(10)
      .padding(10)
      .size(500, 500)
      .marginLeft(150)
      .marginTop(50)
      .position("absolute")
      .bg("black")
      .direction("column"),
  ).padding(40);
}

await fs.writeFile("test/basic-01.jpg", renderAsImageBuffer(Document()));
