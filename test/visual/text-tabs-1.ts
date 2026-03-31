import { Column, Span, Text } from "../../src/node.ts";
import { loadVisualTestFonts } from "./load-test-fonts.ts";
import { writeCanvasToFile } from "./utils.ts";

await loadVisualTestFonts();

const line = (...children: Parameters<typeof Text>) =>
  Text(...children)
    .font("GeistMono")
    .size(20)
    .width(700)
    .tabStops(240, 430, 590)
    .lineHeight(1.35)
    .color("#1f1a17");

const root = Column(
  Text("Tab stop regression board")
    .font("GeistMono")
    .size(30)
    .weight("bold")
    .color("#2f241f"),
  Text(
    "Each row uses the same tab stops so widths, synthetic tab segments, and wrapped continuation lines stay visually aligned.",
  )
    .font("GeistMono")
    .size(16)
    .maxWidth(760)
    .lineHeight(1.4)
    .color("#6d4c41"),
  Column(
    line(
      Span("Item").weight("bold"),
      "\t",
      Span("Description").weight("bold"),
      "\t",
      Span("Qty").weight("bold"),
      "\t",
      Span("Total").weight("bold"),
    ),
    line("A-101\tShort field note\t01\t$12.50"),
    line(
      "B-240\tThis description is deliberately long so the wrapped line proves the text continues under the description column instead of jumping back to the left edge.\t02\t$39.00",
    ),
    line("C-003\tសាកល្បងអត្ថបទខ្មែរ mixed with ASCII\t12\t$144.00").font(
      "NotoSansKhmer",
      "GeistMono",
    ),
    line("D-900\tSpacing check\t128\t$4,096.00"),
  )
    .gap(10)
    .padding(24)
    .bg("white")
    .borderColor("#d7c4b6")
    .borderWidth(2)
    .rounded(24),
)
  .gap(22)
  .padding(40)
  .bg("#f1efe8");

await writeCanvasToFile(root, import.meta.url);
