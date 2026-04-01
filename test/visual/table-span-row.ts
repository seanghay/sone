import { Column, Table, TableCell, TableRow, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const root = Column(
  Table(
    TableRow(
      TableCell(Text("Q1").weight("bold").color("white"))
        .rowspan(2)
        .bg("#4a90d9"),
      TableCell(Text("January")),
      TableCell(Text("$12,400")),
    ),
    TableRow(TableCell(Text("February")), TableCell(Text("$14,200"))),
    TableRow(
      TableCell(Text("Q2").weight("bold").color("white"))
        .rowspan(2)
        .bg("#5a9e5a"),
      TableCell(Text("March")),
      TableCell(Text("$13,800")),
    ),
    TableRow(TableCell(Text("April")), TableCell(Text("$15,600"))),
    TableRow(
      TableCell(Text("Q3").weight("bold").color("white"))
        .rowspan(2)
        .bg("#d9844a"),
      TableCell(Text("May")),
      TableCell(Text("$11,900")),
    ),
    TableRow(TableCell(Text("June")), TableCell(Text("$16,300"))),
  )
    .bg("white")
    .borderWidth(1)
    .borderColor("#ccc")
    .spacing(16, 10),
)
  .bg("#f0f0f0")
  .padding(30);

await writeCanvasToFile(root, import.meta.url);
