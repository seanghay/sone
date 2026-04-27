// Extracts public type definitions from the Sone .d.mts and emits a single
// JSON file the API reference page consumes at build time. Re-running this
// script is the only thing that keeps the docs page in sync with the
// shipped types — wired into `vercel-build` so deploys regenerate.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateDocumentation } from 'fumadocs-typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = resolve(__dirname, '..');
const sonePath = resolve(docsDir, '..', 'dist', 'node.d.mts');

// Curated groups. We don't dump every internal type — only what a user
// composing a Sone tree actually reaches for.
const groups = [
  {
    title: 'Layout',
    description:
      'Flexbox-style props shared by every node in a Sone tree — sizing, spacing, alignment, transforms.',
    types: ['LayoutProps'],
  },
  {
    title: 'Text',
    description: 'Properties on the Text node, plus the TextDefault wrapper.',
    types: ['TextProps', 'DefaultTextProps', 'TextDefaultProps'],
  },
  {
    title: 'Span',
    description:
      'Inline runs inside a Text node. Spans inherit the parent Text style and override only what is set.',
    types: ['SpanProps'],
  },
  {
    title: 'Grid',
    description: 'Two-dimensional layout container.',
    types: ['GridProps', 'GridTrack'],
  },
  {
    title: 'Photo',
    description: 'Image node — local path, URL, or Buffer.',
    types: ['PhotoProps'],
  },
  {
    title: 'Path',
    description: 'SVG-path node for vector shapes.',
    types: ['PathProps'],
  },
  {
    title: 'Table',
    description: 'Table, row, and cell properties.',
    types: ['TableProps', 'TableRowProps', 'TableCellProps'],
  },
  {
    title: 'List',
    description: 'List and list-item properties.',
    types: ['ListProps'],
  },
  {
    title: 'ClipGroup',
    description: 'Mask the content node with the shape of the clip node.',
    types: ['ClipGroupProps'],
  },
  {
    title: 'Render config',
    description: 'Top-level options passed to sone(tree, config).',
    types: ['SoneRenderConfig', 'SoneHeaderFooter', 'SoneDebugConfig'],
  },
];

const output = [];
let totalTypes = 0;

for (const group of groups) {
  const types = [];
  for (const name of group.types) {
    let docs;
    try {
      docs = await generateDocumentation(sonePath, name);
    } catch (err) {
      console.warn(`[api-docs] failed to generate "${name}":`, err.message);
      continue;
    }
    if (!docs?.length) {
      console.warn(`[api-docs] no docs found for "${name}"`);
      continue;
    }
    for (const doc of docs) {
      types.push({
        name: doc.name,
        description: doc.description ?? '',
        properties: doc.entries.map((e) => ({
          name: e.name,
          type: e.type,
          description: e.description ?? '',
          required: e.required,
          deprecated: e.deprecated,
          default: e.tags?.defaultValue ?? e.tags?.default,
        })),
      });
      totalTypes += 1;
    }
  }
  output.push({
    title: group.title,
    description: group.description,
    types,
  });
}

const target = resolve(docsDir, 'app', 'lib', 'api-types.generated.json');
await mkdir(dirname(target), { recursive: true });
await writeFile(target, `${JSON.stringify(output, null, 2)}\n`);
console.log(
  `[api-docs] wrote ${totalTypes} types across ${output.length} groups → ${target}`,
);
