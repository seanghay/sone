/**
 * Line-height comparison: browser (Chrome via Puppeteer) vs Sone
 *
 * For each test case the script:
 *   1. Renders the text in a headless Chrome page and screenshots just the
 *      text element.
 *   2. Renders the same text with Sone (white background, no padding).
 *   3. Places both images side-by-side with a label strip and saves the
 *      composite to test/visual/lineheight-compare-<slug>.png
 *
 * Run with:
 *   npx tsx test/visual/lineheight-compare.ts
 */

import { Buffer } from "node:buffer";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { Canvas, loadImage } from "skia-canvas";
import { sone, Text } from "../../src/node.ts";
import { loadVisualTestFonts } from "./load-test-fonts.ts";

const relative = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const OUT_DIR = relative(".");

const CHROME_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Embed fonts as base64 so the browser page can load them without a server.
const geistMonoBase64 = (
  await fs.readFile(relative("../font/GeistMono-Regular.woff2"))
).toString("base64");

const notoSansKhmerBase64 = (
  await fs.readFile(relative("../font/NotoSansKhmer.ttf"))
).toString("base64");

const moulBase64 = (
  await fs.readFile(relative("../font/Moul-Regular.ttf"))
).toString("base64");

// ─── font registry ─────────────────────────────────────────────────────────────

type FontEntry = {
  family: string;
  base64: string;
  format: "woff2" | "truetype";
  soneName: string;
};

const FONTS: Record<string, FontEntry> = {
  GeistMono: {
    family: "GeistMono",
    base64: geistMonoBase64,
    format: "woff2",
    soneName: "GeistMono",
  },
  NotoSansKhmer: {
    family: "NotoSansKhmer",
    base64: notoSansKhmerBase64,
    format: "truetype",
    soneName: "NotoSansKhmer",
  },
  Moul: {
    family: "Moul",
    base64: moulBase64,
    format: "truetype",
    soneName: "Moul",
  },
};

// ─── test cases ────────────────────────────────────────────────────────────────

type TestCase = {
  slug: string;
  text: string;
  fontSize: number;
  lineHeight: number | "default";
  font: string;
};

