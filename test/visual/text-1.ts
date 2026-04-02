import { fileURLToPath } from "node:url";
import { Column, Photo, Row, Span, Text, TextDefault } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const relative = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const imageUrl = relative("../image/kouprey.jpg");

const root = Column(
  //
  Text(
    Span("កុំសៀមដាក់ខ្ញុំ")
      .font("Moul")
      .color("orange")
      .offsetY(-20)
      .size(44)
      .strokeColor("black")
      .strokeWidth(8),
    " កុំសៀមដាក់ខ្ញុំ",
    " ",
    Span("កុំសៀមដាក់ខ្ញុំ").font("Noto Serif Khmer").color("burlywood").underline(),
  )
    .size(100)
    .font("Noto Serif Khmer")
    .bg("white")
    .color("black")
    .alignSelf("center"),
  Text("ស្រ្តីខ្មែរ")
    .size(100)
    .dropShadow(
      "8px 8px 0px #4444dd",
      "8px -8px 0px red",
      "-8px -8px 0px orange",
      "-8px 8px 0px black",
    )
    .weight("bold")
    .font("Inter Khmer")
    .bg("seagreen")
    .color("beige")
    .alignSelf("flex-end")
    .borderColor("beige")
    .borderWidth(22)
    .borderRadius(56)
    .padding(26, 40),

  Row(
    Text(
      Span("រាជធានីភ្នំពេញ").font("Moul").size(26).color("cyan"),
      " ៖ ក្រសួងការពារជាតិកម្ពុជា បានគូសបញ្ជាក់ថា ការប្រើប្រាស់ សព្វាវុធធុនធ្ងន់គ្រប់ប្រភេទរបស់ប្រទេសថៃ និងការដាក់ពង្រាយទាហានដ៏ច្រើនលើសលុប ដើម្បី ទន្ទ្រានយក ទឹកដីកម្ពុជា គឺជាការ រំលោភយ៉ាងច្បាស់ ក្រឡែត ចំពោះធម្មនុញ្ញអង្គការ សហប្រជា ជាតិ ធម្មនុញ្ញអាស៊ាន។\n",
      // newline
      Span("រាជធានីភ្នំពេញ")
        .font("Moul")
        .size(26)
        .color("cyan"),
      " ៖ ក្រសួងការពារជាតិកម្ពុជា បានគូសបញ្ជាក់ថា ការប្រើប្រាស់ សព្វាវុធធុនធ្ងន់គ្រប់ប្រភេទរបស់ប្រទេសថៃ និងការដាក់ពង្រាយទាហានដ៏ច្រើនលើសលុប ដើម្បី ទន្ទ្រានយក ទឹកដីកម្ពុជា គឺជាការ រំលោភយ៉ាងច្បាស់ ក្រឡែត ចំពោះធម្មនុញ្ញអង្គការ សហប្រជា ជាតិ ធម្មនុញ្ញអាស៊ាន។",
    )
      .size(32)
      .tag("block")
      .weight(500)
      .font("Inter Khmer")
      .maxWidth(700)
      .bg("saddlebrown")
      .bg(
        `linear-gradient(-225deg, #231557 0%, #44107A 29%, #FF1361 67%, #FFF800 100%),
                      repeating-linear-gradient(-115deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px),
                      repeating-linear-gradient(115deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)`,
      )
      .color("white")
      .alignSelf("flex-start")
      .lineHeight(1.3)
      .rounded(44)
      .cornerSmoothing(0.7)
      .padding(24, 24)
      .align("justify")
      .indent(64)
      .borderColor("white")
      .borderWidth(8)
      .dropShadow("4px 4px 0 black")
      .shadow("4px 4px 10px rgba(0,0,0,.6)"),
    Text(
      "- A commonly used HTML entity is the non-breaking space: &nbsp; A non-breaking space is a space that will not break into a new line. Two words separated by a non-breaking space will stick together (not break into a new line). This is handy when breaking the words might be disruptive.",
    )
      .size(32)
      .weight(500)
      .font("Inter Khmer")
      .maxWidth(600)
      .bg("black")
      .bg(Photo(imageUrl).scaleType("fill").opacity(0.4).scale(1))
      .color("white")
      .underline()
      .alignSelf("flex-start")
      .padding(20)
      .borderColor("black")
      .borderWidth(2)
      .rounded(32)
      .lineHeight(1.3)
      .hangingIndent(22),
  )
    .gap(20)
    .tag("paragraph")
    .padding(20),
  TextDefault(
    Row(
      //
      Text("កុំសៀមដាក់ខ្ញុំ")
        .bg("violet")
        .padding(20)
        .strokeColor("white")
        .strokeWidth(22)
        .alignSelf("flex-start"),
      Row().flex(1),
      Text("កុំសៀមដាក់ខ្ញុំ")
        .bg("sandybrown")
        .padding(10)
        .font("Moul")
        .color("linear-gradient(45deg, black, blue)"),
    )
      .bg("wheat")
      .padding(20),
  )
    .size(90)
    .font("Noto Serif Khmer")
    .color("red")
    .weight(500),
  Text(
    "📸🙏 ក្រុមហ៊ុន",
    Span(" Honda ")
      .color("red")
      .offsetY(-20)
      .highlight("yellow")
      .dropShadow("2px 4px 0px black"),
    Span("ដែលកាន់កាប់ចំណែកទីផ្សារធំបំផុតនៃម៉ូតូកម្លាំងម៉ាស៊ីន 50 cc ")
      .underline()
      .lineThrough()
      .overline(),
    Span("(ក)").size(24).offsetY(-10).color("red"),
    " ឬតូចជាងនេះបានសម្រេចចិត្តថា ",
    Span("ការផលិតនឹងពិបាករក្សាម៉ូតូ ").color("brown").font("Moul").size(24),
    "ក្នុងតម្លៃលក់សមរម្យ ប្រសិនបើក្រុមហ៊ុនអនុវត្តការផ្លាស់ប្តូរចាំបាច់",
    " ដើម្បីគោរពតាមបទប្បញ្ញត្តិថ្មី ដែលគ្រោងនេងចូលជាធរមាននៅក្នុងខែវិច្ឆិកា ឆ្នាំ",
    Span("២០២៥").font("Moul").weight(600).color("red").underline(),
    "។",
  )
    .font("Noto Serif Khmer")
    .size(36)
    .alignSelf("center")
    .borderColor("rgba(0,0,0,.2)")
    .borderWidth(2)
    .lineHeight(1.3)
    .maxWidth(800)
    .bg("white")
    .padding(4, 18)
    .rounded(32),
)
  .gap(20)
  .bg("#eee")
  .padding(40);

await writeCanvasToFile(root, import.meta.url);
