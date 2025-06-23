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
- High performance
- Minimal memory footprint
- Composable
- Output as SVG, PDF, and Image(JPG,PNG,WEBP)


## Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Main Components](#main-components)
3. [Layout System](#layout-system)
4. [Styling API](#styling-api)
5. [Image & Graphics](#image--graphics)
6. [Advanced Features](#advanced-features)
7. [Font Management](#font-management)
8. [Output Generation](#output-generation)

## Installation & Setup

🙏 Thanks to [Dmitry Iv.](https://github.com/dy) for donating the `sone` package name.

```bash
npm install sone
```

Basic imports:
```javascript
import {
  sone,
  Column,
  Flex,
  Photo,
  Row,
  Font,
  Span,
  Text,
  Table,
  TableRow,
  loadImage
} from "sone";
```

## Main Components

### 1. Text Component

#### Method Signature
```typescript
Text(...children: (string | SpanComponent)[]): TextComponent
```

#### Properties
| Method | Type | Description | Example |
|--------|------|-------------|---------|
| size(value: number) | number | Font size in pixels | `.size(24)` |
| align(value: string) | "left" \| "center" \| "right" \| "justify" | Text alignment | `.align("justify")` |
| font(value: string) | string | Font family name | `.font("Inter Khmer")` |
| color(value: string) | string | Text color (hex, rgb, gradient) | `.color("#205781")` |
| lineHeight(value: number) | number | Line height multiplier | `.lineHeight(1.5)` |
| weight(value: number\|string) | number\|string | Font weight | `.weight(700)` |
| strokeColor(value: string) | string | Text outline color | `.strokeColor("white")` |
| strokeWidth(value: number) | number | Text outline width | `.strokeWidth(4)` |
| indentSize(value: number) | number | Text indentation | `.indentSize(50)` |

#### Example
```javascript
Text(
  Span("Hello").color("green").weight(800),
  " World",
  Span("!").color("red")
)
  .size(24)
  .font("SF Pro Text")
  .align("center")
  .lineHeight(1.5)
  .color("#205781")
  .shadow("2px 4px 4px black")
```

### 2. Span Component

#### Method Signature
```typescript
Span(text: string): SpanComponent
```

#### Properties
| Method | Type | Description | Example |
|--------|------|-------------|---------|
| color(value: string) | string | Text color | `.color("orange")` |
| weight(value: number\|string) | number\|string | Font weight | `.weight(700)` |
| font(value: string) | string | Font family | `.font("Moul")` |
| size(value: number) | number | Font size | `.size(27)` |
| offsetY(value: number) | number | Vertical offset | `.offsetY(-2)` |
| line(offset: number, thickness: number, color: string) | void | Underline style | `.line(4, 2, "yellow")` |
| strokeColor(value: string) | string | Outline color | `.strokeColor("black")` |
| strokeWidth(value: number) | number | Outline width | `.strokeWidth(8)` |

#### Example with Gradient and Effects
```javascript
Span("Styled Text")
  .font("KdamThmorPro")
  .size(27)
  .color("linear-gradient(to left, orange 0%, yellow 100%)")
  .strokeColor("black")
  .strokeWidth(8)
  .line(4, 2, "rgba(0,0,0,.2)")
```

### 3. Layout Components

#### Flex Component
```typescript
interface FlexOptions {
  direction?: "row" | "column";
  grow?: number;
  width?: number | string;
  height?: number | string;
  position?: "relative" | "absolute";
  left?: number;
  top?: number;
}

Flex(...children: Component[]): FlexComponent
```

#### Examples
```javascript
// Basic Flex container
Flex(
  Text("Content")
)
  .size(200, 100)
  .cornerRadius(100, 0)
  .bg("linear-gradient(45deg, turquoise 20%, yellow 20%)")
  .cornerSmoothing(0.7)
  .position("absolute")
  .left(100)
  .top(200)

// Flex with multiple backgrounds
Flex()
  .bg(`linear-gradient(-225deg, #231557 0%, #44107A 29%, #FF1361 67%, #FFF800 100%),
      repeating-linear-gradient(-115deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px),
      repeating-linear-gradient(115deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)`)
```

### 4. Photo Component

#### Method Signature
```typescript
interface PhotoOptions {
  scaleType?: "contain" | "cover";
  rotate?: number;
}

Photo(source: ImageSource): PhotoComponent
```

#### Properties
| Method | Type | Description |
|--------|------|-------------|
| size(value: number) | number | Image size |
| cornerRadius(value: number) | number | Corner radius |
| cornerSmoothing(value: number) | number | iOS-style corner smoothing (0-1) |
| scaleType(value: string) | "contain" \| "cover" | Image scaling mode |
| rotate(value: number) | number | Rotation in degrees |

#### Example
```javascript
Photo(imageSrc)
  .size(200)
  .cornerRadius(44)
  .cornerSmoothing(0.7)
  .rotate(-40)
  .scaleType("cover")
  .strokeColor("rgba(0,0,0,.4)")
  .strokeWidth(1)
  .shadow(
    "0px 10px 10px red",
    "0px -10px 10px blue"
  )
```

### 5. Table Component

#### Method Signature
```typescript
Table(...rows: TableRow[]): TableComponent
TableRow(...cells: Component[]): TableRowComponent
```

#### Example with Styled Headers and Cells
```javascript
// Helper functions for consistent styling
function StylishHeader(text, corners = [0]) {
  return Flex(
    Text(text)
      .lineHeight(1.4)
      .color("white")
      .weight("bold")
      .font("Inter Khmer")
      .size(18)
  )
    .padding(10, 0)
    .bg("black")
    .alignItems("center")
    .cornerRadius(...corners)
    .cornerSmoothing(0.7);
}

function StylishCell(text) {
  return Flex(
    Text(text)
      .lineHeight(1.2)
      .color("black")
      .size(18)
  )
    .padding(10, 14)
    .maxWidth(140);
}

// Table implementation
Table(
  TableRow(
    StylishHeader("Column 1", [18, 0, 0, 0]),
    StylishHeader("Column 2", [0]),
    StylishHeader("Column 3", [0, 18, 0, 0])
  ),
  TableRow(
    StylishCell("Cell 1"),
    StylishCell("Cell 2").bg("yellow"),
    StylishCell("Cell 3")
  )
)
  .alignSelf("flex-start")
  .marginTop(20)
  .strokeWidth(2)
  .strokeColor("rgba(0,0,0,.2)")
  .cornerRadius(18)
  .lineDash(5, 4)
  .cornerSmoothing(0.7)
  .shadow("10px 10px 0px rgba(0,0,0,.1)")
```

## Font Management

### Font Registration and Tracing

```javascript
// Trace used fonts in a document
const fonts = Font.trace(document);

// Register fonts
Font.registerFont("path/to/font.ttf", { 
  family: "FontFamilyName" 
});

// Example of automatic font registration
for (const fontFamily of fonts) {
  const fontPath = path.join("fonts", `${fontFamily}.ttf`);
  if (fsSync.existsSync(fontPath)) {
    Font.registerFont(fontPath, { family: fontFamily });
  }
}
```

## Output Generation

### Methods
| Method | Description | Options |
|--------|-------------|---------|
| .jpg() | Generate JPEG output | quality (0-100) |
| .png() | Generate PNG output | compression |
| .svg() | Generate SVG output | - |
| .pdf() | Generate PDF output | - |

### Example
```javascript
// Create document
async function Document() {
  return Column(
    // ... components
  );
}

// Generate different formats
await sone(Document).jpg()  // -> Buffer
await sone(Document).png()  // -> Buffer
await sone(Document).svg()  // -> String
await sone(Document).pdf()  // -> Buffer

// Save to file
await fs.writeFile("output.jpg", await sone(Document).jpg());
```

## Styling Reference

### Colors and Gradients
```javascript
// Solid colors
.color("#205781")
.color("rgb(255, 0, 0)")
.color("rgba(0, 0, 0, 0.5)")

// Gradients
.color("linear-gradient(to left, orange 0%, yellow 100%)")
.bg("linear-gradient(-225deg, #231557 0%, #44107A 29%)")

// Multiple backgrounds
.bg(`linear-gradient(-225deg, #231557 0%, #44107A 29%),
     repeating-linear-gradient(-115deg, transparent, transparent 20px)`)
```

### Shadows
```javascript
// Single shadow
.shadow("5px 5px 10px rgba(0,0,0,.2)")

// Multiple shadows
.shadow(
  "0px 10px 10px red",
  "0px -10px 10px blue",
  "-10px 0px 10px orange"
)
```

### Image Effects
```javascript
.contrast(1.1)      // Increase contrast
.saturate(0)        // Remove saturation
.opacity(0.8)       // Set opacity
.rotate(-40)        // Rotate by degrees
```

This documentation covers the main features of the Sone library based on the actual implementation in the test files. The library supports complex layouts, rich text formatting, and various visual effects, making it suitable for generating high-quality documents and images.

The library excels in handling:
- Complex scripts (Khmer, Thai, Lao)
- Emojis and Unicode text
- Flexible layouts
- Rich text styling
- Image processing
- Multiple output formats

For more examples and advanced usage, refer to the test files in the repository.



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
- [ ] Sone Socket Server & Socket Image Viewer
- [ ] No-wrap
- [ ] Non breaking space


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

