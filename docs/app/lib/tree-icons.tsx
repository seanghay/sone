import { createElement, type ReactNode } from 'react';
import { icons } from 'lucide-react';
import type * as PageTree from 'fumadocs-core/page-tree';

function resolveIcon(name: unknown): ReactNode {
  if (typeof name !== 'string' || name.length === 0) return undefined;
  if (name in icons) {
    return createElement(icons[name as keyof typeof icons]);
  }
  return undefined;
}

type AnyNode = PageTree.Node | PageTree.Folder | PageTree.Root;

function walk(node: AnyNode): AnyNode {
  const next: AnyNode = { ...node };
  if ('icon' in next) {
    next.icon = resolveIcon(next.icon as unknown);
  }
  if ('children' in next && Array.isArray(next.children)) {
    next.children = next.children.map(walk) as PageTree.Node[];
  }
  return next;
}

export function attachTreeIcons(tree: PageTree.Root): PageTree.Root {
  return walk(tree) as PageTree.Root;
}
