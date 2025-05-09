import fs from "node:fs/promises";
import {
  Column,
  Flex,
  renderAsImageBuffer,
  renderAsPdfBuffer,
  Row,
  Span,
  Text,
} from "../src/sone.js";

const SAMPLE = `បណ្តាថ្នាក់ដឹកនាំអឺរ៉ុប បង្ហាញស្មារតីសាមគ្គីភាព និងបញ្ចេញសារគាំទ្រអ៊ុយក្រែនយ៉ាងច្រើនព្រោងព្រាតព្រមៗគ្នា បន្ទាប់ពីការប្រកែកខ្វែងសម្តីគ្នា រវាងប្រធានាធិបតីអ៊ុយក្រែន វ៉ូឡូឌីមៀរ ហ្សេឡេនស្គី និងប្រធានាធិបតីអាមេរិក ដូណាល់ ត្រាំ នៅសេតវិមានអាមេរិក។ ក្នុងគ្រាដ៏លំបាកនេះ តើមានមេដឹកនាំអឺរ៉ុបរូបណាខ្លះ ដែលមិនទុកលោក ហ្សេឡេនស្គី ឲ្យនៅឯកា ?\nJSDoc is a markup language used to annotate JavaScript source code files. Using comments containing JSDoc, programmers can add documentation describing the application programming interface of the code they're creating.`;

function Document() {
  return Column(
    Row(
      Text(SAMPLE)
        .font("Inter Khmer")
        .size(32)
        .weight(800)
        .lineHeight(1.3)
        .color("rgba(0,0,0,.8)")
        .align("right")
        .width(500),
      Flex(
        Text(
          Span("បណ្តាថ្នាក់ ").font("Koulen").color("blue"),
          Span("បណ្តាថ្នាក់ ").font("Moul").color("darkgreen"),
          SAMPLE,
          Span("បណ្តាថ្នាក់ ").font("Moul").color("darkgreen"),
          "lorem lorem ",
          Span("បណ្តាថ្នាក់ ")
            .font("Moul")
            .color("orange")
            .strokeColor("black")
            .strokeWidth(4),
          Span("បណ្តាថ្នាក់ ").font("Moul").color("teal"),
        )
          .font("Inter Khmer")
          .size(28)
          .lineHeight(1.6)
          .width(500),
      )
        .strokeColor("magenta")
        .strokeWidth(1)
        .alignSelf("flex-start"),
    )
      .bg("rgba(255,255,255,.1)")
      .gap(20)
      .padding(20)
      .strokeColor("red")
      .strokeWidth(2),
  )
    .bg("pink")
    .padding(40);
}

await fs.writeFile("test/baseline.jpg", await renderAsImageBuffer(Document()));
await fs.writeFile("test/baseline.pdf", await renderAsPdfBuffer(Document()));
