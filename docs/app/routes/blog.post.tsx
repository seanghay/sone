import type { Route } from './+types/blog.post';
import { Link } from 'react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { ArrowLeft, Calendar } from 'lucide-react';
import { baseOptions } from '@/lib/layout.shared';
import { posts } from '@/lib/blog-posts';
import { Footer } from '@/components/footer';

export async function loader({ params }: Route.LoaderArgs) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) throw new Response('Not found', { status: 404 });
  return { post };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: 'Post not found · Sone' }];
  return [
    { title: `${data.post.title} · Sone Blog` },
    { name: 'description', content: data.post.excerpt },
  ];
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData;
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-col">
        <article className="border-b border-fd-border">
          <div className="mx-auto w-full max-w-3xl px-6 py-20">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground hover:text-fd-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              All posts
            </Link>
            <header className="mt-8 flex flex-col gap-4 border-b border-fd-border pb-10">
              <span className="inline-flex items-center gap-2 text-xs text-fd-muted-foreground">
                <Calendar className="size-3" />
                {post.date}
                <span aria-hidden>·</span>
                <span>{post.readTime}</span>
              </span>
              <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-fd-foreground leading-[1.1]">
                {post.title}
              </h1>
              <p className="text-lg text-fd-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            </header>
            <div className="prose prose-invert mt-10 max-w-none [&>p]:text-fd-muted-foreground [&>p]:leading-relaxed [&>p]:my-5 [&>h2]:text-2xl [&>h2]:font-medium [&>h2]:text-fd-foreground [&>h2]:mt-12 [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-medium [&>h3]:text-fd-foreground [&>h3]:mt-8 [&>h3]:mb-2 [&_a]:text-fd-foreground [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-fd-card [&_code]:border [&_code]:border-fd-border [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em]">
              {post.body.map((block, i) => {
                if (block.type === 'h2') {
                  return <h2 key={i}>{block.text}</h2>;
                }
                if (block.type === 'h3') {
                  return <h3 key={i}>{block.text}</h3>;
                }
                return (
                  <p
                    key={i}
                    dangerouslySetInnerHTML={{ __html: block.html ?? '' }}
                  />
                );
              })}
            </div>
          </div>
        </article>
        <Footer />
      </main>
    </HomeLayout>
  );
}
