import {
  FileText,
  Type,
  Languages,
  Hash,
  Layers,
  Boxes,
  Zap,
  Code2,
  Grid3x3,
} from 'lucide-react';
import type { ReactNode } from 'react';

type Feature = {
  icon: ReactNode;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: <FileText className="size-5" />,
    title: 'Multi-page PDF',
    description:
      'Automatic page breaking, repeating headers and footers, page margins. Pages are just layout.',
  },
  {
    icon: <Type className="size-5" />,
    title: 'Rich text first-class',
    description:
      'Mixed-style spans, justification, decorations, drop shadows, and per-glyph gradients in a single Text node.',
  },
  {
    icon: <Languages className="size-5" />,
    title: 'Bidirectional & multilingual',
    description:
      'Automatic RTL detection for Arabic, Hebrew, mixed paragraphs. Custom font loading for any script.',
  },
  {
    icon: <Hash className="size-5" />,
    title: 'Hyphenation in 80+ languages',
    description:
      'Automatic syllable-aware word hyphenation via Knuth–Liang patterns. Composes with balanced wrap.',
  },
  {
    icon: <Layers className="size-5" />,
    title: 'Flexbox & CSS Grid',
    description:
      'Powered by yoga-layout — the same engine behind React Native. If you know CSS, you already know Sone.',
  },
  {
    icon: <Boxes className="size-5" />,
    title: 'Output anywhere',
    description:
      'Render to PNG, JPG, WebP, PDF, SVG, or raw Canvas. Same node tree, six formats.',
  },
  {
    icon: <Zap className="size-5" />,
    title: 'No browser, no Puppeteer',
    description:
      'Native Skia bindings. Images render in single-digit milliseconds, multi-page PDFs in tens of milliseconds.',
  },
  {
    icon: <Code2 className="size-5" />,
    title: 'Just JavaScript',
    description:
      'No JSX, no HTML, no transpiler. Plain function calls that work in Node.js, Deno, Bun, and the browser.',
  },
  {
    icon: <Grid3x3 className="size-5" />,
    title: 'YOLO / COCO datasets',
    description:
      'Tag any node and export the full layout as a YOLO or COCO bounding-box dataset for ML training.',
  },
];

export function FeaturesGrid() {
  return (
    <section className="bg-dot-grid border-b border-fd-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-sone-gradient">
            Built for real-world document generation
          </h2>
          <p className="mt-4 text-fd-muted-foreground leading-relaxed">
            HTML and CSS were built for the web — not for programmatic mass
            document generation. Sone gives you a typed, declarative API
            tailored for its rendering engine. No missing specs. No browser
            overhead.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-fd-border border border-fd-border">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-fd-background p-6 flex flex-col gap-3"
            >
              <div className="text-fd-foreground">{f.icon}</div>
              <h3 className="text-base font-medium text-fd-foreground">
                {f.title}
              </h3>
              <p className="text-sm text-fd-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
