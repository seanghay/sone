<img src="test/image/sone.svg" width=28>

**Sone** — A declarative Canvas layout engine for JavaScript with advanced rich text support.

[![Tests](https://github.com/seanghay/sone/actions/workflows/tests.yaml/badge.svg)](https://github.com/seanghay/sone/actions/workflows/tests.yaml)
[![install size](https://packagephobia.com/badge?p=sone)](https://packagephobia.com/result?p=sone)


### Why Sone.js?

- Declarative API
- Flex Layout & CSS Grid
- Multi-Page PDF — automatic page breaking, repeating headers & footers, margins
- Rich Text — spans, justification, tab stops, tab leaders, text orientation (0°/90°/180°/270°)
- Bidirectional text — RTL support for Arabic, Hebrew, and mixed LTR/RTL paragraphs
- Hyphenation — automatic word hyphenation for 80+ languages via `.hyphenate(locale)`
- Balanced line wrapping — evenly distributed line lengths via `.textWrap("balance")`
- Syntax Highlighting — via `sone/shiki` (Shiki integration)
- Lists, Tables, Photos, SVG Paths, QR Codes
- Squircle, ClipGroup
- Custom font loading — any language or script
- Output as SVG, PDF, PNG, JPG, WebP
- Fully Typed
- Metadata API — access per-node layout, text segment bboxes, and `.tag()` labels
- YOLO / COCO Dataset Export — generate bounding-box datasets for document layout analysis
- All features from [skia-canvas](https://skia-canvas.org/)

---

<img width=720 height=720 src="https://github.com/user-attachments/assets/9a5bce63-33ca-4086-873a-a552b147f99a" alt="">

<details>
<summary><strong>Business documents</strong> — invoice, report, quotation, bank statement (<a href="examples/business-documents/">source</a>)</summary>
<br>
<table>
  <tr>
    <td><img src="examples/business-documents/output/invoice.jpg" alt="Invoice" width="340" /></td>
    <td><img src="examples/business-documents/output/report.jpg" alt="Report" width="340" /></td>
  </tr>
  <tr>
    <td><img src="examples/business-documents/output/quotation.jpg" alt="Quotation" width="340" /></td>
    <td><img src="examples/business-documents/output/bank-statement.jpg" alt="Bank Statement" width="340" /></td>
  </tr>
</table>
</details>

<details>
<summary><strong>Documents &amp; templates</strong> — resume, certificate, app UI, multi-page PDF</summary>
<br>
<table>
  <tr>
    <td><img src="test/visual/resume-1.jpg" alt="Resume" width="340" /></td>
    <td><img src="test/visual/certificate-1.jpg" alt="Certificate" width="340" /></td>
  </tr>
  <tr>
    <td><img src="test/visual/app-1.jpg" alt="App UI" width="340" /></td>
    <td><img src="test/visual/pages-1-p1.jpg" alt="Multi-page PDF" width="340" /></td>
  </tr>
</table>
</details>

<details>
<summary><strong>Tables</strong> — basic table, colspan &amp; rowspan</summary>
<br>
<table>
  <tr>
    <td><img src="test/visual/table-1.jpg" alt="Table" width="340" /></td>
    <td><img src="test/visual/table-span-combined.jpg" alt="Table span" width="340" /></td>
  </tr>
</table>
</details>

<details>
<summary><strong>Typography</strong> — styling, wrap balance, hyphenation, orientation</summary>
<br>
<table>
  <tr>
    <td><img src="test/visual/text-styling-1.jpg" alt="Text styling" width="340" /></td>
    <td><img src="test/visual/text-wrap-balance-1.jpg" alt="Wrap balance" width="340" /></td>
  </tr>
  <tr>
    <td><img src="test/visual/text-hyphenation-1.jpg" alt="Hyphenation" width="340" /></td>
    <td><img src="test/visual/text-orientation-1.jpg" alt="Text orientation" width="340" /></td>
  </tr>
</table>
</details>

<details>
<summary><strong>Tab stops &amp; bidirectional text</strong></summary>
<br>
<table>
  <tr>
    <td><img src="test/visual/tab-leader-1.jpg" alt="Tab leaders" width="340" /></td>
    <td><img src="test/visual/bidi-mixed.jpg" alt="Bidirectional text" width="340" /></td>
  </tr>
</table>
</details>

<details>
<summary><strong>Grid layout &amp; lists</strong></summary>
<br>
<table>
  <tr>
    <td><img src="test/visual/grid-1.jpg" alt="Grid 1" width="340" /></td>
    <td><img src="test/visual/grid-2.jpg" alt="Grid 2" width="340" /></td>
  </tr>
  <tr>
    <td><img src="test/visual/list.jpg" alt="Lists" width="340" /></td>
  </tr>
</table>
</details>

<details>
<summary><strong>Paths, photos &amp; clip groups</strong></summary>
<br>
<table>
  <tr>
    <td><img src="test/visual/path-gradient.jpg" alt="Path gradient" width="340" /></td>
    <td><img src="test/visual/clip-group.jpg" alt="Clip group" width="340" /></td>
  </tr>
</table>
</details>

<details>
<summary><strong>Syntax highlighting</strong> — via <code>sone/shiki</code></summary>
<br>
<img src="test/visual/shiki-1.jpg" alt="Syntax highlighting" width="680" />
</details>

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

**Balanced Line Wrapping**

`.textWrap("balance")` narrows the effective line-break width so all lines end up roughly equal in length — useful for headings, pull-quotes, and card titles where a ragged last line looks awkward. The text node itself shrinks to the balanced content width, so it composes naturally inside flex containers.

```javascript
// Heading — balanced lines vs. greedy default
Text("Breaking News: Scientists Discover New Species in the Amazon Rainforest")
  .font("sans-serif")
  .size(28)
  .weight("bold")
  .maxWidth(480)
  .textWrap("balance")
```

**Hyphenation**

`.hyphenate(locale?)` inserts typographic hyphens at valid syllable boundaries using Knuth–Liang patterns from the [`hyphen`](https://github.com/nicowillis/hypher) package (80+ languages). Install it as a dependency first:

```shell
npm install hyphen
```

```javascript
// English (default)
Text("The internationalization of software requires typographical care.")
  .font("sans-serif")
  .size(16)
  .maxWidth(200)
  .hyphenate()         // same as .hyphenate("en")

// French
Text("Le développement international de logiciels nécessite une typographie soignée.")
  .hyphenate("fr")

// German — compound words benefit greatly
Text("Die Softwareentwicklung erfordert typografische Überlegungen.")
  .hyphenate("de")

// Hyphenation composes with textWrap balance
Text("Extraordinary accomplishments in internationalization.")
  .maxWidth(220)
  .hyphenate("en")
  .textWrap("balance")
```

Supported locale examples: `"en"` / `"en-us"` / `"en-gb"`, `"fr"`, `"de"`, `"es"`, `"it"`, `"pt"`, `"nl"`, `"ru"`, `"pl"`, `"sv"`, `"da"`, `"nb"`, `"fi"`, `"hu"`, `"ro"`, `"cs"`, `"tr"`, `"uk"`, `"bg"`, `"el"`, `"la"`, and more. Pass `true` for English.

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
| `textWrap(v)` | `"wrap"` (default) or `"balance"` — balance distributes text so all lines are roughly equal in width. |
| `hyphenate(locale?)` | Enable automatic hyphenation. Omit locale for English (`"en"`). Accepts BCP-47-like codes: `"fr"`, `"de"`, `"es"`, `"it"`, `"pt"`, `"nl"`, `"ru"`, `"pl"`, `"sv"`, `"da"`, `"nb"`, and 70+ more. Requires the `hyphen` package. |
| `baseDir(v)` | Paragraph base direction: `"ltr"`, `"rtl"`, or `"auto"` (auto-detected from first strong character). |
| `tag(v)` | Debug label attached to the node — surfaced in the Metadata API and used as a YOLO class name. |

---

#### `Span(text)`

An inline styled segment within `Text`. Takes a single string.

```javascript
Span("highlighted").color("orange").weight("bold").size(14)
```

Supports all text styling methods: `color`, `size`, `weight`, `font`, `style`, `letterSpacing`, `wordSpacing`, `underline`, `lineThrough`, `overline`, `highlight`, `strokeColor`, `strokeWidth`, `dropShadow`, `offsetY`.

Additional span-level methods:

| Method | Description |
|---|---|
| `tag(v)` | Debug label for this span — surfaced in the Metadata API and takes priority over the parent `Text` node tag when used as a YOLO class. |
| `textDir(v)` | Per-span canvas direction override: `"ltr"` or `"rtl"`. Overrides the paragraph `baseDir`. |

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

**Bidirectional Text (RTL)**

RTL paragraphs are detected automatically from the first strong character (Unicode P2–P3 rules). You can override with `.baseDir()` on `Text` or force a per-span direction with `.textDir()` on `Span`.

```javascript
import { Font, sone, Column, Text, Span } from "sone";

await Font.load("NotoSansArabic", "fonts/NotoSansArabic.ttf");
await Font.load("NotoSansHebrew", "fonts/NotoSansHebrew.ttf");

Column(
  // Auto-detected RTL (first strong char is Arabic)
  Text("مرحبا بالعالم").font("NotoSansArabic").size(32),

  // Explicit RTL override
  Text("שלום עולם").font("NotoSansHebrew").size(32).baseDir("rtl"),

  // Mixed — LTR paragraph with an RTL span
  Text(
    "Total: ",
    Span("١٢٣").font("NotoSansArabic").textDir("rtl"),
    " items",
  ).size(18),
)
```

| Method | Description |
|---|---|
| `Text.baseDir(v)` | `"ltr"` `"rtl"` `"auto"` — sets paragraph direction. `"auto"` uses the first strong character heuristic. Default is `"auto"`. |
| `Span.textDir(v)` | `"ltr"` `"rtl"` — overrides canvas direction for this span only. |

---

**Metadata API**

`canvasWithMetadata()` and `renderWithMetadata()` return a `SoneMetadata` tree alongside the rendered canvas. Each node carries its computed layout position, dimensions, padding, margin, and — for `Text` nodes — fully laid-out paragraph blocks with per-segment bounding boxes.

```javascript
import { sone, Column, Text, Span } from "sone";

const { canvas, metadata } = await sone(root).canvasWithMetadata();

// metadata mirrors the node tree:
// metadata.x / .y / .width / .height  — layout position
// metadata.tag                         — value from .tag() on the node
// metadata.type                        — "text" | "photo" | "column" | …

// For text nodes, access per-segment runs:
const props = metadata.props;          // TextProps
for (const { paragraph } of props.blocks) {
  for (const line of paragraph.lines) {
    for (const segment of line.segments) {
      const r = segment.run;           // { x, y, width, height } in canvas pixels
      const spanTag = segment.props.tag;
    }
  }
}
```

Tags are set with `.tag()` on any node or span:

```javascript
Column(
  Text("Title").tag("title"),
  Text("Body text").tag("content"),
  Text(
    "Revenue: ",
    Span("+22%").color("green").tag("change"),
  ).tag("row"),
)
```

---

**YOLO Dataset Export**

`toYoloDataset()` transforms a `SoneMetadata` tree into a YOLO bounding-box dataset. Class IDs are auto-assigned alphabetically from all `.tag()` labels found in the tree.

```javascript
import { sone, toYoloDataset } from "sone";

const { metadata } = await sone(root).canvasWithMetadata();

const ds = toYoloDataset(metadata, {
  granularity: "segment",       // "segment" | "line" | "block" | "node"
  include: ["text", "photo"],   // "text" | "photo" | "layout"
  catchAllClass: "content",     // null = skip untagged items
});

ds.classes      // Map<string, number>  e.g. { "change": 0, "row": 1, "title": 2 }
ds.boxes        // YoloBox[]
ds.imageWidth   // derived from root metadata
ds.imageHeight

ds.toTxt()      // YOLO .txt format: "classId cx cy w h" per line (normalised [0,1])
ds.toJSON()     // { imageWidth, imageHeight, classes, boxes }
```

**`YoloExportOptions`**

| Option | Type | Default | Description |
|---|---|---|---|
| `granularity` | `"segment" \| "line" \| "block" \| "node"` | `"node"` | Granularity for text nodes. Non-text nodes always emit at node level. |
| `include` | `Array<"text" \| "photo" \| "layout">` | all three | Which node types to include. |
| `catchAllClass` | `string \| null` | `"__unlabeled__"` | Class name for untagged items. `null` skips them. |

**Granularity levels**

| Value | Emits | Tag source |
|---|---|---|
| `"segment"` | One box per text run | `Span.tag()` → `Text.tag()` → `catchAllClass` |
| `"line"` | Union of segments on a line | `Text.tag()` → `catchAllClass` |
| `"block"` | Union of lines in a paragraph | `Text.tag()` → `catchAllClass` |
| `"node"` | Full layout bbox of the node | `node.tag()` → `catchAllClass` |

**`YoloBox`**

| Field | Description |
|---|---|
| `classId` | Numeric class ID |
| `className` | Human-readable class name |
| `cx` `cy` `w` `h` | Normalised center and size `[0, 1]` |
| `x` `y` `pixelWidth` `pixelHeight` | Absolute pixel coordinates |

---

**COCO Dataset Export**

`toCocoDataset()` produces the same bounding boxes as `toYoloDataset` but in COCO JSON format — a single object with `images`, `annotations`, and `categories` arrays. Category and annotation IDs are 1-based. Bboxes are absolute pixels in `[x, y, width, height]` format.

```javascript
import { sone, toCocoDataset } from "sone";

const { metadata } = await sone(root).canvasWithMetadata();

const ds = toCocoDataset(metadata, {
  granularity: "line",
  include: ["text", "photo"],
  catchAllClass: "content",
  fileName: "invoice-001.jpg",   // recorded in the images entry
  imageId: 1,                    // default: 1
  supercategory: "document",     // default: "layout"
});

// ds.images       — [{ id, file_name, width, height }]
// ds.annotations  — [{ id, image_id, category_id, bbox, area, segmentation, iscrowd }]
// ds.categories   — [{ id, name, supercategory }]

await fs.writeFile("annotations.json", JSON.stringify(ds.toJSON(), null, 2));
```

**Additional `CocoExportOptions`** (extends `YoloExportOptions`):

| Option | Type | Default | Description |
|---|---|---|---|
| `imageId` | `number` | `1` | Numeric ID for the image entry. |
| `fileName` | `string` | `"image.jpg"` | File name recorded in the image entry. |
| `supercategory` | `string` | `"layout"` | `supercategory` field on every category. |

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
