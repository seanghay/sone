import certificate from "./certificate.ts?raw";
import fakeTweet from "./fake-tweet.ts?raw";
import fakeFacebookPost from "./fake-facebook-post.ts?raw";
import fakeReport from "./fake-report.ts?raw";
import fakeTelegramMessage from "./fake-telegram-message.ts?raw";
import githubOpenGraph from "./github-open-graph.ts?raw";
import instagramChat from "./instagram-chat.ts?raw";
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
    id: "instagram-chat",
    label: "Instagram Chat",
    description: "Direct message conversation mockup",
    code: instagramChat,
  },
  {
    id: "fake-tweet",
    label: "Fake Tweet",
    description: "Tweet-style social post mockup",
    code: fakeTweet,
  },
  {
    id: "fake-facebook-post",
    label: "Fake Facebook Post",
    description: "Facebook feed post mockup",
    code: fakeFacebookPost,
  },
  {
    id: "fake-telegram-message",
    label: "Fake Telegram Message",
    description: "Telegram chat message mockup",
    code: fakeTelegramMessage,
  },
  {
    id: "fake-report",
    label: "Fake Report",
    description: "Analytics report/dashboard mockup",
    code: fakeReport,
  },
  {
    id: "github-open-graph",
    label: "GitHub Open Graph",
    description: "Repository social preview card",
    code: githubOpenGraph,
  },
  {
    id: "certificate",
    label: "Certificate",
    description: "Certificate of achievement",
    code: certificate,
  },
];
