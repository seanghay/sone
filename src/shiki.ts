/**
 * Shiki syntax highlighting integration for Sone
 *
 * @example
 * ```ts
 * import { createSoneHighlighter } from "sone/shiki"
 *
 * const highlight = await createSoneHighlighter({
 *   themes: ["github-dark"],
 *   langs: ["typescript"],
 * })
 *
 * const codeBlock = highlight.Code(`const x = 1`, {
 *   lang: "typescript",
 *   theme: "github-dark",
 *   fontSize: 12,
 * })
 * ```
 */
import type { BundledLanguage, BundledTheme } from "shiki";
import { createHighlighter } from "shiki";
import { Column, type ColumnNode, Span, Text } from "./core.ts";

// FontStyle bitmask values from shiki
const FONT_STYLE_ITALIC = 1;
const FONT_STYLE_BOLD = 2;
const FONT_STYLE_UNDERLINE = 4;

export interface SoneHighlighterOptions {
  themes: BundledTheme[];
  langs: BundledLanguage[];
}

export interface CodeOptions {
  lang: BundledLanguage;
  theme?: BundledTheme;
  /** Font size in pixels. Default: 12 */
  fontSize?: number;
  /** Font families in priority order. Default: ["monospace"] */
  fontFamily?: string[];
  /** Line height multiplier. Default: inherited */
  lineHeight?: number;
  /** Horizontal padding inside the code block. Default: 12 */
  paddingX?: number;
  /** Vertical padding inside the code block. Default: 8 */
  paddingY?: number;
}

export interface SoneHighlighter {
  /**
   * Render a syntax-highlighted code block as a Sone ColumnNode.
   * Each line becomes a Text row; each token becomes a styled Span.
   */
  Code(code: string, options: CodeOptions): ColumnNode;
}

/**
 * Create a Sone-compatible syntax highlighter backed by Shiki.
 * Pre-loads the given themes and languages so that `Code()` is synchronous.
 */
export async function createSoneHighlighter(
  options: SoneHighlighterOptions,
): Promise<SoneHighlighter> {
  const highlighter = await createHighlighter({
    themes: options.themes,
    langs: options.langs,
  });

  const defaultTheme = options.themes[0];

  return {
    Code(
      code: string,
      {
        lang,
        theme = defaultTheme,
        fontSize = 12,
        fontFamily = ["monospace"],
        lineHeight,
        paddingX = 12,
        paddingY = 8,
      }: CodeOptions,
    ): ColumnNode {
      const result = highlighter.codeToTokens(code, { lang, theme });
      const fg = result.fg ?? "#000000";

      const lines = result.tokens.map((lineTokens) => {
        // Preserve empty lines with a zero-width space so the line has height
        if (lineTokens.length === 0) {
          const t = Text("\u200b")
            .font(...fontFamily)
            .size(fontSize);
          if (lineHeight != null) t.lineHeight(lineHeight);
          return t;
        }

        const spans = lineTokens.map((token) => {
          const color = token.color ?? fg;
          const fontStyle: number =
            (token as { fontStyle?: number }).fontStyle ?? 0;

          let span = Span(token.content).color(color);

          if (fontStyle & FONT_STYLE_ITALIC) span = span.style("italic");
          if (fontStyle & FONT_STYLE_BOLD) span = span.weight("bold");
          if (fontStyle & FONT_STYLE_UNDERLINE) span = span.underline(1);

          return span;
        });

        const t = Text(...spans)
          .font(...fontFamily)
          .size(fontSize)
          .nowrap();
        if (lineHeight != null) t.lineHeight(lineHeight);
        return t;
      });

      const col = Column(...lines).padding(paddingY, paddingX);

      if (result.bg) {
        col.background(result.bg);
      }

      return col;
    },
  };
}
