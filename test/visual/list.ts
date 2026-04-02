import {
  Column,
  List,
  ListItem,
  Span,
  Text,
  TextDefault,
} from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const root = Column(
  Text("List Demo").size(32).weight("bold").marginBottom(16),

  // Disc list (default)
  Text("Unordered — disc")
    .size(14)
    .weight("bold")
    .color("gray"),
  List(
    ListItem(Text("First item")),
    ListItem(
      Text(
        "Second item with longer text that should wrap nicely Second item with longer text that should wrap nicely Second item with longer text that should wrap nicely",
      ),
    ),
    ListItem(Text("Third item")),
    ListItem(
      Text(
        "Item with ",
        Span("styled").color("royalblue").weight("bold"),
        " content",
      ),
    ),
  )
    .marginTop(10)
    .listStyle("disc")
    .markerGap(8)
    .gap(4)
    .marginBottom(16),

  // Circle list
  Text("Unordered — circle")
    .size(14)
    .weight("bold")
    .color("gray"),
  List(ListItem(Text("Alpha")), ListItem(Text("Beta")), ListItem(Text("Gamma")))
    .listStyle("circle")
    .markerGap(8)
    .gap(4)
    .marginTop(10)
    .marginBottom(16),

  // Decimal (ordered) list
  Text("Ordered — decimal")
    .size(14)
    .weight("bold")
    .color("gray"),
  List(
    ListItem(Text("Step one: Install the package")),
    ListItem(Text("Step two: Import and configure")),
    ListItem(Text("Step three: Render your first layout")),
  )
    .marginTop(10)
    .listStyle("decimal")
    .startIndex(1)
    .markerGap(10)
    .gap(6)
    .marginBottom(16),

  // Span marker — full styling via Span()
  Text('Span marker — Span("+")')
    .size(14)
    .weight("bold")
    .color("gray"),
  TextDefault(
    List(
      ListItem(Text("Click the button")),
      ListItem(Text("Fill in the form")),
      ListItem(Text("Submit and wait")),
    )
      .marginTop(10)
      .listStyle(Span("-").color("mediumseagreen").weight("bold").size(16))
      .markerOffset(-3)
      .markerGap(12)
      .gap(6)
      .marginBottom(16),
  ).lineHeight(1),

  // Arrow function marker — dynamic per-item spans
  Text("Arrow function marker — dynamic labels")
    .size(14)
    .weight("bold")
    .color("gray"),
  List(
    ListItem(Text("Install dependencies")),
    ListItem(Text("Configure the environment")),
    ListItem(Text("Run the build step")),
    ListItem(Text("Deploy to production")),
  )
    .marginTop(10)
    .listStyle((index) => {
      const labels = ["a.", "b.", "c.", "d."];
      return Span(labels[index] ?? `${index + 1}.`).color("royalblue");
    })
    .markerGap(10)
    .gap(6)
    .marginBottom(16),

  // Arrow function marker — pulling values from an array
  Text("Arrow function marker — array values")
    .size(14)
    .weight("bold")
    .color("gray"),
  List(
    ListItem(Text("First priority task")),
    ListItem(Text("Second priority task")),
    ListItem(Text("Third priority task")),
  )
    .marginTop(10)
    .listStyle((index) => {
      const colors = ["#e53e3e", "#dd6b20", "#38a169"];
      return Span(`${index + 1}.`)
        .color(colors[index] ?? "black")
        .weight("bold");
    })
    .markerGap(8)
    .gap(6)
    .marginBottom(16),

  // Arrow function marker — inherits from TextDefault
  Text("Arrow function marker — TextDefault inheritance")
    .size(14)
    .weight("bold")
    .color("gray"),
  TextDefault(
    List(
      ListItem(Text("First step")),
      ListItem(Text("Second step")),
      ListItem(Text("Third step")),
    )
      .marginTop(10)
      .listStyle((index) => Span(`${index + 1}.`))
      .markerGap(8)
      .gap(6)
      .marginBottom(16),
  )
    .size(16)
    .color("slateblue")
    .weight("bold"),

  // Nested list
  Text("Nested list")
    .size(14)
    .weight("bold")
    .color("gray"),
  List(
    ListItem(
      Text("Parent item one"),
      List(ListItem(Text("Child A")), ListItem(Text("Child B")))
        .listStyle("circle")
        .markerGap(6)
        .gap(2)
        .marginTop(4),
    ),
    ListItem(Text("Parent item two")),
  )
    .listStyle("disc")
    .markerGap(8)
    .gap(6)
    .marginTop(10),
)
  .padding(32)
  .width(480)
  .bg("white");

await writeCanvasToFile(root, import.meta.url);
