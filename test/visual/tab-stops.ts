import { Column, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const TABS = [200, 280] as const;

const root = Column(
  Text("Tab Stops Demo").size(24).weight("bold").marginBottom(12),

  Text("Product\tQty\tPrice")
    .tabStops(...TABS)
    .weight("bold")
    .color("slategray"),
  Text("Widget A\t2\t$10.00").tabStops(...TABS),
  Text("Widget B\t10\t$5.00").tabStops(...TABS),
  Text("Widget C\t1\t$99.99").tabStops(...TABS),
  Text("Grand Total\t\t$134.99")
    .tabStops(...TABS)
    .weight("bold"),
)
  .padding(24)
  .gap(4)
  .width(440)
  .bg("white");

await writeCanvasToFile(root, import.meta.url);
