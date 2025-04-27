import fs from "node:fs/promises";
import { Align, FlexDirection, PositionType } from "yoga-layout";
import { Box, Column, renderAsImageBuffer, Row } from "../src/core.js";

function Document() {
  return Column(
    Box().margin(20, 20).size("auto", 200).bg("red"),
    Box().size(200, 20).marginRight(100).alignSelf(Align.FlexEnd).bg("blue"),
    Box().size(400, 300).alignSelf(Align.Center).bg("green"),
    Box().size(400, 300).bg("gray"),
    Box().size(100, 100).bg("gold"),
    Row(
      Box().size(300, 500).bg("orange"),
      Box().size(200, 200).bg("lime"),
      Box().size(200, 200).bg("deepskyblue"),
      Box().size(400).bg("salmon"),
      Box().size(200, "100%").bg("darkred"),
    )
      .gap(20)
      .padding(20),
    Box(
      Box().maxHeight(120).grow(2).bg("red"),
      Box(
        Box()
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
      .position(PositionType.Absolute)
      .bg("black")
      .direction(FlexDirection.Column),
  ).padding(40);
}

await fs.writeFile("test/basic-01.jpg", renderAsImageBuffer(Document()));
