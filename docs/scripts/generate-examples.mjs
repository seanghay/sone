// Generates the homepage code-showcase images.
// Each entry below: a name (filename stem), a render config, and a Sone tree.
// Output goes to docs/public/examples/. The matching code snippets live in
// app/lib/code-examples.server.ts — keep them in sync.
//
// Each render gets `canvas.density = 2` for retina-sharp output.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Column, Row, Span, Text, sone } from 'sone';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, '..', 'public', 'examples');
await mkdir(out, { recursive: true });

const DENSITY = 2;
const FG = '#171717';
const FG_MUTED = '#525252';
const FG_FAINT = '#a3a3a3';
const BORDER = '#e5e5e5';

// 1) OG image — realistic blog-post social card. Three-row layout
//    (brand + category, title + excerpt, author + read time) on white,
//    with a single accent color used for the avatar dot and one Span
//    inside the title. Photo() in the docs example is replaced here with
//    rounded-rectangle placeholders so the script renders without
//    external image files.
function ogImage() {
  const ACCENT = '#0DF';
  return Column(
    // Header — brand mark + category eyebrow
    Row(
      Row(
        Column().width(28).height(28).rounded(6).bg(FG),
        Text('sone.dev')
          .size(16)
          .weight('bold')
          .color(FG)
          .letterSpacing(0.2),
      )
        .gap(10)
        .alignItems('center'),
      Text('ENGINEERING')
        .size(12)
        .weight('bold')
        .color(FG)
        .letterSpacing(1.6),
    )
      .justifyContent('space-between')
      .alignItems('center'),

    // Title + excerpt — Span highlights the punch line in accent color
    Column(
      Text(
        'How we cut PDF render time from ',
        Span('2 seconds').color(FG_MUTED),
        ' to ',
        Span('30 milliseconds').color(ACCENT).weight('bold'),
      )
        .size(64)
        .weight('bold')
        .lineHeight(1.1)
        .color(FG)
        .maxWidth(1040),
      Text(
        'An honest look at the architectural changes that made our document pipeline 60× faster.',
      )
        .size(20)
        .lineHeight(1.4)
        .color(FG_MUTED)
        .maxWidth(900),
    ).gap(18),

    // Footer — author block on left, read time on right
    Row(
      Row(
        Column().width(40).height(40).rounded(20).bg(ACCENT),
        Column(
          Text('Alex Chen').size(15).weight('bold').color(FG),
          Text('Engineering Lead').size(13).color(FG_MUTED),
        ).gap(2),
      )
        .gap(12)
        .alignItems('center'),
      Text('8 MIN READ')
        .size(12)
        .weight('bold')
        .color(FG_MUTED)
        .letterSpacing(1.6),
    )
      .justifyContent('space-between')
      .alignItems('center'),
  )
    .width(1200)
    .height(630)
    .padding(64)
    .bg('white')
    .justifyContent('space-between');
}

// 2) Receipt — tab stops with dot leaders
function receipt() {
  const line = (label, amount) =>
    Text(`${label}\t${amount}`)
      .tabStops(420)
      .tabLeader('.')
      .size(13)
      .color(FG);

  return Column(
    Text('Coffee Receipt').size(20).weight('bold').color(FG),
    Text('Order #2241 · 26 Apr 2026').size(11).color(FG_MUTED),
    Column(
      line('Cappuccino', '$4.50'),
      line('Cortado', '$4.00'),
      line('Almond croissant', '$5.25'),
      line('Sparkling water', '$3.00'),
    ).gap(4).margin(12, 0),
    Text('Total\t$16.75')
      .tabStops(380)
      .size(15)
      .weight('bold')
      .color(FG),
  )
    .width(540)
    .padding(32, 36)
    .gap(8)
    .bg('white')
    .borderWidth(1)
    .borderColor(BORDER)
    .rounded(12);
}

