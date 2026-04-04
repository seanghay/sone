import { Column, Span, Text, TextDefault } from "../../src/core";
import { renderer } from "../../src/node";
import { writeCanvasToFile } from "./utils";

renderer.registerFont("NotoSansArabic", "./test/font/NotoSansArabic.ttf");

const root = Column(
  // Title
  Text("Arabic (RTL) Bidi Rendering Test")
    .size(18)
    .weight("bold")
    .color("#333")
    .marginBottom(20),

  // 1. Pure Arabic paragraph - auto-detected RTL
  Text("مرحبا بالعالم")
    .font("NotoSansArabic")
    .size(32)
    .baseDir("auto")
    .align("right")
    .color("#1a1a1a")
    .marginBottom(8),

  // 2. Explicit RTL
  Text("هذا مثال على النص العربي")
    .font("NotoSansArabic")
    .size(24)
    .baseDir("rtl")
    .align("right")
    .color("#2563eb")
    .marginBottom(8),

  // 3. Longer Arabic paragraph with word wrap
  Text("اللغة العربية هي لغة سامية تنتمي إلى مجموعة اللغات الأفريقية الآسيوية")
    .font("NotoSansArabic")
    .size(18)
    .baseDir("rtl")
    .align("right")
    .color("#374151")
    .lineHeight(1.6)
    .marginBottom(16),

  // 4. Arabic numbers
  Text("السعر: ١٢٣ دولار")
    .font("NotoSansArabic")
    .size(22)
    .baseDir("rtl")
    .align("right")
    .color("#059669")
    .marginBottom(8),

  // 5. Arabic with Latin numbers
  Text("السعر: 100 دولار")
    .font("NotoSansArabic")
    .size(22)
    .baseDir("rtl")
    .align("right")
    .color("#7c3aed")
    .marginBottom(8),

  // 6. Center-aligned RTL
  Text("مرحباً بكم")
    .font("NotoSansArabic")
    .size(28)
    .baseDir("rtl")
    .align("center")
    .color("#dc2626")
    .marginBottom(16),

  // 7. RTL with different font sizes via spans
  TextDefault(
    Text(
      Span("مرحبا").size(32).color("#1a1a1a"),
      Span(" "),
      Span("بالعالم").size(24).color("#6b7280"),
    )
      .font("NotoSansArabic")
      .baseDir("rtl")
      .align("right"),
  ).font("NotoSansArabic"),

  // 8. RTL with highlight
  Text("النص المميز باللون")
    .font("NotoSansArabic")
    .size(22)
    .baseDir("rtl")
    .align("right")
    .highlight("#fef08a")
    .color("#111827")
    .marginTop(8),
)
  .width(600)
  .padding(30)
  .bg("white");

await writeCanvasToFile(root, import.meta.url);
