import fs from "node:fs/promises";
import { Box, Column, renderAsImageBuffer, Row, Text } from "../src/core.js";

function Document() {
  return Column(
    Row(
      Box().size(200).bg("green"),
      Box().size(200).bg("orange"),
    ).gap(10),

    Text("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent dignissim vehicula ultrices. Proin a purus interdum neque eleifend volutpat quis vitae ipsum. Quisque at sollicitudin dolor. Cras ut enim rhoncus nibh consectetur fermentum nec a lorem. In ut sapien mauris. Praesent vel urna elit. Pellentesque iaculis mollis arcu, lobortis fermentum odio euismod quis.")
      .lineHeight(1.4)
      .color("#222831")
      ,
    Text("const date = new Date();")
      .color("red")
      .font("Geist Mono"),
    Text("ពិធីបុណ្យព្រះសពរបស់សម្តេចប៉ាបហ្វ្រង់ស្វ័រ បានប្រព្រឹត្តិធ្វើទៅនៅបុរីវ៉ាទីកង់ នៅថ្ងៃសៅរ៍ទី២៦មេសានេះ។ ព្រះមហាក្សត្រ ប្រមុខរដ្ឋ ប្រមុខរដ្ឋាភិបាល និងគណៈប្រតិភូសរុបជាង១៦០ បានមកចូលរួមនៅក្នុងកម្មវិធីនេះ។")
      .font("Siemreap")
      .lineHeight(1.2)
      .size(22)
      .color("blue"),
    Row(
      Box().size(200).bg("green"),
      Box().size(200).bg("orange"),
    ).gap(10),
  ).padding(10).maxWidth(430).gap(10);
}

await fs.writeFile("test/text-01.jpg", renderAsImageBuffer(Document()));
