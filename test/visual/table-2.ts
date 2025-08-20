import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Canvas } from "skia-canvas";
import {
  Column,
  render,
  renderer,
  Span,
  Table,
  TableCell,
  TableRow,
  Text,
  TextDefault,
} from "../../src/node.ts";

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

const canvas = await render<Canvas>(root, renderer);
const file = path.parse(fileURLToPath(import.meta.url));

await fs.writeFile(
  path.join(file.dir, `${file.name}.jpg`),
  await canvas.toBuffer("jpg", { quality: 1 }),
);
