import { Column, Photo, Text, loadImage } from "sone";

/**
 * @type {import("sone/src/types").SoneContextConfig}
 */
export const config = {
  debug: true,
  backgroundColor: "white",
};

export async function loader() {
  const image = await loadImage("https://picsum.photos/512");
  return {
    image,
  };
}

/**
 *
 * @param {Awaited<ReturnType<loader>>} param0
 * @returns
 */
export default function Component({ image }) {
  return Column(
    Photo(image)
      .cornerRadius(56)
      .cornerSmoothing(0.7)
      .strokeWidth(56)
      .strokeColor("magenta"),
    // break
    Text("សួស្ដីខ្មែរស្រុកខ្មែរ")
      .font("Inter Khmer")
      .size(100)
      .color("red"),
    // break
    Text("សួស្ដីខ្មែរស្រុកខ្មែរ")
      .font("Inter Khmer")
      .size(100)
      .color("blue")
      .weight(700),
  )
    .gap(56)
    .size(1024)
    .padding(56);
}
