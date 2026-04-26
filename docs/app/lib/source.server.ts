import { loader } from 'fumadocs-core/source';
import { create, docs } from '../../source.generated';

const fumadocsSource = await create.sourceAsync(docs.doc, docs.meta);

// No `icon` resolver here — icons stay as plain strings so the page tree
// survives JSON serialization through React Router's loader. They're
// resolved into <svg> elements client-side via `attachTreeIcons`.
export const source = loader({
  source: fumadocsSource,
  baseUrl: '/docs',
});
