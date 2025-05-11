import fs from "node:fs/promises";
import { Flex, Column, Span, Text, sone } from "../src/sone.js";

function Document() {
  return Column(
    Text(
      "ភ្នំពេញ៖ ",
      Span("ពិធីបុណ្យ ព្រះសពរបស់ ").color("green"),
      Span("លោក សុិន សុខខា").font("Moul").color("red").size(64),
      Span(" បានប្រព្រឹត្តិធ្វើទៅ Internal នៅ"),
      Span(" ថ្ងៃសៅរ៍ ទី២៦មេសា").weight(700),
      Span(
        "នេះ។ ព្រះមហាក្សត្រ ប្រមុខរដ្ឋ ប្រមុខរដ្ឋាភិបាល និងគណៈប្រតិភូសរុបជាង១៦០ បានមកចូលរួម នៅក្នុងកម្មវិធីនេះ",
      ),
      Span(" លោក សុិន សុខខុង ").font("Moul").color("salmon").size(27),
      Span("។").color("orange"),
    )
      .font("Inter Khmer")
      .size(32)
      .align("justify")
      .color("#333")
      .lineHeight(1.45),
    Flex().height(2, "auto").bg("#eee"),
    Flex(
      Text(
        "លោក​ម៉ះមូដ អាបាស់ ប្រធាន​អាជ្ញាធរប៉ាឡេស្ទីន បានប្រកាសតែងតាំងមនុស្សថ្មីម្នាក់ ឈ្មោះ ហ៊ូសេន អាល់ឆេក ជាអនុប្រធាន​នៃ​អង្គការរំដោះប៉ាឡេស្ទីន។ តាម​ការវិភាគ​ មនុស្សថ្មីនេះ អាចជាអ្នកដែលនឹងមកស្នងតំណែង បន្ត​ពីលោក ម៉ះមូដ អាបាស់ ដែលមានវ័យ​៨៩ឆ្នាំទៅ​ហើយ​។ សហគមអន្តរជាតិ និងក្រុមម្ចាស់ជំនួយ ធ្លាប់បាន​ទាមទារជាច្រើនលើក ឲ្យ​អង្គការរំដោះប៉ាឡេស្ទីនត្រូវតែធ្វើកំណែទម្រង់ស៊ីជម្រៅ ដើម្បី​ត្រៀមដឹកនាំ​ដែនដីប៉ាឡេស្ទីនទាំងមូល ដោយរាប់ទាំងតំបន់​ហ្កាហ្សា បន្ទាប់ពី​សង្គ្រាមរវាងអ៊ីស្រាអែល និង​ក្រុមហាម៉ាស ត្រូវបិទបញ្ចប់​។",
      )
        .size(20)
        .lineHeight(1.8)
        .font("Siemreap")
        .color("gray")
        .align("justify"),
    )
      .strokeColor("red")
      .strokeWidth(1),
  )
    .maxWidth(700)
    .padding(40)
    .gap(10);
}

await fs.writeFile("test/text-02.jpg", await sone(Document).jpg());
