import { Column, Table, TableCell, TableRow, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const root = Column(
  Table(
    TableRow(
      TableCell(Text("Full Name").weight("bold").color("white")).colspan(2),
      TableCell(Text("Score").weight("bold").color("white")),
      TableCell(Text("Grade").weight("bold").color("white")),
    ).bg("#4a90d9"),
    TableRow(
      TableCell(Text("Alice")),
      TableCell(Text("Johnson")),
      TableCell(Text("95")),
      TableCell(Text("A")),
    ),
    TableRow(
      TableCell(Text("Bob")),
      TableCell(Text("Smith")),
      TableCell(Text("82")),
      TableCell(Text("B")),
    ),
    TableRow(
      TableCell(Text("Summary")).colspan(2).bg("#f0f0f0"),
      TableCell(Text("88.5")).bg("#f0f0f0"),
      TableCell(Text("B+")).bg("#f0f0f0"),
    ),
    TableRow(TableCell(Text("Grand Total")).colspan(4).bg("#e8f4e8")),
  )
    .bg("white")
    .borderWidth(1)
    .borderColor("#ccc")
    .spacing(16, 10),
)
  .bg("#f5f5f5")
  .padding(30);

await writeCanvasToFile(root, import.meta.url);
