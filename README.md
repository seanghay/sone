## Sone

A Swift UI-inspired canvas layout engine.

> **សូន** - *ប្រមូលអ្វីៗដែលមានសាច់ទន់ជ្រាយឱ្យកើតជាដុំ, ជាគ្រាប់ឬជារូប*


Sone component looks like this

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


### Examples

[test/text-01.js](test/text-01.js)

<img width=400 src="test/text-01.jpg">

[test/text-02.js](test/text-02.js)

<img width=400 src="test/text-02.jpg">

[test/table.js](test/table.js)

<img width=400 src="test/table.jpg">

[test/basic-01.js](test/basic-01.js)

<img width=400 src="test/basic-01.jpg">


#### Roadmap

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



### Reference

- https://github.com/chearon/dropflow
- https://github.com/vercel/satori
- https://github.com/GuptaSiddhant/recanvas
- https://github.com/catalinmiron/react-native-css-gradient
- https://jsfiddle.net/vtmnyea8/