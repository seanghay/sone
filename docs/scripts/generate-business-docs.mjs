// Re-renders the business-documents fixtures at density=2 so the docs
// gallery shows sharp images instead of the 794×746 single-density JPGs
// that ship with examples/business-documents/output/. Output goes to
// docs/public/gallery/.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Font, sone } from 'sone';
import { FONT, FONT_PATH } from '../../examples/business-documents/constants.js';
import { BankStatementDocument } from '../../examples/business-documents/documents/bank-statement.js';
import { InvoiceDocument } from '../../examples/business-documents/documents/invoice.js';
import { QuotationDocument } from '../../examples/business-documents/documents/quotation.js';
import { ReportDocument } from '../../examples/business-documents/documents/report.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, '..', 'public', 'gallery');
await mkdir(out, { recursive: true });

await Font.load(FONT, FONT_PATH);

const DENSITY = 2;
const DOCUMENTS = [
  { name: 'invoice', build: InvoiceDocument },
  { name: 'report', build: ReportDocument },
  { name: 'quotation', build: QuotationDocument },
  { name: 'bank-statement', build: BankStatementDocument },
];

for (const { name, build } of DOCUMENTS) {
  const doc = build();
  const canvas = await sone(doc, { pageHeight: 1123 }).canvas();
  canvas.density = DENSITY;
  const buf = await canvas.toBuffer('jpeg', {
    quality: 0.95,
    density: DENSITY,
  });
  const file = join(out, `${name}.jpg`);
  await writeFile(file, buf);
  console.log(
    `  + ${name}.jpg (${canvas.width * DENSITY}×${canvas.height * DENSITY})`,
  );
}

console.log(`\nWrote ${DOCUMENTS.length} business documents to ${out}`);
