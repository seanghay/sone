import type { BaseLayoutProps, LinkItemType } from 'fumadocs-ui/layouts/shared';
import {
  BookOpen,
  Newspaper,
  Package,
  Play,
  Sparkles,
} from 'lucide-react';

const links: LinkItemType[] = [
  {
    type: 'main',
    text: 'Docs',
    url: '/docs',
    icon: <BookOpen />,
  },
  {
    type: 'main',
    text: 'Examples',
    url: '/docs/examples/invoice',
    icon: <Sparkles />,
  },
  {
    type: 'main',
    text: 'Playground',
    url: 'https://sone-editor.vercel.app/',
    external: true,
    icon: <Play />,
  },
  {
    type: 'main',
    text: 'Blog',
    url: '/blog',
    icon: <Newspaper />,
  },
  {
    type: 'main',
    text: 'npm',
    url: 'https://www.npmjs.com/package/sone',
    external: true,
    icon: <Package />,
  },
];

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2">
          <img src="/sone.svg" alt="Sone" className="h-5 w-auto" />
          <span className="font-medium tracking-tight">Sone</span>
        </span>
      ),
    },
    links,
    githubUrl: 'https://github.com/seanghay/sone',
  };
}
