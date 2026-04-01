import { Column, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const root = Column(
  // Table of contents — classic dot leader
  Text("Table of Contents")
    .size(20)
    .weight("bold")
    .marginBottom(4),
  Text("Introduction\t1").tabStops(360).tabLeader(".").size(14),
  Text("Chapter 1: Getting Started\t12").tabStops(360).tabLeader(".").size(14),
  Text("Chapter 2: Advanced Usage\t34").tabStops(360).tabLeader(".").size(14),
  Text("Chapter 3: Customization\t56").tabStops(360).tabLeader(".").size(14),
  Text("Appendix\t78").tabStops(360).tabLeader(".").size(14).marginBottom(20),

  // Dash leader
  Text("Dash leader (—)")
    .size(16)
    .weight("bold")
    .marginBottom(4),
  Text("Revenue\t$1,200,000").tabStops(300).tabLeader("-").size(14),
  Text("Expenses\t$840,000").tabStops(300).tabLeader("-").size(14),
  Text("Net Profit\t$360,000")
    .tabStops(300)
    .tabLeader("-")
    .size(14)
    .weight("bold")
    .marginBottom(20),

  // Underscore leader
  Text("Underscore leader (_)")
    .size(16)
    .weight("bold")
    .marginBottom(4),
  Text("Name:\t___").tabStops(240).tabLeader("_").size(14),
  Text("Date:\t___").tabStops(240).tabLeader("_").size(14),
  Text("Signature:\t___")
    .tabStops(240)
    .tabLeader("_")
    .size(14)
    .marginBottom(20),

  // No leader (default behaviour, for comparison)
  Text("No leader (default)")
    .size(16)
    .weight("bold")
    .marginBottom(4),
  Text("Item A\t100").tabStops(300).size(14),
  Text("Item B\t200").tabStops(300).size(14),
)
  .padding(32)
  .width(480)
  .bg("white");

await writeCanvasToFile(root, import.meta.url);
