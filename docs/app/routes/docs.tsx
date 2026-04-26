import { useMemo } from 'react';
import type { Route } from './+types/docs';
import type * as PageTree from 'fumadocs-core/page-tree';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import { toClientRenderer } from 'fumadocs-mdx/runtime/vite';
import { source } from '@/lib/source.server';
import { docs } from '../../source.generated';
import { baseOptions } from '@/lib/layout.shared';
import { useMDXComponents } from '@/components/mdx';
import { attachTreeIcons } from '@/lib/tree-icons';
import { absoluteUrl, ogImagePath } from '@/lib/site';

export async function loader({ params }: Route.LoaderArgs) {
  const slugs = (params['*'] ?? '').split('/').filter((v) => v.length > 0);
  const page = source.getPage(slugs);
  if (!page) throw new Response('Not found', { status: 404 });

  return {
    path: page.path,
    tree: source.getPageTree(),
    title: page.data.title,
    description: page.data.description,
    ogImage: absoluteUrl(ogImagePath(slugs)),
    canonical: absoluteUrl(page.url),
  };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: 'Sone Docs' }];
  const title = `${data.title} · Sone`;
  const description = data.description;
  return [
    { title },
    description ? { name: 'description', content: description } : null,
    { property: 'og:title', content: title },
    description ? { property: 'og:description', content: description } : null,
    { property: 'og:image', content: data.ogImage },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: data.canonical },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    description ? { name: 'twitter:description', content: description } : null,
    { name: 'twitter:image', content: data.ogImage },
    { tagName: 'link', rel: 'canonical', href: data.canonical },
  ].filter(Boolean) as Route.MetaDescriptors;
}

const renderer = toClientRenderer(
  docs.doc,
  ({ default: Mdx, frontmatter, toc }) => {
    return (
      <DocsPage toc={toc}>
        <title>{`${frontmatter.title} · Sone`}</title>
        {frontmatter.description ? (
          <meta name="description" content={frontmatter.description} />
        ) : null}
        <DocsTitle>{frontmatter.title}</DocsTitle>
        {frontmatter.description ? (
          <DocsDescription>{frontmatter.description}</DocsDescription>
        ) : null}
        <DocsBody>
          <Mdx components={useMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
);

export default function Page({ loaderData }: Route.ComponentProps) {
  const { path, tree } = loaderData;
  const Content = renderer[path];
  const treeWithIcons = useMemo(
    () => attachTreeIcons(tree as PageTree.Root),
    [tree],
  );

  return (
    <DocsLayout {...baseOptions()} tree={treeWithIcons}>
      <Content />
    </DocsLayout>
  );
}