const CASES: TestCase[] = [
  // Latin / GeistMono
  {
    slug: "single-line-lh1",
    text: "Hello World",
    fontSize: 20,
    lineHeight: 1.0,
    font: "GeistMono",
  },
  {
    slug: "single-line-lh1.2",
    text: "Hello World",
    fontSize: 20,
    lineHeight: 1.2,
    font: "GeistMono",
  },
  {
    slug: "single-line-lh1.5",
    text: "Hello World",
    fontSize: 20,
    lineHeight: 1.5,
    font: "GeistMono",
  },
  {
    slug: "multiline-lh1.2",
    text: "Hello World\nLine two here\nLine three",
    fontSize: 20,
    lineHeight: 1.2,
    font: "GeistMono",
  },
  {
    slug: "multiline-lh1.5",
    text: "Hello World\nLine two here\nLine three",
    fontSize: 20,
    lineHeight: 1.5,
    font: "GeistMono",
  },
  {
    slug: "large-font-lh1.2",
    text: "The quick brown fox\njumps over the lazy dog",
    fontSize: 36,
    lineHeight: 1.2,
    font: "GeistMono",
  },
  {
    slug: "large-font-lh1.5",
    text: "The quick brown fox\njumps over the lazy dog",
    fontSize: 36,
    lineHeight: 1.5,
    font: "GeistMono",
  },
  {
    slug: "small-font-lh1.2",
    text: "pack my box with\nfive dozen liquor jugs",
    fontSize: 14,
    lineHeight: 1.2,
    font: "GeistMono",
  },
  {
    slug: "small-font-lh2",
    text: "pack my box with\nfive dozen liquor jugs",
    fontSize: 14,
    lineHeight: 2.0,
    font: "GeistMono",
  },
  // Khmer / NotoSansKhmer
  {
    slug: "khmer-single-lh1.2",
    text: "ភ្នំពេញ",
    fontSize: 20,
    lineHeight: 1.2,
    font: "NotoSansKhmer",
  },
  {
    slug: "khmer-single-lh1.5",
    text: "ភ្នំពេញ",
    fontSize: 20,
    lineHeight: 1.5,
    font: "NotoSansKhmer",
  },
  {
    slug: "khmer-multiline-lh1.2",
    text: "ក្រសួងការពារជាតិ\nកម្ពុជា",
    fontSize: 20,
    lineHeight: 1.2,
    font: "NotoSansKhmer",
  },
  {
    slug: "khmer-multiline-lh1.5",
    text: "ក្រសួងការពារជាតិ\nកម្ពុជា",
    fontSize: 20,
    lineHeight: 1.5,
    font: "NotoSansKhmer",
  },
  {
    slug: "khmer-large-lh1.3",
    text: "សួស្តី\nពិភពលោក",
    fontSize: 32,
    lineHeight: 1.3,
    font: "NotoSansKhmer",
  },
  {
    slug: "khmer-large-lh1.5",
    text: "សួស្តី\nពិភពលោក",
    fontSize: 32,
    lineHeight: 1.5,
    font: "NotoSansKhmer",
  },
  // Khmer / Moul
  {
    slug: "moul-single-lh1.2",
    text: "ភ្នំពេញ",
    fontSize: 20,
    lineHeight: 1.2,
    font: "Moul",
  },
  {
    slug: "moul-single-lh1.5",
    text: "ភ្នំពេញ",
    fontSize: 20,
    lineHeight: 1.5,
    font: "Moul",
  },
  {
    slug: "moul-multiline-lh1.2",
    text: "ក្រសួងការពារជាតិ\nកម្ពុជា",
    fontSize: 20,
    lineHeight: 1.2,
    font: "Moul",
  },
  {
    slug: "moul-multiline-lh1.5",
    text: "ក្រសួងការពារជាតិ\nកម្ពុជា",
    fontSize: 20,
    lineHeight: 1.5,
    font: "Moul",
  },
  {
    slug: "moul-large-lh1.3",
    text: "សួស្តី\nពិភពលោក",
    fontSize: 32,
    lineHeight: 1.3,
    font: "Moul",
  },
  {
    slug: "moul-large-lh1.5",
    text: "សួស្តី\nពិភពលោក",
    fontSize: 32,
    lineHeight: 1.5,
    font: "Moul",
  },
  // Default line-height: browser uses `normal`, Sone uses NaN → 1.0
  {
    slug: "default-lh-geistmono",
    text: "Hello World\nLine two here",
    fontSize: 20,
    lineHeight: "default",
    font: "GeistMono",
  },
  {
    slug: "default-lh-noto-khmer",
    text: "ក្រសួងការពារជាតិ\nកម្ពុជា",
    fontSize: 20,
    lineHeight: "default",
    font: "NotoSansKhmer",
  },
  {
    slug: "default-lh-moul",
    text: "ក្រសួងការពារជាតិ\nកម្ពុជា",
    fontSize: 20,
    lineHeight: "default",
    font: "Moul",
  },
  {
    slug: "default-lh-moul-large",
    text: "សួស្តី\nពិភពលោក",
    fontSize: 32,
    lineHeight: "default",
    font: "Moul",
  },
];

// ─── browser helper ────────────────────────────────────────────────────────────

function buildHtml(
  text: string,
  fontSize: number,
  lineHeight: number | "default",
  fontEntry: FontEntry,
): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  const lhCss = lineHeight === "default" ? "normal" : lineHeight;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: '${fontEntry.family}';
    src: url('data:font/${fontEntry.format === "woff2" ? "woff2" : "truetype"};base64,${fontEntry.base64}') format('${fontEntry.format}');
    font-weight: normal;
    font-style: normal;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: white; }
  .text {
    font-family: '${fontEntry.family}', sans-serif;
    font-size: ${fontSize}px;
    line-height: ${lhCss};
    color: black;
    background: white;
    display: inline-block;
    white-space: nowrap;
  }
