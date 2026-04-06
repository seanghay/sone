import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Font, sone } from "sone";
import { FONT, FONT_PATH } from "./constants.js";
import { BankStatementDocument } from "./documents/bank-statement.js";
import { InvoiceDocument } from "./documents/invoice.js";
import { QuotationDocument } from "./documents/quotation.js";
import { ReportDocument } from "./documents/report.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "output");

await Font.load(FONT, FONT_PATH);
await fs.mkdir(OUTPUT_DIR, { recursive: true });

const DOCUMENTS = [
  { name: "invoice",        build: InvoiceDocument },
  { name: "report",         build: ReportDocument },
  { name: "quotation",      build: QuotationDocument },
  { name: "bank-statement", build: BankStatementDocument },
];

for (const { name, build } of DOCUMENTS) {
  const doc = build();
  const outBase = path.join(OUTPUT_DIR, name);
  const renderer = sone(doc, { pageHeight: 1123 });

  await Promise.all([
    renderer.pdf().then(buf => fs.writeFile(`${outBase}.pdf`, buf)),
    renderer.jpg(0.95).then(buf => fs.writeFile(`${outBase}.jpg`, buf)),
  ]);

  console.log(`✓ ${name}.pdf + ${name}.jpg`);
}

console.log(`\nDone! Files saved to ${path.relative(process.cwd(), OUTPUT_DIR)}/`);
