import type { Route } from './+types/blog';
import { Link } from 'react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { ArrowRight, Calendar } from 'lucide-react';
import { baseOptions } from '@/lib/layout.shared';
import { posts } from '@/lib/blog-posts';
import { Footer } from '@/components/footer';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Blog · Sone' },
    {
      name: 'description',
      content: 'Announcements, release notes, and writeups from the Sone team.',
    },
  ];
}

export default function Blog() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-col">
        <section className="border-b border-fd-border">
          <div className="mx-auto w-full max-w-4xl px-6 py-20">
            <div className="mb-12">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-fd-muted-foreground">
                The Sone blog
              </span>
              <h1 className="mt-2 text-4xl sm:text-5xl font-medium tracking-tight text-fd-foreground">
                Announcements & writeups
              </h1>
              <p className="mt-4 max-w-2xl text-fd-muted-foreground leading-relaxed">
                Release notes, deep-dives into how Sone is built, and case
                studies from teams shipping documents at scale.
              </p>
            </div>

            <ul className="divide-y divide-fd-border border-y border-fd-border">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`/blog/${p.slug}`}
                    className="flex items-center justify-between gap-6 py-6 group"
                  >
                    <div className="flex flex-col gap-1.5">
                      <span className="inline-flex items-center gap-2 text-xs text-fd-muted-foreground">
                        <Calendar className="size-3" />
                        {p.date}
                        <span aria-hidden>·</span>
                        <span>{p.readTime}</span>
                      </span>
                      <h2 className="text-lg sm:text-xl font-medium text-fd-foreground">
                        {p.title}
                      </h2>
                      <p className="text-sm text-fd-muted-foreground leading-relaxed max-w-2xl">
                        {p.excerpt}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <Footer />
      </main>
    </HomeLayout>
  );
}
