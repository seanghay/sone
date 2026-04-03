/**
 * Sone performance benchmark
 *
 * Run:
 *   npx tsx test/benchmark.ts
 *   npx tsx test/benchmark.ts --iterations=50
 */

import { Column, Row, Span, sone, Text } from "../src/node.ts";

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).flatMap((arg) => {
    const [k, v] = arg.replace(/^--/, "").split("=");
    return v !== undefined ? [[k, v]] : [];
  }),
);
const ITERATIONS = Number(args.iterations ?? 20);

// ── Timer helpers ─────────────────────────────────────────────────────────────
function mean(samples: number[]) {
  return samples.reduce((a, b) => a + b, 0) / samples.length;
}

function stddev(samples: number[], avg: number) {
  return Math.sqrt(
    samples.reduce((a, b) => a + (b - avg) ** 2, 0) / samples.length,
  );
}

function p(samples: number[], pct: number) {
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.floor((pct / 100) * sorted.length);
  return sorted[Math.min(idx, sorted.length - 1)];
}

async function bench(
  label: string,
  fn: () => Promise<void>,
  iterations = ITERATIONS,
) {
  // warm-up
  await fn();

  const samples: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    await fn();
    samples.push(performance.now() - t0);
  }

  const avg = mean(samples);
  const sd = stddev(samples, avg);
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const p50 = p(samples, 50);
  const p95 = p(samples, 95);

  console.log(
    `${label.padEnd(40)} avg=${fmt(avg)} min=${fmt(min)} p50=${fmt(p50)} p95=${fmt(p95)} max=${fmt(max)} σ=${fmt(sd)}`,
  );
  return { label, avg, min, max, p50, p95, sd };
}

function fmt(ms: number) {
  return `${ms.toFixed(1).padStart(7)}ms`;
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

function simpleColumn() {
  return Column(
    Text("Hello, World!").size(24).weight("bold").color("black"),
    Text("Subtitle text").size(16).color("#555"),
    Row(Text("Left").flex(1).size(14), Text("Right").size(14)).padding(10),
  )
    .bg("white")
    .padding(20)
    .gap(8);
}

function richText() {
  const body =
    "The quick brown fox jumps over the lazy dog. " +
    "Pack my box with five dozen liquor jugs. " +
    "How vexingly quick daft zebras jump! ";

  return Column(
    Text(
      Span("Rich Text ").size(32).weight("bold").color("#1d1d1f"),
      Span("Rendering").size(32).weight("bold").color("#0071e3").underline(),
    ).lineHeight(1.2),
    Text(
      body.repeat(4),
      Span(" highlighted").highlight("yellow"),
      " and ",
      Span("colored").color("crimson").weight("bold"),
      " spans inline.",
    )
      .size(15)
      .lineHeight(1.6)
      .font("Inter")
      .align("justify")
      .maxWidth(700),
    Text(body.repeat(2))
      .size(13)
      .lineHeight(1.5)
      .color("#444")
      .lineBreak("knuth-plass")
      .maxWidth(700),
  )
    .bg("#f5f5f7")
    .padding(40)
    .gap(16)
    .width(780);
}

function deepNesting() {
  const cell = (label: string, value: string) =>
    Column(
      Text(label).size(9).color("#86868b").weight("bold"),
      Text(value).size(22).weight("bold").color("#1d1d1f"),
    )
      .padding(16)
      .flex(1)
      .gap(4);

  return Column(
    ...Array.from({ length: 8 }, (_, i) =>
      Row(
        cell(`METRIC ${i * 4 + 1}`, `${(Math.random() * 1000) | 0}`),
        cell(`METRIC ${i * 4 + 2}`, `${(Math.random() * 100).toFixed(1)}%`),
        cell(`METRIC ${i * 4 + 3}`, `${(Math.random() * 50) | 0} ms`),
        cell(`METRIC ${i * 4 + 4}`, `${(Math.random() * 10000) | 0}`),
      )
        .bg(i % 2 === 0 ? "white" : "#fafafa")
        .borderWidth(0, 0, 1, 0)
        .borderColor("#e5e5ea"),
    ),
  )
    .bg("white")
    .width(800);
}

function gradientAndShadow() {
  return Column(
    Text("Gradient Title")
      .size(48)
      .weight("bold")
      .color("linear-gradient(135deg, #667eea 0%, #764ba2 100%)")
      .dropShadow("4px 4px 0px rgba(0,0,0,0.3)")
      .alignSelf("center"),
    Text("Box shadow + gradient background")
      .size(18)
      .color("white")
      .bg("linear-gradient(135deg, #f093fb 0%, #f5576c 100%)")
      .shadow("0 8px 32px rgba(0,0,0,0.3)")
      .padding(24, 40)
      .rounded(16)
      .alignSelf("center"),
    Text("Stroke text")
      .size(56)
      .color("transparent")
      .strokeColor("#0071e3")
      .strokeWidth(2)
      .weight("bold")
      .alignSelf("center"),
  )
    .bg("#1c1c1e")
    .padding(60)
    .gap(24)
    .width(700);
}

function multiPage() {
  const section = (n: number) =>
    Column(
      Text(`Section ${n}`).size(20).weight("bold").color("#1d1d1f"),
      Text(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
          "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
          "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
      )
        .size(13)
        .lineHeight(1.7)
        .color("#444")
        .align("justify"),
    )
      .gap(10)
      .padding(20, 0);

  return Column(...Array.from({ length: 12 }, (_, i) => section(i + 1)))
    .bg("white")
    .padding(40)
    .width(600);
}

// ── Run benchmarks ────────────────────────────────────────────────────────────
console.log(`\nSone benchmark  (${ITERATIONS} iterations each)\n`);
console.log("=".repeat(90));

await bench("simple column → PNG", async () => {
  await sone(simpleColumn()).png();
});

await bench("rich text → PNG", async () => {
  await sone(richText()).png();
});

await bench("deep nesting (32 cells) → PNG", async () => {
  await sone(deepNesting()).png();
});

await bench("gradients + shadows → PNG", async () => {
  await sone(gradientAndShadow()).png();
});

await bench("multi-page (12 sections) → PNG pages", async () => {
  const root = multiPage();
  await sone(root, { pageHeight: 800 }).png();
});

await bench("simple column → JPG", async () => {
  await sone(simpleColumn()).jpg();
});

await bench("simple column → SVG", async () => {
  await sone(simpleColumn()).svg();
});

await bench("rich text → PDF (multi-page)", async () => {
  const root = multiPage();
  await sone(root, { pageHeight: 800 }).pdf();
});

console.log("=".repeat(90));
console.log("Done.\n");
