import certificate from "./certificate.ts?raw";
import invoice from "./invoice.ts?raw";
import postcard from "./postcard.ts?raw";
import socialPoster from "./social-poster.ts?raw";

export interface Template {
  id: string;
  label: string;
  description: string;
  code: string;
}

export const TEMPLATES: Template[] = [
  {
    id: "invoice",
    label: "Invoice",
    description: "Business invoice with line items and totals",
    code: invoice,
  },
  {
    id: "postcard",
    label: "Postcard",
    description: "Front & back postcard layout",
    code: postcard,
  },
  {
    id: "social-poster",
    label: "Social Poster",
    description: "Square social media post (1:1)",
    code: socialPoster,
  },
  {
    id: "certificate",
    label: "Certificate",
    description: "Certificate of achievement",
    code: certificate,
  },
];
