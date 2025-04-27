import { createCanvas } from "canvas";

const segmenter = new Intl.Segmenter(undefined, {
  granularity: "word",
});

export function stringifyFont({
  font = "sans-serif",
  size = 12,
  style = "",
  weight = "",
}) {
  return `${style} ${weight} ${size}px ${font}`.trim();
}

export function measureText({ text, font, lineHeight = 1 }) {
  if (text.length === 0) return { width: 0, height: 0 };

  const canvas = createCanvas(1, 1);
  const ctx = canvas.getContext("2d");

  ctx.textBaseline = "top";
  ctx.font = font;

  const m = ctx.measureText(text);

  const height =
    (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) * lineHeight;

  return {
    height,
    width: m.width,
  };
}

export function splitLines({
  text,
  maxWidth,
  font,
  indentSize = 0,
  lineHeight = 1,
}) {
  const lines = [[]];
  let currentText = "";
  let i = 0;

  for (const item of segmenter.segment(text)) {
    let indentWidth = 0;

    if (lines.length === 1) {
      indentWidth = indentSize;
    }

    const { width } = measureText({
      text: currentText + item.segment,
      font,
      lineHeight,
    });

    if (width + indentSize < maxWidth) {
      lines[lines.length - 1].push(item.segment);
      currentText += item.segment;
    } else {
      lines.push([item.segment]);
      currentText = item.segment;
    }

    i++;
  }

  return lines;
}

/**
 * @param {string} text
 * @param {import("./types.js").SoneTextOptions} style
 * @param {number} maxWidth
 * @returns {ReturnType<import("yoga-layout").MeasureFunction>}
 */
export function textMeasureFunc(text, style, maxWidth) {
  const font = stringifyFont(style);

  const dimensions = measureText({
    text,
    font,
    lineHeight: style.lineHeight,
  });

  if (Number.isNaN(maxWidth)) {
    return dimensions;
  }

  if (dimensions.width <= maxWidth) {
    return dimensions;
  }

  if (dimensions.width >= 1 && maxWidth > 0 && maxWidth < 1) {
    return dimensions;
  }

  let width = 0;
  let height = 0;

  const lines = splitLines({
    text,
    maxWidth,
    font,
    lineHeight: style.lineHeight,
    indentSize: style.indentSize,
  });

  for (const line of lines) {
    const str = line.join("").trim();
    const m = measureText({
      text: str,
      font,
      lineHeight: style.lineHeight,
    });

    width = Math.max(width, m.width);
    height += m.height;
  }

  return { width, height };
}
