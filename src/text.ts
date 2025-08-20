import { dequal } from "dequal";
import { klona } from "klona";
import { Edge, type Node } from "yoga-layout/load";
import type { SpanNode, SpanProps, TextNode, TextProps } from "./core.ts";
import { createGradientFillStyleList } from "./gradient.ts";
import type { SoneRenderer } from "./renderer.ts";
import { applySpanProps, indicesOf, isWhitespace } from "./utils.ts";

export interface SoneParagraphLineSegment {
  metrics: TextMetrics;
  props: SpanProps;
  text: string;
  width: number;
  height: number;
}

export interface SoneParagraphLine {
  baseline: number;
  segments: SoneParagraphLineSegment[];
  spacesCount: number;
  width: number;
  height: number;
}

export interface SoneParagraph {
  width: number;
  height: number;
  lines: SoneParagraphLine[];
  offsetY: number;
}

export interface SoneParagraphBlock {
  paragraph: SoneParagraph;
}

export function createMultilineParagraph(
  spans: Array<string | SpanNode>,
  breakpoints: number[][],
  maxWidth: number,
  baseProps: TextProps,
  measureText: SoneRenderer["measureText"],
): SoneParagraph {
  const lineMultiplier =
    baseProps.lineHeight == null || Number.isNaN(baseProps.lineHeight)
      ? 1.0
      : baseProps.lineHeight;

  const lines: SoneParagraphLine[] = [];

  let currentLine: SoneParagraphLine = {
    baseline: 0,
    height: 0,
    width: baseProps.indentSize ?? 0,
    segments: [],
    spacesCount: 0,
  };

  lines.push(currentLine);

  for (let spanIndex = 0; spanIndex < spans.length; spanIndex++) {
    const span = spans[spanIndex];
    const props = typeof span === "string" ? baseProps : span.props;
    const text = typeof span === "string" ? span : span.children;
    const spanBreakpoints = breakpoints[spanIndex] || [];

    // If no breakpoints, treat entire text as one segment
    if (spanBreakpoints.length === 0) {
      const metrics = measureText(text, props);
      let segmentWidth = metrics.width;
      let segmentHeight =
        metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

      // Check if we need to wrap to new line
      if (
        currentLine.width + segmentWidth > maxWidth &&
        currentLine.segments.length > 0
      ) {
        // Start new line
        currentLine = {
          baseline: 0,
          height: 0,
          width: 0,
          segments: [],
          spacesCount: 0,
        };

        lines.push(currentLine);

        // Trim leading whitespace for new line
        const trimmedText = text.trimStart();
        if (trimmedText !== text) {
          const trimmedMetrics = measureText(trimmedText, props);
          segmentWidth = trimmedMetrics.width;
          segmentHeight =
            trimmedMetrics.fontBoundingBoxAscent +
            trimmedMetrics.fontBoundingBoxDescent;

          // Add trimmed segment to current line
          const segment: SoneParagraphLineSegment = {
            metrics: trimmedMetrics,
            props,
            text: trimmedText,
            width: segmentWidth,
            height: segmentHeight,
          };

          currentLine.segments.push(segment);
          currentLine.width += segmentWidth;
          currentLine.height = Math.max(currentLine.height, segmentHeight);
          currentLine.baseline = Math.max(
            currentLine.baseline,
            trimmedMetrics.fontBoundingBoxAscent,
          );
          continue;
        }
      }

      // Add segment to current line
      const segment: SoneParagraphLineSegment = {
        metrics,
        props,
        text,
        width: segmentWidth,
        height: segmentHeight,
      };

      currentLine.segments.push(segment);
      currentLine.width += segmentWidth;
      currentLine.height = Math.max(currentLine.height, segmentHeight);
      currentLine.baseline = Math.max(
        currentLine.baseline,
        metrics.fontBoundingBoxAscent,
      );

      continue;
    }

    // Handle text with breakpoints
    let lastBreakpoint = 0;

    for (let bpIndex = 0; bpIndex < spanBreakpoints.length; bpIndex++) {
      const breakpoint = spanBreakpoints[bpIndex];
      const segmentText = text.substring(lastBreakpoint, breakpoint);

      if (segmentText.length === 0) {
        lastBreakpoint = breakpoint;
        continue;
      }

      const metrics = measureText(segmentText, props);
      const segmentWidth = metrics.width;
      const segmentHeight =
        metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

      // Check if we need to wrap to new line
      if (
        currentLine.width + segmentWidth > maxWidth &&
        currentLine.segments.length > 0
      ) {
        // Trim trailing whitespace from last segment of current line
        if (currentLine.segments.length > 0) {
          const lastSegment =
            currentLine.segments[currentLine.segments.length - 1];

          const trimmedText = lastSegment.text.trimEnd();
          if (trimmedText !== lastSegment.text && trimmedText.length > 0) {
            const trimmedMetrics = measureText(trimmedText, lastSegment.props);
            const trimmedWidth = trimmedMetrics.width;
            const trimmedHeight =
              trimmedMetrics.fontBoundingBoxAscent +
              trimmedMetrics.fontBoundingBoxDescent;

            // Update last segment with trimmed text
            lastSegment.text = trimmedText;
            lastSegment.metrics = trimmedMetrics;
            lastSegment.width = trimmedWidth;
            lastSegment.height = trimmedHeight;

            // Recalculate line width
            currentLine.width = currentLine.segments.reduce(
              (sum, seg) => sum + seg.width,
              0,
            );
          }
        }

        // Start new line
        currentLine = {
          baseline: 0,
          height: 0,
          width: baseProps.hangingIndentSize ?? 0,
          segments: [],
          spacesCount: 0,
        };

        lines.push(currentLine);

        // Trim leading whitespace for new line
        const trimmedText = segmentText.trimStart();
        if (trimmedText !== segmentText) {
          if (trimmedText.length === 0) {
            lastBreakpoint = breakpoint;
            continue;
          }
          const trimmedMetrics = measureText(trimmedText, props);
          const trimmedWidth = trimmedMetrics.width;
          const trimmedHeight =
            trimmedMetrics.fontBoundingBoxAscent +
            trimmedMetrics.fontBoundingBoxDescent;

          // Add trimmed segment to current line
          const segment: SoneParagraphLineSegment = {
            metrics: trimmedMetrics,
            props,
            text: trimmedText,
            width: trimmedWidth,
            height: trimmedHeight,
          };

          currentLine.segments.push(segment);
          currentLine.width += trimmedWidth;
          currentLine.height = Math.max(currentLine.height, trimmedHeight);
          currentLine.baseline = Math.max(
            currentLine.baseline,
            trimmedMetrics.fontBoundingBoxAscent,
          );

          lastBreakpoint = breakpoint;
          continue;
        }
      }

      // Add segment to current line
      const segment: SoneParagraphLineSegment = {
        metrics,
        props,
        text: segmentText,
        width: segmentWidth,
        height: segmentHeight,
      };

      currentLine.segments.push(segment);
      currentLine.width += segmentWidth;
      currentLine.height = Math.max(currentLine.height, segmentHeight);
      currentLine.baseline = Math.max(
        currentLine.baseline,
        metrics.fontBoundingBoxAscent,
      );

      lastBreakpoint = breakpoint;
    }

    // Handle remaining text after last breakpoint
    if (lastBreakpoint < text.length) {
      const remainingText = text.substring(lastBreakpoint);
      const metrics = measureText(remainingText, props);
      const segmentWidth = metrics.width;
      const segmentHeight =
        metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

      // Check if we need to wrap to new line
      if (
        currentLine.width + segmentWidth > maxWidth &&
        currentLine.segments.length > 0
      ) {
        // Trim trailing whitespace from last segment of current line
        if (currentLine.segments.length > 0) {
          const lastSegment =
            currentLine.segments[currentLine.segments.length - 1];
          const trimmedText = lastSegment.text.trimEnd();
          if (trimmedText !== lastSegment.text && trimmedText.length > 0) {
            const trimmedMetrics = measureText(trimmedText, lastSegment.props);
            const trimmedWidth = trimmedMetrics.width;
            const trimmedHeight =
              trimmedMetrics.fontBoundingBoxAscent +
              trimmedMetrics.fontBoundingBoxDescent;

            // Update last segment with trimmed text
            lastSegment.text = trimmedText;
            lastSegment.metrics = trimmedMetrics;
            lastSegment.width = trimmedWidth;
            lastSegment.height = trimmedHeight;

            // Recalculate line width
            currentLine.width = currentLine.segments.reduce(
              (sum, seg) => sum + seg.width,
              0,
            );
          }
        }

        // Start new line
        currentLine = {
          baseline: 0,
          height: 0,
          width: 0,
          segments: [],
          spacesCount: 0,
        };

        lines.push(currentLine);

        // Trim leading whitespace for new line
        const trimmedText = remainingText.trimStart();
        if (trimmedText !== remainingText) {
          if (trimmedText.length === 0) {
            continue;
          }
          const trimmedMetrics = measureText(trimmedText, props);
          const trimmedWidth = trimmedMetrics.width;
          const trimmedHeight =
            trimmedMetrics.fontBoundingBoxAscent +
            trimmedMetrics.fontBoundingBoxDescent;

          // Add trimmed segment to current line
          const segment: SoneParagraphLineSegment = {
            metrics: trimmedMetrics,
            props,
            text: trimmedText,
            width: trimmedWidth,
            height: trimmedHeight,
          };

          currentLine.segments.push(segment);
          currentLine.width += trimmedWidth;
          currentLine.height = Math.max(currentLine.height, trimmedHeight);
          currentLine.baseline = Math.max(
            currentLine.baseline,
            trimmedMetrics.fontBoundingBoxAscent,
          );
          continue;
        }
      }

      // Add segment to current line
      const segment: SoneParagraphLineSegment = {
        metrics,
        props,
        text: remainingText,
        width: segmentWidth,
        height: segmentHeight,
      };

      currentLine.segments.push(segment);
      currentLine.width += segmentWidth;
      currentLine.height = Math.max(currentLine.height, segmentHeight);
      currentLine.baseline = Math.max(
        currentLine.baseline,
        metrics.fontBoundingBoxAscent,
      );
    }
  }

  // filter out the leading and trailing white spaces
  for (const line of lines) {
    const segments: SoneParagraphLineSegment[] = [];
    for (let i = 0; i < line.segments.length; i++) {
      const segment = line.segments[i];
      const isSpace = isWhitespace(segment.text);
      if (isSpace) {
        if (i === line.segments.length - 1 || i === 0) {
          line.width -= segment.width;
          continue;
        }
      }
      segments.push(segment);
    }
    line.segments = segments;
  }

  let linePosition = 0;
  for (const line of lines) {
    line.baseline *= lineMultiplier;
    line.height *= lineMultiplier;

    let lineOffsetMax = 0;
    let lineOffsetMin = Number.POSITIVE_INFINITY;

    for (const segment of line.segments) {
      const offset = segment.props.offsetY ?? 0;
      if (offset > lineOffsetMax) lineOffsetMax = offset;
      if (offset < lineOffsetMin) lineOffsetMin = offset;
    }

    line.baseline -= lineOffsetMin;
    line.height -= lineOffsetMin;
    line.height += lineOffsetMax;

    if (linePosition < lines.length - 1) {
      for (const segment of line.segments) {
        const m = segment.text.match(/[ ]/);
        if (m) {
          line.spacesCount += m.length;
        }
      }
    }

    linePosition++;
  }

  // Calculate final paragraph dimensions
  let totalHeight = 0;
  let maxLineWidth = 0;

  for (const line of lines) {
    totalHeight += line.height;
    maxLineWidth = Math.max(maxLineWidth, line.width);
  }

  // For some reasons, when line height is set,
  // the text doesn't align center vertically.
  let offsetY = 0;
  if (
    lines.length > 0 &&
    baseProps.lineHeight != null &&
    !Number.isNaN(baseProps.lineHeight)
  ) {
    const lh = Math.max(0, baseProps.lineHeight - 1);
    for (const segment of lines[0].segments) {
      const m = segment.metrics;
      const value =
        -((m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2) * lh;

      if (value < offsetY) {
        offsetY = value;
      }
    }
  }

  return {
    width: maxLineWidth,
    height: totalHeight,
    lines,
    offsetY,
  };
}

export function createBlocks(
  spans: Array<string | SpanNode>,
  breakIterator: SoneRenderer["breakIterator"],
): [Array<Array<string | SpanNode>>, number[][][]] {
  const blocks: Array<Array<string | SpanNode>> = [[]];

  for (const span of spans) {
    const text = typeof span === "string" ? span : span.children;
    const indices = indicesOf(text, "\n");

    // there's no force break
    if (indices.length === 0) {
      blocks[blocks.length - 1].push(span);
      continue;
    }

    if (indices.length > 0 && indices[indices.length - 1] !== text.length)
      indices.push(text.length);

    let start = 0;
    for (let i = 0; i < indices.length; i++) {
      const end = indices[i];
      const textChunk = text.slice(start, end);

      if (typeof span === "string") {
        blocks[blocks.length - 1].push(textChunk);
      } else {
        const cloned = klona(span);
        cloned.children = textChunk;
        blocks[blocks.length - 1].push(cloned);
      }

      if (i < indices.length - 1) blocks.push([]);
      start = end + 1;
    }
  }

  const blockBreakpoints: number[][][] = [];
  for (const spans of blocks) {
    const bp: number[][] = [];
    for (const span of spans) {
      const text = typeof span === "string" ? span : span.children;
      bp.push(Array.from(breakIterator(text)));
    }
    blockBreakpoints.push(bp);
  }

  return [blocks, blockBreakpoints];
}

export function createParagraph(
  _spans: Array<string | SpanNode>,
  maxWidth: number,
  baseProps: TextProps,
  measureText: SoneRenderer["measureText"],
  breakIterator: SoneRenderer["breakIterator"],
): SoneParagraphBlock[] {
  const [blocks, blockBreakpoints] = createBlocks(_spans, breakIterator);
  const items: SoneParagraphBlock[] = [];

  for (let b = 0; b < blocks.length; b++) {
    const breakpoints = blockBreakpoints[b];
    const spans = blocks[b];
    const paragraph = createMultilineParagraph(
      spans,
      breakpoints,
      maxWidth,
      baseProps,
      measureText,
    );

    for (const span of paragraph.lines) {
      const mergedSegments: SoneParagraphLineSegment[][] = [[]];

      // collect and compare
      for (const segment of span.segments) {
        const current = mergedSegments[mergedSegments.length - 1];
        if (current.length > 0) {
          const tail = current[current.length - 1];
          // only split on space if the text justification
          if (baseProps.align === "justify") {
            if (isWhitespace(segment.text)) {
              mergedSegments.push([segment]);
              mergedSegments.push([]);
              continue;
            }
          }

          if (!dequal(tail.props, segment.props)) {
            mergedSegments.push([segment]);
            continue;
          }
        }

        current.push(segment);
      }

      // merge the text and width
      const segments: SoneParagraphLineSegment[] = [];
      for (const collection of mergedSegments) {
        if (collection.length === 0) continue;

        if (collection.length === 1) {
          segments.push(collection[0]);
          continue;
        }

        const out = collection.slice(1).reduce((prev, current) => {
          return {
            metrics: prev.metrics,
            text: prev.text + current.text,
            height: Math.max(prev.height, current.height),
            width: prev.width + current.width,
            props: prev.props,
          } satisfies SoneParagraphLineSegment;
        }, collection[0]);

        segments.push(out);
      }

      span.segments = segments;
    }

    items.push({ paragraph });
  }

  return items;
}

export function drawTextNode(
  renderer: SoneRenderer,
  ctx: CanvasRenderingContext2D,
  node: TextNode,
  layout: Node,
  x: number,
  y: number,
) {
  const { props } = node;
  const { blocks } = props;
  if (blocks == null) return;

  const spaceX =
    layout.getComputedBorder(Edge.Left) +
    layout.getComputedBorder(Edge.Right) +
    layout.getComputedPadding(Edge.Left) +
    layout.getComputedPadding(Edge.Right);

  let paragraphOffsetY = 0;

  for (const { paragraph } of blocks) {
    paragraph.width =
      Math.max(layout.getComputedWidth(), paragraph.width) - spaceX;

    const paddingLeft =
      props.boxSizing === "content-box"
        ? layout.getComputedPadding(Edge.Left)
        : 0;

    const paddingTop =
      props.boxSizing === "content-box"
        ? layout.getComputedPadding(Edge.Top)
        : 0;

    const borderLeft = layout.getComputedBorder(Edge.Left);
    const borderTop = layout.getComputedBorder(Edge.Top);

    const left = paddingLeft + borderLeft;
    const top = paddingTop + borderTop;
    const align = props.align;

    // root
    applySpanProps(ctx, props);

    let offsetY = paragraph.offsetY + paragraphOffsetY;

    paragraphOffsetY += paragraph.height;

    for (let i = 0; i < paragraph.lines.length; i++) {
      const line = paragraph.lines[i];
      const trailingWidth = paragraph.width - line.width;

      const addedSpaceWidth =
        align === "justify" && trailingWidth > 0 && line.spacesCount > 0
          ? trailingWidth / line.spacesCount
          : 0;

      let offsetX = 0;

      switch (align) {
        case "center":
          offsetX = (paragraph.width - line.width) / 2;
          break;
        case "right":
          offsetX = paragraph.width - line.width;
          break;
        case "left":
        case "justify":
          if (i === 0 && props.indentSize != null) {
            offsetX += props.indentSize;
          }

          if (i > 0 && props.hangingIndentSize != null) {
            offsetX += props.hangingIndentSize;
          }

          break;
      }

      for (let s = 0; s < line.segments.length; s++) {
        const segment = line.segments[s];
        const spanOffsetY = segment.props.offsetY ?? 0;

        let segmentWidth = segment.width;

        if (align === "justify") {
          // FIXME: Should flag this in compute layout func
          if (/[ ]/.test(segment.text)) {
            segmentWidth += addedSpaceWidth;
          }
        }

        const textX = x + left + offsetX;
        const textY = y + line.baseline + top + offsetY + spanOffsetY;

        // underline
        if (
          typeof segment.props.underline === "number" &&
          segment.props.underline !== 0
        ) {
          if (typeof segment.props.color === "string") {
            ctx.fillStyle = segment.props.underlineColor ?? segment.props.color;
          }

          const underlineHeight =
            (segment.height * segment.props.underline) / 18;

          ctx.fillRect(
            textX,
            textY + underlineHeight,
            segmentWidth,
            underlineHeight,
          );
        }

        // overline
        if (
          typeof segment.props.overline === "number" &&
          segment.props.overline !== 0
        ) {
          if (typeof segment.props.color === "string") {
            ctx.fillStyle = segment.props.overlineColor ?? segment.props.color;
          }

          const overlineHeight = (segment.height * segment.props.overline) / 18;
          ctx.fillRect(
            textX,
            textY - segment.metrics.fontBoundingBoxAscent,
            segmentWidth,
            overlineHeight,
          );
        }

        const actualTextY =
          textY - segment.height + segment.metrics.fontBoundingBoxDescent;

        // draw span highlightColor
        if (segment.props.highlightColor != null) {
          ctx.fillStyle = segment.props.highlightColor;
          ctx.fillRect(textX, actualTextY, segmentWidth, segment.height);
        }

        // draw segment
        applySpanProps(ctx, segment.props);

        if (segment.props.dropShadows) {
          for (const shadowProperties of segment.props.dropShadows) {
            if (typeof shadowProperties === "string") continue;
            ctx.save();
            ctx.shadowOffsetX = shadowProperties.offsetX;
            ctx.shadowOffsetY = shadowProperties.offsetY;
            ctx.shadowBlur = shadowProperties.blurRadius;
            if (shadowProperties.color) {
              ctx.shadowColor = shadowProperties.color;
              ctx.fillStyle = shadowProperties.color;
            }
            ctx.fillText(segment.text, textX, textY);
            ctx.restore();
          }
        }

        ctx.save();
        if (
          segment.props.strokeColor != null &&
          segment.props.strokeWidth != null &&
          segment.props.strokeWidth !== 0
        ) {
          ctx.strokeStyle = segment.props.strokeColor;
          ctx.lineJoin = "round";
          ctx.miterLimit = 2;
          ctx.lineWidth = segment.props.strokeWidth;
          ctx.strokeText(segment.text, textX, textY);
        }

        if (
          typeof segment.props.color !== "string" &&
          Array.isArray(segment.props.color)
        ) {
          for (const gradient of segment.props.color) {
            const [fill] = createGradientFillStyleList(
              ctx,
              [gradient],
              x,
              y,
              segment.width,
              segment.height,
            );
            ctx.fillStyle = fill;
          }
        }

        ctx.fillText(segment.text, textX, textY);
        ctx.restore();

        // draw line-through
        if (
          typeof segment.props.lineThrough === "number" &&
          segment.props.lineThrough !== 0
        ) {
          if (typeof segment.props.color === "string") {
            ctx.fillStyle =
              segment.props.lineThroughColor ?? segment.props.color;
          }

          const lineThroughHeight =
            (segment.height * segment.props.lineThrough) / 18;

          ctx.fillRect(
            textX,
            textY -
              (segment.metrics.fontBoundingBoxAscent -
                segment.metrics.fontBoundingBoxDescent) /
                2,
            segmentWidth,
            lineThroughHeight,
          );
        }

        // debug view
        const debug = renderer.debug();

        if (debug.text) {
          ctx.save();
          // draw debug rect
          ctx.lineWidth = renderer.dpr() * 2;
          ctx.strokeStyle = "cyan";
          ctx.strokeRect(textX, actualTextY, segmentWidth, segment.height);
          ctx.restore();
        }

        offsetX += segmentWidth;
      }

      offsetY += line.height;
    }
  }
}
