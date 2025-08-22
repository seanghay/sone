<img src="test/image/sone.svg" width=28>

**Sone** — A declarative Canvas layout engine for JavaScript with advanced rich text support.

[![Tests](https://github.com/seanghay/sone/actions/workflows/tests.yaml/badge.svg)](https://github.com/seanghay/sone/actions/workflows/tests.yaml)
[![install size](https://packagephobia.com/badge?p=sone)](https://packagephobia.com/result?p=sone)

- Declarative API
- Flex Layout
- Squircle
- Text Justification
- Table
- Rich Text Rendering
- Composable
- QR Code
- Output as SVG, PDF, Image
- Metadata API (Text Recognition Dataset Generation)
- All features from [skia-canvas](https://skia-canvas.org/)

---

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

More examples can be found at [test/visual](test/visual) directory

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

### License

`Apache-2.0`

*Seanghay's Optimized Nesting Engine*
