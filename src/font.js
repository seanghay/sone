import { SoneConfig } from "./utils.js";

function traceFonts(node, callback) {
  if (Array.isArray(node.children) && node.children.length > 0) {
    for (const n of node.children) {
      traceFonts(n, callback);
    }
  }

  // span
  if (Array.isArray(node.spans) && node.spans.length > 0) {
    for (const n of node.spans) {
      traceFonts(n, callback);
    }
  }

  // table
  if (Array.isArray(node.rows) && node.rows.length > 0) {
    for (const cells of node.rows) {
      for (const cell of cells) {
        traceFonts(cell, callback);
      }
    }
  }

  let style = node.spanStyle || {};
  style = { ...node.style, ...style }; // merge with parent style
  if (style.font) {
    callback(style.font);
  }
}

export const Font = {
  trace(node) {
    const fonts = new Set();
    traceFonts(node, (font) => fonts.add(font));
    return Array.from(fonts);
  },
  registerFont: SoneConfig.registerFont,
};

