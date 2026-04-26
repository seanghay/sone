export function CodeBlock({ html }: { html: string }) {
  return (
    <section className="bg-fd-muted/40 border-b border-fd-border">
      <div className="mx-auto w-full max-w-5xl px-6 py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-sone-gradient">
            Just JavaScript. No JSX, no HTML.
          </h2>
          <p className="mt-4 text-fd-muted-foreground leading-relaxed">
            Plain function calls that work anywhere JavaScript runs. Compose
            nodes like <code className="text-fd-foreground">Column</code>,{' '}
            <code className="text-fd-foreground">Row</code>,{' '}
            <code className="text-fd-foreground">Text</code>,{' '}
            <code className="text-fd-foreground">Photo</code> — Sone figures
            out where everything goes.
          </p>
        </div>

        <div className="rounded-lg border border-fd-border bg-fd-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-fd-border px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-fd-border" />
            <span className="size-2.5 rounded-full bg-fd-border" />
            <span className="size-2.5 rounded-full bg-fd-border" />
            <span className="ml-3 text-xs text-fd-muted-foreground font-mono">
              hello.ts
            </span>
          </div>
          <div
            className="shiki-host overflow-x-auto p-5 text-[13px] leading-6 font-mono"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </section>
  );
}
