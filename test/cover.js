import fs from "node:fs/promises";
import {
  sone,
  Column,
  Flex,
  Photo,
  Span,
  Text,
  loadImage,
} from "../src/sone.js";

const svgSrc = await loadImage("test/sone.svg");

function SoneCover() {
  return Column(
    Column(
      Flex(Photo(svgSrc).size(100).scaleType("contain"))
        .alignSelf("flex-start")
        .strokeColor("#eee")
        .strokeWidth(2)
        .shadow("4px 4px 0px #eee")
        .bg("white")
        .padding(14)
        .cornerRadius(24)
        .cornerSmoothing(0.7),
      Column(
        Text(
          "Sone.js ",
          Span("សូន")
            .font("Inter Khmer")
            .weight(700)
            .color("linear-gradient(to right, #0acffe 0%, #495aff 100%);")
            .shadow("4px 4px 0px rgba(0,0,0,.1)"),
        )
          .font("Inter Khmer")
          .weight(800)
          .lineHeight(1.3)
          .size(64),
        Text(
          "SwiftUI-inspired canvas layout engine with ",
          Span("Advanced Rich Text")
            .weight("bold")
            .color("linear-gradient(to top, #9be15d 0%, #00e3ae 100%)")
            .strokeColor("white")
            .strokeWidth(8),
          " support.",
        )
          .size(32)
          .color("#333"),
      )
        .padding(4, 10)
        .gap(18),
    ).gap(24),
    Flex().bg("rgba(0,0,0,.1)").marginTop(20).height(4),
    Flex(
      Text(
        "https://github.com/",
        Span("seanghay/sone").color("black").weight("500"),
      )
        .font("Geist Mono")
        .size(32)
        .color("gray"),
    )
      .marginTop(20)
      .marginLeft(14),
  )
    .padding(72)
    .width(1280)
    .height(640)
    .bg("linear-gradient(to top, #dfe9f3 0%, white 100%);");
}

await fs.writeFile("test/cover.jpg", await sone(SoneCover).jpg());
await fs.writeFile("test/cover.png", await sone(SoneCover).png());
await fs.writeFile("test/cover.pdf", await sone(SoneCover).pdf());
await fs.writeFile("test/cover.svg", await sone(SoneCover).svg());
