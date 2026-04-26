type Mapping = { tw: string; sone: string };

const mappings: { group: string; rows: Mapping[] }[] = [
  {
    group: 'Layout',
    rows: [
      { tw: 'flex flex-col', sone: 'Column(...)' },
      { tw: 'flex flex-row', sone: 'Row(...)' },
      { tw: 'grid', sone: 'Grid(...)' },
      { tw: 'gap-3', sone: '.gap(12)' },
      { tw: 'flex-1', sone: '.flex(1)' },
      { tw: 'items-center', sone: '.alignItems("center")' },
      { tw: 'justify-between', sone: '.justifyContent("space-between")' },
    ],
  },
  {
    group: 'Spacing',
    rows: [
      { tw: 'p-6', sone: '.padding(24)' },
      { tw: 'px-4 py-2', sone: '.padding(8, 16)' },
      { tw: 'pt-4', sone: '.paddingTop(16)' },
      { tw: 'm-4', sone: '.margin(16)' },
      { tw: 'mt-2', sone: '.marginTop(8)' },
    ],
  },
  {
    group: 'Sizing',
    rows: [
      { tw: 'w-full', sone: '.width("100%")' },
      { tw: 'w-96', sone: '.width(384)' },
      { tw: 'max-w-sm', sone: '.maxWidth(384)' },
      { tw: 'h-screen', sone: '.height("100vh")' },
    ],
  },
  {
    group: 'Typography',
    rows: [
      { tw: 'text-xl', sone: '.size(20)' },
      { tw: 'font-bold', sone: '.weight("bold")' },
      { tw: 'font-medium', sone: '.weight(500)' },
      { tw: 'leading-relaxed', sone: '.lineHeight(1.55)' },
      { tw: 'tracking-tight', sone: '.letterSpacing(-0.4)' },
      { tw: 'text-center', sone: '.align("center")' },
      { tw: 'underline', sone: '.underline()' },
    ],
  },
  {
    group: 'Color',
    rows: [
      { tw: 'text-white', sone: '.color("white")' },
      { tw: 'text-zinc-500', sone: '.color("#71717a")' },
      { tw: 'bg-black', sone: '.bg("black")' },
      { tw: 'bg-gradient-to-r ...', sone: '.bg("linear-gradient(90deg, ...)")' },
    ],
  },
  {
    group: 'Borders & shadow',
    rows: [
      { tw: 'rounded-lg', sone: '.rounded(8)' },
      { tw: 'rounded-full', sone: '.rounded(9999)' },
      { tw: 'border', sone: '.borderWidth(1)' },
      { tw: 'border-zinc-200', sone: '.borderColor("#e4e4e7")' },
      { tw: 'shadow-md', sone: '.shadow("0 4px 6px rgba(0,0,0,0.1)")' },
      { tw: 'opacity-50', sone: '.opacity(0.5)' },
    ],
  },
];

function CodeFrame({
  filename,
  html,
}: {
  filename: string;
  html: string;
}) {
  return (
    <div className="rounded-lg border border-fd-border bg-fd-card overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2 border-b border-fd-border px-4 py-2.5 shrink-0">
        <span className="size-2.5 rounded-full bg-fd-border" />
        <span className="size-2.5 rounded-full bg-fd-border" />
        <span className="size-2.5 rounded-full bg-fd-border" />
        <span className="ml-3 text-xs text-fd-muted-foreground font-mono">
          {filename}
        </span>
      </div>
      <div
        className="shiki-host flex-1 overflow-x-auto p-5 text-[12.5px] leading-6 font-mono"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export function TailwindBridge({
  tailwindHtml,
  soneHtml,
}: {
  tailwindHtml: string;
  soneHtml: string;
}) {
  return (
    <section className="border-b border-fd-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-fd-muted-foreground">
            For Tailwind users
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-sone-gradient">
            If you know Tailwind, you already know Sone
          </h2>
          <p className="mt-4 text-fd-muted-foreground leading-relaxed">
            Same vocabulary, same flexbox model — just method calls instead of
            class strings. The card on the left and the card on the right
            render to identical pixels.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12 items-stretch">
          <CodeFrame filename="Card.tsx" html={tailwindHtml} />
          <CodeFrame filename="Card.ts" html={soneHtml} />
        </div>

        <div className="rounded-lg border border-fd-border bg-fd-background overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-fd-border px-4 py-2">
            <span className="text-xs font-medium text-fd-foreground">
              Cheat sheet
            </span>
            <span className="text-[10px] text-fd-muted-foreground">
              Tailwind class &nbsp;→&nbsp; Sone method
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x-0 md:divide-x lg:divide-x divide-fd-border">
            {mappings.map((g) => (
              <div
                key={g.group}
                className="flex flex-col border-t md:border-t-0 first:border-t-0 border-fd-border"
              >
                <div className="px-4 pt-3 pb-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-fd-muted-foreground">
                  {g.group}
                </div>
                <div className="px-4 pb-3 flex flex-col gap-0.5">
                  {g.rows.map((r) => (
                    <div
                      key={r.tw + r.sone}
                      className="grid grid-cols-[1fr_12px_1fr] items-center gap-1.5 text-[11px] leading-[1.7]"
                    >
                      <code className="text-fd-muted-foreground font-mono truncate">
                        {r.tw}
                      </code>
                      <span
                        aria-hidden
                        className="text-fd-muted-foreground/40 text-center"
                      >
                        →
                      </span>
                      <code className="text-fd-foreground font-mono truncate">
                        {r.sone}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs text-fd-muted-foreground text-center">
          Want the full method list?{' '}
          <a
            href="/docs/layout/flexbox"
            className="text-fd-foreground underline underline-offset-4"
          >
            Browse the layout reference →
          </a>
        </p>
      </div>
    </section>
  );
}
