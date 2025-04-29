import { loadImage } from "canvas";
import fs from "node:fs/promises";
import {
  Box,
  Column,
  Photo,
  Row,
  Span,
  Text,
  renderAsImageBuffer,
} from "../src/core.js";

async function Document() {
  const imageSrc = await loadImage("test/Flag_of_Cambodia.svg");
  const sample =
    "ពិធីបុណ្យ ព្រះសពរបស់ សម្តេច ប៉ាបហ្វ្រង់ស្វ័រ បានប្រព្រឹត្តិធ្វើទៅនៅបុរីវ៉ាទីកង់ នៅថ្ងៃសៅរ៍ ទី២៦មេសានេះ។ ព្រះមហាក្សត្រ ប្រមុខរដ្ឋ ប្រមុខរដ្ឋាភិបាល និងគណៈប្រតិភូសរុបជាង១៦០ បានមកចូលរួម នៅក្នុងកម្មវិធីនេះ។";
  const defaultFont = "Inter Khmer";

  return Column(
    Row(
      Box().size(200, 100).cornerRadius(100, 0).bg("blue"),
      Box().size(200).cornerRadius(200).bg("orange"),
      Photo(imageSrc).size("auto", 200).aspectRatio(1.5625),
    )
      .alignItems("center")
      .gap(44),
    Text(
      Span("Lorem ipsum").color("green").weight(800),
      " dolor sit amet, consectetur adipiscing elit. Praesent dignissim vehicula ultrices. Proin a purus interdum neque eleifend volutpat quis vitae ipsum. Quisque at sollicitudin dolor. Cras ut enim rhoncus nibh consectetur fermentum nec a lorem. In ut sapien mauris. Praesent vel urna elit. Pellentesque iaculis mollis arcu, lobortis fermentum odio euismod quis.",
    )
      .lineHeight(1.5)
      .color("#205781")
      .size(32)
      .font("SF Pro Text")
      .align("center"),
    Text(
      Span("const ").color("red"),
      Span("date ").weight(700).color("blue"),
      Span("= "),
      Span("new ").color("red"),
      Span("Date();").color("blue"),
    )
      .size(32)
      .color("#A55B4B")
      .font("Geist Mono"),
    Text(sample).font(defaultFont).lineHeight(1.5).size(22).color("blue"),
    Row(
      Box().cornerRadius(20).grow(1).size(50, "auto").bg("#ACD3A8"),
      Box().cornerRadius(20).size(100).bg("#57B4BA"),
    ).gap(50),
    Column(
      Box(
        Box(
          Text(
            "ពិធីបុណ្យ ព្រះសពរបស់ ",
            Span("សម្តេច ប៉ាបហ្វ្រង់ស្វ័រ")
              .font("Moul")
              .size(22)
              .color("#FE7743")
              .offsetY(-2),
            " បានប្រព្រឹត្តិ ធ្វើទៅនៅបុរីវ៉ាទីកង់ នៅថ្ងៃសៅរ៍ ទី២៦មេសានេះ។ ព្រះមហាក្សត្រ ប្រមុខរដ្ឋ ប្រមុខរដ្ឋាភិបាល និងគណៈប្រតិភូសរុបជាង១៦០ បានមកចូលរួម នៅក្នុងកម្មវិធីនេះ។",
          )
            .color("#261FB3")
            .font(defaultFont)
            .lineHeight(1.7)
            .size(24)
            .align("justify")
            .weight(500),
        )
          .maxWidth(440)
          .padding(30, 30)
          .cornerRadius(44)
          .alignSelf("center")
          .bg("#FBE4D6"),
        Box(
          Text(
            "ពិធីបុណ្យ ព្រះសពរបស់ ",
            Span("សម្តេច ប៉ាបហ្វ្រង់ស្វ័រ").font("Moul").size(34).color("#FE7743"),
            " បានប្រព្រឹត្តិធ្វើទៅនៅបុរីវ៉ាទីកង់នៅថ្ងៃសៅរ៍ ទី២៦មេសានេះ។ ព្រះមហាក្សត្រ ប្រមុខរដ្ឋ ប្រមុខរដ្ឋាភិបាល និងគណៈប្រតិភូសរុបជាង១៦០ បានមកចូលរួម នៅក្នុងកម្មវិធីនេះ។",
          )
            .color("#261FB3")
            .font(defaultFont)
            .lineHeight(1.6)
            .size(40)
            .align("right")
            .weight(600),
        )
          .width(700)
          .padding(20, 30)
          .cornerRadius(44)
          .bg("#FBE4D6"),
      )
        .gap(40)
        .direction("row"),
      Text(sample)
        .color("#333")
        .font(defaultFont)
        .lineHeight(1.5)
        .size(22)
        .align("center"),
      Box().height(4).bg("#eee"),
      Text(
        [sample, sample].join(" "),
        "\n",
        Span([sample, sample].join(" ")).weight(700).color("black"),
        " ",
        Span([sample].join(" ")).color("#C5172E"),
      )
        .align("justify")
        .font(defaultFont)
        .lineHeight(1.8)
        .size(24)
        .weight(400)
        .indentSize(50)
        .color("gray"),
      Box().height(4).bg("#eee"),
      Box(
        Text("Page 1").color("#333").weight("bold").size(18),
        Box().size("auto").grow(1),
        Text(
          Span("Example Footer").color("blue").weight(600),
          " | Rendering Engine",
        )
          .color("#333")
          .size(18),
      )
        .justifyContent("flex-end")
        .direction("row"),
    ).gap(20),
  )
    .padding(60)
    .maxWidth(1300)
    .gap(50);
}

await fs.writeFile("test/text-01.jpg", renderAsImageBuffer(await Document()));
