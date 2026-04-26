// Generates Open Graph images at request time using Sone itself.
// Used by /og/docs/*.jpg to produce per-page social-share cards.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Column, Font, Row, Span, Text, sone } from 'sone';

const FG = '#0a0a0a';
const FG_MUTED = '#525252';
const BORDER = '#e5e5e5';

// Load Google Sans once at module init. The font ships in the repo at
// app/fonts/ so it's available in any deploy environment that bundles the
// app's `app/` tree (Vercel functions include it because we reference it
// from server code).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_PATH = path.resolve(__dirname, '..', 'fonts', 'GoogleSans-Variable.ttf');

let fontReady: Promise<void> | undefined;
async function ensureFonts(): Promise<void> {
  if (fontReady) return fontReady;
  fontReady = (async () => {
    if (!Font.has('GoogleSans')) {
      try {
        await Font.load('GoogleSans', FONT_PATH);
      } catch (err) {
        console.warn('[og] could not load GoogleSans:', err);
      }
    }
  })();
  return fontReady;
}

type OgInput = {
  title: string;
  description?: string;
  section?: string;
};

export async function renderOg({
  title,
  description,
  section,
}: OgInput): Promise<Buffer> {
  await ensureFonts();

  const tree = Column(
    Row(
      Text('SONE')
        .size(20)
        .weight('bold')
        .color(FG)
        .letterSpacing(1.5)
        .font('GoogleSans'),
      Text(section ?? 'Docs')
        .size(14)
        .color(FG_MUTED)
        .weight('bold')
        .letterSpacing(0.4)
        .font('GoogleSans'),
    )
      .gap(16)
      .alignItems('center'),

    Text(title)
      .size(76)
      .weight('bold')
      .lineHeight(1.05)
      .color(FG)
      .maxWidth(1040)
      .font('GoogleSans'),

    description
      ? Text(description)
          .size(24)
          .color(FG_MUTED)
          .lineHeight(1.45)
          .maxWidth(960)
          .font('GoogleSans')
      : Column().height(0),

    Row(
      Text(
        Span('npm install ').color(FG_MUTED),
        Span('sone').color(FG).weight('bold'),
      )
        .size(18)
        .color(FG)
        .padding(12, 18),
    )
      .borderWidth(1)
      .borderColor(BORDER)
      .rounded(8)
      .alignSelf('flex-start'),
  )
    .width(1200)
    .height(630)
    .padding(72, 80)
    .gap(28)
    .bg('white')
    .justifyContent('space-between');

  const canvas = (await sone(tree).canvas()) as unknown as {
    density: number;
    toBuffer(format: string, options?: Record<string, unknown>): Promise<Buffer>;
  };
  canvas.density = 2;
  return canvas.toBuffer('jpeg', { quality: 0.92, density: 2 });
}
