import boxshadowparser from "css-box-shadow";
import memoize from "fast-memoize";
import Yoga from "yoga-layout";
import { DrawSymbol, SoneConfig } from "./utils.js";
import { createGradientFillStyleList, isColor } from "./gradient.js";

const measureCanvas = SoneConfig.createCanvas(1, 1);

export function stringifyFont({
  font = "sans-serif",
  size = 12,
  style = "",
  weight = "",
}) {
  return `${style} ${weight} ${size}px ${font}`.trim();
}

export function _measureText({ text, font }) {
  if (text.length === 0)
    return {
      width: 0,
      height: 0,
      textMetrics: {
        alphabeticBaseline: 0,
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

  const canvas = measureCanvas;
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

export const measureText = memoize(_measureText);

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

    for (const segment of SoneConfig.lineBreakTokenizer(span.text)) {
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
          currentLineWidth = segment === "\n" ? indentSize : 0;
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
  let w = maxWidth;
  if (Number.isNaN(w)) w = Number.POSITIVE_INFINITY;

  let width = 0;
  let height = 0;

  const { lines, maxHeight, forceBreaks } = splitLines({
    spans,
    maxWidth: w,
    lineHeight: style.lineHeight,
    indentSize: style.indentSize,
  });

  for (const nodes of lines) {
    for (const node of nodes) {
      width += node.width;
    }
    height += maxHeight * style.lineHeight;
  }

  return { width, height, lines, maxHeight, forceBreaks };
}

/**
 * @param  {...string} children this can be string or Span object
 * @returns
 */
export function Text(...children) {
  const node = Yoga.Node.create();
  const properties = {};

  /**
   * @type {import("./types.js").SoneTextOptions}
   */
  const style = {
    size: 12,
    font: "sans-serif",
    color: "black",
    weight: 400,
    lineHeight: 1,
    indentSize: 0,
    align: "left",
  };

  /**
   * @type {import("./types.js").SoneSpanNode[]}
   */
  const spans = children.map((child) => {
    if (typeof child !== "object") {
      return {
        type: Span,
        text: child,
        style,
      };
    }

    return {
      ...child,
      style,
      spanStyle: child.style,
    };
  });

  node.setMeasureFunc((width, widthMode, height, heightMode) => {
    const result = textMeasureFunc(spans, style, width);
    Object.assign(properties, result);
    return result;
  });

  return {
    node,
    type: Text,
    spans,
    style,
    properties,
    size(value) {
      this.style.size = value;
      return this;
    },
    /**
     * @param  {...import("./types.js").SoneFont} values
     */
    font(...values) {
      this.style.font = values.join(", ");
      return this;
    },
    color(value) {
      this.style.color = value;
      return this;
    },
    weight(value) {
      this.style.weight = value;
      return this;
    },
    lineHeight(value) {
      this.style.lineHeight = value;
      return this;
    },
    indentSize(value) {
      this.style.indentSize = value;
      return this;
    },
    /**
     * @param {import("./types.js").SoneTextOptions['align']} value
     * @returns
     */
    align(value) {
      this.style.align = value;
      return this;
    },
    strokeWidth(value) {
      this.style.strokeWidth = value;
      return this;
    },
    strokeColor(value) {
      this.style.strokeColor = value;
      return this;
    },

    shadow(...values) {
      const value = values.join(",");
      this.style.shadow = boxshadowparser.parse(value);
      return this;
    },
    /**
     * @param {number} offset
     * @param {number} lineWidth
     * @param {string} color
     * @returns
     */
    line(offset = 0, lineWidth = 2, color = null) {
      this.style.lineOffset = offset;
      this.style.lineWidth = lineWidth;
      this.style.lineColor = color;
      return this;
    },

    /**
     *
     * @param {import("./types.js").SoneDrawingContext} param0
     */
    [DrawSymbol]: ({ ctx, component, x, y }) => {
      /**
       * @type {import("./types.js").SoneTextOptions}
       */
      const style = component.style;
      const indentSize = style.indentSize || 0.0;
      const width = component.node.getComputedWidth();

      ctx.save();
      ctx.textBaseline = "top";

      const { lines, maxHeight, forceBreaks } = component.properties;

      const offsetX = x;
      let offsetY = y;
      let lineNumber = -1;

      const drawCommands = [];

      for (const spanNodes of lines) {
        lineNumber++;

        let lineWidth = 0;
        let lineOffsetX = 0;
        let totalSpacesCount = 0;
        let totalSpaceWidth = 0;
        let spaceWidth = 0;
        let textAlign = style.align;

        const hasForceBreak = forceBreaks.indexOf(lineNumber) !== -1;

        // always left for last line when text align is justify
        if (
          (textAlign === "justify" && lineNumber === lines.length - 1) ||
          hasForceBreak
        ) {
          textAlign = "left";
        }

        for (const node of spanNodes) {
          lineWidth += node.width;

          if (textAlign === "justify") {
            if (/\s+/.test(node.text)) {
              totalSpacesCount++;
              totalSpaceWidth += node.width;
            }
          }
        }

        const indentable =
          lineNumber === 0 ||
          (lineNumber > 0 && forceBreaks.indexOf(lineNumber - 1) !== -1);

        if (textAlign === "justify") {
          let fullWidth = width;

          if (indentable) {
            fullWidth -= indentSize;
          }

          spaceWidth =
            (fullWidth - lineWidth + totalSpaceWidth) / totalSpacesCount;
        }

        if (textAlign === "left" || textAlign === "justify") {
          if (indentable) {
            lineOffsetX += indentSize;
          }
        }

        if (textAlign === "right") {
          lineOffsetX = width - lineWidth;
          if (indentable) {
            lineOffsetX -= indentSize;
          }
        }

        if (textAlign === "center") {
          lineOffsetX = (width - lineWidth) / 2;
        }

        for (const node of spanNodes) {
          let style = node.spanStyle || {};
          style = { ...node.style, ...style };

          if (textAlign === "justify") {
            if (/\s+/.test(node.text)) {
              lineOffsetX += spaceWidth;
              continue;
            }
          }

          const position = node._position;
          let spanOffsetY = 0;

          if (position) {
            spanOffsetY = position.offsetY;
          }

          drawCommands.push({
            text: node.text,
            x: offsetX + lineOffsetX,
            y: offsetY + spanOffsetY,
            fillStyle: style.color,
            font: stringifyFont(style),
            strokeWidth: style.strokeWidth,
            strokeColor: style.strokeColor,
            shadow: style.shadow,
            width: node.width,
            height: style.size,
            style,
          });

          lineOffsetX += node.width;
        }

        offsetY += maxHeight * style.lineHeight;
      }

      // start drawing stroke
      for (const cmd of drawCommands) {
        const strokeWidth = cmd.strokeWidth || 0;
        if (strokeWidth > 0) {
          ctx.save();
          ctx.font = cmd.font;
          ctx.strokeStyle = cmd.strokeColor || "black";
          ctx.lineWidth = strokeWidth;
          ctx.lineJoin = "round";
          ctx.miterLimit = 2;
          ctx.strokeText(cmd.text, cmd.x, cmd.y);
          ctx.restore();
        }
      }

      // start drawing fill
      for (const cmd of drawCommands) {
        ctx.font = cmd.font;
        let fillStyles = [];
        if (cmd.style.fillGradient) {
          const gradientFillStyles = createGradientFillStyleList(
            ctx,
            cmd.style.fillGradient,
            cmd.x,
            cmd.y,
            cmd.width,
            cmd.height,
          );
          fillStyles = gradientFillStyles;
        } else {
          fillStyles.push(cmd.fillStyle);
        }

        for (const fillStyle of fillStyles) {
          ctx.fillStyle = fillStyle;

          let textDecorationLineWidth = cmd.style.lineWidth;
          let textDecorationBehind = false;

          if (textDecorationLineWidth < 0) {
            textDecorationLineWidth = Math.abs(textDecorationLineWidth);
            textDecorationBehind = true;
          }

          const drawLine = () => {
            if (typeof cmd.style.lineOffset === "number") {
              const offset = cmd.height + cmd.style.lineOffset;
              ctx.beginPath();
              ctx.strokeStyle = cmd.style.lineColor || ctx.fillStyle;
              ctx.lineWidth = textDecorationLineWidth || 2;
              ctx.moveTo(cmd.x, cmd.y + offset);
              ctx.lineTo(cmd.x + cmd.width, cmd.y + offset);
              ctx.stroke();
            }
          };

          if (textDecorationBehind) {
            drawLine();
          }

          if (Array.isArray(cmd.shadow)) {
            for (const shadowItem of cmd.shadow) {
              ctx.save();
              ctx.shadowBlur = shadowItem.blurRadius;
              ctx.shadowColor = shadowItem.color;
              ctx.shadowOffsetX = shadowItem.offsetX;
              ctx.shadowOffsetY = shadowItem.offsetY;
              ctx.fillText(cmd.text, cmd.x, cmd.y);
              ctx.restore();
              if (!textDecorationBehind) {
                drawLine();
              }
            }

            continue;
          }

          ctx.fillText(cmd.text, cmd.x, cmd.y);
          if (!textDecorationBehind) {
            drawLine();
          }
        }
      }

      ctx.restore();
    },
  };
}

/**
 * Span
 * @param {string} text
 */
export function Span(text) {
  /**
   * @type {Partial<import("./types.js").SoneSpanOptions>}
   */
  const style = {};

  return {
    text,
    style,
    _position: {
      offsetY: 0,
    },
    type: Span,
    size(value) {
      this.style.size = value;
      return this;
    },
    font(...values) {
      this.style.font = values.join(", ");
      return this;
    },
    color(value) {
      if (isColor(value)) {
        this.style.color = value;
        return this;
      }
      this.style.fillGradient = value;
      return this;
    },
    weight(value) {
      this.style.weight = value;
      return this;
    },
    offsetY(value) {
      this._position.offsetY = value;
      return this;
    },
    strokeWidth(value) {
      this.style.strokeWidth = value;
      return this;
    },
    strokeColor(value) {
      this.style.strokeColor = value;
      return this;
    },
    shadow(value) {
      this.style.shadow = boxshadowparser.parse(value);
      return this;
    },
    /**
     * @param {number} offset
     * @param {number} lineWidth
     * @param {string} color
     * @returns
     */
    line(offset = 0, lineWidth = 2, color = null) {
      this.style.lineOffset = offset;
      this.style.lineWidth = lineWidth;
      this.style.lineColor = color;
      return this;
    },
  };
}
