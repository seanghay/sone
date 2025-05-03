import { Column, Span, Text, renderAsCanvas } from "sonejs";

function Document() {
  return Column(
    Column(
      Text(
        "Hello world! ",
        Span("Sone.js សូន")
          .color("linear-gradient(to right, #4facfe 0%, #00f2fe 100%);")
          .weight(500)
          .shadow("2px 2px 0px rgba(0,0,0,.2)"),
        " runs on the browser! 😍🇰🇭",
      )
        .font("Kantumruy Pro")
        .size(72)
        .lineHeight(1.3),
    )
      .padding(40, 40)
      .bg("linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);")
      .cornerRadius(28)
      .cornerSmoothing(0.7)
      .strokeColor("orange")
      .strokeWidth(4)
      .maxWidth(540)
      .lineDash(20, 10),
  ).padding(40);
}

const render = () => {
  const canvas = renderAsCanvas(Document(), undefined, undefined);
  const image = document.getElementById("image");

  image.width = canvas.width / devicePixelRatio;
  image.height = canvas.height / devicePixelRatio;

  image.src = canvas.toDataURL("image/png");
};

render();

document.fonts.ready.then(() => {
  render();
});
