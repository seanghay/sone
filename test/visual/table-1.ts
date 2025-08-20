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

function TextDesc(text: string) {
  return Text(text).maxWidth(300).lineHeight(1.3);
}

const root = Column(
  Text("Sone.js ", Span("Table").highlight("lightgray"))
    .size(56)
    .font("Inter Khmer")
    .weight("bold"),
  Text("Table កម្រិតខ្ពស់ដែលបានបង្កើតរួចហើយ។ ត្រៀមចំពោះការបង្កើត invoice!")
    .size(32)
    .font("Inter Khmer")
    .color("slategray")
    .marginBottom(20),
  TextDefault(
    Table(
      TableRow(
        TextDefault(
          TableCell(Text("កិច្ចការ")),
          TableCell(Text("Project")),
          TableCell(Text("អ្នកទទួលខុសត្រូវ")).alignItems("center"),
          TableCell(Text("ការពិពណ៌នា")),
        )
          .color("white")
          .weight("bold")
          .size(22),
      ).bg("brown"),

      TableRow(
        TableCell(Text("រៀបចំ CI/CD Pipeline")),
        TableCell(Text("E-commerce Platform")),
        TableCell(Text("Alex Chen")).alignItems("center"),
        TableCell(
          TextDesc("កំណត់រចនាសម្ព័ន្ធ automated testing និង deployment workflows"),
        ),
      ),

      TableRow(
        TableCell(Text("រចនា User Dashboard")),
        TableCell(Text("Analytics App")),
        TableCell(Text("Sarah Johnson")).alignItems("center"),
        TableCell(
          TextDesc("បង្កើត wireframes និង mockups សម្រាប់ interface dashboard មេ"),
        ),
      ).bg("yellow"),
      TableRow(
        TableCell(
          Text(
            "Database ",
            Span("Migration").color("white").highlight("black"),
          ),
        ),
        TableCell(Text("Legacy System Upgrade")),
        TableCell(Text("Mike Rodriguez")).alignItems("center"),
        TableCell(TextDesc("ផ្ទេរទិន្នន័យអតិថិជនពី MySQL ទៅ PostgreSQL")),
      ),

      TableRow(
        TableCell(Text("API Documentation")),
        TableCell(Text("Mobile SDK")),
        TableCell(
          Text("Emma Thompson").color("darkred").style("italic").weight("bold"),
        )
          .bg("pink")
          .alignItems("center"),
        TableCell(TextDesc("សរសេរឯកសារ API ពេញលេញជាមួយឧទាហរណ៍ code")),
      ),

      TableRow(
        TableCell(Text("Performance Testing")),
        TableCell(Text("Web Application")),
        TableCell(Text("David Kim")).alignItems("center"),
        TableCell(TextDesc("អនុវត្ត load testing និងបង្កើនប្រសិទ្ធភាព bottlenecks")),
      ),

      TableRow(
        TableCell(Text("User Authentication")),
        TableCell(Text("Social Media Platform")),
        TableCell(Text("Lisa Wang")).alignItems("center"),
        TableCell(TextDesc("អនុវត្ត OAuth2 និង multi-factor authentication")),
      ),

      TableRow(
        TableCell(Text("Mobile Responsive Design")),
        TableCell(Text("Corporate Website")),
        TableCell(Text("James Miller")).alignItems("center"),
        TableCell(TextDesc("ធានាថា website ដំណើរការយ៉ាងរលូននៅលើគ្រប់ទំហំឧបករណ៍")),
      ),

      TableRow(
        TableCell(Text("យុទ្ធសាស្ត្រ Data Backup")),
        TableCell(Text("Cloud Infrastructure")),
        TableCell(Text("Rachel Green")).alignItems("center"),
        TableCell(
          TextDesc("រចនា automated backup និងផែនការស្ដារបន្ទាប់ពីគ្រោះមហន្តរាយ"),
        ),
      ),

      TableRow(
        TableCell(Text("Security Audit")),
        TableCell(Text("Payment Gateway")),
        TableCell(Text("Tom Anderson")).alignItems("center"),
        TableCell(
          TextDesc("អនុវត្ត penetration testing និងការវាយតម្លៃភាពងាយរងគ្រោះ"),
        ),
      ),

      TableRow(
        TableCell(Text("Feature Testing")),
        TableCell(Text("Chat Application")),
        TableCell(Text("Nina Patel")).alignItems("center"),
        TableCell(TextDesc("ធ្វើតេស្ត real-time messaging និងមុខងារចែករំលែកឯកសារ")),
      ),
    )
      .bg("white")
      .borderWidth(2)
      .borderColor("black")
      .spacing(32, 12),
  )
    .size(22)
    .font("Inter Khmer")
    .color("black"),
)
  .bg("#fff")
  .padding(40);

const canvas = await render<Canvas>(root, renderer);
const file = path.parse(fileURLToPath(import.meta.url));

await fs.writeFile(
  path.join(file.dir, `${file.name}.jpg`),
  await canvas.toBuffer("jpg", { quality: 1 }),
);
