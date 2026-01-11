import fs from "node:fs/promises";
import { Column, Font, renderer, renderWithMetadata, Text } from "sone";

const font = {
  primary: "TheCustomFont",
};

await Font.load(font.primary, "fonts/Battambang-Regular.ttf");

function Document() {
  return Column(
    //
    Column(
      //
      Text(
        "ខេត្តកំពង់ស្ពឺ ៖ យ៉ាងហោចណាស់ជនជាតិឥណ្ឌូណេស៊ីប្រុស-ស្រី២នាក់ បានស្លាប់ភ្លាមៗនៅកន្លែងកើតហេតុ និង៣នាក់ផ្សេងទៀតរងរបួសធ្ងន់ ត្រូវបានដឹកបញ្ជូនយកទៅសង្គ្រោះភ្លាមៗនៅមន្ទីរពេទ្យ ខណៈដែលពួកគេជិះរថយន្តស៊េរីទំនើបមួយគ្រឿងម៉ាកហ្វដរ៉ាប់ទ័រ ជ្រុលទៅបុករថយន្តកុងតឺន័រពីក្រោយ ខណៈរថយន្តកុងតឺន័រខូចកំពុងចតលើផ្លូវ ។",
      )
        .maxWidth(500)
        .font(font.primary)
        .size(20)
        .color("black")
        .lineHeight(0.8),

      Text(
        "ខេត្តកំពង់ស្ពឺ ៖ យ៉ាងហោចណាស់ជនជាតិឥណ្ឌូណេស៊ីប្រុស-ស្រី២នាក់ បានស្លាប់ភ្លាមៗនៅកន្លែងកើតហេតុ និង៣នាក់ផ្សេងទៀតរងរបួសធ្ងន់ ត្រូវបានដឹកបញ្ជូនយកទៅសង្គ្រោះភ្លាមៗនៅមន្ទីរពេទ្យ ខណៈដែលពួកគេជិះរថយន្តស៊េរីទំនើបមួយគ្រឿងម៉ាកហ្វដរ៉ាប់ទ័រ ជ្រុលទៅបុករថយន្តកុងតឺន័រពីក្រោយ ខណៈរថយន្តកុងតឺន័រខូចកំពុងចតលើផ្លូវ ។",
      )
        .maxWidth(500)
        .font(font.primary)
        .size(32)
        .color("black")
        .lineHeight(0.8),
    ).gap(20),
  )
    .bg("#eee")
    .padding(10, 20);
}

const root = Document();
const { canvas, metadata } = await renderWithMetadata(root, renderer);
const buffer = await canvas.toBuffer("png");
await fs.writeFile("image.png", buffer);

console.log(JSON.stringify(metadata));
