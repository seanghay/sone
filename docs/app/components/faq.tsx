import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';

type Item = { q: string; a: string };

const items: Item[] = [
  {
    q: 'What is Sone built for?',
    a: 'Programmatic document and image generation at scale: invoices, multi-page reports, resumes, certificates, Open Graph images, app UI snapshots — anything that needs to look good when rendered by a machine, repeatedly, at speed.',
  },
  {
    q: 'Why not Puppeteer or html-to-image?',
    a: 'Headless browsers carry hundreds of MB of memory and 100ms+ per render. HTML-to-PDF engines support only a fraction of CSS — missing features become silent layout breakage. Sone is a first-party, fully-typed layout API on top of yoga-layout and skia-canvas. The API surface is exactly what the engine supports.',
  },
  {
    q: 'Do I need a build step, JSX, or a compiler?',
    a: 'No. Sone is plain JavaScript function calls. No JSX, no HTML parser, no transpiler configuration. Works out of the box with `npm install sone` in Node.js, Deno, or Bun.',
  },
  {
    q: "Why doesn't Sone use a markup language?",
    a: "Markup decouples syntax from the engine that renders it — and that gap is where silent layout breakage lives. Sone's API surface is exactly what the engine supports: if a method exists, it works; if it doesn't, TypeScript tells you. Loops, conditionals, and helpers are just JavaScript — no template syntax to learn.",
  },
  {
    q: 'How does the layout system work?',
    a: 'Sone uses Flexbox as its primary model, powered by yoga-layout — the same engine behind React Native. If you know CSS Flexbox, you already know how to position elements in Sone. CSS Grid is also available for 2D layouts.',
  },
  {
    q: 'Can I generate multi-page PDFs?',
    a: 'Yes. Pass `pageHeight` to the render config and Sone slices your node tree across as many pages as needed. Add a `header` and `footer` to the same config for repeating page chrome — both can be functions that receive `{ pageNumber, totalPages }`. PageBreak() forces explicit breaks.',
  },
  {
    q: 'Does Sone support advanced typography?',
    a: 'Yes — bidirectional text (Arabic, Hebrew, mixed paragraphs), automatic hyphenation in 80+ languages, balanced line wrapping, tab stops with leaders, text orientation at 0°/90°/180°/270°, mixed-style spans, justification, decorations, drop shadows, and per-glyph gradients.',
  },
  {
    q: 'What output formats are supported?',
    a: 'PNG, JPG, WebP, PDF, SVG, raw Canvas, raw pixel buffer. The same node tree renders to any of them via `sone(root).png()`, `.pdf()`, etc.',
  },
  {
    q: 'What environments does Sone support?',
    a: 'Node.js 16+, Deno, and Bun for full server-side rendering. The browser entry supports PNG/JPG/WebP via the standard Canvas API; PDF and SVG output require the Node.js renderer.',
  },
  {
    q: 'What are YOLO and COCO dataset exports?',
    a: 'Sone exposes the computed layout of every node, line, and text segment via the Metadata API. `toYoloDataset()` and `toCocoDataset()` turn that into ML-friendly bounding-box datasets for training Document Layout Analysis or OCR models on synthetic data.',
  },
  {
    q: 'Can I use Sone with Next.js?',
    a: 'Yes. Externalize `skia-canvas` so the bundler does not try to inline the native binary. See the Installation page for the exact `next.config.ts` snippet.',
  },
];

export function Faq() {
  return (
    <section className="border-b border-fd-border">
      <div className="mx-auto w-full max-w-4xl px-6 py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-fd-foreground">
            Frequently asked
          </h2>
          <p className="mt-4 text-fd-muted-foreground leading-relaxed">
            Common questions about what Sone solves and how it fits into a
            document pipeline.
          </p>
        </div>

        <Accordions type="single" collapsible defaultValue={items[0].q}>
          {items.map((item) => (
            <Accordion key={item.q} title={item.q} value={item.q}>
              <div className="text-sm text-fd-muted-foreground leading-relaxed">
                {item.a}
              </div>
            </Accordion>
          ))}
        </Accordions>
      </div>
    </section>
  );
}
