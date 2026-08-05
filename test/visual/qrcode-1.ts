import { Column, Photo, qrcode, Row, Text } from "../../src/index.ts";
import { writeCanvasToFile } from "./utils.ts";

const tile = (
  label: string,
  data: string,
  opts: Parameters<typeof qrcode>[1],
  bg: string,
) =>
  Column(
    Photo(qrcode(data, opts)).size(160, 160),
    Text(label)
      .size(11)
      .weight("bold")
      .font("GeistMono")
      .color("#334155")
      .marginTop(10),
  )
    .padding(18)
    .rounded(16)
    .bg(bg)
    .alignItems("center");

const root = Column(
  Text("QR Codes").size(30).weight("bold").color("#0f172a"),
  Text("Built-in qrcode() rendered as SVG and embedded through Photo.")
    .size(13)
    .color("#475569")
    .marginTop(4),
  Row(
    tile(
      "default",
      "https://github.com/seanghay/sone",
      { pixelSize: 8 },
      "#fff",
    ),
    tile(
      "indigo",
      "https://github.com/seanghay/sone",
      { pixelSize: 8, blackColor: "#4338ca", whiteColor: "#eef2ff" },
      "#eef2ff",
    ),
    tile(
      "inverted",
      "sone — declarative canvas",
      { pixelSize: 8, blackColor: "#f8fafc", whiteColor: "#0f172a" },
      "#0f172a",
    ),
    tile(
      "dense",
      "The quick brown fox jumps over the lazy dog. 1234567890",
      { pixelSize: 6, blackColor: "#059669", whiteColor: "#ecfdf5" },
      "#ecfdf5",
    ),
  )
    .gap(20)
    .marginTop(24)
    .wrap("wrap"),
)
  .bg("linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)")
  .padding(40)
  .gap(0);

await writeCanvasToFile(root, import.meta.url);
