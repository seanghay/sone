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

---

### Philosophy

Sone is built around one idea: **describe what you want, not how to draw it**.

Most canvas libraries are imperative — you call `fillRect`, `drawText`, `moveTo` in the right order and hope the math works out. Sone flips this. You compose a tree of nodes (`Column`, `Row`, `Text`, `Photo`) and Sone handles layout, line breaking, page splitting, and rendering automatically.

A few guiding principles:

**Flexbox for layout.** Sone uses [yoga-layout](https://yogalayout.dev/) — the same engine behind React Native. If you know CSS flexbox, you already know how to lay out in Sone. No coordinate math, no manual positioning.

**Rich text as a first-class citizen.** Text is not just a string painted at a point. Sone supports mixed-style spans, justification, tab stops, line height, decorations, drop shadows, and per-glyph gradients — all within a single `Text()` node.

**Pages are just layout.** Multi-page PDFs are not a special mode. `pageHeight` slices the same layout tree into pages. Headers and footers are ordinary nodes. Page breaks are just a prop. The mental model stays the same whether you're rendering one image or a hundred-page document.

**No side effects.** Nodes are plain data. The same tree can be measured, split, and rendered multiple times. There is no mutable canvas state to reason about.

**Platform-agnostic core.** The rendering engine is separated from the canvas backend via the `SoneRenderer` interface. The default backend uses `skia-canvas` in Node.js, but the same core works in the browser with a custom renderer.

**Performance.** Sone does not spin up a browser or a headless Chromium instance. Rendering is done directly via [skia-canvas](https://skia-canvas.org/) — a native Node.js binding to Google's Skia graphics library. No Puppeteer, no CDP, no process overhead. A typical image renders in single-digit milliseconds and a multi-page PDF in tens of milliseconds, even for complex layouts with rich text and images.

---

### API Reference

#### `sone(node, config?)`

The main render function. Returns an object with export methods.

```typescript
sone(node: SoneNode, config?: SoneRenderConfig)
  .pdf()           // → Promise<Buffer>
  .png()           // → Promise<Buffer>
  .jpg(quality?)   // → Promise<Buffer>  quality: 0.0–1.0
  .svg()           // → Promise<Buffer>
  .webp()          // → Promise<Buffer>
  .raw()           // → Promise<Buffer>
  .canvas()        // → Promise<Canvas>
  .pages()         // → Promise<Canvas[]>  one per page
```

**SoneRenderConfig**

| Option | Type | Description |
|---|---|---|
| `width` | `number` | Exact canvas width. When set, margins inset content within it. |
| `height` | `number` | Canvas height (auto-sized if omitted). |
| `background` | `string` | Canvas background color. |
| `pageHeight` | `number` | Enables multi-page output. Each page is this many pixels tall. |
| `header` | `SoneNode \| (info) => SoneNode` | Repeating header on every page. |
| `footer` | `SoneNode \| (info) => SoneNode` | Repeating footer on every page. |
| `margin` | `number \| { top, right, bottom, left }` | Page margins in pixels. |
| `lastPageHeight` | `"uniform" \| "content"` | `"content"` trims the last page to its actual height. Default `"uniform"`. |
| `cache` | `Map` | Image cache for repeated renders. |

**SonePageInfo** — passed to dynamic `header`/`footer` functions:

```typescript
{ pageNumber: number, totalPages: number }
```

---

#### `Column(...children)`  /  `Row(...children)`

Flex layout containers. `Column` stacks children vertically, `Row` horizontally.

**Layout methods** — available on all node types:

| Method | Description |
|---|---|
| `width(v)` / `height(v)` | Fixed dimensions. |
| `minWidth(v)` / `maxWidth(v)` | Size constraints. |
| `flex(v)` | `flex-grow` shorthand. |
| `grow(v)` / `shrink(v)` | `flex-grow` / `flex-shrink`. |
| `basis(v)` | `flex-basis`. |
| `wrap(v)` | `flexWrap`: `"wrap"`, `"nowrap"`, `"wrap-reverse"`. |
| `gap(v)` / `rowGap(v)` / `columnGap(v)` | Spacing between children. |
| `padding(…v)` | CSS shorthand: 1–4 values. |
| `margin(…v)` | CSS shorthand: 1–4 values. |
| `alignItems(v)` | `"flex-start"` `"flex-end"` `"center"` `"stretch"` `"baseline"`. |
| `alignSelf(v)` | Self alignment override. |
| `alignContent(v)` | Multi-line alignment. |
| `justifyContent(v)` | `"flex-start"` `"flex-end"` `"center"` `"space-between"` `"space-around"` `"space-evenly"`. |
| `direction(v)` | `"row"` `"column"` `"row-reverse"` `"column-reverse"`. |
| `position(v)` | `"relative"` `"absolute"`. |
| `top(v)` / `right(v)` / `bottom(v)` / `left(v)` | Offset for absolute positioning. |
| `overflow(v)` | `"visible"` `"hidden"`. |
| `display(v)` | `"flex"` `"none"` `"contents"`. |
| `bg(v)` | Background color or gradient string. |
| `borderWidth(…v)` | CSS shorthand: 1–4 values (top, right, bottom, left). |
| `borderColor(v)` | Border color. |
| `rounded(…v)` | Border radius (CSS shorthand). |
| `borderSmoothing(v)` | Squircle smoothing (0.0–1.0). |
| `shadow(…v)` | CSS `box-shadow` string(s). |
| `opacity(v)` | 0.0–1.0. |
| `blur(v)` | Blur filter in pixels. |
| `rotate(v)` | Rotation in degrees. |
| `scale(v)` | Uniform scale, or `scale(x, y)`. |
| `translateX(v)` / `translateY(v)` | Transform offset. |
| `pageBreak(v)` | `"before"` `"after"` `"avoid"`. |

---

#### `Text(...children)`

A block of text. Children can be plain strings or `Span` nodes.

```javascript
Text("Hello ", Span("world").color("blue").weight("bold")).size(16)
```

**Text-specific methods** (in addition to layout methods):

| Method | Description |
|---|---|
| `size(v)` | Font size in pixels. |
| `color(v)` | Text color or gradient. |
| `weight(v)` | Font weight: `"normal"` `"bold"` or a number. |
| `font(v)` | Font family name(s). |
| `style(v)` | `"normal"` `"italic"` `"oblique"`. |
| `lineHeight(v)` | Line height multiplier (e.g. `1.5`). |
| `align(v)` | `"left"` `"right"` `"center"` `"justify"`. |
| `letterSpacing(v)` | Letter spacing in pixels. |
| `wordSpacing(v)` | Word spacing in pixels. |
| `indent(v)` | First-line indent in pixels. |
| `tabStops(...v)` | Tab stop x-positions in pixels. Use `\t` in content to snap. |
| `orientation(v)` | Rotation: `0` `90` `180` `270`. Layout footprint swaps at 90°/270°. |
| `underline(v?)` | Underline thickness. |
| `lineThrough(v?)` | Strikethrough thickness. |
| `overline(v?)` | Overline thickness. |
| `highlight(v)` | Background highlight color. |
| `strokeColor(v)` / `strokeWidth(v)` | Text outline. |
| `dropShadow(v)` | CSS text-shadow string. |
| `nowrap()` | Disable text wrapping. |

---

#### `Span(text)`

An inline styled segment within `Text`. Takes a single string.

```javascript
Span("highlighted").color("orange").weight("bold").size(14)
```

Supports all text styling methods: `color`, `size`, `weight`, `font`, `style`, `letterSpacing`, `wordSpacing`, `underline`, `lineThrough`, `overline`, `highlight`, `strokeColor`, `strokeWidth`, `dropShadow`, `offsetY`.

---

#### `List(...items)`

A vertical list container.

| Method | Description |
|---|---|
| `listStyle(v)` | `"disc"` `"circle"` `"square"` `"decimal"` `"dash"` `"none"`, or a `Span` node for a custom marker. |
| `markerGap(v)` | Gap between marker and item content. Default `8`. |
| `startIndex(v)` | Starting number for numeric lists. |

Plus all layout methods.

#### `ListItem(...children)`

A single item in a `List`. Accepts any `SoneNode` children. Supports all layout methods.

```javascript
List(
  ListItem(Text("First item").size(12)).alignItems("center"),
  ListItem(
    Text("Nested").size(12).weight("bold"),
    List(
      ListItem(Text("Child item").size(11)),
    ).listStyle(Span("·").color("gray")).markerGap(6),
  ),
).listStyle("disc").gap(8)
```

---

#### `Photo(src)`

Displays an image. Accepts a file path, URL, or `Uint8Array`.

| Method | Description |
|---|---|
| `scaleType(v, align?)` | `"cover"` `"contain"` `"fill"`. Optional alignment: `"start"` `"center"` `"end"`. |
| `flipHorizontal(v?)` | Mirror horizontally. |
| `flipVertical(v?)` | Mirror vertically. |

Plus all layout methods (`width`, `height`, `rounded`, etc.).

---

#### `Path(d)`

Draws an SVG path string.

| Method | Description |
|---|---|
| `fill(v)` | Fill color. |
| `fillRule(v)` | `"evenodd"` or `"nonzero"`. |
| `stroke(v)` | Stroke color. |
| `strokeWidth(v)` | Stroke width. |
| `strokeLineCap(v)` | `"butt"` `"round"` `"square"`. |
| `strokeLineJoin(v)` | `"bevel"` `"miter"` `"round"`. |
| `strokeDashArray(...v)` | Dash pattern, e.g. `strokeDashArray(5, 5)`. |
| `strokeDashOffset(v)` | Dash offset. |
| `scalePath(v)` | Scale the path geometry. |

Plus all layout methods.

---

#### `Table(...rows)` / `TableRow(...cells)` / `TableCell(...children)`

Table layout nodes.

```javascript
Table(
  TableRow(
    TableCell(Text("Name").weight("bold")),
    TableCell(Text("Score").weight("bold")),
  ),
  TableRow(
    TableCell(Text("Alice")),
    TableCell(Text("98")),
  ),
).spacing(4)
```

- **`Table`**: `.spacing(v)` — cell spacing.
- **`TableCell`**: `.colspan(v)` / `.rowspan(v)` — spanning.
- All three support layout methods.

---

#### `PageBreak()`

Inserts an explicit page break. Only has an effect when `pageHeight` is set.

```javascript
Column(
  SectionOne,
  PageBreak(),
  SectionTwo,
)
```

---

#### `Font`

```javascript
await Font.load("MyFont", "/path/to/font.ttf")
await Font.load("MyFont", ["/path/to/bold.ttf"], { weight: "bold" })
Font.has("MyFont")   // → boolean
await Font.unload("MyFont")
```

---

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
