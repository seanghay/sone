import { Link } from 'react-router';
import { ArrowRight, Github } from 'lucide-react';
import { CopyCommand } from './copy-command';
import { HeroParticles } from './hero-particles';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-fd-border">
      {/* Subtle radial gradient backdrop — adapts to theme via CSS variables */}
      <div
        aria-hidden
        className="hero-glow pointer-events-none absolute inset-0 -z-10"
      />
      <HeroParticles />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-fd-border to-transparent -z-10"
      />
      <div className="relative mx-auto w-full max-w-5xl px-6 py-24 sm:py-32 flex flex-col items-center text-center">
        <img
          src="/sone.svg"
          alt="Sone"
          width={64}
          height={75}
          className="mb-8 h-16 w-auto"
        />
        <h1 className="text-5xl sm:text-6xl font-medium tracking-tight text-fd-foreground">
          Sone
        </h1>
        <p className="mt-6 max-w-2xl text-xl sm:text-2xl text-fd-foreground leading-snug font-medium tracking-tight">
          A layout engine for image generation in JavaScript. Compose images
          like you write components.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/docs/getting-started/install"
            className="inline-flex items-center gap-2 rounded-full bg-fd-primary text-fd-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
          <a
            href="https://github.com/seanghay/sone"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card text-fd-card-foreground px-5 py-2.5 text-sm font-medium hover:bg-fd-accent hover:text-fd-accent-foreground transition-colors"
          >
            <Github className="size-4" />
            GitHub
          </a>
        </div>

        <div className="mt-10">
          <CopyCommand value="npm install sone" />
        </div>
      </div>
    </section>
  );
}
