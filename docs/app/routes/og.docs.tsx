import type { Route } from './+types/og.docs';
import { source } from '@/lib/source.server';
import { renderOg } from '@/lib/og.server';

export async function loader({ params }: Route.LoaderArgs) {
  const raw = (params['*'] ?? '').replace(/\.(jpg|jpeg|png)$/i, '');
  const slugs = raw.split('/').filter((v) => v.length > 0 && v !== 'index');

  const page = source.getPage(slugs);
  if (!page) throw new Response('Not found', { status: 404 });

  const sectionLabel = inferSection(slugs);
  const buffer = await renderOg({
    title: page.data.title ?? 'Documentation',
    description: page.data.description,
    section: sectionLabel,
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'image/jpeg',
      // Cache hard at the CDN edge — page metadata only changes on rebuild.
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}

function inferSection(slugs: string[]): string {
  if (slugs.length === 0) return 'Docs';
  const top = slugs[0];
  const labels: Record<string, string> = {
    'getting-started': 'Getting started',
    layout: 'Layout',
    typography: 'Typography',
    styling: 'Styling',
    'content-nodes': 'Content nodes',
    'multi-page': 'Multi-page',
    output: 'Output formats',
    advanced: 'Advanced',
    examples: 'Examples',
  };
  return labels[top] ?? 'Docs';
}
