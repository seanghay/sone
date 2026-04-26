import { createHighlighter } from 'shiki';

const highlighter = await createHighlighter({
  themes: ['github-dark', 'github-light'],
  langs: ['typescript', 'javascript', 'tsx', 'bash'],
});

export function highlight(code: string, lang = 'typescript') {
  return highlighter.codeToHtml(code, {
    lang,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    // false → no inline `color:` style, both themes ship as CSS variables only.
    // This lets us swap them via the .dark class without specificity battles
    // with the inline style attribute.
    defaultColor: false,
    cssVariablePrefix: '--shiki-',
  });
}
