import { marked } from "marked";
import fs from "node:fs/promises";
import { Column, Flex, Span, Text, sone } from "sone";

const defaultFont = "Inter Khmer";
const lineHeight = 1.4;

/**
 * Convert marked tokens to sone.js nodes.
 * Uses .gap() for vertical spacing, not margin.
 */
function tokensToSoneNodes(tokens) {
  const nodes = [];
  for (const token of tokens) {
    if (token.type === "heading") {
      // Choose size based on depth
      const sizes = { 1: 38, 2: 30, 3: 24, 4: 20, 5: 18, 6: 16 };
      nodes.push(
        Text(...inlineTokensToSone(token.tokens))
          .size(sizes[token.depth] || 16)
          .weight("bold")
          .font(defaultFont)
          .lineHeight(lineHeight),
      );
      continue;
    }
    if (token.type === "paragraph") {
      nodes.push(
        Text(...inlineTokensToSone(token.tokens))
          .size(18)
          .font(defaultFont)
          .lineHeight(lineHeight)
          .color("#333"),
      );
    }

    if (token.type === "hr") {
      nodes.push(Flex().height(2).bg("#eee"));
    }
    // Add support for more block types (lists, blockquote, code, etc.) as needed.
  }

  return nodes;
}

/**
 * Convert inline tokens to sone.js Spans/Text.
 */
function inlineTokensToSone(tokens) {
  const items = [];
  for (const token of tokens) {
    if (token.type === "text") {
      items.push(token.text);
    } else if (token.type === "strong") {
      items.push(
        Span(...inlineTokensToSone(token.tokens))
          .font(defaultFont)
          .weight("bold"),
      );
    } else if (token.type === "em") {
      items.push(
        Span(...inlineTokensToSone(token.tokens))
          .font(defaultFont)
          .weight("italic"),
      );
    } else if (token.type === "codespan") {
      items.push(
        Span(token.text)
          .font(defaultFont)
          .bg("#eee")
          .weight("monospace")
          .padding(2, 4)
          .cornerRadius(4),
      );
    } else if (token.type === "link") {
      // Just render as blue underlined text
      items.push(
        Span(token.text)
          .font(defaultFont)
          .color("#1976d2")
          .line(2, 2, "#1976d2"),
      );
    }
    // Extend for more inline types as needed
  }
  return items;
}

// Example markdown input
const markdown = await fs.readFile("certificate.md", "utf8");

// Parse markdown to tokens using marked
const tokens = marked.lexer(markdown);

// Convert tokens to sone.js nodes
const soneNodes = tokensToSoneNodes(tokens);

// Compose document using .gap() for vertical spacing instead of margin on Text
function Document() {
  return Column(...soneNodes)
    .padding(60)
    .gap(18)
    .width(600)
    .bg("#fff");
}

// Output as PDF
await fs.writeFile("certificate.pdf", await sone(Document).pdf());