// 3) Quote card
function quoteCard() {
  return Column(
    Text('"').size(72).color('#d4d4d4').weight('bold').lineHeight(0.9),
    Text(
      'Sone lets you focus on designing instead of calculating positions manually.',
    )
      .size(22)
      .lineHeight(1.4)
      .color(FG)
      .weight('bold')
      .maxWidth(440),
    Row(
      Column(
        Text('Seanghay').size(13).weight('bold').color(FG),
        Text('Author of Sone').size(11).color(FG_MUTED),
      ).gap(2),
    ).margin(16, 0, 0, 0),
  )
    .width(540)
    .padding(40)
    .gap(8)
    .bg('white')
    .borderWidth(1)
    .borderColor(BORDER)
    .rounded(16);
}

// 4) Stats card — large numeric metric with delta
function statsCard() {
  const stat = (label, value, delta) =>
    Column(
      Text(label).size(13).color(FG_MUTED).weight('bold').letterSpacing(0.4),
      Text(value).size(48).weight('bold').color(FG).lineHeight(1.05),
      Row(
        Text(
          Span(`▲ ${delta}`).color('#16a34a').weight('bold'),
          ' vs last week',
        )
          .size(13)
          .color(FG_MUTED),
      ).margin(4, 0, 0, 0),
    ).gap(4).flex(1);

  return Row(stat('Active users', '128,420', '+22%'), stat('Revenue', '$12,840', '+9%'))
    .width(640)
    .padding(32)
    .gap(48)
    .bg('white')
    .borderWidth(1)
    .borderColor(BORDER)
    .rounded(16);
}

// 5) Feature row
function featureRow() {
  return Row(
    Column().width(48).height(48).rounded(12).bg('#f5f5f5'),
    Column(
      Text('Multi-page PDF').size(18).weight('bold').color(FG),
      Text(
        'Automatic page breaking, repeating headers and footers, page margins. Pages are just layout.',
      )
        .size(13)
        .color(FG_MUTED)
        .lineHeight(1.55)
        .maxWidth(420),
    ).gap(4).flex(1),
  )
    .width(540)
    .padding(28)
    .gap(16)
    .bg('white')
    .borderWidth(1)
    .borderColor(BORDER)
    .rounded(16);
}

// 6) Hero gradient — large headline with inline span and gradient
function heroGradient() {
  return Column(
    Text(
      'Beautiful ',
      Span('typography')
        .color('linear-gradient(135deg, #f97316, #c026d3)')
        .weight('bold'),
      ', without a browser.',
    )
      .size(56)
      .weight('bold')
      .lineHeight(1.1)
      .color(FG)
      .maxWidth(560),
    Text(
      'Mixed spans, justification, decorations, drop shadows, and per-glyph gradients in a single Text node.',
    )
      .size(15)
      .color(FG_MUTED)
      .lineHeight(1.6)
      .maxWidth(540)
      .margin(8, 0, 0, 0),
  )
    .width(640)
    .padding(48)
    .bg('white')
    .borderWidth(1)
    .borderColor(BORDER)
    .rounded(16);
}

const scenes = [
  { name: 'og-image', node: ogImage() },
  { name: 'receipt', node: receipt() },
  { name: 'quote-card', node: quoteCard() },
  { name: 'stats-card', node: statsCard() },
  { name: 'feature-row', node: featureRow() },
  { name: 'hero-gradient', node: heroGradient() },
];

for (const { name, node } of scenes) {
  // Get the underlying skia-canvas Canvas so we can set the pixel density
  // before encoding — produces 2× output for retina sharpness.
  const canvas = await sone(node, { background: "white" }).canvas();
  canvas.density = DENSITY;
  const buf = await canvas.toBuffer('jpeg', { quality: 0.92, density: DENSITY });
  const file = join(out, `${name}.jpg`);
  await writeFile(file, buf);
  console.log(`  + ${name}.jpg (${canvas.width * DENSITY}×${canvas.height * DENSITY})`);
}

console.log(`\nWrote ${scenes.length} examples to ${out}`);
