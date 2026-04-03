/**
 * Visual test: syntax-highlighted code blocks with two themes side-by-side
 */
import { Column, Row, Text } from "../../src/node.ts";
import { createSoneHighlighter } from "../../src/shiki.ts";
import { loadVisualTestFonts } from "./load-test-fonts.ts";
import { writeCanvasToFile } from "./utils.ts";

await loadVisualTestFonts();

const FONT = ["GeistMono"];
const TS_SNIPPET = `\
interface User {
  id: number;
  name: string;
  email?: string;
}

async function fetchUser(id: number): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error("Not found");
  return res.json() as Promise<User>;
}`;

const JS_SNIPPET = `\
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = Array.from({ length: 8 }, (_, i) => fibonacci(i));
console.log(result);`;

const highlight = await createSoneHighlighter({
  themes: ["github-dark", "github-light"],
  langs: ["typescript", "javascript"],
});

function Label(text: string) {
  return Text(text)
    .font(...FONT)
    .size(11)
    .weight("bold")
    .color("#6b7280")
    .paddingBottom(6);
}

const darkTs = highlight.Code(TS_SNIPPET, {
  lang: "typescript",
  theme: "github-dark",
  fontSize: 12,
  fontFamily: FONT,
  lineHeight: 1.6,
});

const lightJs = highlight.Code(JS_SNIPPET, {
  lang: "javascript",
  theme: "github-light",
  fontSize: 12,
  fontFamily: FONT,
  lineHeight: 1.6,
});

const root = Column(
  Text("Shiki Syntax Highlighting")
    .font(...FONT)
    .size(22)
    .weight("bold")
    .color("#111827"),
  Text("Two themes rendered side-by-side inside a Sone layout")
    .font(...FONT)
    .size(13)
    .color("#6b7280"),
  Row(
    Column(
      Label("TypeScript — github-dark"),
      darkTs.borderRadius(8).overflow("hidden"),
    )
      .flex(1)
      .gap(4),
    Column(
      Label("JavaScript — github-light"),
      lightJs
        .borderRadius(8)
        .overflow("hidden")
        .borderWidth(1)
        .borderColor("#e5e7eb"),
    )
      .flex(1)
      .gap(4),
  ).gap(20),
)
  .gap(16)
  .padding(32)
  .bg("#f9fafb");

await writeCanvasToFile(root, import.meta.url);
