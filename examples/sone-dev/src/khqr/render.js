import { Column, Photo, Text, qrcode } from "sone";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const assetsDir = join(dirname(fileURLToPath(import.meta.url)), "assets");

/**
 * @type {import("sone/src/types").SoneContextConfig}
 */
export const config = {
  debug: true,
  backgroundColor: "white",
};

export async function loader({ loadAsset, isDev, req }) {
  const [bgImage, usdImage, khrImage] = await Promise.all([
    loadAsset(join(assetsDir, "bg.png")),
    loadAsset(join(assetsDir, "USD.png")),
    loadAsset(join(assetsDir, "KHR.png")),
  ]);

  if (isDev) {
    return {
      bgImage,
      khrImage,
      usdImage,
      name: "Name",
      username: "example@example",
      currency: "USD",
      data: "xxxxxxxxxxxxxxx-0000000000-11111111111111xxxxxxxxxxxxxxx-0000000000-11111111111111",
    };
  }

  return {
    bgImage,
    khrImage,
    usdImage,
    name: req.query.name ?? "Example",
    username: "example@example",
    currency: "USD",
    data: "xxxxxxxxxxxxxxx-0000000000-11111111111111xxxxxxxxxxxxxxx-0000000000-11111111111111",
  };
}

/**
 * @param {Awaited<ReturnType<loader>>} param
 */
export default function KHQR({
  bgImage,
  usdImage,
  currency,
  khrImage,
  data,
  name,
  username,
}) {
  const currencyImage = currency === "USD" ? usdImage : khrImage;

  return Column(
    // background
    Column(Photo(bgImage)),
    // frame
    Column(
      Photo(qrcode(data, { background: null, margin: 0 }))
        .size(580)
        .rotate(-40)
        .scale(1.1)
        .marginTop(660),
      Photo(currencyImage).position("absolute").size(140).marginTop(400),
      Column(
        Text(name).size(72).weight("bold"),
        Text(username).size(70).color("#333"),
      )
        .alignItems("center")
        .gap(36)
        .marginTop(100),
    )
      .gap(100)
      .width("100%")
      .justifyContent("center")
      .alignItems("center")
      .position("absolute"),
  );
}
