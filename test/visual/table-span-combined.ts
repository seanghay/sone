import { Column, Table, TableCell, TableRow, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

// Invoice-style table combining colspan and rowspan
const root = Column(
  Table(
    // Header row spanning all columns
    TableRow(
      TableCell(Text("INVOICE").weight("bold").color("white"))
        .colspan(4)
        .bg("#2c3e50"),
    ),
    // Sub-header
    TableRow(
      TableCell(Text("Item").weight("bold")),
      TableCell(Text("Qty").weight("bold")),
      TableCell(Text("Unit Price").weight("bold")),
      TableCell(Text("Amount").weight("bold")),
    ).bg("#ecf0f1"),
    // Data rows with rowspan on category label
    TableRow(
      TableCell(Text("Services").weight("bold").color("white"))
        .rowspan(2)
        .bg("#3498db"),
      TableCell(Text("Consulting")),
      TableCell(Text("5")),
      TableCell(Text("$500")),
    ),
    TableRow(
      TableCell(Text("Design")),
      TableCell(Text("3")),
      TableCell(Text("$750")),
    ),
    // Another group with rowspan
    TableRow(
      TableCell(Text("Products").weight("bold").color("white"))
        .rowspan(2)
        .bg("#e67e22"),
      TableCell(Text("Laptop")),
      TableCell(Text("1")),
      TableCell(Text("$1,200")),
    ),
    TableRow(
      TableCell(Text("Mouse")),
      TableCell(Text("2")),
      TableCell(Text("$45")),
    ),
    // Totals row spanning first 3 columns
    TableRow(
      TableCell(Text("Total").weight("bold")).colspan(3).bg("#f8f9fa"),
      TableCell(Text("$3,290").weight("bold")).bg("#f8f9fa"),
    ),
  )
    .bg("white")
    .borderWidth(1)
    .borderColor("#bdc3c7")
    .spacing(16, 10),
)
  .bg("#f5f6fa")
  .padding(30);

await writeCanvasToFile(root, import.meta.url);
