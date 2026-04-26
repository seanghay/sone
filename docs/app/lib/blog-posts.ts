// Static blog posts. To add a new post, append an entry below — slug is the
// URL fragment used at /blog/<slug>. Body is a list of typed blocks rather
// than markdown so the layout stays simple and SSR-friendly.

type Block =
  | { type: 'p'; html: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  body: Block[];
};

const p = (html: string): Block => ({ type: 'p', html });
const h2 = (text: string): Block => ({ type: 'h2', text });
const h3 = (text: string): Block => ({ type: 'h3', text });

export const posts: BlogPost[] = [
  {
    slug: 'announcing-sone-1-4',
    title: 'Announcing Sone 1.4 — multi-page PDFs, balanced wrap, and the Metadata API',
    excerpt:
      'Sone 1.4 ships first-class multi-page PDF rendering, balanced line wrapping for headlines, and a Metadata API that exports every laid-out node and segment as YOLO or COCO datasets.',
    date: 'April 26, 2026',
    readTime: '6 min read',
    body: [
      p(
        `It has been a busy quarter. Sone now ships <strong>multi-page PDFs</strong> as a first-class feature: pass <code>pageHeight</code> to the render config and your node tree is sliced into pages automatically. Headers and footers are ordinary nodes — pass them inline, or as a function that receives <code>{ pageNumber, totalPages }</code> for dynamic page chrome.`,
      ),
      p(
        `The <code>PageBreak()</code> node forces a break exactly where you want one, and <code>node.pageBreak("avoid")</code> hints the layout engine to keep a section together when there is room. Margins, last-page trimming, and per-page headers behave as you would expect from a real document engine.`,
      ),
      h2('Balanced line wrapping'),
      p(
        `Default text wrapping is greedy: each line takes as many words as fit, leaving the last line short and ragged. For headings, pull-quotes, and card titles, that looks awkward. <code>.textWrap("balance")</code> shrinks the effective break-width until all lines come out roughly equal, then sizes the node to the balanced content width — so it composes naturally inside a flex container.`,
      ),
      p(
        `Pair it with <code>.hyphenate("en")</code> for narrow-column body copy and you get tight, even-looking paragraphs without manual line breaks.`,
      ),
      h2('The Metadata API'),
      p(
        `Sone now exposes the <em>computed</em> layout of every node, line, and text segment. Call <code>sone(root).canvasWithMetadata()</code> and you get a tree with <code>x</code>, <code>y</code>, <code>width</code>, <code>height</code> and tag labels for every leaf. Useful for hit-testing, debug overlays, and post-processing.`,
      ),
      p(
        `The headline use-case is dataset generation. Tag any node with <code>.tag("title")</code> or <code>.tag("invoice-number")</code>, then pass the metadata to <code>toYoloDataset()</code> or <code>toCocoDataset()</code>. Out the other end you get bounding-box annotations matching your image — perfect for training Document Layout Analysis models on synthetic, perfectly-labeled data.`,
      ),
      h2('Bidirectional text and hyphenation'),
      p(
        `Bidirectional text now follows the Unicode Bidirectional Algorithm out of the box. Mixed-direction paragraphs (an LTR sentence with an inline RTL number) reorder correctly without any manual intervention. Override per-paragraph with <code>.baseDir()</code> on Text or per-span with <code>.textDir()</code> on Span.`,
      ),
      p(
        `Hyphenation now supports 80+ languages via Knuth–Liang patterns from the <code>hyphen</code> package. Pass <code>.hyphenate("de")</code> for German compound words, <code>.hyphenate("fr")</code> for French — most BCP-47-like locales work out of the box.`,
      ),
      h2("What's next"),
      p(
        `1.5 will focus on <strong>browser parity</strong>: a fully working <code>SoneRenderer</code> implementation backed by the standard Canvas API, so you can run Sone client-side for live preview UIs without wrapping your own platform shim.`,
      ),
      p(
        `If you are already using Sone in production, drop a note in the GitHub repo — we are collecting case studies and would love to feature yours.`,
      ),
    ],
  },
  {
    slug: 'why-not-puppeteer',
    title: 'Why we did not build Sone on top of Puppeteer',
    excerpt:
      'A short writeup on the trade-offs between headless browsers and a first-party layout engine, and why those trade-offs add up at scale.',
    date: 'April 12, 2026',
    readTime: '4 min read',
    body: [
      p(
        `Every project that needs to generate documents from code eventually faces the same question: do you spin up a headless Chrome and render HTML, or do you build a first-party rendering pipeline?`,
      ),
      p(
        `For one-off PDF exports the answer is almost always <em>headless Chrome</em>. The browser already speaks HTML and CSS fluently; you write the document like a webpage, screenshot it, and ship it. Done.`,
      ),
      p(
        `At scale the calculus changes. Each Chrome instance costs hundreds of megabytes of RAM and takes 100ms+ to render even a simple page. CDP traffic adds latency. Cold-starts hurt serverless functions. Hosted services like Browserless cost real money. And every CSS feature you reach for has a chance of behaving slightly differently across versions.`,
      ),
      p(
        `Sone takes a different bet: build the layout engine ourselves, on top of <a href="https://yogalayout.dev/">yoga-layout</a> (the same engine React Native uses) and <a href="https://skia-canvas.org/">skia-canvas</a> (native Skia bindings for Node). The API surface is exactly what the engine implements — there is no missing-CSS-spec problem because there is no CSS.`,
      ),
      p(
        `Render times drop into the single-digit-millisecond range for images and tens of milliseconds for multi-page PDFs. Memory stays flat. The same node tree renders to PNG, JPG, WebP, PDF, and SVG with no special modes.`,
      ),
      p(
        `It is not the right answer for everything. If your document is going to be edited as HTML by humans, headless browsers still win. But for invoices, OG images, certificates, and reports — programs talking to programs — Sone is dramatically faster, cheaper, and more predictable.`,
      ),
    ],
  },
];
