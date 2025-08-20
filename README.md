**Sone**

A declarative Canvas layout engine for JavaScript with advanced rich text support.

- Flex Layout
- Squircle
- Text Justification
- Table
- Rich Text
- Composable
- Output as SVG, PDF, Image

```shell
npm install sone
```

```javascript
import { Column, Span, sone, Text } from "sone";

function Document() {
  return Column(
    Text("Hello, ", Span("World").color("blue").weight("bold"))
      .size(44)
      .color("black"),
  )
    .padding(24)
    .bg("white");
}

// save as buffer
const buffer = await sone(Document()).jpg();

// save to file
import fs from "node:fs/promises";

fs.writeFile("image.jpg", buffer);
```

#### Acknowledgement

- [skia-canvas](https://skia-canvas.org/)
- [node-canvas](https://github.com/Automattic/node-canvas)
- [@napi-rs/canvas](https://github.com/Brooooooklyn/canvas)
- [dropflow](https://github.com/chearon/dropflow)
- [harfbuzz](https://harfbuzz.github.io/)
- [yoga-layout](https://yogalayout.dev/)
- [vercel/satori](https://github.com/vercel/satori)
- [recanvas](https://github.com/GuptaSiddhant/recanvas)
- https://jsfiddle.net/vtmnyea8/
- https://raphlinus.github.io/text/2020/10/26/text-layout.html
- https://mrandri19.github.io/2019/07/24/modern-text-rendering-linux-overview.html

### License

`Apache-2.0`

*Seanghay's Optimized Nesting Engine*
