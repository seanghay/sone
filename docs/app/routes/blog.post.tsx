import type { Route } from './+types/blog.post';
import { Link } from 'react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { ArrowLeft, Calendar } from 'lucide-react';
import { baseOptions } from '@/lib/layout.shared';
import { posts } from '@/lib/blog-posts';
import { Footer } from '@/components/footer';
import {
  absoluteUrl,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_TYPE,
  OG_IMAGE_WIDTH,
  SITE_LOCALE,
  SITE_NAME,
} from '@/lib/site';

export async function loader({ params }: Route.LoaderArgs) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) throw new Response('Not found', { status: 404 });
  return { post };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: 'Post not found · Sone' }];
  const { post } = data;
  const title = `${post.title} · Sone Blog`;
  const description = post.excerpt;
  // Blog posts share the home OG card for now. When we add per-post OG
  // generation, swap this for absoluteUrl(`/og/blog/${post.slug}.jpg`).
  const ogImage = absoluteUrl('/og.jpg');
  const canonical = absoluteUrl(`/blog/${post.slug}`);
  const tagTags =
    post.tags?.map((tag) => ({ property: 'article:tag', content: tag })) ?? [];
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:locale', content: SITE_LOCALE },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:secure_url', content: ogImage },
    { property: 'og:image:type', content: OG_IMAGE_TYPE },
    { property: 'og:image:width', content: String(OG_IMAGE_WIDTH) },
    { property: 'og:image:height', content: String(OG_IMAGE_HEIGHT) },
    { property: 'og:image:alt', content: post.title },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: canonical },
    { property: 'article:author', content: post.author },
    { property: 'article:published_time', content: post.publishedTime },
    {
      property: 'article:modified_time',
      content: post.modifiedTime ?? post.publishedTime,
    },
    { property: 'article:section', content: 'Blog' },
    ...tagTags,
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: ogImage },
    { tagName: 'link', rel: 'canonical', href: canonical },
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
