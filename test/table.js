import fs from "node:fs/promises";
import { Column, Flex, Span, Text, renderAsImageBuffer } from "../src/sone.js";
import { Table, TableRow } from "../src/table.js";

function StylishHeader(t, corners = [0]) {
  return Flex(
    Text(t)
      .lineHeight(1.4)
      .color("white")
      .weight("bold")
      .font("Inter Khmer")
      .size(18),
  )
    .padding(10, 0)
    .bg("black")
    .alignItems("center")
    .cornerRadius(...corners)
    .cornerSmoothing(0.7);
}

function StylishCell(t) {
  return Flex(Text(t).lineHeight(1.2).color("black").size(18))
    .padding(10, 14)
    .maxWidth(140);
}

function Document() {
  return Column(
    Text(
      "ភ្នំពេញ៖ ",
      Span("ពិធីបុណ្យ ព្រះសពរបស់ ")
        .color("white")
        .strokeColor("orange")
        .strokeWidth(3),
      Span("លោក សុិន")
        .font("Moul")
        .color("red")
        .size(23)
        .line(10, -2, "rgba(0,0,0,.2)"),
      " ",
      Span("សុខខា").color("green"),
      Span(" បានប្រព្រឹត្តិធ្វើទៅ នៅ"),
      Span(" ថ្ងៃសៅរ៍ ទី២៦មេសា").weight(700),
      Span(
        "នេះ។ ព្រះមហាក្សត្រ ប្រមុខរដ្ឋ ប្រមុខរដ្ឋាភិបាល និងគណៈប្រតិភូសរុបជាង១៦០ បានមកចូលរួម នៅក្នុងកម្មវិធីនេះ",
      ),
      Span(" លោក សុិន សុខខុង ").font("Moul").color("salmon").size(27).offsetY(-2),
      Span("។").color("orange"),
    )
      .font("Inter Khmer")
      .size(32)
      .align("left")
      .color("#333")
      .lineHeight(1.4),
    Flex().height(2, "auto").bg("#eee"),
    Flex(
      Text(
        "លោក​ម៉ះមូដ អាបាស់ ប្រធាន​អាជ្ញាធរប៉ាឡេស្ទីន បានប្រកាសតែងតាំងមនុស្សថ្មីម្នាក់ ឈ្មោះ ហ៊ូសេន អាល់ឆេក ជាអនុប្រធាន​នៃ​អង្គការរំដោះប៉ាឡេស្ទីន។ តាម​ការវិភាគ​ មនុស្សថ្មីនេះ អាចជាអ្នកដែលនឹងមកស្នងតំណែង បន្ត​ពីលោក ម៉ះមូដ អាបាស់ ដែលមានវ័យ​៨៩ឆ្នាំទៅ​ហើយ​។ សហគមអន្តរជាតិ និងក្រុមម្ចាស់ជំនួយ ធ្លាប់បាន​ទាមទារជាច្រើនលើក ឲ្យ​អង្គការរំដោះប៉ាឡេស្ទីនត្រូវតែធ្វើកំណែទម្រង់ស៊ីជម្រៅ ដើម្បី​ត្រៀមដឹកនាំ​ដែនដីប៉ាឡេស្ទីនទាំងមូល ដោយរាប់ទាំងតំបន់​ហ្កាហ្សា បន្ទាប់ពី​សង្គ្រាមរវាងអ៊ីស្រាអែល និង​ក្រុមហាម៉ាស ត្រូវបិទបញ្ចប់​។",
      )
        .size(18)
        .font("Inter Khmer")
        .lineHeight(1.4)
        .color("gray")
        .align("justify"),
    )
      .strokeWidth(1)
      .padding(10, 15)
      .strokeColor("#eee")
      .cornerRadius(20)
      .cornerSmoothing(0.7)
      .bg("white")
      .shadow("0px 0px 20px rgba(0,0,0,.1)"),

    Table(
      TableRow(
        StylishHeader("មកចូលរួម", [18, 0, 0, 0]),
        StylishHeader("Column 2", [0]),
        StylishHeader("Column 3", [0, 18, 0, 0]),
      ),
      TableRow(
        StylishCell("This is a text"),
        StylishCell("Hello world"),
        StylishCell("This is another"),
      ),
      TableRow(StylishCell("This is a text"), StylishCell("Hello world")),
      TableRow(
        StylishCell("This is a loooong text"),
        StylishCell("Hello world").bg("yellow"),
      ),
      TableRow(StylishCell("Hello world")),
    )
      .alignSelf("flex-start")
      .marginTop(20)
      .strokeWidth(2)
      .strokeColor("rgba(0,0,0,.2)")
      .cornerRadius(18)
      .lineDash(5, 4)
      .cornerSmoothing(0.7)
      .shadow("10px 10px 0px rgba(0,0,0,.1)"),
    Table(
      TableRow(
        StylishHeader("មកចូលរួម"),
        StylishHeader("Column 2"),
        StylishHeader("Column 3"),
      ),
      TableRow(
        StylishCell("This is a text"),
        StylishCell("Hello world"),
        StylishCell("This is another"),
      ),
      TableRow(StylishCell("This is a text"), StylishCell("Hello world")),
      TableRow(
        StylishCell("This is a loooong text").bg("rgba(255,0,0,0.1)"),
        StylishCell("Stuff"),
      ),
      TableRow(StylishCell("Hello world")),
    )
      .alignSelf("flex-start")
      .marginTop(20)
      .strokeWidth(2)
      .strokeColor("red")
      .shadow("10px 10px 0px rgba(0,0,0, 0.4)")
      .width(600),
  )
    .maxWidth(700)
    .padding(40)
    .gap(10);
}

await fs.writeFile("test/table.jpg", renderAsImageBuffer(Document()));
