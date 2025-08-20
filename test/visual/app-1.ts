import { Column, Photo, Row, Text, TextDefault } from "../../src/core";
import { writeCanvasToFile } from "./utils";

function Button(text: string) {
  return Column(
    //
    Text(text)
      .size(32)
      .color("black")
      .align("center")
      .weight("bold")
      .font("Inter Khmer"),
  )
    .bg("orange")
    .margin(44)
    .padding(28)
    .rounded(20)
    .corner("cut")
    .shadow("6px 6px 0px black");
}

function Selector(icon: string, text: string, check?: boolean) {
  return Row(
    Photo(icon).preserveAspectRatio().width(64),
    Text(text).font("Inter Khmer").size(40).weight(500).flex(1),
    Photo(check ? "./test/image/check-orange.svg" : "./test/image/check.svg")
      .preserveAspectRatio()
      .width(44)
      .fill("blue"),
  )
    .alignItems("center")
    .gap(18)
    .paddingTop(18)
    .paddingBottom(18)
    .paddingLeft(22)
    .paddingRight(24)
    .bg("#eee")
    .margin(0, 44)
    .rounded(20)
    .cornerSmoothing(0.7)
    .borderColor("orange")
    .borderWidth(check ? 4 : 0);
}

const root = Column(
  Column().flex(1),
  Photo("./test/image/kouprey.jpg")
    .size(200)
    .scaleType("cover")
    .borderColor("orange")
    .borderWidth(4)
    .alignSelf("center")
    .rounded(100)
    .marginTop(44),

  //
  TextDefault(
    //
    Text("Choose Language")
      .weight("bold")
      .size(50)
      .marginTop(44),
    //
    Text("សូមជ្រើសរើសភាសារបស់អ្នក")
      .color("gray")
      .marginTop(14),
  )
    .size(40)
    .align("center")
    .font("Inter Khmer"),

  Column(
    Selector("./test/image/cambodia.svg", "ភាសាខ្មែរ"),
    Selector("./test/image/english.svg", "English", true),
  )
    .marginTop(44)
    .gap(22),
  Column().flex(1),
  Button("Get Started"),
)
  .bg("linear-gradient(to top, white, #fff3d8ff 100%)")
  .size(750, 1334);

await writeCanvasToFile(root, import.meta.url);
