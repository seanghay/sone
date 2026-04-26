import {
  BookOpen,
  Check,
  Info,
  Minus,
  Share2,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { ComponentType } from 'react';

type Tool = 'sone' | 'takumi' | 'satori' | 'plutobook';

const tools: { key: Tool; name: string; tag: string; href: string }[] = [
  {
    key: 'sone',
    name: 'Sone',
    tag: 'this library',
    href: 'https://github.com/seanghay/sone',
  },
  {
    key: 'takumi',
    name: 'Takumi',
    tag: 'Rust renderer',
    href: 'https://takumi.kane.tw/',
  },
  {
    key: 'satori',
    name: 'Satori',
    tag: 'Vercel',
    href: 'https://github.com/vercel/satori',
  },
  {
    key: 'plutobook',
    name: 'PlutoBook',
    tag: 'HTML → PDF',
    href: 'https://github.com/plutoprint/plutobook',
  },
];

type Cell = boolean | string;

type Row = {
  feature: string;
  values: Record<Tool, Cell>;
};

const rows: Row[] = [
  {
    feature: 'API',
    values: {
      sone: 'Plain JS function calls',
      takumi: 'JSX (HTML + CSS subset)',
      satori: 'JSX (HTML + CSS subset)',
      plutobook: 'HTML + CSS document',
    },
  },
  {
    feature: 'Renderer',
    values: {
      sone: 'skia-canvas (native Skia)',
      takumi: 'Rust + WGPU/Skia',
      satori: 'SVG → resvg / Sharp',
      plutobook: 'C++ + Cairo',
    },
  },
  {
    feature: 'JS / TS API',
    values: {
      sone: true,
      takumi: true,
      satori: true,
      plutobook: 'Node.js, C++, Python',
    },
  },
  {
    feature: 'Build step required',
    values: { sone: false, takumi: 'JSX', satori: 'JSX', plutobook: false },
  },
  {
    feature: 'Image output (PNG / JPG / WebP)',
    values: {
      sone: true,
      takumi: true,
      satori: 'PNG via post-render',
      plutobook: 'PNG only',
    },
  },
  {
    feature: 'PDF output',
    values: {
      sone: 'multi-page, headers, footers',
      takumi: false,
      satori: false,
      plutobook: 'core feature',
    },
  },
  {
    feature: 'SVG output',
    values: {
      sone: true,
      takumi: false,
      satori: 'native format',
      plutobook: false,
    },
  },
  {
    feature: 'CSS Grid',
    values: { sone: true, takumi: false, satori: false, plutobook: true },
  },
  {
    feature: 'Flexbox layout',
    values: {
      sone: 'yoga-layout',
      takumi: true,
      satori: 'yoga-layout',
      plutobook: true,
    },
  },
  {
    feature: 'Bidirectional text (RTL)',
    values: {
      sone: 'auto, full UBA',
      takumi: 'limited',
      satori: 'limited',
      plutobook: true,
    },
  },
  {
    feature: 'Hyphenation',
    values: {
      sone: '80+ languages',
      takumi: false,
      satori: false,
      plutobook: 'CSS hyphens',
    },
  },
  {
    feature: 'Balanced line wrapping',
    values: { sone: true, takumi: false, satori: false, plutobook: false },
  },
  {
    feature: 'Tab stops & leaders',
    values: { sone: true, takumi: false, satori: false, plutobook: 'via CSS' },
  },
  {
    feature: 'Custom font loading',
    values: { sone: true, takumi: true, satori: true, plutobook: true },
  },
  {
    feature: 'Layout metadata (bboxes)',
    values: {
      sone: 'YOLO / COCO export',
      takumi: false,
      satori: false,
      plutobook: false,
    },
  },
  {
    feature: 'Browser runtime',
    values: {
      sone: 'PNG / JPG / WebP',
      takumi: false,
      satori: 'PNG / SVG',
      plutobook: false,
    },
  },
  {
    feature: 'Edge runtime',
    values: {
      sone: false,
      takumi: true,
      satori: true,
      plutobook: false,
    },
  },
];

const bestFor: Record<
  Tool,
  { icon: ComponentType<{ className?: string }>; label: string; copy: string }
> = {
  sone: {
    icon: Sparkles,
    label: 'Documents at scale',
    copy:
      'Invoices, reports, resumes, multi-page PDFs, and OG images on Node servers — first-class typography and pagination.',
  },
  takumi: {
    icon: Zap,
    label: 'Edge-fast OG images',
    copy:
      'Very fast OG images and dynamic banners on edge runtimes where Rust binaries are available.',
  },
  satori: {
    icon: Share2,
    label: 'JSX-native social cards',
    copy:
      'Edge-friendly OG images with familiar JSX + CSS — the lowest-friction option if you already write React.',
  },
  plutobook: {
    icon: BookOpen,
    label: 'Print-quality PDFs',
    copy:
      'Print-perfect PDFs from existing HTML/CSS templates — Node.js, Python, and C++ bindings cover most pipelines.',
  },
};

function CellValue({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1 text-fd-foreground">
        <Check className="size-3 text-emerald-500" aria-hidden />
        <span className="sr-only">Yes</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1 text-fd-muted-foreground/60">
        <Minus className="size-3" aria-hidden />
        <span className="sr-only">No</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <Check className="size-3 text-emerald-500 shrink-0" aria-hidden />
      <span className="text-[11px] text-fd-foreground">{value}</span>
    </span>
  );
}

export function Comparison() {
  return (
    <section className="bg-dot-grid border-b border-fd-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-6 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-fd-foreground">
            How Sone compares
          </h2>
          <p className="mt-4 text-fd-muted-foreground leading-relaxed">
            Sone, Takumi, Vercel Satori, and PlutoBook all turn code (or
            HTML/CSS) into images and PDFs, but they make different trade-offs.
            Pick by what you're shipping.
          </p>
        </div>
        <div className="mb-10 inline-flex items-start gap-2 rounded-md border border-fd-border bg-fd-card px-3 py-2 text-xs text-fd-muted-foreground">
          <Info className="size-3.5 mt-0.5 shrink-0" aria-hidden />
          <span>
            This table was generated with AI assistance. Some details may be
            outdated or wrong — check each project's docs before deciding.
            Spot a mistake?{' '}
            <a
              href="https://github.com/seanghay/sone/issues/new"
              target="_blank"
              rel="noreferrer"
              className="text-fd-foreground underline underline-offset-4"
            >
              File an issue.
            </a>
          </span>
        </div>

        <div className="w-full max-w-full overflow-x-auto rounded-lg border border-fd-border bg-fd-background">
          <table className="w-max min-w-full text-xs">
            <thead>
              <tr className="border-b border-fd-border bg-fd-card">
                <th className="text-left px-3 py-2 font-medium text-fd-muted-foreground w-1/3 whitespace-nowrap">
                  Feature
                </th>
                {tools.map((t) => (
                  <th
                    key={t.key}
                    className="text-left px-3 py-2 font-medium text-fd-foreground whitespace-nowrap"
                  >
                    <a
                      href={t.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-col"
                    >
                      <span className="text-[13px]">{t.name}</span>
                      <span className="text-[10.5px] font-normal text-fd-muted-foreground">
                        {t.tag}
                      </span>
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={r.feature}
                  className={
                    idx % 2 === 1
                      ? 'border-t border-fd-border bg-fd-card/40'
                      : 'border-t border-fd-border'
                  }
                >
                  <td className="px-3 py-2 font-semibold text-fd-foreground whitespace-nowrap">
                    {r.feature}
                  </td>
                  {tools.map((t) => (
                    <td key={t.key} className="px-3 py-2 align-top">
                      <CellValue value={r.values[t.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((t) => {
            const { icon: Icon, label, copy } = bestFor[t.key];
            return (
              <div
                key={t.key}
                className="rounded-lg border border-fd-border bg-fd-card p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-5 shrink-0 text-fd-foreground" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-fd-muted-foreground">
                      Best for
                    </div>
                    <div className="text-sm font-medium text-fd-foreground truncate">
                      {t.name}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-fd-foreground">
                    {label}
                  </div>
                  <p className="mt-1 text-xs text-fd-muted-foreground leading-relaxed">
                    {copy}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
