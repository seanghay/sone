import { Column, Photo, Span, Text, qrcode } from "sone";

export const config = {
  debug: true,
  backgroundColor: "white",
};

export async function loader({ req, loadAsset }) {
  return req.body;
}

export default function () {
  return Column(
    // image
    Photo(qrcode("hello, world", { color: "red" })).size(300),
    // text
    Text("សួស្ដី 😄", Span("ស្រុកខ្មែរ").font("Moulpali").color("orange"))
      .size(100)
      .lineHeight(1.3)
      .align("right"),
    // text
    Text("Hello, world")
      .font("Inter")
      .size(100)
      .weight(700)
      .color("blue")
      .lineHeight(1.2),
  )
    .padding(100)
    .gap(30)
    .size(1024);
}
