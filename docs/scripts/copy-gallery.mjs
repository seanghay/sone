// Re-snapshots the gallery images from ../test/visual into docs/public/gallery.
// Run when the upstream test fixtures change. Tracked images are committed.

import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');
const sourceDir = join(repoRoot, 'test', 'visual');
const targetDir = join(__dirname, '..', 'public', 'gallery');

const files = [
  'resume-1.jpg',
  'certificate-1.jpg',
  'pages-1-p1.jpg',
  'table-span-combined.jpg',
  'text-orientation-1.jpg',
  'bidi-mixed.jpg',
];

await mkdir(targetDir, { recursive: true });

for (const f of files) {
  const src = join(sourceDir, f);
  const dst = join(targetDir, f);
  if (!existsSync(src)) {
    console.warn(`skip: ${f} (not found in test/visual)`);
    continue;
  }
  await copyFile(src, dst);
  console.log(`copied: ${f}`);
}
