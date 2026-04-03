<img src="test/image/sone.svg" width=28>

**Sone** — A declarative Canvas layout engine for JavaScript with advanced rich text support.

[![Tests](https://github.com/seanghay/sone/actions/workflows/tests.yaml/badge.svg)](https://github.com/seanghay/sone/actions/workflows/tests.yaml)
[![install size](https://packagephobia.com/badge?p=sone)](https://packagephobia.com/result?p=sone)


### Why Sone.js?

- Declarative API
- Flex Layout & CSS Grid
- Multi-Page PDF — automatic page breaking, repeating headers & footers, margins
- Rich Text — spans, justification, tab stops, tab leaders, text orientation (0°/90°/180°/270°)
- Syntax Highlighting — via `sone/shiki` (Shiki integration)
- Lists, Tables, Photos, SVG Paths, QR Codes
- Squircle, ClipGroup
- Custom font loading — any language or script
- Output as SVG, PDF, PNG, JPG, WebP
- Fully Typed
- Metadata API (Text Recognition Dataset Generation)
- All features from [skia-canvas](https://skia-canvas.org/)

---

<img width=720 height=720 src="https://github.com/user-attachments/assets/9a5bce63-33ca-4086-873a-a552b147f99a" alt="">


### Overview

- This project uses `skia-canvas` — if you encounter an installation issue, follow [the skia-canvas instructions](https://github.com/samizdatco/skia-canvas)
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

More examples can be found in the [test/visual](test/visual) directory.

---

**Syntax Highlighting**

Install [Shiki](https://shiki.style/) as a peer dependency, then import from `sone/shiki`:

```shell
npm install shiki
```

```javascript
import { Column, sone } from "sone";
import { createSoneHighlighter } from "sone/shiki";

// Pre-load themes and languages once
const highlight = await createSoneHighlighter({
  themes: ["github-dark"],
  langs: ["typescript", "javascript", "bash"],
});

// Code() returns a ColumnNode — compose it like any other node
const doc = Column(
  highlight.Code(`const greet = (name: string) => \`Hello, \${name}!\``, {
    lang: "typescript",
    theme: "github-dark",
    fontSize: 13,
    fontFamily: ["monospace"],
    lineHeight: 1.6,
  }),
).padding(24).bg("white");

await sone(doc).pdf();
```

`CodeOptions`:

| Option | Type | Default | Description |
|---|---|---|---|
| `lang` | `BundledLanguage` | — | Shiki language identifier. |
| `theme` | `BundledTheme` | first loaded theme | Shiki theme. |
| `fontSize` | `number` | `12` | Font size in pixels. |
| `fontFamily` | `string[]` | `["monospace"]` | Font families in priority order. |
| `lineHeight` | `number` | inherited | Line height multiplier. |
| `paddingX` | `number` | `12` | Horizontal padding inside the block. |
| `paddingY` | `number` | `8` | Vertical padding inside the block. |

---

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

Add `.tabLeader(char)` to fill the tab gap with a repeated character — dot leader (`.`) is the classic MS Word table-of-contents style, but any character works.

```javascript
// Table of contents — dot leader
Text("Introduction\t1")
  .tabStops(360)
  .tabLeader(".")
  .size(13)

// Financial report — dash leader
Text("Revenue\t$1,200,000")
  .tabStops(300)
  .tabLeader("-")
  .size(13)
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
).listStyle(Span("{}.").color("black").weight("bold")).startIndex(1).gap(8)

// Dynamic arrow function marker — index is 0-based, full Span styling available
const labels = ["①", "②", "③"]
List(
  ListItem(Text("Install dependencies").size(12)),
  ListItem(Text("Configure the environment").size(12)),
  ListItem(Text("Run the build").size(12)),
).listStyle((index) => Span(labels[index]).color("royalblue").weight("bold")).gap(8)
```

**Font Registration**

```javascript
import { Font } from 'sone';

await Font.load("NotoSansKhmer", "test/font/NotoSansKhmer.ttf");

// Load a specific weight variant
await Font.load("GeistMono", ["/path/to/GeistMono-Bold.ttf"], { weight: "bold" });

Font.has("NotoSansKhmer") // → boolean
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

Inspired by Flutter and SwiftUI, Sone lets you focus on **designing** instead of calculating positions manually. Describe your layout as a tree of composable nodes — `Column`, `Row`, `Text`, `Photo` — and Sone figures out where everything goes.

Built for real-world document generation: **invoices, letters, open graph images, reports, resumes**, and anything that needs to look good at scale.

**Just JavaScript, no preprocessors.** Sone does not use JSX or HTML. JSX requires a build step and transpiler config. HTML requires a full CSS parser — and any missing feature becomes a confusing gap for users. Sone's API is plain function calls that work anywhere JavaScript runs, with no setup beyond `npm install`.

**Flexbox for layout.** Powered by [yoga-layout](https://yogalayout.dev/) — the same engine behind React Native. If you know CSS flexbox, you already know Sone's layout model.

**Rich text as a first-class citizen.** Mixed-style spans, justification, tab stops, decorations, drop shadows, and per-glyph gradients — all within a single `Text()` node.

**Pages are just layout.** `pageHeight` slices the same node tree into pages. Headers, footers, and page breaks are ordinary nodes. No special mode, no different API.

**Performance.** No browser, no Puppeteer, no CDP. Rendering goes directly through [skia-canvas](https://skia-canvas.org/) — a native Skia binding for Node.js. Images render in single-digit milliseconds, multi-page PDFs in tens of milliseconds.

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
| `bg(v)` | Background color, gradient string, or `Photo` node. |
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

#### `Grid(...children)`

CSS Grid layout container. Children are auto-placed or explicitly positioned.

| Method | Description |
|---|---|
| `columns(...v)` | Column track sizes: fixed px, `"auto"`, or `"Nfr"`. |
| `rows(...v)` | Row track sizes. |
| `autoRows(...v)` | Implicit row track sizes. |
| `autoColumns(...v)` | Implicit column track sizes. |
| `columnGap(v)` / `rowGap(v)` | Gap between tracks. |

Children support explicit placement via layout methods:

| Method | Description |
|---|---|
| `gridColumn(start, span?)` | Column start index and optional span count. |
| `gridRow(start, span?)` | Row start index and optional span count. |

```javascript
Grid(
  Column(Text("Hero")).gridColumn(1, 2).gridRow(1),  // spans 2 cols
  Column(Text("Side")).gridColumn(3).gridRow(1),
  Column(Text("Footer")).gridColumn(1, 3),           // spans all 3
).columns("1fr", "1fr", "200px").columnGap(12).rowGap(12)
```

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
| `tabLeader(v)` | Character to fill tab gaps (e.g. `"."` for dot leader, `"-"` for dash). |
| `autofit(v?)` | Scale font size to fill available height. Combined with `nowrap()`, shrinks/grows to fill available width on a single line. |
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

#### `TextDefault(...children)`

A layout container that cascades text styling to all descendant `Text` and `Span` nodes. Useful for setting document-wide defaults without repeating props on every node.

```javascript
TextDefault(
  Column(
    Text("Heading").size(20).weight("bold"),
    Text("Body copy that inherits the font.").size(12),
  ).gap(8),
).font("GeistMono").color("#111")
```

Supports all text styling methods (same as `Text`) plus all layout methods.

---

#### `List(...items)`

A vertical list container.

| Method | Description |
|---|---|
| `listStyle(v)` | `"disc"` `"circle"` `"square"` `"decimal"` `"dash"` `"none"`, a `Span` node, or `(index: number) => Span` for dynamic per-item markers (index is 0-based). |
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

#### `ClipGroup(path, ...children)`

Clips its children to an SVG path shape. The path is scaled to fit the node's layout dimensions.

```javascript
ClipGroup(
  "M 0 0 L 100 0 L 100 100 Z",  // SVG path string
  Photo("./image.jpg").size(150, 150),
).size(150, 150)
```

Supports all layout methods plus `.clipPath(v)` to update the path after construction.

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
