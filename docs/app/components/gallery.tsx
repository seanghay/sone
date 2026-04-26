type GalleryItem = {
  src: string;
  title: string;
  caption: string;
  source: string; // path inside the repo
};

const REPO = 'https://github.com/seanghay/sone/blob/main';

const items: GalleryItem[] = [
  {
    src: '/gallery/invoice.jpg',
    title: 'Invoice',
    caption: 'Header, line-items table, totals, and footer in one node tree.',
    source: 'examples/business-documents/invoice.ts',
  },
  {
    src: '/gallery/report.jpg',
    title: 'Report',
    caption: 'Section headings, mixed typography, charts, and signatures.',
    source: 'examples/business-documents/report.ts',
  },
  {
    src: '/gallery/quotation.jpg',
    title: 'Quotation',
    caption:
      'Itemized pricing with branded header — same render as the invoice.',
    source: 'examples/business-documents/quotation.ts',
  },
  {
    src: '/gallery/bank-statement.jpg',
    title: 'Bank statement',
    caption: 'Tabular transactions with running balances and categorization.',
    source: 'examples/business-documents/bank-statement.ts',
  },
  {
    src: '/gallery/resume-1.jpg',
    title: 'Resume',
    caption: 'Single-page document with mixed typography and tables.',
    source: 'test/visual/resume-1.ts',
  },
  {
    src: '/gallery/certificate-1.jpg',
    title: 'Certificate',
    caption: 'Centered hero typography with decorative paths.',
    source: 'test/visual/certificate-1.ts',
  },
  {
    src: '/gallery/pages-1-p1.jpg',
    title: 'Multi-page PDF',
    caption: 'Auto-paginated reports with repeating headers and footers.',
    source: 'test/visual/pages-1.ts',
  },
  {
    src: '/gallery/app-1.jpg',
    title: 'App UI',
    caption: 'Render mobile app screens — perfect for store screenshots.',
    source: 'test/visual/app-1.ts',
  },
  {
    src: '/gallery/table-span-combined.jpg',
    title: 'Tables',
    caption: 'Colspan, rowspan, custom borders, and cell spacing.',
    source: 'test/visual/table-span-combined.ts',
  },
  {
    src: '/gallery/grid-1.jpg',
    title: 'CSS Grid',
    caption: 'True 2D layout with explicit column and row tracks.',
    source: 'test/visual/grid-1.ts',
  },
  {
    src: '/gallery/list.jpg',
    title: 'Lists',
    caption: 'Ordered, unordered, and custom-marker lists with nesting.',
    source: 'test/visual/list.ts',
  },
  {
    src: '/gallery/text-styling-1.jpg',
    title: 'Text styling',
    caption: 'Mixed weights, decorations, and per-span colors.',
    source: 'test/visual/text-styling-1.ts',
  },
  {
    src: '/gallery/text-wrap-balance-1.jpg',
    title: 'Balanced wrapping',
    caption: 'Lines distribute to roughly equal widths — great for headings.',
    source: 'test/visual/text-wrap-balance-1.ts',
  },
  {
    src: '/gallery/text-hyphenation-1.jpg',
    title: 'Hyphenation',
    caption: 'Knuth–Liang hyphenation for 80+ languages.',
    source: 'test/visual/text-hyphenation-1.ts',
  },
  {
    src: '/gallery/tab-leader-1.jpg',
    title: 'Tab leaders',
    caption: 'Dot or dash leaders fill the gap between aligned columns.',
    source: 'test/visual/tab-leader-1.ts',
  },
  {
    src: '/gallery/text-orientation-1.jpg',
    title: 'Text orientation',
    caption: 'Rotate text 0°/90°/180°/270° while preserving flex layout.',
    source: 'test/visual/text-orientation-1.ts',
  },
  {
    src: '/gallery/bidi-mixed.jpg',
    title: 'Bidirectional text',
    caption: 'Mixed LTR/RTL paragraphs with auto-detected base direction.',
    source: 'test/visual/bidi-mixed.ts',
  },
  {
    src: '/gallery/path-gradient.jpg',
    title: 'Paths & gradients',
    caption: 'Render any SVG path with stroke, fill, and gradient color.',
    source: 'test/visual/path-gradient.ts',
  },
  {
    src: '/gallery/clip-group.jpg',
    title: 'Clip groups',
    caption: 'Mask any subtree to an arbitrary SVG path shape.',
    source: 'test/visual/clip-group.ts',
  },
  {
    src: '/gallery/photo-clip-path.jpg',
    title: 'Photo clipping',
    caption: 'Decorative photo masks for hero treatments and avatars.',
    source: 'test/visual/photo-clip-path.ts',
  },
  {
    src: '/gallery/text-clip-image.jpg',
    title: 'Text-clip image',
    caption: 'Use text glyphs as a mask over an image fill.',
    source: 'test/visual/text-clip-image.ts',
  },
  {
    src: '/gallery/shiki-1.jpg',
    title: 'Syntax highlighting',
    caption: 'Drop-in Shiki integration via the sone/shiki entry.',
    source: 'test/visual/shiki-1.ts',
  },
];

export function Gallery() {
  return (
    <section className="border-b border-fd-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-sone-gradient">
            What you can build
          </h2>
          <p className="mt-4 text-fd-muted-foreground leading-relaxed">
            A small sample of outputs from the test suite — click any tile to
            open its source on GitHub. Every image is generated programmatically
            — no headless browser, no HTML parsing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-fd-border border border-fd-border">
          {items.map((item) => (
            <a
              key={item.src}
              href={`${REPO}/${item.source}`}
              target="_blank"
              rel="noreferrer"
              className="group bg-fd-background p-4 flex flex-col gap-3 hover:bg-fd-accent/30 transition-colors"
            >
              <div className="aspect-[4/3] overflow-hidden bg-fd-muted">
                <img
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                />
              </div>
              <figcaption className="px-1">
                <div className="flex items-center gap-1.5 text-sm font-medium text-fd-foreground">
                  {item.title}
                  <svg
                    aria-hidden
                    className="size-3 text-fd-muted-foreground/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17 17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </div>
                <div className="text-xs text-fd-muted-foreground mt-1 leading-relaxed">
                  {item.caption}
                </div>
              </figcaption>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
