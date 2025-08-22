import { Column, Span, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const root = Column(
  //
  Text(
    "ធី សុវណ្ណថា\nត្រូវបញ្ជប់តួនាទីពី\nអភិបាលរងក្រុងអរិយក្សត្រ\nនិងបណ្តេញចេញពីក្របខ័ណ្ឌរដ្ឋទាំងអស់ ",
    Span(
      "JBC ចាត់ទុកការរាយបន្លាលួស\nរបស់យោធាថៃ\nគឺល្មើសច្បាប់អន្តរជាតិ និងរំលោភ MOU ឆ្នាំ២០០០",
    )
      .color("red")
      .font("Moul"),
  )
    .font("Khmer")
    .color("brown")
    .size(44)
    .align("center")
    .borderWidth(2)
    .borderColor("red"),

  Text(
    "រាជធានីភ្នំពេញ៖ ",
    Span("សម្ដេចតេជោហ៊ុន សែន").font("Moul").color("red"),
    " ប្រធានព្រឹទ្ធសភា និងជាប្រធានគណបក្សប្រជាជនកម្ពុជាបានសម្រេចឲ្យអភិបាលខេត្តកណ្តាលបញ្ចប់មុខតំណែង អ្នកនាង ធី សុវណ្ណថាពីអភិបាលរងក្រុងអរិយក្សត្រ និងបណ្តេញចេញពីក្របខ័ណ្ឌរដ្ឋទាំងអស់ ។",
    Span(
      "\nសម្តេចតេជោ បានសរសេរលើបណ្តាញសង្គម នៅមុននេះ ដែលមានខ្លឹមយ៉ាងដូច្នេះថា ៖ យើងគ្មានពេលអប់រំមន្ត្រីដែលគ្មានវិន័យ ក្នុងពេលដែលកិច្ចការជាតិកំពុងទាមទារយើងដោះស្រាយនោះឡើយ ។",
    )
      .color("red")
      .font("Khmer"),
  )
    .font("Hanuman")
    .size(44)
    .maxWidth(1000)
    .padding(44)
    .borderWidth(2)
    .borderColor("black")
    .indent(72)
    .lineHeight(1.1),
)
  .bg("cornsilk")
  .padding(44)
  .gap(44);

await writeCanvasToFile(root, import.meta.url);
