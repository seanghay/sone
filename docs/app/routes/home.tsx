import type { Route } from './+types/home';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { Hero } from '@/components/hero';
import { FeaturesGrid } from '@/components/features-grid';
import { CodeBlock } from '@/components/code-block';
import { CodeShowcase } from '@/components/code-showcase';
import { TailwindBridge } from '@/components/tailwind-bridge';
import { Gallery } from '@/components/gallery';
import { Comparison } from '@/components/comparison';
import { UsedBy } from '@/components/used-by';
import { Faq } from '@/components/faq';
import { Footer } from '@/components/footer';
import {
  helloWorldHtml,
  showcase,
  soneBridgeHtml,
  tailwindBridgeHtml,
} from '@/lib/code-examples.server';
import {
  absoluteUrl,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_TYPE,
  OG_IMAGE_WIDTH,
  SITE_LOCALE,
  SITE_NAME,
} from '@/lib/site';

export function meta({}: Route.MetaArgs) {
  const title = 'Sone — A layout engine for image generation in JavaScript.';
  const description =
    'Compose images like you write components. Build beautiful, dynamic images, OG cards, posters, dashboards, multi-page PDFs, and invoices — at scale, without a browser.';
  const ogImage = absoluteUrl('/og.jpg');
  const canonical = absoluteUrl('/');
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
    { property: 'og:image:alt', content: title },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: canonical },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: ogImage },
    { tagName: 'link', rel: 'canonical', href: canonical },
  ];
}

export async function loader() {
  return {
    helloWorldHtml,
    showcase,
    tailwindBridgeHtml,
    soneBridgeHtml,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { helloWorldHtml, showcase, tailwindBridgeHtml, soneBridgeHtml } =
    loaderData;
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-col">
        <Hero />
        <FeaturesGrid />
        <CodeBlock html={helloWorldHtml} />
        <TailwindBridge
          tailwindHtml={tailwindBridgeHtml}
          soneHtml={soneBridgeHtml}
        />
        <CodeShowcase examples={showcase} />
        <Gallery />
        <Comparison />
        <UsedBy />
        <Faq />
        <Footer />
      </main>
    </HomeLayout>
  );
}
