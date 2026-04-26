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
const BORDER = '#e5e5e5';

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
