import { Column, Photo, Row, Text } from "sone";
import { C, FONT, LOGO_PATH } from "./constants.js";

export function Divider() {
  return Row().height(1).bg(C.border).width("100%");
}

export function Label(text) {
  return Text(text).font(FONT).size(10).color(C.gray).weight(500);
}

export function Value(text) {
  return Text(text).font(FONT).size(12).color(C.black).weight(400);
}

export function Header({ title, subtitle, date, number, numberLabel }) {
  return Column(
    Row(
      Row(
        Photo(LOGO_PATH).size(40, 40).scaleType("contain"),
        Column(
          Text("Sone Corp").font(FONT).size(18).color(C.black).weight(700),
          Text("ក្រុមហ៊ុន សូន").font(FONT).size(11).color(C.gray).weight(400),
        ).gap(2).justifyContent("center"),
      ).gap(12).alignItems("center"),

      Column(
        Text(title).font(FONT).size(22).color(C.accent).weight(700).align("right"),
        Text(subtitle).font(FONT).size(11).color(C.gray).weight(400).align("right"),
        Row(
          Text(`${numberLabel}: `).font(FONT).size(11).color(C.gray).weight(400),
          Text(number).font(FONT).size(11).color(C.black).weight(700),
        ).gap(2).alignItems("center").justifyContent("flex-end"),
        Text(date).font(FONT).size(11).color(C.gray).weight(400).align("right"),
      ).gap(4).grow(1).alignItems("flex-end"),
    )
      .justifyContent("space-between")
      .alignItems("center")
      .padding(24, 32),

    Divider(),
  );
}

export function Footer(pageNote) {
  return Column(
    Divider(),
    Row(
      Text("Sone Corp · Phnom Penh, Cambodia · info@sonecorp.com")
        .font(FONT).size(10).color(C.gray).weight(400),
      Text(pageNote)
        .font(FONT).size(10).color(C.gray).weight(400).align("right").grow(1),
    )
      .padding(16, 32)
      .justifyContent("space-between")
      .alignItems("center"),
  );
}
