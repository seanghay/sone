import path from "node:path";
import { Column, Photo, Row, Font, Text, loadImage } from "sonejs";

const bg = await loadImage("components/khm-moh-stats-sample.jpg");
const logo = await loadImage("components/moh.png");

const fonts = {
  text: "Siemreap",
  heading: "Moul",
  wingding: "Wingding",
  times: "Times",
};

const colors = {
  darkblue: "#080291",
  red: "#fe0102",
  blue: "#0470c1",
  pink: "#f574bf",
  gray: "#595959",
  brown: "#c5590f",
  gold: "#c09001",
};

// register fonts
for (const font of Object.values(fonts)) {
  Font.register(path.join("components", "fonts", `${font}-Regular.ttf`), {
    family: font,
  });
}

function LetterHead() {
  return Column(
    Text("ព្ររាជាណាចក្រកម្ពុជា")
      .font(fonts.heading)
      .size(32)
      .color(colors.darkblue),
    Text("ជាតិ សាសនា ព្រះមហាក្សត្រ")
      .font(fonts.heading)
      .size(32)
      .color(colors.darkblue),
    Text("\uf09a¯\uf09b").font(fonts.wingding).size(30).color(colors.darkblue),
  )

    .gap(30)
    .alignItems("center")
    .alignSelf("center")
    .marginTop(124);
}

function Background() {
  return Column().size("100%").position("absolute").bg(bg).opacity(0.1);
}

function Headline() {
  return Column(
    Text(
      "សេចក្ដីជូនព័ត៌មាន\nស្ដីពី\nការសរុបស្ថានភាពជំងឺកូវីដ-១៩ ក្នុងព្រះរាជាណាចក្រកម្ពុជា\nសម្រាប់ថ្ងៃទី៦ ខែឧសភា ឆ្នាំ២០២៥",
    )
      .font(fonts.heading)
      .size(28)
      .color(colors.darkblue)
      .lineHeight(2)
      .align("center"),
  )
    .marginTop(150)
    .alignItems("center");
}

function PandemicCaseStatistic(title, value, desc) {
  return Column(
    Column(
      Text(title).font(fonts.heading).size(30).color(colors.white),
      Column(Text(value).font(fonts.times).size(60).color(colors.white))
        .grow(1)
        .marginTop(10),
      Text(desc)
        .font(fonts.text)
        .size(30)
        .lineHeight(1.8)
        .align("center")
        .color(colors.white),
    )
      .padding(30, 14)
      .grow(1)
      .justifyContent("center")
      .gap(20)
      .alignItems("center"),
  )
    .grow(1)
    .cornerRadius(20);
}

function HorizontalCase(text, value, desc) {
  return Column(
    Column(
      Text(text).font(fonts.heading).size(35).color(colors.white),
      Text(value).font(fonts.times).weight("bold").size(60).color(colors.white),
      ...(desc ? [Text(desc).size(30).font(fonts.text).color("white")] : []),
    )
      .alignItems("center")
      .gap(30),
  )

    .padding(30, 0)
    .cornerRadius(20);
}

function Statistics() {
  return Column(
    HorizontalCase("ករណីឆ្លងសរុប", "139,336").bg(colors.red),
    // 3 cols
    Row(
      PandemicCaseStatistic("ករណីឆ្លងថ្មី", 3, "(លទ្ធផលបញ្ជាក់ដោយ PCR)").bg(
        colors.blue,
      ),
      PandemicCaseStatistic("ករណីជាសះស្បើយសរុប", "136,276", "(ថ្មី = 1)").bg(
        colors.pink,
      ),
      PandemicCaseStatistic(
        "ករណីស្លាប់សរុប",
        3,
        "ថ្មី = 0 (ក្នុងនេះ\nមិនបានចាក់វ៉ាក់សាំង = 0)",
      ).bg(colors.gray),
    )
      .gap(40)
      .opacity(1),
    //
    HorizontalCase("ករណីនាំចូលពីក្រៅប្រទេសសរុប", "21,246", "(ថ្មី = 0)").bg(
      colors.brown,
    ),
    HorizontalCase("ករណីឆ្លងក្នុងសហគមន៍", "17,506", "(ថ្មី = 3)").bg(colors.gold),
  )
    .gap(40)
    .marginTop(50)
    .marginLeft(80)
    .marginRight(80)
    .strokeColor("#333")
    .strokeWidth(4)
    .padding(40);
}

function Logo() {
  return Column(
    Photo(logo).size(190).scaleType("contain"),
    Text("ក្រសួងសុខាភិបាល").size(28).font(fonts.heading).color(colors.darkblue),
  )
    .position("absolute")
    .alignItems("center")
    .marginLeft(100)
    .marginTop(130)
    .gap(25);
}

function Footer() {
  return Column(
    Column().size("auto", 2).alignSelf("stretch").bg(colors.gray),
    Text(
      "ទីស្ដីការក្រសួងសុខាភិបាល ដីឡូត៏លេខ៨០ វិថីសម្តេច ប៉ែន នុត (២៨៩) ភ្នំពេញ ទូរសព្ទ-ទូរសារ៖ (៨៥៥-២៣) ៨៨៥ ៩៧០ / ៨៨៤ ៩០៩",
    )
      .color(colors.darkblue)
      .size(24)
      .font(fonts.text),
  )
    .position("absolute")
    .bottom(0)
    .alignItems("center")
    .right(0)
    .left(0)
    .gap(14)
    .padding(50, 0);
}

function DateStamp() {
  return Column(
    Text(
      "ថ្ងៃពុធ ១កើត ខែពិសាខ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស.២៥៦៨\nរាជធានីភ្នំពេញ ថ្ងៃទី៧ ខែឧសភា ឆ្នាំ២០២៥",
    )
      .size(28)
      .font(fonts.text)
      .lineHeight(1.8)
      .align("right"),
  )
    .marginTop(35)
    .alignSelf("flex-end")
    .marginRight(100);
}

export default function Document() {
  return Column(
    // Background(),
    LetterHead(),
    Logo(),
    Footer(),
    Headline(),
    Statistics(),
    DateStamp(),
  ).size(1447, 2048);
}
