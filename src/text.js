import { createCanvas } from "canvas";
import { lineBreakTokenizer } from "./segmenter.js";

export function stringifyFont({
  font = "sans-serif",
  size = 12,
  style = "",
  weight = "",
}) {
  return `${style} ${weight} ${size}px ${font}`.trim();
}

export function measureText({ text, font }) {
  if (text.length === 0)
    return {
      width: 0,
      height: 0,
      textMetrics: {
        alphabeticBaseline: Number.MIN_SAFE_INTEGER,
        actualBoundingBoxAscent: 0,
        actualBoundingBoxDescent: 0,
        actualBoundingBoxLeft: 0,
        actualBoundingBoxRight: 0,
        emHeightAscent: 0,
        emHeightDescent: 0,
        fontBoundingBoxAscent: 0,
        fontBoundingBoxDescent: 0,
        width: 0,
      },
    };

  const canvas = createCanvas(1, 1);
  const ctx = canvas.getContext("2d");

  ctx.textBaseline = "top";
  ctx.font = font;

  const m = ctx.measureText(text);
  const height = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;

  return {
    height,
    width: m.width,
    textMetrics: m,
  };
}

/**
 * @typedef {import("./types.js").SoneSpanNode} SpanNode
 * @param {{spans: SpanNode[], maxWidth: number, indentSize: number}} param0
 * @returns {{lines: import("./types.js").SoneSpanRenderNode[][], maxHeight: number, forceBreaks: number[]}} an array of lines
 */
export function splitLines({ spans, maxWidth, indentSize = 0 }) {
  /**
   * @type {import("./types.js").SoneSpanRenderNode[][]}
   */
  const outputs = [];
  const forceBreaks = [];

  let currentLineWidth = indentSize;
  let maxHeight = 0;

  for (const span of spans) {
    let style = span.spanStyle || {};
    style = { ...span.style, ...style }; // merge with parent style
    const font = stringifyFont(style);

    for (const segment of lineBreakTokenizer(span.text)) {
      const { width, height, textMetrics } = measureText({
        text: segment,
        font,
      });

      if (maxHeight < style.size) {
        maxHeight = style.size;
      }

      currentLineWidth += width;
      if (currentLineWidth < maxWidth && segment !== "\n") {
        if (outputs.length === 0) {
          outputs.push([]);
        }

        const length = outputs[outputs.length - 1].length;
        // remove trailing whitespace
        if (length === 0 && /\s+/.test(segment)) {
          currentLineWidth -= width;
          continue;
        }

        outputs[outputs.length - 1].push({
          ...span,
          text: segment,
          width,
          height,
          textMetrics,
        });
      } else {

        if (segment === "\n") {
          forceBreaks.push(outputs.length - 1);
        }

        if (outputs.length > 0) {
          const tail = outputs[outputs.length - 1];
          while (tail.length > 0 && /\s+/.test(tail[tail.length - 1].text)) {
            tail.pop();
          }

          while (tail.length > 0 && /\s+/.test(tail[0].text)) {
            tail.unshift();
          }
        }

        outputs.push([]);

        if (/\s+/.test(segment)) {
          currentLineWidth = 0;
          continue;
        }

        outputs[outputs.length - 1].push({
          ...span,
          text: segment,
          width,
          height,
          textMetrics,
        });

        currentLineWidth = width;
      }
    }
  }

  return {
    lines: outputs,
    maxHeight,
    forceBreaks,
  };
}

/**
 * @param {import("./types.js").SoneTextOptions} style
 * @param {import("./types.js").SoneSpanNode[]} spans
 * @returns {ReturnType<import("yoga-layout").MeasureFunction>}
 */
export function measureSpans(spans, style) {
  const size = {
    width: 0,
    height: 0,
  };

  for (const span of spans) {
    let style = span.spanStyle || {};
    style = { ...span.style, ...style }; // merge with parent style

    const dimen = measureText({
      text: span.text,
      font: stringifyFont(style),
    });

    size.width += dimen.width;
    if (size.height < style.size) {
      size.height = style.size;
    }
  }

  size.height *= style.lineHeight;
  return size;
}

/**
 * @param {import("./types.js").SoneSpanNode[]} spans
 * @param {import("./types.js").SoneTextOptions} style
 * @param {number} maxWidth
 * @returns {ReturnType<import("yoga-layout").MeasureFunction>}
 */
export function textMeasureFunc(spans, style, maxWidth) {
  const dimensions = measureSpans(spans, style);

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

  const { lines, maxHeight } = splitLines({
    spans,
    maxWidth,
    lineHeight: style.lineHeight,
    indentSize: style.indentSize,
  });

  for (const nodes of lines) {
    for (const node of nodes) {
      width += node.width;
    }
    height += maxHeight * style.lineHeight;
  }

  return { width, height };
}
