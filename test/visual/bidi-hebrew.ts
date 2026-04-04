import { Column, Span, Text, TextDefault } from "../../src/core";
import { renderer } from "../../src/node";
import { writeCanvasToFile } from "./utils";

renderer.registerFont("NotoSansHebrew", "./test/font/NotoSansHebrew.ttf");

const root = Column(
  // Title
  Text("Hebrew (RTL) Bidi Rendering Test")
    .size(18)
    .weight("bold")
    .color("#333")
    .marginBottom(20),

  // 1. Basic Hebrew - auto-detect
  Text("שָׁלוֹם עוֹלָם")
    .font("NotoSansHebrew")
    .size(36)
    .baseDir("auto")
    .align("right")
    .color("#1a1a1a")
    .marginBottom(8),

  // 2. Explicit RTL
  Text("שלום עולם")
    .font("NotoSansHebrew")
    .size(32)
    .baseDir("rtl")
    .align("right")
    .color("#2563eb")
    .marginBottom(8),

  // 3. Longer Hebrew sentence
  Text("עברית היא שפה שמית ממשפחת השפות האפרו-אסיאתיות")
    .font("NotoSansHebrew")
    .size(20)
    .baseDir("rtl")
    .align("right")
    .color("#374151")
    .lineHeight(1.6)
    .marginBottom(16),

  // 4. Hebrew with numbers
  Text("המחיר: 100 שקל")
    .font("NotoSansHebrew")
    .size(24)
    .baseDir("rtl")
    .align("right")
    .color("#059669")
    .marginBottom(8),

  // 5. Center-aligned Hebrew
  Text("ברוכים הבאים")
    .font("NotoSansHebrew")
    .size(28)
    .baseDir("rtl")
    .align("center")
    .color("#dc2626")
    .marginBottom(16),

  // 6. Multi-line wrapped Hebrew
  Text("ישראל הוא מדינה במזרח התיכון הממוקמת בחלקה המזרחי של חוף הים התיכון")
    .font("NotoSansHebrew")
    .size(18)
    .baseDir("rtl")
    .align("right")
    .lineHeight(1.5)
    .color("#111827")
    .marginBottom(12),

  // 7. RTL with underline decoration
  Text("טקסט עם קו תחתון")
    .font("NotoSansHebrew")
    .size(22)
    .baseDir("rtl")
    .align("right")
    .underline(1)
    .color("#7c3aed")
    .marginBottom(8),

  // 8. Mixed size spans
  TextDefault(
    Text(
      Span("שלום").size(32).color("#1a1a1a"),
      Span(" "),
      Span("עולם").size(22).color("#6b7280"),
    )
      .font("NotoSansHebrew")
      .baseDir("rtl")
      .align("right"),
  ).font("NotoSansHebrew"),
)
  .width(600)
  .padding(30)
  .bg("white");

await writeCanvasToFile(root, import.meta.url);
