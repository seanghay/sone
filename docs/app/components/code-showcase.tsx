import {
  BarChart3,
  LayoutPanelTop,
  Quote,
  Receipt,
  Share2,
  Sparkles,
} from 'lucide-react';
import type {
  ShowcaseExample,
  ShowcaseIcon,
} from '@/lib/code-examples.server';

const ICONS = {
  Share2,
  Receipt,
  Sparkles,
  BarChart3,
  Quote,
  LayoutPanelTop,
} satisfies Record<ShowcaseIcon, unknown>;

function CodeFrame({ html }: { html: string }) {
  return (
    <div className="rounded-lg border border-fd-border bg-fd-card overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2 border-b border-fd-border px-4 py-2.5 shrink-0">
        <span className="size-2.5 rounded-full bg-fd-border" />
        <span className="size-2.5 rounded-full bg-fd-border" />
        <span className="size-2.5 rounded-full bg-fd-border" />
        <span className="ml-3 text-xs text-fd-muted-foreground font-mono">
          example.ts
        </span>
      </div>
      <div
        className="shiki-host flex-1 overflow-x-auto p-5 text-[12.5px] leading-6 font-mono"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function Preview({
  src,
  alt,
  ratio,
}: {
  src: string;
  alt: string;
  ratio?: string;
}) {
  return (
    <div
      className="rounded-lg border border-fd-border bg-fd-muted overflow-hidden flex items-center justify-center"
      style={{ aspectRatio: ratio ?? '4 / 3' }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export function CodeShowcase({ examples }: { examples: ShowcaseExample[] }) {
  return (
    <section className="bg-fd-muted/40 border-b border-fd-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-sone-gradient">
            Code in, document out
          </h2>
          <p className="mt-4 text-fd-muted-foreground leading-relaxed">
            Every snippet below was rendered by Sone into the image beside it.
            Same builders, no JSX, no CSS — composing nodes is the entire API.
          </p>
        </div>

        <div className="flex flex-col gap-16">
          {examples.map((ex, idx) => {
            const reverse = idx % 2 === 1;
            const Icon = ICONS[ex.icon] as React.ComponentType<{
              className?: string;
            }>;
            return (
              <div
                key={ex.title}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch"
              >
                <div
                  className={`flex flex-col gap-3 ${reverse ? 'lg:order-2' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center size-9 shrink-0 rounded-lg border border-fd-border bg-fd-card text-fd-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <h3 className="text-lg font-medium text-fd-foreground">
                        {ex.title}
                      </h3>
                      <p className="mt-1 text-sm text-fd-muted-foreground leading-relaxed">
                        {ex.description}
                      </p>
                    </div>
                  </div>
                  <CodeFrame html={ex.codeHtml} />
                </div>
                <div className={`flex ${reverse ? 'lg:order-1' : ''}`}>
                  <div className="w-full">
                    <Preview
                      src={ex.image}
                      alt={ex.imageAlt}
                      ratio={ex.imageRatio}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
