import { fileURLToPath } from "node:url";
import { Column, Row, renderer, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const relative = (p: string) => fileURLToPath(new URL(p, import.meta.url));

await renderer.registerFont(
  "NotoSansKhmer",
  relative("../font/NotoSansKhmer.ttf"),
);

const component = Column(
  // Header
  Row(
    Text("Dashboard").size(32).weight("bold").color("#2563eb"),
    Text("Analytics Overview").size(16).color("#6b7280"),
  )
    .padding(24)
    .justifyContent("space-between")
    .bg("#f8fafc")
    .borderWidth(0, 0, 1, 0)
    .borderColor("#e5e7eb"),

  // Main content
  Row(
    // Sidebar
    Column(
      Text("Navigation").size(18).weight("600").color("#374151"),
      Text("• Dashboard").size(14).color("#6b7280").padding(8, 0),
      Text("• Analytics").size(14).color("#2563eb").padding(8, 0),
      Text("• Reports").size(14).color("#6b7280").padding(8, 0),
      Text("• Settings").size(14).color("#6b7280").padding(8, 0),
    )
      .width(200)
      .padding(24)
      .bg("#f9fafb")
      .borderWidth(0, 1, 0, 0)
      .borderColor("#e5e7eb"),

    // Content area
    Column(
      // Stats cards
      Row(
        Column(
          Text("Users").size(14).color("#6b7280"),
          Text("1,234").size(28).weight("bold").color("#111827"),
          Text("+12%").size(12).color("#10b981"),
        )
          .padding(20)
          .bg("white")
          .rounded(8)
          .borderWidth(1)
          .borderColor("#e5e7eb")
          .flex(1),

        Column(
          Text("Revenue").size(14).color("#6b7280"),
          Text("$45,678").size(28).weight("bold").color("#111827"),
          Text("+8%").size(12).color("#10b981"),
        )
          .padding(20)
          .bg("white")
          .rounded(8)
          .borderWidth(1)
          .borderColor("#e5e7eb")
          .flex(1),

        Column(
          Text("Orders").size(14).color("#6b7280"),
          Text("567").size(28).weight("bold").color("#111827"),
          Text("-3%").size(12).color("#ef4444"),
        )
          .padding(20)
          .bg("white")
          .rounded(8)
          .borderWidth(1)
          .borderColor("#e5e7eb")
          .flex(1),
      ).gap(16),

      // Chart placeholder
      Column(
        Text("Sales Chart").size(20).weight("600").color("#374151"),
        Column()
          .height(200)
          .bg("#f3f4f6")
          .rounded(4)
          .borderWidth(2, 2, 2, 2)
          .borderColor("#d1d5db"),
      )
        .padding(24)
        .bg("white")
        .rounded(8)
        .borderWidth(1)
        .borderColor("#e5e7eb"),
    )
      .padding(24)
      .gap(24)
      .flex(1),
  ).flex(1),

  // Footer
  Text("© 2024 Dashboard. All rights reserved.")
    .size(12)
    .color("#9ca3af")
    .padding(16)
    .bg("#f8fafc")
    .borderWidth(1, 0, 0, 0)
    .borderColor("#e5e7eb"),
)
  .width(1200)
  .height(800)
  .bg("#ffffff");

await writeCanvasToFile(component, import.meta.url);
