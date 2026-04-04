import { Column, Row, Text } from "../../src/core";
import { renderer } from "../../src/node";
import { writeCanvasToFile } from "./utils";

renderer.registerFont("NotoSansArabic", "./test/font/NotoSansArabic.ttf");
renderer.registerFont("NotoSansHebrew", "./test/font/NotoSansHebrew.ttf");

const root = Column(
  Text("Mixed Bidi Text Rendering")
    .size(18)
    .weight("bold")
    .color("#333")
    .marginBottom(20),

  // Section: LTR with label
  Text("LTR Paragraphs")
    .size(13)
    .color("#6b7280")
    .weight("bold")
    .marginBottom(6),

  Text("Hello World - standard left-to-right text")
    .size(18)
    .color("#1a1a1a")
    .marginBottom(4),

  Text("Price: 1,234.56 USD").size(18).color("#059669").marginBottom(16),

  // Section: RTL Arabic with label
  Text("RTL Arabic Paragraphs")
    .size(13)
    .color("#6b7280")
    .weight("bold")
    .marginBottom(6),

  Text("مرحبا بالعالم")
    .font("NotoSansArabic")
    .size(24)
    .baseDir("rtl")
    .align("right")
    .color("#1a1a1a")
    .marginBottom(4),

  Text("السعر: 1,234.56 دولار")
    .font("NotoSansArabic")
    .size(20)
    .baseDir("rtl")
    .align("right")
    .color("#059669")
    .marginBottom(4),

  Text("هذا النص يحتوي على أرقام 123 وكلمات عربية")
    .font("NotoSansArabic")
    .size(18)
    .baseDir("rtl")
    .align("right")
    .color("#7c3aed")
    .marginBottom(16),

  // Section: RTL Hebrew
  Text("RTL Hebrew Paragraphs")
    .size(13)
    .color("#6b7280")
    .weight("bold")
    .marginBottom(6),

  Text("שלום עולם")
    .font("NotoSansHebrew")
    .size(24)
    .baseDir("rtl")
    .align("right")
    .color("#1a1a1a")
    .marginBottom(4),

  Text("המחיר: 1,234.56 שקל")
    .font("NotoSansHebrew")
    .size(20)
    .baseDir("rtl")
    .align("right")
    .color("#059669")
    .marginBottom(16),

  // Section: Auto-detected direction
  Text("Auto-detected Direction")
    .size(13)
    .color("#6b7280")
    .weight("bold")
    .marginBottom(6),

  Row(
    Column(
      Text("Auto LTR:").size(12).color("#6b7280").marginBottom(4),
      Text("Hello World").size(18).baseDir("auto").marginBottom(0),
    )
      .flex(1)
      .alignItems("flex-start"),
    Column(
      Text("Auto RTL:")
        .size(12)
        .color("#6b7280")
        .marginBottom(4)
        .align("right"),
      Text("مرحبا بالعالم")
        .font("NotoSansArabic")
        .size(18)
        .baseDir("auto")
        .align("right")
        .marginBottom(0),
    )
      .flex(1)
      .alignItems("flex-end"),
  )
    .gap(20)
    .marginBottom(16),

  // Section: Side-by-side comparison
  Text("Alignment Comparison (RTL Arabic)")
    .size(13)
    .color("#6b7280")
    .weight("bold")
    .marginBottom(6),

  Text("align: right (natural RTL)")
    .font("NotoSansArabic")
    .size(20)
    .baseDir("rtl")
    .align("right")
    .color("#1a1a1a")
    .bg("#f9fafb")
    .padding(8)
    .marginBottom(4),

  Text("align: center")
    .font("NotoSansArabic")
    .size(20)
    .baseDir("rtl")
    .align("center")
    .color("#1a1a1a")
    .bg("#f9fafb")
    .padding(8)
    .marginBottom(4),

  Text("align: left")
    .font("NotoSansArabic")
    .size(20)
    .baseDir("rtl")
    .align("left")
    .color("#1a1a1a")
    .bg("#f9fafb")
    .padding(8),
)
  .width(620)
  .padding(30)
  .bg("white");

await writeCanvasToFile(root, import.meta.url);