</style>
</head>
<body><div class="text">${escaped}</div></body>
</html>`;
}

// ─── sone helper ───────────────────────────────────────────────────────────────

async function renderSone(
  text: string,
  fontSize: number,
  lineHeight: number | "default",
  fontEntry: FontEntry,
): Promise<Buffer> {
  let node = Text(text)
    .font(fontEntry.soneName)
    .size(fontSize)
    .color("black")
    .bg("white");
  if (lineHeight !== "default") node = node.lineHeight(lineHeight);

  const { canvas } = await sone(node).canvasWithMetadata();
  // @ts-expect-error skia-canvas toBuffer not in HTMLCanvasElement types
  return (canvas as HTMLCanvasElement).toBuffer("png", { density: 1 });
}

// ─── composite helper ──────────────────────────────────────────────────────────

const LABEL_H = 28;
const GAP = 4;
const PAD = 8;
const FONT_LABEL = "14px monospace";

function asNodeBuffer(data: Uint8Array): Buffer {
  return Buffer.isBuffer(data) ? data : Buffer.from(data);
}

async function composite(
  slug: string,
  browserPng: Uint8Array,
  sonePng: Uint8Array,
  meta: { text: string; fontSize: number; lineHeight: number | "default" },
): Promise<void> {
  const bImg = await loadImage(asNodeBuffer(browserPng));
  const sImg = await loadImage(asNodeBuffer(sonePng));

  const totalW = PAD + bImg.width + GAP + sImg.width + PAD;
  const totalH =
    PAD + LABEL_H + GAP + Math.max(bImg.height, sImg.height) + LABEL_H + PAD;

  const canvas = new Canvas(totalW, totalH);
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, totalW, totalH);

  // title label
  ctx.fillStyle = "#333";
  ctx.font = `bold ${FONT_LABEL}`;
  ctx.fillText(
    `"${meta.text.replace(/\n/g, "\\n")}"  size=${meta.fontSize}  lh=${meta.lineHeight === "default" ? "normal(browser) / 1.0(sone)" : meta.lineHeight}`,
    PAD,
    PAD + 18,
  );

  const imgY = PAD + LABEL_H + GAP;

  // browser image
  const bX = PAD;
  ctx.drawImage(bImg, bX, imgY);
  ctx.strokeStyle = "#0074D9";
  ctx.lineWidth = 2;
  ctx.strokeRect(bX, imgY, bImg.width, bImg.height);

  // sone image
  const sX = PAD + bImg.width + GAP;
  ctx.drawImage(sImg, sX, imgY);
  ctx.strokeStyle = "#FF4136";
  ctx.lineWidth = 2;
  ctx.strokeRect(sX, imgY, sImg.width, sImg.height);

  // sub-labels
  const labelY = imgY + Math.max(bImg.height, sImg.height) + 16;
  ctx.fillStyle = "#0074D9";
  ctx.font = FONT_LABEL;
  ctx.fillText(`browser  ${bImg.width}×${bImg.height}`, bX, labelY);
  ctx.fillStyle = "#FF4136";
  ctx.fillText(`sone     ${sImg.width}×${sImg.height}`, sX, labelY);

  // height delta indicator
  const delta = Math.abs(bImg.height - sImg.height);
  ctx.fillStyle = delta === 0 ? "#2ECC40" : delta <= 2 ? "#FF851B" : "#FF4136";
  ctx.font = `bold ${FONT_LABEL}`;
  ctx.fillText(`Δh = ${delta}px`, PAD, totalH - PAD - 4);

  const outPath = path.join(OUT_DIR, `lineheight-compare-${slug}.png`);
  await fs.writeFile(
    outPath,
    // @ts-expect-error skia-canvas toBuffer not in HTMLCanvasElement types
    await (canvas as HTMLCanvasElement).toBuffer("png", { density: 1 }),
  );
  console.log(`  saved ${path.basename(outPath)}  (Δh=${delta}px)`);
}

// ─── main ──────────────────────────────────────────────────────────────────────

console.log("Loading fonts for Sone...");
await loadVisualTestFonts();

console.log("Launching Chrome...");
const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  for (const tc of CASES) {
    console.log(`\n[${tc.slug}]`);

    const fontEntry = FONTS[tc.font];
    if (!fontEntry) throw new Error(`Unknown font: ${tc.font}`);

    // --- browser render ---
    const page = await browser.newPage();
    await page.setContent(
      buildHtml(tc.text, tc.fontSize, tc.lineHeight, fontEntry),
    );
    await page.evaluate(() => document.fonts.ready);
    const element = await page.$(".text");
    if (!element) throw new Error("element not found");
    const browserPng = asNodeBuffer(await element.screenshot({ type: "png" }));
    await page.close();

    // --- sone render ---
    const sonePng = await renderSone(
      tc.text,
      tc.fontSize,
      tc.lineHeight,
      fontEntry,
    );

    // --- composite ---
    await composite(tc.slug, browserPng, sonePng, tc);
  }
} finally {
  await browser.close();
}

console.log("\nDone. Images written to test/visual/");
