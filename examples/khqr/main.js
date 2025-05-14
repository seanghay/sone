import fs from "node:fs/promises";
import { Column, Photo, Text, loadImage, qrcode, sone } from "sone";

function KHQR({ bgImage, usdImage, currency, khrImage, data, name, username }) {
  const currencyImage = currency === "USD" ? usdImage : khrImage;

  return Column(
    Column(Photo(bgImage)),
    Column(
      Photo(qrcode(data, { background: null, margin: 0 }))
        .size(580)
        .marginTop(660),
      Photo(currencyImage).position("absolute").size(140).marginTop(400),
      Column(
        Text(name).size(72).weight("bold"),
        Text(username).size(56).color("#333"),
      )
        .alignItems("center")
        .gap(36)
        .marginTop(100),
    )
      .gap(30)
      .width("100%")
      .justifyContent("center")
      .alignItems("center")
      .position("absolute"),
  );
}

const [bgImage, usdImage, khrImage] = await Promise.all([
  loadImage("assets/bg.png"),
  loadImage("assets/USD.png"),
  loadImage("assets/KHR.png"),
]);

const sampleData = {
  bgImage,
  khrImage,
  usdImage,
  name: "Example",
  username: "example@example",
  currency: "USD",
  data: "xxxxxxxxxxxxxxx-0000000000-11111111111111xxxxxxxxxxxxxxx-0000000000-11111111111111",
};

await fs.writeFile("out.png", await sone(() => KHQR(sampleData)).png());
await fs.writeFile("out.pdf", await sone(() => KHQR(sampleData)).pdf());
