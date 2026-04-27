import { renderOg } from '@/lib/og.server';

// Dedicated OG image for the home page. Without this, the home would
// have to point at /og/docs/index.jpg, which resolves the docs root and
// renders an OG card titled "Introduction" instead of the home tagline.

export async function loader() {
  const buffer = await renderOg({
    title: 'A layout engine for image generation in JavaScript.',
    description:
      'Compose images like you write components — at scale, without a browser.',
    section: 'sone.dev',
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control':
        'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
