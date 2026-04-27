// Generates Open Graph images at request time using Sone itself.
// Used by /og/docs/*.jpg to produce per-page social-share cards.

import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Column, Font, Row, Span, Text, sone } from 'sone';
// `?inline` embeds the font as a base64 data URL in the SSR bundle so the
// bytes ship inside the Vercel function (no separate asset file needed).
// React Router otherwise moves emitted assets to the client-only build,
// where the function cannot read them at runtime.
import fontDataUrl from '../fonts/GoogleSans-Variable.ttf?inline';

const FG = '#0a0a0a';
const FG_MUTED = '#525252';
const ACCENT_DEEP = '#1e1bff';
const ACCENT_CYAN = '#00d4ff';
const BRAND_GRADIENT = `linear-gradient(135deg, ${ACCENT_DEEP}, ${ACCENT_CYAN})`;

let fontReady: Promise<void> | undefined;
async function ensureFonts(): Promise<void> {
  if (fontReady) return fontReady;
  fontReady = (async () => {
    if (Font.has('GoogleSans')) return;
    const base64 = fontDataUrl.split(',', 2)[1];
    const bytes = Buffer.from(base64, 'base64');
    const fontPath = path.join(tmpdir(), 'sone-google-sans.ttf');
    await writeFile(fontPath, bytes);
    try {
      await Font.load('GoogleSans', fontPath);
    } catch (err) {
      console.error('[og] could not load GoogleSans:', err);
      throw err;
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
    // Top row — gradient brand glyph + wordmark on the left, section
    // eyebrow on the right.
    Row(
      Row(
        Column().width(44).height(44).rounded(10).bg(BRAND_GRADIENT),
        Text('Sone')
          .size(28)
          .weight('bold')
          .color(FG)
          .letterSpacing(-0.4)
          .font('GoogleSans'),
      )
        .gap(14)
        .alignItems('center'),
      Text((section ?? 'Documentation').toUpperCase())
        .size(13)
        .weight('bold')
        .color(FG_MUTED)
        .letterSpacing(2.2)
        .font('GoogleSans'),
    )
      .justifyContent('space-between')
      .alignItems('center'),

    // Headline + optional excerpt. Bumped to 88pt so titles read at a
    // glance in feed previews. lineHeight 1.02 keeps multi-line headlines
    // tight without crowding.
    Column(
      Text(title)
        .size(88)
        .weight('bold')
        .lineHeight(1.02)
        .letterSpacing(-1.2)
        .color(FG)
        .maxWidth(1040)
        .font('GoogleSans'),

      description
        ? Text(description)
            .size(28)
            .color(FG_MUTED)
            .lineHeight(1.4)
            .maxWidth(960)
            .font('GoogleSans')
        : Column().height(0),
    ).gap(22),

    // Footer — accent stripe (brand gradient), domain on the left,
    // CTA-style read-more on the right.
    Column(
      Column().width(72).height(4).rounded(2).bg(BRAND_GRADIENT),
      Row(
        Text('sone.seanghay.com')
          .size(20)
          .weight('bold')
          .color(FG_MUTED)
          .letterSpacing(-0.2)
          .font('GoogleSans'),
        Text(
          Span('Read the docs').color(FG).weight('bold'),
          Span('  →').color(ACCENT_DEEP).weight('bold'),
        )
          .size(20)
          .font('GoogleSans')
          .letterSpacing(-0.2),
      )
        .justifyContent('space-between')
        .alignItems('center'),
    ).gap(20),
  )
    .width(1200)
    .height(630)
    .padding(72, 80)
    .gap(40)
    .bg('white')
    .justifyContent('space-between');

  const canvas = (await sone(tree).canvas()) as unknown as {
    density: number;
    toBuffer(format: string, options?: Record<string, unknown>): Promise<Buffer>;
  };
  canvas.density = 2;
  return canvas.toBuffer('jpeg', { quality: 0.92, density: 2 });
}
