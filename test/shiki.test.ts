import { expect, test } from "vitest";
import { Column } from "../src/core.ts";
import { sone } from "../src/node.ts";
import { createSoneHighlighter } from "../src/shiki.ts";

test("createSoneHighlighter returns a Code builder", async () => {
  const highlight = await createSoneHighlighter({
    themes: ["github-dark"],
    langs: ["typescript"],
  });

  const code = highlight.Code(
    `const greet = (name: string) => \`Hello, \${name}!\``,
    { lang: "typescript", fontSize: 13 },
  );

  expect(code.type).toBe("column");
  // Each line of the snippet should become a Text child
  expect(code.children.length).toBeGreaterThan(0);
});

test("Code block renders to a PNG buffer", async () => {
  const highlight = await createSoneHighlighter({
    themes: ["github-dark"],
    langs: ["javascript"],
  });

  const code = `function add(a, b) {
  return a + b;
}`;

  const doc = Column(
    highlight.Code(code, {
      lang: "javascript",
      fontSize: 13,
      fontFamily: ["monospace"],
    }),
  ).padding(16);

  const buffer = await sone(doc).png();
  expect(buffer.byteLength).toBeGreaterThan(0);
});

test("Code handles empty lines", async () => {
  const highlight = await createSoneHighlighter({
    themes: ["github-light"],
    langs: ["python"],
  });

  const code = `def foo():\n    pass\n\ndef bar():\n    pass`;
  const node = highlight.Code(code, { lang: "python" });

  // 5 lines total including the blank line
  expect(node.children).toHaveLength(5);
});

test("background color is set from theme", async () => {
  const highlight = await createSoneHighlighter({
    themes: ["github-dark"],
    langs: ["typescript"],
  });

  const node = highlight.Code("const x = 1", { lang: "typescript" });
  // github-dark background should be applied
  expect(node.props.background).toBeDefined();
  expect(node.props.background!.length).toBeGreaterThan(0);
});
