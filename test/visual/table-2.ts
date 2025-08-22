import {
  Column,
  Span,
  Table,
  TableCell,
  TableRow,
  Text,
  TextDefault,
} from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const root = Column(
  TextDefault(
    Table(
      // Header row
      TableRow(
        TextDefault(
          TableCell(Text("ID")),
          TableCell(Text("Name")),
          TableCell(Text("Gender")),
        )
          .weight("bold")
          .color("black"),
      ).bg("lime"),
      // Data rows
      TableRow(
        TableCell(Text("001")),
        TableCell(
          Text(
            "Alice ",
            Span("Johnson")
              .highlight("yellow")
              .weight("bold")
              .font("monospace"),
          ),
        ),
        TableCell(Text("Female")),
      ),
      TableRow(
        TableCell(Text("002")),
        TableCell(Text("Bob Smith")).bg("aquamarine"),
        TableCell(Text("Male")),
      ),
      TableRow(
        TableCell(Text("003")),
        TableCell(Text("Carol Davis")),
        TableCell(Text("Female")),
      ),
      TableRow(
        TableCell(Text("004")),
        TableCell(Text("David Wilson")),
        TableCell(Text("Male")),
      ),
      TableRow(
        TableCell(Text("005")),
        TableCell(Text("Eva Martinez")),
        TableCell(Text("Female")),
      ),
    )
      .bg("white")
      .borderWidth(2)
      .borderColor("#333")
      .spacing(30, 20),
  )
    .size(32)
    .font("Arial")
    .color("#333"),
)
  .bg("#eee")
  .padding(40);

await writeCanvasToFile(root, import.meta.url);
