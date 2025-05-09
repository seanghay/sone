import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Font } from "../src/font.js";
import {
  Column,
  Flex,
  Photo,
  Row,
  SoneConfig,
  Span,
  Text,
  renderAsImageBuffer,
} from "../src/sone.js";

async function Document() {
  console.time("resource");
  const [imageSrc, bgSrc] = await Promise.all([
    SoneConfig.loadImage("test/Flag_of_Cambodia.svg"),
    SoneConfig.loadImage("test/248-700x400.jpg"),
  ]);

  console.timeEnd("resource");

  const sample =
    "ពិធីបុណ្យ ព្រះសពរបស់ សម្តេច ប៉ាបហ្វ្រង់ស្វ័រ បានប្រព្រឹត្តិធ្វើទៅនៅបុរីវ៉ាទីកង់ នៅថ្ងៃសៅរ៍ ទី២៦មេសានេះ។ ព្រះមហាក្សត្រ ប្រមុខរដ្ឋ ប្រមុខរដ្ឋាភិបាល និងគណៈប្រតិភូសរុបជាង១៦០ បានមកចូលរួម នៅក្នុងកម្មវិធីនេះ។";

  const defaultFont = "Inter Khmer";

  return Column(
    Row(
      Flex()
        .size(200, 100)
        .cornerRadius(100, 0)
        .bg(
          "linear-gradient(45deg, turquoise 20%, yellow 20%, yellow 40%, turquoise 40%, turquoise 60%, yellow 60%, yellow 80%, turquoise 80%, turquoise 100%)",
        ),
      Flex().size(200).cornerRadius(200).bg("orange"),
      Photo(imageSrc)
        .size(200)
        .cornerRadius(40)
        .cornerSmoothing(0.7)
        .scaleType("cover"),
      Photo(imageSrc)
        .size(200)
        .cornerRadius(44)
        .cornerSmoothing(0.7)
        .bg("green")
        .scaleType("cover")
        .strokeColor("rgba(0,0,0,.4)")
        .strokeWidth(1)
        .shadow(
          "0px 10px 10px red",
          "0px -10px 10px blue",
          "-10px 0px 10px orange",
          "10px 0px 10px lightgreen",
        ),
    )
      .alignItems("center")
      .gap(44),
    Text(
      Span("Lorem ipsum")
        .color("green")
        .weight(800)
        .shadow("3px 3px 0px lightgreen"),
      " dolor sit amet, consectetur adipiscing elit. Praesent dignissim vehicula ultrices. Proin a purus interdum neque eleifend volutpat quis vitae ipsum. Quisque at sollicitudin dolor. Cras ut enim rhoncus nibh consectetur fermentum nec a lorem. In ut sapien mauris. Praesent vel urna elit. Pellentesque iaculis mollis arcu, lobortis fermentum odio euismod quis.",
    )
      .lineHeight(1.5)
      .color("#205781")
      .size(20)
      .font("SF Pro Text")
      .align("center"),
    Text(
      Span("const ").color("red"),
      Span("date").weight(700).color("blue").line(-8, 3, "yellow"),
      " ",
      Span("= "),
      Span("new ").color("red"),
      Span("Date();").color("blue"),
    )
      .size(24)
      .color("#A55B4B")
      .font("Geist Mono")
      .shadow("2px 4px 4px black, 2px -4px 4px orange"),
    Text(sample).font(defaultFont).lineHeight(1.5).size(22).color("blue"),
    Row(
      Flex()
        .cornerRadius(20)
        .grow(1)
        .size(50, "auto")
        .bg("linear-gradient(to left, #a18cd1 0%, #fbc2eb 100%)")
        .strokeColor("orange")
        .strokeWidth(6),
      Flex().cornerRadius(20).size(100).bg("#57B4BA").cornerSmoothing(1),
    ).gap(50),
    Column(
      Flex(
        Flex(
          Text(
            "ពិធីបុណ្យ ព្រះសពរបស់ ",
            Span("សម្តេច ប៉ាបហ្វ្រង់ស្វ័រ").font("Moul").size(22).color("#FE7743"),
            " បានប្រព្រឹត្តិ ធ្វើទៅនៅបុរីវ៉ាទីកង់ នៅថ្ងៃសៅរ៍ ទី២៦មេសានេះ។ ព្រះមហាក្សត្រ ប្រមុខរដ្ឋ ប្រមុខរដ្ឋាភិបាល និងគណៈប្រតិភូសរុបជាង១៦០ បានមកចូលរួម នៅក្នុងកម្មវិធីនេះ។",
          )
            .color("#261FB3")
            .font(defaultFont)
            .lineHeight(1.7)
            .size(24)
            .align("justify")
            .weight(500)
            .strokeColor("white")
            .strokeWidth(4),
        )
          .maxWidth(400)
          .padding(30, 30)
          .cornerRadius(56)
          .cornerSmoothing(0.7)
          .alignSelf("center")
          .bg(bgSrc, "cover")
          .bg("#eee")
          .strokeColor("rgba(0,0,0,.4)")
          .strokeWidth(1)
          .shadow("5px 5px 10px rgba(0,0,0,.2)"),
        Flex(
          Text(
            "ពិធីបុណ្យ ព្រះសពរបស់ ",
            Span("សម្តេច ប៉ាបហ្វ្រង់ស្វ័រ")
              .font("KdamThmorPro")
              .size(27)
              .color("linear-gradient(to left, orange 0%, yellow 100%)")
              .strokeColor("black")
              .strokeWidth(8),
            " បានប្រព្រឹត្តិធ្វើទៅនៅបុរីវ៉ាទីកង់នៅថ្ងៃសៅរ៍ ទី២៦មេសានេះ។ ព្រះមហាក្សត្រ ប្រមុខរដ្ឋ ប្រមុខរដ្ឋាភិបាល និងគណៈប្រតិភូសរុបជាង១៦០ បានមកចូលរួម នៅក្នុងកម្មវិធីនេះ។",
          )
            .color("#fff")
            .font(defaultFont)
            .lineHeight(1.6)
            .size(30)
            .align("right")
            .weight(600),
        )
          .alignSelf("center")
          .width(700)
          .opacity(1)
          .padding(30, 25)
          .cornerRadius(28)
          .cornerSmoothing(0.7)
          .shadow("5px 5px 10px rgba(255, 137, 110, .6)")
          .bg(`linear-gradient(-225deg, #231557 0%, #44107A 29%, #FF1361 67%, #FFF800 100%),
                      repeating-linear-gradient(-115deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px),
                      repeating-linear-gradient(115deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)`),
      )
        .gap(40)
        .direction("row"),
      Text(sample)
        .color("#333")
        .font(defaultFont)
        .lineHeight(1.5)
        .size(22)
        .align("center")
        .line(4, -2, "lightgreen"),
      Flex().height(4).bg("#eee"),
      Text(
        [sample, sample].join(" "),
        "\n",
        Span([sample, sample].join(" ")).weight(700).color("black"),
        " ",
        Span([sample].join(" ")).color("#C5172E"),
        Span(
          " ສປປ ລາວ ແລະ ສາທາລະນະລັດ ອິນເດຍ (ສ ອິນເດຍ) ລົງນາມເອກະສານຮ່ວມມືສອງຝ່າຍ ຈໍານວນ 7 ສະບັບ ປະກອບມີ: ການຮ່ວມມືຂົງເຂດວຽກງານປ້ອງກັນຊາດ. ສັນຍາວ່າດ້ວຍການຮ່ວມມືການຊ່ວຍເຫຼືອເຊິ່ງກັນ ແລະ ກັນ ໃນດ້ານວຽກງານພາສີ. ການຮ່ວມມືການກະຈາຍສຽງ ແລະ ພາບ ລະຫວ່າງລາວ- ອິນເດຍ.",
        ).line(4, 2, "rgba(0,0,0,.2)"),
        Span(
          " 🙏 โดยการแจกเงินยังคงเป็นไปตามไทม์ไลน์คือไตรมาสที่ 2 ช่วงเดือน พ.ค.-มิ.ย.2568 ทั้งนี้ กระทรวงการคลัง ยืนยันว่า การดำเนินโครงการขณะนี้มีความคืบหน้าตามลำดับ โดยที่ผ่านมาได้ประชุมกับหน่วยงานที่เกี่ยวข้อง รวมถึงการหารือกับสถาบันการเงินที่เข้าร่วมโครงการ เพื่อเชื่อมระบบการทำธุรกรรมทางการเงิน ซึ่งเบื้องต้นก็เป็นไปด้วยความเรียบร้อย ไม่มีปัญหาอะไร... อ่านข่าวต้นฉบับได้ที่",
        ).color("green"),
      )
        .align("justify")
        .font(defaultFont)
        .lineHeight(2)
        .size(24)
        .weight(400)
        .indentSize(50)
        .color("gray"),
      Flex().height(4).bg("#eee"),
      Flex(
        Text("Page 1")
          .color("#fff")
          .weight("bold")
          .size(18)
          .strokeColor("black")
          .strokeWidth(4),
        Flex().size("auto").grow(1),
        Text(
          Span("Example Footer").color("blue").weight(600),
          " | Rendering Engine",
        )
          .color("#333")
          .size(18),
      )
        .justifyContent("flex-end")
        .direction("row"),
    ).gap(20),

    Flex(
      Flex(Text("I am absolute!").color("#fff").size(44)).alignSelf("center"),
    )
      .size(400, "auto")
      .cornerRadius(20)
      .position("absolute")
      .left(100)
      .top(200)
      .bg("rgba(0,0,0,.3)")
      .padding(10, 20),
  )
    .padding(60)
    .maxWidth(1300)
    .gap(40);
}

const document = await Document();

// automatic font registration
const fonts = Font.trace(document);
for (const fontFamily of fonts) {
  const fontPath = path.join("test", "fonts", `${fontFamily}.ttf`);
  if (fsSync.existsSync(fontPath)) {
    Font.registerFont(fontPath, { family: fontFamily });
  }
}

console.time("render");
await fs.writeFile("test/text-01.jpg", await renderAsImageBuffer(document));
console.timeEnd("render");
