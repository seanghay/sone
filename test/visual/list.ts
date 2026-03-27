import { Column, List, ListItem, Span, Text } from "../../src/node.ts";
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
    .listStyle("disc")
    .markerColor("gray")
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
    .markerColor("steelblue")
    .markerGap(8)
    .gap(4)
    .marginBottom(16),

  // Square list
  Text("Unordered — square")
    .size(14)
    .weight("bold")
    .color("gray"),
  List(ListItem(Text("One")), ListItem(Text("Two")), ListItem(Text("Three")))
    .listStyle("square")
    .markerColor("tomato")
    .markerGap(8)
    .gap(4)
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
    .listStyle("decimal")
    .startIndex(1)
    .markerColor("darkslategray")
    .markerWeight("bold")
    .markerGap(10)
    .gap(6)
    .marginBottom(16),

  // Custom marker
  Text("Custom marker — →")
    .size(14)
    .weight("bold")
    .color("gray"),
  List(
    ListItem(Text("Click the button")),
    ListItem(Text("Fill in the form")),
    ListItem(Text("Submit and wait")),
  )
    .listStyle("→")
    .markerColor("mediumseagreen")
    .markerSize(16)
    .markerGap(12)
    .gap(6)
    .marginBottom(16),

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
        .markerColor("gray")
        .markerGap(6)
        .gap(2)
        .marginTop(4),
    ),
    ListItem(Text("Parent item two")),
  )
    .listStyle("disc")
    .markerColor("black")
    .markerGap(8)
    .gap(6),
)
  .padding(32)
  .width(480)
  .bg("white");

await writeCanvasToFile(root, import.meta.url);
