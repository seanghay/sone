import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="border-t border-fd-border bg-fd-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src="/sone.svg" alt="Sone" className="h-6 w-auto" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-fd-foreground">Sone</span>
            <span className="text-xs text-fd-muted-foreground">
              Apache-2.0 — © {new Date().getFullYear()} Seanghay Yath
            </span>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-6 text-sm text-fd-muted-foreground">
          <Link to="/docs" className="hover:text-fd-foreground transition-colors">
            Documentation
          </Link>
          <a
            href="https://github.com/seanghay/sone"
            target="_blank"
            rel="noreferrer"
            className="hover:text-fd-foreground transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/sone"
            target="_blank"
            rel="noreferrer"
            className="hover:text-fd-foreground transition-colors"
          >
            npm
          </a>
          <a
            href="https://github.com/seanghay/sone/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
            className="hover:text-fd-foreground transition-colors"
          >
            License
          </a>
        </nav>
      </div>
    </footer>
  );
}
