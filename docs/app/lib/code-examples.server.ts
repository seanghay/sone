import { highlight } from './shiki.server';

export type ShowcaseIcon =
  | 'Share2'
  | 'Receipt'
  | 'Sparkles'
  | 'BarChart3'
  | 'Quote'
  | 'LayoutPanelTop';

export type ShowcaseExample = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imageRatio?: string;
  icon: ShowcaseIcon;
  codeHtml: string;
};

const helloWorldCode = `import fs from "node:fs/promises";
import { Column, Span, sone, Text } from "sone";

// A document is just a tree of node builders — no JSX, no HTML.
function HelloCard() {
  return Column(
    Text(
      "Hello, ",
      Span("Sone").color("linear-gradient(135deg, #f97316, #c026d3)"),
      ".",
    )
      .size(48)
      .weight("bold")
      .color("#171717"),

    Text("Declarative documents — no browser, no JSX.")
      .size(16)
      .color("#525252")
      .lineHeight(1.5),
  )
    .gap(10)
    .padding(40)
    .bg("white")
    .borderWidth(1)
    .borderColor("#e5e5e5")
    .rounded(16);
}

// Render to JPG (also: .png(), .pdf(), .svg(), .webp())
const buffer = await sone(HelloCard()).jpg();
await fs.writeFile("hello.jpg", buffer);`;

export const helloWorldHtml = highlight(helloWorldCode, 'typescript');

// --- Tailwind / Sone bridge ---
// Side-by-side snippets that render the *same* card. Idea: if you can read
// Tailwind classes, you can read Sone — same vocabulary, different syntax.

const tailwindBridgeCode = `// React + Tailwind
<div className="
  flex flex-col gap-2
  p-6 bg-white rounded-xl
  border border-zinc-200 max-w-sm
">
  <h2 className="text-xl font-bold text-zinc-900">
    Sone
  </h2>
  <p className="text-sm leading-relaxed text-zinc-500">
    Familiar vocabulary. Same flexbox model.
    Different syntax — plain JavaScript.
  </p>
  <button className="
    mt-2 px-4 py-2 rounded-full
    bg-zinc-900 text-white text-sm font-medium
  ">
    Get started
  </button>
</div>`;

const soneBridgeCode = `// Sone
Column(
  Text("Sone").size(20).weight("bold").color("#18181b"),
  Text(
    "Familiar vocabulary. Same flexbox model. " +
    "Different syntax — plain JavaScript.",
  )
    .size(14).lineHeight(1.55).color("#71717a"),
  Column(Text("Get started").size(14).weight(500).color("white"))
    .padding(8, 16).bg("#18181b").rounded(9999)
    .alignSelf("flex-start").marginTop(8),
)
  .gap(8).padding(24).bg("white")
  .borderWidth(1).borderColor("#e4e4e7")
  .rounded(12).maxWidth(384)`;

export const tailwindBridgeHtml = highlight(tailwindBridgeCode, 'tsx');
export const soneBridgeHtml = highlight(soneBridgeCode, 'typescript');

