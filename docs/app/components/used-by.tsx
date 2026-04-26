type User = {
  name: string;
  url: string;
  logo: string;
};

const users: User[] = [
  {
    name: 'KhmerCoders',
    url: 'https://khmercoder.com',
    logo: 'https://khmercoder.com/logo.svg',
  },
  {
    name: 'KhmerDict',
    url: 'https://khmerdict.com',
    logo: 'https://khmerdict.com/apple-icon-144x144.png',
  },
];

// Render an even number of full sets back-to-back. The animation translates
// the whole strip by -50% of its width, landing at the start of the second
// half — which is identical content, so the wrap-around is invisible.
//
// We render more copies than strictly needed (6 sets here) so the strip is
// wider than 2× the viewport on any screen size — that way the visible
// window always sees continuous content, never empty space at the trailing
// edge of the last copy.
const REPEATS = 6;
const SEQUENCE = Array.from({ length: REPEATS }, () => users).flat();

export function UsedBy() {
  return (
    <section className="border-b border-fd-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-6 text-center">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-fd-muted-foreground">
            Used by
          </span>
        </div>

        <div
          className="relative overflow-hidden"
          style={{
            maskImage:
              'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          }}
        >
          <div className="flex w-max animate-marquee py-2">
            {SEQUENCE.map((u, i) => (
              <a
                key={`${i}-${u.name}`}
                href={u.url}
                target="_blank"
                rel="noreferrer"
                aria-hidden={i >= users.length}
                aria-label={i < users.length ? u.name : undefined}
                className="group inline-flex items-center gap-2 shrink-0 me-12 opacity-60 hover:opacity-100 transition-opacity"
              >
                <img
                  src={u.logo}
                  alt={i < users.length ? u.name : ''}
                  width={24}
                  height={24}
                  loading="lazy"
                  className="size-6 grayscale group-hover:grayscale-0 transition"
                />
                <span className="text-xs font-medium text-fd-muted-foreground group-hover:text-fd-foreground transition-colors">
                  {u.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
