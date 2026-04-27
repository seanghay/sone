import { TypeTable } from 'fumadocs-ui/components/type-table';
import data from '@/lib/api-types.generated.json';

type Property = {
  name: string;
  type: string;
  description: string;
  required: boolean;
  deprecated: boolean;
  default?: string;
};

type TypeBlock = {
  name: string;
  description: string;
  properties: Property[];
};

type Group = {
  title: string;
  description: string;
  types: TypeBlock[];
};

const groups = data as Group[];

function toRecord(properties: Property[]) {
  const out: Record<
    string,
    {
      description: string;
      type: string;
      default?: string;
      required?: boolean;
      deprecated?: boolean;
    }
  > = {};
  for (const p of properties) {
    out[p.name] = {
      description: p.description,
      type: p.type,
      default: p.default,
      required: p.required || undefined,
      deprecated: p.deprecated || undefined,
    };
  }
  return out;
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ApiReference() {
  return (
    <div className="flex flex-col gap-12">
      {groups.map((group) => (
        <section
          key={group.title}
          id={slug(group.title)}
          className="flex flex-col gap-4 scroll-mt-24"
        >
          <header className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold tracking-tight text-fd-foreground">
              {group.title}
            </h2>
            <p className="text-sm text-fd-muted-foreground leading-relaxed">
              {group.description}
            </p>
          </header>

          {group.types.map((type) => (
            <div
              key={type.name}
              id={slug(type.name)}
              className="flex flex-col gap-3 scroll-mt-24"
            >
              <div className="flex flex-col gap-0.5">
                <h3 className="text-base font-mono font-semibold text-fd-foreground">
                  {type.name}
                </h3>
                {type.description ? (
                  <p className="text-sm text-fd-muted-foreground leading-relaxed">
                    {type.description}
                  </p>
                ) : null}
              </div>
              {type.properties.length > 0 ? (
                <TypeTable type={toRecord(type.properties)} />
              ) : (
                <p className="text-xs text-fd-muted-foreground italic">
                  No public properties.
                </p>
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

export function ApiReferenceToc() {
  return (
    <nav className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
      {groups.map((group) => (
        <a
          key={group.title}
          href={`#${slug(group.title)}`}
          className="group block rounded-md border border-transparent px-3 py-2 hover:border-fd-border hover:bg-fd-accent/40 transition-colors no-underline [&]:no-underline"
        >
          <span className="block font-medium text-fd-foreground">
            {group.title}
          </span>
          <span className="block text-xs text-fd-muted-foreground/80 font-mono mt-0.5 truncate">
            {group.types.map((t) => t.name).join(' · ')}
          </span>
        </a>
      ))}
    </nav>
  );
}
