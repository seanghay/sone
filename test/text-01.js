import fs from "node:fs/promises";
import { Box, Column, renderAsImageBuffer, Row, Text } from "../src/core.js";

function Document() {
  const sample =
    "ពិធីបុណ្យ ព្រះសពរបស់ សម្តេច ប៉ាបហ្វ្រង់ស្វ័រ បានប្រព្រឹត្តិធ្វើទៅនៅបុរីវ៉ាទីកង់ នៅថ្ងៃសៅរ៍ ទី២៦មេសានេះ។ ព្រះមហាក្សត្រ ប្រមុខរដ្ឋ ប្រមុខរដ្ឋាភិបាល និងគណៈប្រតិភូសរុបជាង១៦០ បានមកចូលរួម នៅក្នុងកម្មវិធីនេះ។";
  const defaultFont = "Kantumruy Pro";

  return Column(
    Row(Box().size(200).bg("green"), Box().size(200).bg("orange")).gap(10),

    Text(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent dignissim vehicula ultrices. Proin a purus interdum neque eleifend volutpat quis vitae ipsum. Quisque at sollicitudin dolor. Cras ut enim rhoncus nibh consectetur fermentum nec a lorem. In ut sapien mauris. Praesent vel urna elit. Pellentesque iaculis mollis arcu, lobortis fermentum odio euismod quis.",
    )
      .lineHeight(1.5)
      .color("#205781")
      .size(32)
      .font("SF Pro Text")
      .align("center"),
    Text("const date = new Date();")
      .size(32)
      .color("#A55B4B")
      .font("Geist Mono"),
    Text(sample).font(defaultFont).lineHeight(1.2).size(22).color("blue"),
    Row(
      Box().grow(1).size(50, "auto").bg("#ACD3A8"),
      Box().size(100).bg("#57B4BA"),
    ).gap(10),
    Column(
      Box(
        Text(sample)
          .color("#261FB3")
          .font(defaultFont)
          .lineHeight(1.3)
          .size(44)
          .align("right")
          .weight(700),
      )
        .padding(20, 30)
        .bg("#FBE4D6"),
      Text(sample).color("#333").font(defaultFont).lineHeight(1.2).size(22),
      Box().height(4).bg("#eee"),
      Text(sample.repeat(4))
        .align("justify")
        .font(defaultFont)
        .lineHeight(1.3)
        .size(32)
        .weight(500),
      Box().height(4).bg("#eee"),
      Box(
        Text("Example Footer | Rendering Engine")
        .align("center")
        .color("#333").size(18)
      )
    ).gap(20),
  )
    .padding(60)
    .maxWidth(1300)
    .gap(30);
}

await fs.writeFile("test/text-01.jpg", renderAsImageBuffer(Document()));
