<img src="test/image/sone.svg" width=28>

**Sone** — A declarative Canvas layout engine for JavaScript with advanced rich text support.

[![Tests](https://github.com/seanghay/sone/actions/workflows/tests.yaml/badge.svg)](https://github.com/seanghay/sone/actions/workflows/tests.yaml)
[![install size](https://packagephobia.com/badge?p=sone)](https://packagephobia.com/result?p=sone)

- Declarative API
- Flex Layout
- Multi-Page PDF — automatic page breaking, repeating headers & footers, margins
- Rich Text — spans, justification, tab stops, text orientation (0°/90°/180°/270°)
- Custom list markers via `Span` nodes
- Per-side borders — `borderWidth(top, right, bottom, left)`
- Squircle, QR Code, Photo
- Table
- Custom font loading — any language or script
- Output as SVG, PDF, PNG, JPG, WebP
- Fully Typed
- Metadata API (Text Recognition Dataset Generation)
- All features from [skia-canvas](https://skia-canvas.org/)

---

<img width=720 height=720 src="https://github.com/user-attachments/assets/9a5bce63-33ca-4086-873a-a552b147f99a" alt="">


### Overview

- This project uses `skia-canvas` if you encounter an installation issue, please follow [the skia-canvas instruction](https://github.com/samizdatco/skia-canvas)
- Node.js 16+ or equivalent

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

await fs.writeFile("image.jpg", buffer);
```

More examples can be found at [test/visual](test/visual) directory.

**Multi-Page PDF**

Pass `pageHeight` to enable automatic page breaking. Headers and footers repeat on every page; use a function to access per-page info.

```javascript
import { Column, Row, Text, Span, sone } from "sone";

const header = Row(Text("My Report").size(10)).padding(8, 16);

const footer = ({ pageNumber, totalPages }) =>
  Row(Text(Span(`${pageNumber}`).weight("bold"), ` / ${totalPages}`).size(10))
    .padding(8, 16)
    .justifyContent("flex-end");

const content = Column(
  Text("Section 1").size(24).weight("bold"),
  Text("Lorem ipsum...").size(12).lineHeight(1.6),
  // PageBreak() forces a new page at any point
).gap(12);

const pdf = await sone(content, {
  pageHeight: 1056,          // Letter height @ 96 dpi
  header,
  footer,
  margin: { top: 16, bottom: 16 },
  lastPageHeight: "content", // trim last page to actual content
}).pdf();
```

**Tab Stops**

Align columns without a Table node using `\t` and `.tabStops()`.

```javascript
Text("Name\tAmount\tDate")
  .tabStops(200, 320)
  .font("GeistMono")
  .size(12)
```

**Text Orientation**

Rotate text 0°/90°/180°/270°. At 90° and 270° the layout footprint swaps width and height so surrounding elements flow naturally.

```javascript
Text("Rotated").size(16).orientation(90)
```

**Lists**

Use built-in markers or pass a `Span` for full typographic control. Supports nested lists.

```javascript
import { List, ListItem, Span, Text } from "sone";

// Built-in disc marker
List(
  ListItem(Text("Automatic page breaking").size(12)),
  ListItem(Text("Repeating headers & footers").size(12)),
).listStyle("disc").markerGap(10).gap(8)

// Custom Span marker
List(
  ListItem(Text("Tab stops").size(12)),
  ListItem(Text("Text orientation").size(12)),
).listStyle(Span("→").color("black").weight("bold")).markerGap(10).gap(8)

// Numbered list (startIndex sets the starting number)
List(
  ListItem(Text("npm install sone").size(12)),
  ListItem(Text("Compose your node tree").size(12)),
  ListItem(Text("sone(root).pdf()").size(12)),
).listStyle(Span("").color("black").weight("bold")).startIndex(1).gap(8)
```

**Font Registration**

```javascript
import { Font } from 'sone';

if (!Font.has("NotoSansKhmer")) {
  await Font.load('NotoSansKhmer', "test/font/NotoSansKhmer.ttf");
}
```

**Next.js**

To make it work with Next.js, update your config file:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["skia-canvas"],
  webpack: (config, options) => {
    if (options.isServer) {
      config.externals = [
        ...config.externals,
        { "skia-canvas": "commonjs skia-canvas" },
      ];
    }
    return config;
  },
};

export default nextConfig;

```

### Acknowledgements

- Thanks [Dmitry Iv.](https://github.com/dy) for donating the `sone` package name.
- [skia-canvas](https://skia-canvas.org/) Awesome JavaScript Skia Canvas binding
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
- https://www.khmerload.com/article/208169
- [Tep Sovichet](https://github.com/sovichet)
- https://github.com/tdewolff/canvas
- https://github.com/bramstein/typeset

### Use case

- KhmerCoders Preview (https://github.com/KhmerCoders/khmercoders-preview)

### Similar Project

- [kane50613/takumi](https://github.com/kane50613/takumi) Takumi makes dynamic image rendering simple.

### License

`Apache-2.0`

*Seanghay's Optimized Nesting Engine*
