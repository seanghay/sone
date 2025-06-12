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

🙏 Thanks to [Dmitry Iv.](https://github.com/dy) for donating the `sone` package name.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
- [Components](#components)
- [Advanced Usage](#advanced-usage)
- [Examples](#examples)
- [API Reference](#api-reference)

## Features

1. **Layout System**
   - Flex Layout powered by [yoga-layout](https://www.yogalayout.dev/)
   - Advanced positioning and alignment
   - Gap and spacing control
   - Maximum width constraints

2. **Rich Text Support**
   - Multiple text alignment options (Left, Right, Center, Justify)
   - Support for complex scripts (Khmer, Thai, Lao)
   - Font tracing capabilities
   - Text shadows and decorations
   - Gradient text fill

3. **Graphics Capabilities**
   - SVG support without rasterization
   - Squircle rounded corners (iOS-style)
   - Linear and repeating gradients
   - Box shadows
   - Border controls
   - Opacity management

4. **Table Support**
   - Flexible table layouts
   - Complex data presentation
   - Customizable styling

5. **Output Formats**
   - SVG
   - PDF
   - Image (JPG, PNG, WEBP)

## Installation

```shell
npm install sone
```

## Getting Started

### Basic Usage

```javascript
import { sone, Column, Text, Span } from "sone";
import fs from "node:fs/promises";

function Document() {
  return Column(
    Text(
      "Hello world! ",
      Span("Sone.")
        .color("orange")
        .weight("bold")
        .shadow("2px 2px 0px rgba(0,0,0,.2)"),
      " 😍"
    ).size(34),
  ).padding(40);
}

// Generate PNG
await fs.writeFile("output.png", await sone(Document).png());

// Generate PDF
await fs.writeFile("output.pdf", await sone(Document).pdf());
```

## Core Concepts

### Component Structure
Sone uses a composable component structure where elements can be nested and styled using a chainable API:

1. **Column**: Vertical layout container
2. **Text**: Text container supporting rich text features
3. **Span**: Inline text styling component
4. **Flex**: Flexible layout component

### Styling
Components can be styled using chainable methods:
- `.color()`: Sets text color
- `.size()`: Sets font size
- `.weight()`: Sets font weight
- `.shadow()`: Adds text shadow
- `.padding()`: Sets padding
- `.gap()`: Sets spacing between elements
- `.maxWidth()`: Sets maximum width constraint

## Components

### Column
Used for vertical layouts:
```javascript
Column(
  // child components
).padding(40).gap(10);
```

### Text
Text container with rich formatting:
```javascript
Text(
  "Regular text",
  Span("styled text").color("orange")
).size(34).align("justify");
```

### Span
Inline text styling:
```javascript
Span("text")
  .color("orange")
  .weight("bold")
  .shadow("2px 2px 0px rgba(0,0,0,.2)");
```

### Table
Table layout component:
```javascript
// See examples in test/table.js for table implementation
```

## Advanced Usage

### Font Tracing
Get a list of fonts used in the component tree:
```javascript
// See test/text-01.js for font tracing implementation
```

### Custom Styling
Advanced styling options:
```javascript
Text()
  .font("Inter Khmer")
  .size(32)
  .align("justify")
  .color("#333")
  .lineHeight(1.45);
```

### Video Frame Generation
For creating video frames:
```shell
# Create frames
node main.js

# Encode frames into mp4
ffmpeg -y -framerate 60 -i "frames/%04d.jpg" -c:v libx264 -pix_fmt yuv420p -crf 18 output.mp4
```

## Examples

The repository includes several example implementations:
- Text layouts: `test/text-01.js`, `test/text-02.js`
- Tables: `test/table.js`, `test/table-2.js`
- Basic layouts: `test/basic-01.js`

## API Reference

### Main Functions
- `sone()`: Main entry point for rendering
- `Column()`: Creates vertical layout
- `Text()`: Creates text container
- `Span()`: Creates styled text span

### Output Methods
- `.png()`: Renders to PNG
- `.pdf()`: Renders to PDF
- `.svg()`: Renders to SVG

### Styling Methods
- `.color(value)`: Sets color
- `.size(value)`: Sets size
- `.weight(value)`: Sets font weight
- `.shadow(value)`: Sets shadow
- `.padding(value)`: Sets padding
- `.gap(value)`: Sets gap between elements
- `.maxWidth(value)`: Sets maximum width
- `.lineHeight(value)`: Sets line height
- `.align(value)`: Sets text alignment
- `.font(value)`: Sets font family
- `.bg(value)`: Sets background color

## Current Status

Sone is actively maintained and has implemented many key features. Check the current implementation status in the repository's README for the latest updates on feature implementation.


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

