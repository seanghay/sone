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

export function meta({}: Route.MetaArgs) {
  const title = 'Sone — Tailwind for the canvas. Beautiful images at scale.';
  const description =
    'A declarative Canvas layout engine for JavaScript. Build beautiful, dynamic images, OG cards, posters, dashboards, multi-page PDFs, and invoices — at scale, without a browser.';
  const ogImage = 'https://sone.seanghay.com/og/docs/index.jpg';
  const canonical = 'https://sone.seanghay.com/';
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: ogImage },
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
