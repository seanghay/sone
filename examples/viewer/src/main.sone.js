import { Column, Photo, Text, qrcode } from "sone";

/**
 * @type {import("sone/src/types").SoneContextConfig}
 */
export const config = {
  debug: false,
  backgroundColor: "#f2f2f2",
};

export async function loader({ loadImage }) {
  const image = await loadImage("https://picsum.photos/510");

  return {
    image,
    name: "https://google.coms",
    random: `Random: ${Math.random()}`,
  };
}

/**
 * @param {Awaited<ReturnType<loader>>} param
 */
export default function Component({ image, name, random }) {
  return Column(
    Photo(image)
      .cornerRadius(56)
      .cornerSmoothing(0.7)
      .strokeWidth(40)
      .strokeColor("#fff")
      .scaleType("cover")
      .shadow("20px 20px 40px rgba(0,0,0,.2)")
      .size(300),

    // qrcode
    Photo(qrcode(name, { color: "blue" }))
      .cornerRadius(56)
      .cornerSmoothing(0.7)
      .shadow("1px 1px 10px rgba(0,0,0,.2)")
      .scaleType("cover")
      .size(300),

    // break
    Text(name)
      .font("Inter Khmer")
      .size(40)
      .color("blue"),

    // break
    Text(random)
      .font("Inter Khmer")
      .size(40)
      .align("center")
      .color("black")
      .weight(400),
  )
    .gap(44)
    .size(1024)
    .padding(56)
    .alignItems("center");
}
