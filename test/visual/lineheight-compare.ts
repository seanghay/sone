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

// Embed the woff2 as base64 so the browser page can load it without a server.
const fontBase64 = (
  await fs.readFile(relative("../font/GeistMono-Regular.woff2"))
).toString("base64");

// ─── test cases ────────────────────────────────────────────────────────────────

const CASES = [
  {
    slug: "single-line-lh1",
    text: "Hello World",
    fontSize: 20,
    lineHeight: 1.0,
  },
  {
    slug: "single-line-lh1.2",
    text: "Hello World",
    fontSize: 20,
    lineHeight: 1.2,
  },
  {
    slug: "single-line-lh1.5",
    text: "Hello World",
    fontSize: 20,
    lineHeight: 1.5,
  },
  {
    slug: "multiline-lh1.2",
    text: "Hello World\nLine two here\nLine three",
    fontSize: 20,
    lineHeight: 1.2,
  },
  {
    slug: "multiline-lh1.5",
    text: "Hello World\nLine two here\nLine three",
    fontSize: 20,
    lineHeight: 1.5,
  },
  {
    slug: "large-font-lh1.2",
    text: "The quick brown fox\njumps over the lazy dog",
    fontSize: 36,
    lineHeight: 1.2,
  },
  {
    slug: "large-font-lh1.5",
    text: "The quick brown fox\njumps over the lazy dog",
    fontSize: 36,
    lineHeight: 1.5,
  },
  {
    slug: "small-font-lh1.2",
    text: "pack my box with\nfive dozen liquor jugs",
    fontSize: 14,
    lineHeight: 1.2,
  },
  {
    slug: "small-font-lh2",
    text: "pack my box with\nfive dozen liquor jugs",
    fontSize: 14,
    lineHeight: 2.0,
  },
];

// ─── browser helper ────────────────────────────────────────────────────────────

function buildHtml(text: string, fontSize: number, lineHeight: number): string {
  // Use <br> for newlines; white-space:pre for spacing.
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'GeistMono';
    src: url('data:font/woff2;base64,${fontBase64}') format('woff2');
    font-weight: normal;
    font-style: normal;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: white; }
  .text {
    font-family: 'GeistMono', monospace;
    font-size: ${fontSize}px;
    line-height: ${lineHeight};
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
  lineHeight: number,
): Promise<Buffer> {
  const root = Text(text)
    .font("GeistMono")
    .size(fontSize)
    .lineHeight(lineHeight)
    .color("black")
    .bg("white");

  const { canvas } = await sone(root).canvasWithMetadata();
  // @ts-expect-error skia-canvas buffer API
  return canvas.toBuffer("png", { density: 1 });
}

// ─── composite helper ──────────────────────────────────────────────────────────

const LABEL_H = 28;
const GAP = 4;
const PAD = 8;
const FONT_LABEL = "14px monospace";

async function composite(
  slug: string,
  browserPng: Buffer,
  sonePng: Buffer,
  meta: { text: string; fontSize: number; lineHeight: number },
): Promise<void> {
  const bImg = await loadImage(browserPng);
  const sImg = await loadImage(sonePng);

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
    `"${meta.text.replace(/\n/g, "\\n")}"  size=${meta.fontSize}  lh=${meta.lineHeight}`,
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
  // @ts-expect-error skia-canvas buffer API
  await fs.writeFile(outPath, await canvas.toBuffer("png", { density: 1 }));
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

    // --- browser render ---
    const page = await browser.newPage();
    await page.setContent(buildHtml(tc.text, tc.fontSize, tc.lineHeight));
    // wait for @font-face to finish loading
    await page.evaluate(() => document.fonts.ready);
    const element = await page.$(".text");
    if (!element) throw new Error("element not found");
    const browserPng = (await element.screenshot({ type: "png" })) as Buffer;
    await page.close();

    // --- sone render ---
    const sonePng = await renderSone(tc.text, tc.fontSize, tc.lineHeight);

    // --- composite ---
    await composite(tc.slug, browserPng, sonePng, tc);
  }
} finally {
  await browser.close();
}

console.log("\nDone. Images written to test/visual/");