const defs = [
  {
    title: 'Open Graph image',
    icon: 'Share2',
    description:
      'Fixed-size 1200×630 social card. Same node tree renders to PNG, JPG, or WebP — single-digit-millisecond render means you can produce them per request.',
    image: '/examples/og-image.jpg',
    imageAlt: 'OG image with hero title',
    imageRatio: '1200 / 630',
    code: `Column(
  Row(Text("sone.dev").size(18).color("#525252").weight("bold")),
  Text("Generate documents at scale, without a browser.")
    .size(72).weight("bold").color("#171717")
    .lineHeight(1.1).maxWidth(1000),
  Row(
    Column(
      Text("Read more").size(15).weight("bold").color("#171717"),
      Text("5 min read").size(13).color("#525252"),
    ).gap(2),
  ),
)
  .width(1200).height(630).padding(64)
  .bg("white").justifyContent("space-between")`,
  },
  {
    title: 'Receipt with tab leaders',
    icon: 'Receipt',
    description:
      'Tab stops with a "." leader give classic Word-style table-of-contents alignment in a single Text node — no Table needed.',
    image: '/examples/receipt.jpg',
    imageAlt: 'Receipt with dot-leader pricing rows',
    imageRatio: '540 / 320',
    code: `const line = (label, amount) =>
  Text(\`\${label}\\t\${amount}\`)
    .tabStops(420).tabLeader(".")
    .size(13).color("#171717");

Column(
  Text("Coffee Receipt").size(20).weight("bold"),
  Text("Order #2241 · 26 Apr 2026").size(11).color("#737373"),
  Column(
    line("Cappuccino", "$4.50"),
    line("Cortado", "$4.00"),
    line("Almond croissant", "$5.25"),
    line("Sparkling water", "$3.00"),
  ).gap(4).margin(12, 0),
  Text("Total\\t$16.75")
    .tabStops(380).size(15).weight("bold"),
)
  .width(540).padding(32, 36).gap(8).bg("white")
  .borderWidth(1).borderColor("#e5e5e5").rounded(12)`,
  },
  {
    title: 'Inline gradient span',
    icon: 'Sparkles',
    description:
      'Spans inside a Text inherit the paragraph layout but can override color, weight, font, decorations — even a CSS gradient color.',
    image: '/examples/hero-gradient.jpg',
    imageAlt: 'Heading with a gradient-colored word',
    imageRatio: '640 / 380',
    code: `Column(
  Text(
    "Beautiful ",
    Span("typography")
      .color("linear-gradient(135deg, #f97316, #c026d3)")
      .weight("bold"),
    ", without a browser.",
  )
    .size(56).weight("bold").color("#171717")
    .lineHeight(1.1).maxWidth(560),

  Text(
    "Mixed spans, justification, decorations, drop shadows, " +
    "and per-glyph gradients in a single Text node.",
  ).size(15).color("#525252").lineHeight(1.6).maxWidth(540),
)
  .width(640).padding(48).bg("white")
  .borderWidth(1).borderColor("#e5e5e5").rounded(16)`,
  },
  {
    title: 'Stats card with semantic spans',
    icon: 'BarChart3',
    description:
      'Two-column dashboard tile. Each delta is a Span inside the body text — color the trend without breaking out into a separate node.',
    image: '/examples/stats-card.jpg',
    imageAlt: 'Two-column stats card',
    imageRatio: '640 / 200',
    code: `Row(
  Column(
    Text("Active users").size(13).color("#525252").weight("bold"),
    Text("128,420").size(48).weight("bold").color("#171717"),
    Text(
      Span("▲ +22%").color("#16a34a").weight("bold"),
      " vs last week",
    ).size(13).color("#525252"),
  ).gap(4).flex(1),
  Column(
    Text("Revenue").size(13).color("#525252").weight("bold"),
    Text("$12,840").size(48).weight("bold").color("#171717"),
    Text(
      Span("▲ +9%").color("#16a34a").weight("bold"),
      " vs last week",
    ).size(13).color("#525252"),
  ).gap(4).flex(1),
)
  .width(640).padding(32).gap(48).bg("white")
  .borderWidth(1).borderColor("#e5e5e5").rounded(16)`,
  },
  {
    title: 'Pull-quote',
    icon: 'Quote',
    description:
      'maxWidth + lineHeight + a decorative leading character. The author block is a sibling Column with its own typography.',
    image: '/examples/quote-card.jpg',
    imageAlt: 'Pull-quote card',
    imageRatio: '540 / 320',
    code: `Column(
  Text('"').size(72).color("#d4d4d4").weight("bold").lineHeight(0.9),
  Text(
    "Sone lets you focus on designing instead of " +
    "calculating positions manually.",
  )
    .size(22).color("#171717").weight("bold")
    .lineHeight(1.4).maxWidth(440),
  Row(
    Column(
      Text("Seanghay").size(13).weight("bold").color("#171717"),
      Text("Author of Sone").size(11).color("#737373"),
    ).gap(2),
  ).margin(16, 0, 0, 0),
)
  .width(540).padding(40).gap(8).bg("white")
  .borderWidth(1).borderColor("#e5e5e5").rounded(16)`,
  },
  {
    title: 'Feature row',
    icon: 'LayoutPanelTop',
    description:
      'A Row of two Columns — the icon tile is just a sized Column with a background. Compose features without a CSS framework.',
    image: '/examples/feature-row.jpg',
    imageAlt: 'Icon + heading + body row',
    imageRatio: '540 / 140',
    code: `Row(
  Column().width(48).height(48).rounded(12).bg("#f5f5f5"),
  Column(
    Text("Multi-page PDF").size(18).weight("bold").color("#171717"),
    Text(
      "Automatic page breaking, repeating headers and " +
      "footers, page margins. Pages are just layout.",
    ).size(13).color("#525252").lineHeight(1.55).maxWidth(420),
  ).gap(4).flex(1),
)
  .width(540).padding(28).gap(16).bg("white")
  .borderWidth(1).borderColor("#e5e5e5").rounded(16)`,
  },
];

export const showcase: ShowcaseExample[] = defs.map((d) => ({
  title: d.title,
  description: d.description,
  image: d.image,
  imageAlt: d.imageAlt,
  imageRatio: d.imageRatio,
  icon: d.icon as ShowcaseIcon,
  codeHtml: highlight(d.code, 'typescript'),
}));
