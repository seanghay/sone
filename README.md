# Sone

>  Seanghay's Optimized Nesting Engine 😉

<img src=test/cover.svg>

> **សូន** - *ប្រមូលអ្វីៗដែលមានសាច់ទន់ជ្រាយឱ្យកើតជាដុំ, ជាគ្រាប់ឬជារូប*

SwiftUI-inspired canvas layout engine with advanced rich text support. Sone is built to generate PDF or Image on the server with minimal memory footprint and performance. It provides some features such as

- Flex Layout ([yoga-layout](https://www.yogalayout.dev/))
- SVG Support without rasterizing.
- Squircle Rounded Corner (iOS-like)
- Text Alignment (Left, Right, Center, **Justify**) for Khmer, Thai, Lao and some langauges.
- Font Tracing - Get a list of fonts that used in the component tree. (See [test/text-01.js](test/text-01.js))
- Table (See [test/table.js](test/table.js))
- Repeating Linear Gradient & Linear Gradient
- Composable
- Output as SVG, PDF, and Image(JPG,PNG,WEBP)

### Get started

🙏 Thanks to [Dmitry Iv.](https://github.com/dy) for donating the `sone` package name.

```shell
npm install sone
```

```js
import fs from "node:fs/promises";

import { 
  sone, 
  Column, 
  Text, 
  Span
} from "sone";

function Document() {
  return Column(
    Text(
      "Hello world! ",
      Span("Sone.")
        .color("orange")
        .weight("bold")
        .shadow("2px 2px 0px rgba(0,0,0,.2)"),
        " 😍🇰🇭"
    ).size(34),
  ).padding(40);
}

// save as Image
await fs.writeFile("test/output.png", await sone(Document).png());

// save as PDF
await fs.writeFile("test/output.pdf", await sone(Document).pdf());
```

Preview

<img src=test/output.png>

[test/output.pdf](test/output.pdf)

A complex Sone component looks like this

```js
function Document() {
  return Column(
    Text(
      "ភ្នំពេញ៖ ",
      Span("ពិធីបុណ្យ ព្រះសពរបស់ ").color("green"),
      Span("លោក សុិន សុខខា").font("Moul").color("red").size(23),
      Span(" បានប្រព្រឹត្តិធ្វើទៅ Internal នៅ"),
      Span(" ថ្ងៃសៅរ៍ ទី២៦មេសា").weight(700),
      Span(
        "នេះ។ ព្រះមហាក្សត្រ ប្រមុខរដ្ឋ ប្រមុខរដ្ឋាភិបាល និងគណៈប្រតិភូសរុបជាង១៦០ បានមកចូលរួម នៅក្នុងកម្មវិធីនេះ",
      ),
      Span(" លោក សុិន សុខខុង ").font("Moul").color("salmon").size(27),
      Span("។").color("orange"),
    )
      .font("Inter Khmer")
      .size(32)
      .align("justify")
      .color("#333")
      .lineHeight(1.45),
    Flex().height(2, "auto").bg("#eee"),
    Text(
      "....",
    )
      .size(18)
      .font("Inter Khmer")
      .lineHeight(1.4)
      .color("gray"),
  )
    .maxWidth(700)
    .padding(40)
    .gap(10);
}
```


### See Examples

[test/text-01.js](test/text-01.js)

<img width=400 src="test/text-01.jpg">

[test/text-02.js](test/text-02.js)

<img width=400 src="test/text-02.jpg">

[test/table.js](test/table.js)

<img width=400 src="test/table.jpg">

[test/basic-01.js](test/basic-01.js)

<img width=400 src="test/basic-01.jpg">

[test/table-2.js](test/table-2.js)

<img width=400 src="test/table-2.jpg">


#### Roadmap

- [x] Flex Engine (Yoga Layout)
- [x] Linear Gradient / Repeating Linear Gradient
- [x] Figma Squircle
- [x] Text Stroke (https://jsfiddle.net/vtmnyea8/)
- [x] Box Shadow
- [x] Text Shadow
- [x] Border
- [x] Text Span
- [x] Align/Justify Enum -> Literal String
- [x] SVG to Path2D
- [x] Image Scale Type
- [ ] Transforms (Scale, Rotate, Translate)
- [ ] Mesh Gradient
- [x] Span OffsetY
- [x] Text Decoration (Underline, Cross, Overline)
- [ ] Mask
- [x] Opacity
- [ ] JSON Serialization
- [ ] JSON Deserialization
- [x] Table
- [ ] Grid
- [x] Background Image
- [x] Emoji
- [x] Font
- [x] Text Fill Gradient
- [x] Non-rasterized SVG (Canvg)
- [x] Font Tracing
- [x] Move from `node-canvas` to `skia-canvas` (Emoji, Colored Fonts, Font Fallback, SVG, Path2D, Variable Fonts)

### News
- Sone got featured on Khmerload [https://www.khmerload.com/article/208169]

### Reference

- https://github.com/chearon/dropflow
- https://github.com/vercel/satori
- https://github.com/GuptaSiddhant/recanvas
- https://github.com/catalinmiron/react-native-css-gradient
- https://jsfiddle.net/vtmnyea8/
- https://github.com/Automattic/node-canvas
- https://www.myfirstfont.com/glossary.html
- https://en.wikipedia.org/wiki/X-height
- https://github.com/foliojs/fontkit
- https://raphlinus.github.io/text/2020/10/26/text-layout.html
- https://raphlinus.github.io/rust/skribo/text/2019/04/04/font-fallback.html
- https://simoncozens.github.io/fonts-and-layout/
- https://mrandri19.github.io/2019/07/24/modern-text-rendering-linux-overview.html