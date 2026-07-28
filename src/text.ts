import { dequal } from "dequal";
import { Edge, type Node } from "yoga-layout/load";
import { resolveParagraphDirection } from "./bidi.ts";
import type { SpanNode, SpanProps, TextNode, TextProps } from "./core.ts";
import { createGradientFillStyleList } from "./gradient.ts";
import type { SoneRenderer, SoneTextMetrics } from "./renderer.ts";
import type { SkPaint } from "./skia/arena.ts";
import { parseColor } from "./skia/color.ts";
import { type Painter, withSave } from "./skia/painter.ts";
import { indicesOf, isWhitespace } from "./utils.ts";

function countSpaces(value: string): number {
  let count = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === " ") count++;
  }
  return count;
}

function nextTabStop(tabStops: number[], currentX: number): number {
  for (const stop of tabStops) {
    if (stop > currentX) return stop;
  }
  return currentX + 40;
}

function measureTabExpandedWidth(
  text: string,
  props: SpanProps,
  tabStops: number[] | undefined,
  currentX: number,
  measureText: SoneRenderer["measureText"],
): number {
  if (!tabStops?.length || !text.includes("\t")) {
    return measureText(text, props).width;
  }
  const parts = text.split("\t");
  let x = currentX;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].length > 0) x += measureText(parts[i], props).width;
    if (i < parts.length - 1) x = nextTabStop(tabStops, x);
  }
  return x - currentX;
}

export interface SoneParagraphLineRun {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SoneParagraphLineSegment {
  metrics: SoneTextMetrics;
  props: SpanProps;
  text: string;
  width: number;
  height: number;
  run?: SoneParagraphLineRun;
  /** true for synthetic tab-stop segments — must not be merged with adjacent segments */
  isTab?: boolean;
  /** pre-computed leader string to render inside this tab gap (e.g. "..........") */
  tabLeader?: string;
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
  /** Resolved paragraph direction for bidi rendering */
  baseDir?: "ltr" | "rtl";
}

export interface SoneParagraphBlock {
  paragraph: SoneParagraph;
}

interface ParagraphChunk {
  props: SpanProps;
  text: string;
  width: number;
}

const ELLIPSIS = "…";
const TRAILING_WHITESPACE_RE = /[ \t]+$/u;
const LEADING_WHITESPACE_RE = /^[ \t]+/u;
const TAB_RE = /\t+/gu;
let graphemeSegmenter: Intl.Segmenter | null = null;

function createEmptyLine(width = 0): SoneParagraphLine {
  return {
    baseline: 0,
    height: 0,
    width,
    segments: [],
    spacesCount: 0,
  };
}

function pushSegments(
  line: SoneParagraphLine,
  text: string,
  segProps: SpanProps,
  tabStops: number[] | undefined,
  tabLeader: string | undefined,
  measureText: SoneRenderer["measureText"],
): void {
  if (!tabStops?.length || !text.includes("\t")) {
    const m = measureText(text, segProps);
    const h = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
    line.segments.push({
      metrics: m,
      props: segProps,
      text,
      width: m.width,
      height: h,
    });
    line.width += m.width;
    line.height = Math.max(line.height, h);
    line.baseline = Math.max(line.baseline, m.fontBoundingBoxAscent);
    return;
  }

  const parts = text.split("\t");
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.length > 0) {
      const m = measureText(part, segProps);
      const h = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
      line.segments.push({
        metrics: m,
        props: segProps,
        text: part,
        width: m.width,
        height: h,
      });
      line.width += m.width;
      line.height = Math.max(line.height, h);
      line.baseline = Math.max(line.baseline, m.fontBoundingBoxAscent);
    }
    if (i < parts.length - 1) {
      const tabWidth = Math.max(
        nextTabStop(tabStops, line.width) - line.width,
        4,
      );
      const m = measureText(" ", segProps);
      const h = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;

      let leaderStr: string | undefined;
      if (tabLeader) {
        const charWidth = measureText(tabLeader, segProps).width;
        if (charWidth > 0) {
          const count = Math.floor(tabWidth / charWidth);
          if (count > 0) leaderStr = tabLeader.repeat(count);
        }
      }

      line.segments.push({
        metrics: m,
        props: segProps,
        text: "",
        width: tabWidth,
        height: h,
        isTab: true,
        tabLeader: leaderStr,
      });
      line.width += tabWidth;
      line.height = Math.max(line.height, h);
      line.baseline = Math.max(line.baseline, m.fontBoundingBoxAscent);
    }
  }
}

function recomputeLineMetrics(line: SoneParagraphLine) {
  line.height = 0;
  line.baseline = 0;
  for (const segment of line.segments) {
    line.height = Math.max(line.height, segment.height);
    line.baseline = Math.max(
      line.baseline,
      segment.metrics.fontBoundingBoxAscent,
    );
  }
}

function trimTrailingWhitespace(
  line: SoneParagraphLine,
  measureText: SoneRenderer["measureText"],
) {
  while (line.segments.length > 0) {
    const tail = line.segments[line.segments.length - 1];

    if (tail.isTab) {
      line.width -= tail.width;
      line.segments.pop();
      continue;
    }

    const trimmedText = tail.text.replace(TRAILING_WHITESPACE_RE, "");
    if (trimmedText === tail.text) break;

    if (trimmedText.length === 0) {
      line.width -= tail.width;
      line.segments.pop();
      continue;
    }

    const metrics = measureText(trimmedText, tail.props);
    const height =
      metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    line.width -= tail.width - metrics.width;
    tail.text = trimmedText;
    tail.metrics = metrics;
    tail.width = metrics.width;
    tail.height = height;
    break;
  }

  recomputeLineMetrics(line);
}

function createMeasuredSegment(
  text: string,
  props: SpanProps,
  measureText: SoneRenderer["measureText"],
): SoneParagraphLineSegment {
  const metrics = measureText(text, props);
  return {
    metrics,
    props,
    text,
    width: metrics.width,
    height: metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent,
  };
}

function segmentTextWidth(segments: SoneParagraphLineSegment[]) {
  return segments.reduce((width, segment) => width + segment.width, 0);
}

function lineIndentWidth(index: number, baseProps: TextProps) {
  return index === 0
    ? (baseProps.indentSize ?? 0)
    : (baseProps.hangingIndentSize ?? 0);
}

function recomputeFinalizedLine(
  line: SoneParagraphLine,
  index: number,
  baseProps: TextProps,
) {
  const isDefaultLineHeight =
    baseProps.lineHeight == null || Number.isNaN(baseProps.lineHeight);
  const lineMultiplier = isDefaultLineHeight
    ? 1.0
    : (baseProps.lineHeight ?? 1.0);

  let lineAbove = 0;
  let lineBelow = 0;
  let lineOffsetMax = 0;
  let lineOffsetMin = Number.POSITIVE_INFINITY;
  let segmentsWidth = 0;

  for (const segment of line.segments) {
    segmentsWidth += segment.width;
    const fontSize = segment.props.size ?? baseProps.size ?? 16;
    const lineBoxH = isDefaultLineHeight
      ? segment.height
      : fontSize * lineMultiplier;
    const halfLeading = (lineBoxH - segment.height) / 2;
    lineAbove = Math.max(
      lineAbove,
      halfLeading + segment.metrics.fontBoundingBoxAscent,
    );
    lineBelow = Math.max(
      lineBelow,
      halfLeading + segment.metrics.fontBoundingBoxDescent,
    );
    const offset = segment.props.offsetY ?? 0;
    if (offset > lineOffsetMax) lineOffsetMax = offset;
    if (offset < lineOffsetMin) lineOffsetMin = offset;
  }

  if (lineOffsetMin === Number.POSITIVE_INFINITY) {
    lineOffsetMin = 0;
  }

  line.width = lineIndentWidth(index, baseProps) + segmentsWidth;
  line.baseline = lineAbove - lineOffsetMin;
  line.height = lineAbove + lineBelow - lineOffsetMin + lineOffsetMax;
}

function recomputeParagraphMetrics(paragraph: SoneParagraph) {
  paragraph.width = 0;
  paragraph.height = 0;

  for (let i = 0; i < paragraph.lines.length; i++) {
    const line = paragraph.lines[i];
    line.spacesCount =
      i < paragraph.lines.length - 1
        ? line.segments.reduce(
            (count, segment) => count + countSpaces(segment.text),
            0,
          )
        : 0;
    paragraph.width = Math.max(paragraph.width, line.width);
    paragraph.height += line.height;
  }

  paragraph.offsetY = 0;
}

function trimTrailingSegments(
  segments: SoneParagraphLineSegment[],
  measureText: SoneRenderer["measureText"],
) {
  while (segments.length > 0) {
    const tail = segments[segments.length - 1];

    if (tail.isTab) {
      segments.pop();
      continue;
    }

    const trimmedText = tail.text.replace(TRAILING_WHITESPACE_RE, "");
    if (trimmedText === tail.text) break;

    if (trimmedText.length === 0) {
      segments.pop();
      continue;
    }

    const measured = createMeasuredSegment(
      trimmedText,
      tail.props,
      measureText,
    );
    tail.text = measured.text;
    tail.metrics = measured.metrics;
    tail.width = measured.width;
    tail.height = measured.height;
    break;
  }
}

function getPrefixBoundaries(
  text: string,
  breakIterator: SoneRenderer["breakIterator"],
) {
  const boundaries = new Set<number>([0]);

  for (const index of breakIterator(text)) {
    if (index > 0 && index < text.length) boundaries.add(index);
  }

  if (graphemeSegmenter == null) {
    graphemeSegmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });
  }

  for (const segment of graphemeSegmenter.segment(text)) {
    if (segment.index > 0 && segment.index < text.length) {
      boundaries.add(segment.index);
    }
  }

  return Array.from(boundaries).sort((a, b) => b - a);
}

function fitLineWithEllipsis(
  line: SoneParagraphLine,
  index: number,
  maxWidth: number,
  baseProps: TextProps,
  measureText: SoneRenderer["measureText"],
  breakIterator: SoneRenderer["breakIterator"],
) {
  const contentBudget = Math.max(
    0,
    maxWidth - lineIndentWidth(index, baseProps),
  );
  const working = line.segments.map((segment) => ({ ...segment }));
  trimTrailingSegments(working, measureText);

  let lastTextSegment: (typeof working)[number] | null = null;
  for (let i = working.length - 1; i >= 0; i--) {
    if (!working[i].isTab && working[i].text.length > 0) {
      lastTextSegment = working[i];
      break;
    }
  }
  const ellipsisProps = lastTextSegment?.props ?? baseProps;
  const ellipsisSegment = createMeasuredSegment(
    ELLIPSIS,
    ellipsisProps,
    measureText,
  );

  while (working.length > 0) {
    trimTrailingSegments(working, measureText);
    if (segmentTextWidth(working) + ellipsisSegment.width <= contentBudget) {
      line.segments = [...working, ellipsisSegment];
      recomputeFinalizedLine(line, index, baseProps);
      return;
    }

    const tail = working[working.length - 1];
    if (tail.isTab) {
      working.pop();
      continue;
    }

    const boundaries = getPrefixBoundaries(tail.text, breakIterator);
    let shortened = false;

    for (const boundary of boundaries) {
      if (boundary >= tail.text.length) continue;
      const nextText = tail.text
        .slice(0, boundary)
        .replace(TRAILING_WHITESPACE_RE, "");
      if (nextText === tail.text) continue;
      if (nextText.length === 0) continue;

      const measured = createMeasuredSegment(nextText, tail.props, measureText);
      tail.text = measured.text;
      tail.metrics = measured.metrics;
      tail.width = measured.width;
      tail.height = measured.height;
      shortened = true;
      break;
    }

    if (shortened) continue;
    working.pop();
  }

  if (ellipsisSegment.width <= contentBudget) {
    line.segments = [ellipsisSegment];
  } else {
    line.segments = [];
  }

  recomputeFinalizedLine(line, index, baseProps);
}

function applyTextOverflow(
  paragraph: SoneParagraph,
  maxWidth: number,
  baseProps: TextProps,
  measureText: SoneRenderer["measureText"],
  breakIterator: SoneRenderer["breakIterator"],
) {
  const maxLines =
    typeof baseProps.maxLines === "number" &&
    Number.isFinite(baseProps.maxLines)
      ? Math.max(0, Math.floor(baseProps.maxLines))
      : null;

  const hiddenLines = maxLines != null && paragraph.lines.length > maxLines;
  if (hiddenLines) {
    paragraph.lines = paragraph.lines.slice(0, maxLines);
  }

  if (paragraph.lines.length === 0) {
    paragraph.width = 0;
    paragraph.height = 0;
    paragraph.offsetY = 0;
    return;
  }

  const lastIndex = paragraph.lines.length - 1;
  const lastLine = paragraph.lines[lastIndex];
  const overflowsWidth =
    baseProps.nowrap === true &&
    Number.isFinite(maxWidth) &&
    lastLine.width > maxWidth;

  if (
    Number.isFinite(maxWidth) &&
    baseProps.textOverflow === "ellipsis" &&
    (hiddenLines || overflowsWidth)
  ) {
    fitLineWithEllipsis(
      lastLine,
      lastIndex,
      maxWidth,
      baseProps,
      measureText,
      breakIterator,
    );
  }

  recomputeParagraphMetrics(paragraph);
}

function finalizeParagraph(
  lines: SoneParagraphLine[],
  baseProps: TextProps,
  measureText: SoneRenderer["measureText"],
): SoneParagraph {
  const isDefaultLineHeight =
    baseProps.lineHeight == null || Number.isNaN(baseProps.lineHeight);
  const lineMultiplier = isDefaultLineHeight
    ? 1.0
    : (baseProps.lineHeight ?? 1.0);

  let totalHeight = 0;
  let maxLineWidth = 0;

  for (let linePosition = 0; linePosition < lines.length; linePosition++) {
    const line = lines[linePosition]!;
    trimTrailingWhitespace(line, measureText);

    let lineAbove = 0;
    let lineBelow = 0;
    let lineOffsetMax = 0;
    let lineOffsetMin = Number.POSITIVE_INFINITY;

    for (const segment of line.segments) {
      const fontSize = segment.props.size ?? baseProps.size ?? 16;
      const lineBoxH = isDefaultLineHeight
        ? segment.height
        : fontSize * lineMultiplier;
      const halfLeading = (lineBoxH - segment.height) / 2;
      lineAbove = Math.max(
        lineAbove,
        halfLeading + segment.metrics.fontBoundingBoxAscent,
      );
      lineBelow = Math.max(
        lineBelow,
        halfLeading + segment.metrics.fontBoundingBoxDescent,
      );
      const offset = segment.props.offsetY ?? 0;
      if (offset > lineOffsetMax) lineOffsetMax = offset;
      if (offset < lineOffsetMin) lineOffsetMin = offset;
    }

    if (lineOffsetMin === Number.POSITIVE_INFINITY) {
      lineOffsetMin = 0;
    }

    line.baseline = lineAbove - lineOffsetMin;
    line.height = lineAbove + lineBelow - lineOffsetMin + lineOffsetMax;

    if (linePosition < lines.length - 1) {
      for (const segment of line.segments) {
        line.spacesCount += countSpaces(segment.text);
      }
    }

    totalHeight += line.height;
    if (line.width > maxLineWidth) maxLineWidth = line.width;
  }

  return {
    width: maxLineWidth,
    height: totalHeight,
    lines,
    offsetY: 0,
  };
}

function createParagraphChunks(
  spans: Array<string | SpanNode>,
  breakpoints: number[][],
  measureText: SoneRenderer["measureText"],
  baseProps: TextProps,
) {
  const chunks: ParagraphChunk[] = [];

  for (let spanIndex = 0; spanIndex < spans.length; spanIndex++) {
    const span = spans[spanIndex];
    const props = typeof span === "string" ? baseProps : span.props;
    const text = typeof span === "string" ? span : span.children;

    if (text.includes("\t")) return null;

    const spanBreakpoints = breakpoints[spanIndex] || [];

    if (spanBreakpoints.length === 0) {
      chunks.push({
        props,
        text,
        width: measureText(text, props).width,
      });
      continue;
    }

    let lastBreakpoint = 0;

    for (const breakpoint of spanBreakpoints) {
      const segmentText = text.substring(lastBreakpoint, breakpoint);
      if (segmentText.length === 0) {
        lastBreakpoint = breakpoint;
        continue;
      }

      chunks.push({
        props,
        text: segmentText,
        width: measureText(segmentText, props).width,
      });
      lastBreakpoint = breakpoint;
    }

    if (lastBreakpoint < text.length) {
      const remainingText = text.substring(lastBreakpoint);
      chunks.push({
        props,
        text: remainingText,
        width: measureText(remainingText, props).width,
      });
    }
  }

  return chunks;
}

function trimLeadingWrapWhitespace(text: string): string {
  return text.replace(LEADING_WHITESPACE_RE, "");
}

function findFittingWrapBoundary(
  text: string,
  props: SpanProps,
  availableWidth: number,
  currentX: number,
  tabStops: number[] | undefined,
  measureText: SoneRenderer["measureText"],
  breakIterator: SoneRenderer["breakIterator"],
): number {
  // getPrefixBoundaries already uses a Set so there are no duplicates;
  // it returns positions in descending order. Reverse to iterate ascending.
  const prefixBoundaries = getPrefixBoundaries(text, breakIterator);
  // prefixBoundaries is sorted descending; iterate in reverse for ascending.
  let fallback = text.length;
  let best = 0;

  for (let i = prefixBoundaries.length - 1; i >= 0; i--) {
    const boundary = prefixBoundaries[i];
    if (boundary <= 0) continue;
    if (fallback === text.length) fallback = boundary;

    const width = measureTabExpandedWidth(
      text.slice(0, boundary),
      props,
      tabStops,
      currentX,
      measureText,
    );

    if (width <= availableWidth) {
      best = boundary;
      continue;
    }

    break;
  }

  // Also check text.length itself (entire segment fits)
  if (best === 0) {
    const fullWidth = measureTabExpandedWidth(
      text,
      props,
      tabStops,
      currentX,
      measureText,
    );
    if (fullWidth <= availableWidth) best = text.length;
  }

  return best > 0 ? best : fallback;
}

function appendWrappedText(
  lines: SoneParagraphLine[],
  currentLine: SoneParagraphLine,
  text: string,
  props: SpanProps,
  maxWidth: number,
  baseProps: TextProps,
  measureText: SoneRenderer["measureText"],
  breakIterator: SoneRenderer["breakIterator"],
  shouldWrap: boolean,
) {
  let remainingText = text;

  while (remainingText.length > 0) {
    const segmentWidth = measureTabExpandedWidth(
      remainingText,
      props,
      baseProps.tabStops,
      currentLine.width,
      measureText,
    );

    if (
      !shouldWrap ||
      !Number.isFinite(maxWidth) ||
      currentLine.width + segmentWidth <= maxWidth
    ) {
      pushSegments(
        currentLine,
        remainingText,
        props,
        baseProps.tabStops,
        baseProps.tabLeader,
        measureText,
      );
      break;
    }

    if (currentLine.segments.length > 0) {
      // Current line has content and remainingText doesn't fit as-is.
      // Flush the line and retry on the now-empty next line.
      currentLine = createEmptyLine(baseProps.hangingIndentSize ?? 0);
      lines.push(currentLine);

      remainingText = trimLeadingWrapWhitespace(remainingText);
      if (remainingText.length === 0) break;
      continue;
    }

    const availableWidth = Math.max(0, maxWidth - currentLine.width);
    const boundary = findFittingWrapBoundary(
      remainingText,
      props,
      availableWidth,
      currentLine.width,
      baseProps.tabStops,
      measureText,
      breakIterator,
    );

    const lineText = remainingText.slice(0, boundary);
    pushSegments(
      currentLine,
      lineText,
      props,
      baseProps.tabStops,
      baseProps.tabLeader,
      measureText,
    );

    remainingText = trimLeadingWrapWhitespace(remainingText.slice(boundary));
    if (remainingText.length === 0) break;

    currentLine = createEmptyLine(baseProps.hangingIndentSize ?? 0);
    lines.push(currentLine);
  }

  return currentLine;
}

function createGreedyMultilineParagraph(
  spans: Array<string | SpanNode>,
  breakpoints: number[][],
  maxWidth: number,
  baseProps: TextProps,
  measureText: SoneRenderer["measureText"],
  breakIterator: SoneRenderer["breakIterator"],
): SoneParagraph {
  const shouldWrap = baseProps.nowrap !== true;
  const lines: SoneParagraphLine[] = [];

  let currentLine = createEmptyLine(baseProps.indentSize ?? 0);
  lines.push(currentLine);

  for (let spanIndex = 0; spanIndex < spans.length; spanIndex++) {
    const span = spans[spanIndex];
    const props = typeof span === "string" ? baseProps : span.props;
    const text = typeof span === "string" ? span : span.children;
    const spanBreakpoints = breakpoints[spanIndex] || [];

    if (spanBreakpoints.length === 0) {
      currentLine = appendWrappedText(
        lines,
        currentLine,
        text,
        props,
        maxWidth,
        baseProps,
        measureText,
        breakIterator,
        shouldWrap,
      );
      continue;
    }

    let lastBreakpoint = 0;

    for (const breakpoint of spanBreakpoints) {
      const segmentText = text.substring(lastBreakpoint, breakpoint);

      if (segmentText.length === 0) {
        lastBreakpoint = breakpoint;
        continue;
      }

      currentLine = appendWrappedText(
        lines,
        currentLine,
        segmentText,
        props,
        maxWidth,
        baseProps,
        measureText,
        breakIterator,
        shouldWrap,
      );
      lastBreakpoint = breakpoint;
    }

    if (lastBreakpoint < text.length) {
      currentLine = appendWrappedText(
        lines,
        currentLine,
        text.substring(lastBreakpoint),
        props,
        maxWidth,
        baseProps,
        measureText,
        breakIterator,
        shouldWrap,
      );
    }
  }

  return finalizeParagraph(lines, baseProps, measureText);
}

function createKnuthPlassMultilineParagraph(
  spans: Array<string | SpanNode>,
  breakpoints: number[][],
  maxWidth: number,
  baseProps: TextProps,
  measureText: SoneRenderer["measureText"],
) {
  if (baseProps.nowrap === true || !Number.isFinite(maxWidth)) return null;

  const paragraphChunks = createParagraphChunks(
    spans,
    breakpoints,
    measureText,
    baseProps,
  );
  if (paragraphChunks == null || paragraphChunks.length === 0) return null;
  const chunks = paragraphChunks;

  const prefixWidths = [0];
  const trimmedWidths = chunks.map((chunk) => {
    const trimmedText = chunk.text.replace(TRAILING_WHITESPACE_RE, "");
    if (trimmedText.length === 0) return 0;
    if (trimmedText === chunk.text) return chunk.width;
    return measureText(trimmedText, chunk.props).width;
  });

  for (const chunk of chunks) {
    prefixWidths.push(prefixWidths[prefixWidths.length - 1] + chunk.width);
  }

  function measureLineWidth(start: number, end: number) {
    const indentWidth =
      start === 0
        ? (baseProps.indentSize ?? 0)
        : (baseProps.hangingIndentSize ?? 0);

    let effectiveEnd = end;
    while (
      effectiveEnd > start &&
      isWhitespace(chunks[effectiveEnd - 1].text.replace(TAB_RE, " "))
    ) {
      effectiveEnd--;
    }

    if (effectiveEnd === start) return indentWidth;

    let width = prefixWidths[effectiveEnd] - prefixWidths[start];
    width -= chunks[effectiveEnd - 1].width - trimmedWidths[effectiveEnd - 1];
    return indentWidth + width;
  }

  const costs = Array<number>(chunks.length + 1).fill(Number.POSITIVE_INFINITY);
  const previous = Array<number>(chunks.length + 1).fill(-1);
  costs[0] = 0;

  for (let start = 0; start < chunks.length; start++) {
    if (!Number.isFinite(costs[start])) continue;

    for (let end = start + 1; end <= chunks.length; end++) {
      if (end < chunks.length && isWhitespace(chunks[end].text)) continue;

      const lineWidth = measureLineWidth(start, end);
      if (lineWidth > maxWidth) break;

      const isLastLine = end === chunks.length;
      const slack = Math.max(0, maxWidth - lineWidth);
      const ratio = slack / Math.max(maxWidth, 1);
      const badness = isLastLine ? 0 : (ratio * 100) ** 3 + 1;
      const nextCost = costs[start] + badness;

      if (nextCost < costs[end]) {
        costs[end] = nextCost;
        previous[end] = start;
      }
    }
  }

  if (
    !Number.isFinite(costs[chunks.length]) ||
    previous[chunks.length] === -1
  ) {
    return null;
  }

  const ranges: Array<[number, number]> = [];
  let end = chunks.length;

  while (end > 0) {
    const start = previous[end];
    if (start < 0) return null;
    ranges.push([start, end]);
    end = start;
  }

  ranges.reverse();

  const lines = ranges.map(([start, end], index) => {
    const line = createEmptyLine(
      index === 0
        ? (baseProps.indentSize ?? 0)
        : (baseProps.hangingIndentSize ?? 0),
    );

    for (let i = start; i < end; i++) {
      const chunk = chunks[i];
      pushSegments(
        line,
        chunk.text,
        chunk.props,
        undefined,
        undefined,
        measureText,
      );
    }

    return line;
  });

  return finalizeParagraph(lines, baseProps, measureText);
}

function createBalancedParagraph(
  spans: Array<string | SpanNode>,
  breakpoints: number[][],
  maxWidth: number,
  baseProps: TextProps,
  measureText: SoneRenderer["measureText"],
  breakIterator: SoneRenderer["breakIterator"],
): SoneParagraph {
  // First, lay out at full width to get the target number of lines.
  const reference = createGreedyMultilineParagraph(
    spans,
    breakpoints,
    maxWidth,
    baseProps,
    measureText,
    breakIterator,
  );
  const targetLineCount = reference.lines.length;

  // Nothing to balance if it fits on a single line or has no content.
  if (targetLineCount <= 1) return reference;

  // Binary search for the smallest width that still produces targetLineCount lines.
  // Lower bound: the widest single line in the reference layout gives us the minimum
  // possible width (we can't go narrower than the widest word).
  let lo = reference.width / targetLineCount;
  let hi = maxWidth;
  const PRECISION = 0.5; // stop when the search window is < 0.5px

  while (hi - lo > PRECISION) {
    const mid = (lo + hi) / 2;
    const attempt = createGreedyMultilineParagraph(
      spans,
      breakpoints,
      mid,
      baseProps,
      measureText,
      breakIterator,
    );
    if (attempt.lines.length <= targetLineCount) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return createGreedyMultilineParagraph(
    spans,
    breakpoints,
    hi,
    baseProps,
    measureText,
    breakIterator,
  );
}

export function createMultilineParagraph(
  spans: Array<string | SpanNode>,
  breakpoints: number[][],
  maxWidth: number,
  baseProps: TextProps,
  measureText: SoneRenderer["measureText"],
  breakIterator: SoneRenderer["breakIterator"] = function* () {},
): SoneParagraph {
  if (
    baseProps.textWrap === "balance" &&
    baseProps.nowrap !== true &&
    Number.isFinite(maxWidth)
  ) {
    return createBalancedParagraph(
      spans,
      breakpoints,
      maxWidth,
      baseProps,
      measureText,
      breakIterator,
    );
  }

  if (
    baseProps.lineBreak === "knuth-plass" &&
    baseProps.nowrap !== true &&
    Number.isFinite(maxWidth)
  ) {
    const paragraph = createKnuthPlassMultilineParagraph(
      spans,
      breakpoints,
      maxWidth,
      baseProps,
      measureText,
    );

    if (paragraph != null) return paragraph;
  }

  return createGreedyMultilineParagraph(
    spans,
    breakpoints,
    maxWidth,
    baseProps,
    measureText,
    breakIterator,
  );
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
        blocks[blocks.length - 1].push({ ...span, children: textChunk });
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

  // Resolve paragraph direction once for all blocks using the full span text.
  const fullText = _spans
    .map((s) => (typeof s === "string" ? s : s.children))
    .join("");
  const resolvedBaseDir = resolveParagraphDirection(
    fullText,
    baseProps.baseDir,
  );

  for (let b = 0; b < blocks.length; b++) {
    const spans = blocks[b];
    const breakpoints = baseProps.nowrap
      ? spans.map(() => [])
      : blockBreakpoints[b];
    const paragraph = createMultilineParagraph(
      spans,
      breakpoints,
      maxWidth,
      baseProps,
      measureText,
      breakIterator,
    );
    applyTextOverflow(
      paragraph,
      maxWidth,
      baseProps,
      measureText,
      breakIterator,
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

          if (
            !dequal(tail.props, segment.props) ||
            tail.isTab ||
            segment.isTab
          ) {
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

    paragraph.baseDir = resolvedBaseDir;
    items.push({ paragraph });
  }

  return items;
}

export function createTextRuns(
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
    // For balanced text the paragraph width is the balanced content width — do not
    // expand it to fill the full node width, so alignment is relative to the
    // narrower balanced block rather than the container.
    if (props.textWrap !== "balance") {
      paragraph.width =
        Math.max(layout.getComputedWidth(), paragraph.width) - spaceX;
    }

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
    const isRTL = paragraph.baseDir === "rtl";

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

      if (isRTL) {
        // For RTL, offsetX starts at the right edge and decrements per segment.
        // Default alignment for RTL is "right"; "left" pins text to left edge.
        switch (align) {
          case "center":
            offsetX = (paragraph.width + line.width) / 2;
            break;
          case "left":
            offsetX = line.width;
            break;
          default:
            offsetX = paragraph.width;
            break;
        }
      } else {
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
      }

      for (let s = 0; s < line.segments.length; s++) {
        const segment = line.segments[s];
        const spanOffsetY = segment.props.offsetY ?? 0;
        let segmentWidth = segment.width;
        const segmentSpaces = countSpaces(segment.text);

        if (align === "justify" && segmentSpaces > 0) {
          segmentWidth += addedSpaceWidth * segmentSpaces;
        }

        let textX: number;
        if (isRTL) {
          // Decrement first so offsetX points to the left edge of this segment.
          offsetX -= segmentWidth;
          textX = x + left + offsetX;
        } else {
          textX = x + left + offsetX;
          offsetX += segmentWidth;
        }

        const textY = y + line.baseline + top + offsetY + spanOffsetY;
        const actualTextY =
          textY - segment.height + segment.metrics.fontBoundingBoxDescent;

        segment.run = {
          x: textX,
          y: actualTextY,
          width: segmentWidth,
          height: segment.height,
        };
      }

      offsetY += line.height;
    }
  }
}

/**
 * Resolve a decoration colour.
 *
 * Canvas2D carried `fillStyle` between draws, so an unset decoration colour
 * used to inherit whatever the previous draw happened to leave behind. Skia has
 * no such implicit state, so the fallback is stated explicitly: the span's own
 * colour, or black when that colour is a gradient.
 */
function decorationColor(
  override: string | null | undefined,
  color: SpanProps["color"],
): string {
  if (override != null) return override;
  return typeof color === "string" ? color : "black";
}

export function drawTextNode(
  renderer: SoneRenderer,
  p: Painter,
  node: TextNode,
  layout: Node,
  x: number,
  y: number,
) {
  const { props } = node;
  const { blocks } = props;
  if (blocks == null) return;

  const orientation = props.orientation ?? 0;

  if (orientation === 0) {
    drawTextBlocks(renderer, p, node, layout, x, y, orientation);
    return;
  }

  const w = layout.getComputedWidth();
  const h = layout.getComputedHeight();

  // Skia's rotate() takes degrees where Canvas2D takes radians, and it takes a
  // pivot — after the translate the pivot is the new origin, so (0, 0) here
  // reproduces the Canvas2D translate-then-rotate pair exactly.
  withSave(p, () => {
    switch (orientation) {
      case 90:
        p.canvas.translate(x + w, y);
        p.canvas.rotate(90, 0, 0);
        break;
      case 180:
        p.canvas.translate(x + w, y + h);
        p.canvas.rotate(180, 0, 0);
        break;
      case 270:
        p.canvas.translate(x, y + h);
        p.canvas.rotate(-90, 0, 0);
        break;
    }
    drawTextBlocks(renderer, p, node, layout, 0, 0, orientation);
  });
}

function drawTextBlocks(
  renderer: SoneRenderer,
  p: Painter,
  node: TextNode,
  layout: Node,
  x: number,
  y: number,
  orientation: number,
) {
  const { props } = node;
  const { blocks } = props;
  if (blocks == null) return;

  // For 90°/270°, remap padding/border edges to match the local drawing frame.
  //   90°  CW:  local +x→screen down,  local +y→screen left
  //             local x-start = screen top  (Edge.Top)
  //             local y-start = screen right (Edge.Right)
  //   270° CCW: local +x→screen up,   local +y→screen right
  //             local x-start = screen bottom (Edge.Bottom)
  //             local y-start = screen left   (Edge.Left)
  const edgeLocalLeft =
    orientation === 90
      ? Edge.Top
      : orientation === 270
        ? Edge.Bottom
        : Edge.Left;
  const edgeLocalRight =
    orientation === 90
      ? Edge.Bottom
      : orientation === 270
        ? Edge.Top
        : Edge.Right;
  const edgeLocalTop =
    orientation === 90
      ? Edge.Right
      : orientation === 270
        ? Edge.Left
        : Edge.Top;

  const spaceX =
    layout.getComputedBorder(edgeLocalLeft) +
    layout.getComputedBorder(edgeLocalRight) +
    layout.getComputedPadding(edgeLocalLeft) +
    layout.getComputedPadding(edgeLocalRight);

  let paragraphOffsetY = 0;

  for (const { paragraph } of blocks) {
    const containerWidth =
      orientation === 90 || orientation === 270
        ? layout.getComputedHeight()
        : layout.getComputedWidth();
    paragraph.width = Math.max(containerWidth, paragraph.width) - spaceX;

    const paddingLeft =
      props.boxSizing === "content-box"
        ? layout.getComputedPadding(edgeLocalLeft)
        : 0;

    const paddingTop =
      props.boxSizing === "content-box"
        ? layout.getComputedPadding(edgeLocalTop)
        : 0;

    const borderLeft = layout.getComputedBorder(edgeLocalLeft);
    const borderTop = layout.getComputedBorder(edgeLocalTop);

    const left = paddingLeft + borderLeft;
    const top = paddingTop + borderTop;
    const align = props.align;
    const isRTL = paragraph.baseDir === "rtl";

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

      if (isRTL) {
        // RTL: offsetX starts at the right edge and decrements per segment.
        // When align is unset or "right", text is flush to the right (natural RTL).
        // "left" pins the text block to the left edge of the container.
        switch (align) {
          case "center":
            offsetX = (paragraph.width + line.width) / 2;
            break;
          case "left":
            offsetX = line.width;
            break;
          default:
            // "right" or unset (default for RTL)
            offsetX = paragraph.width;
            break;
        }
      } else {
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
      }

      for (let s = 0; s < line.segments.length; s++) {
        const segment = line.segments[s];
        const spanOffsetY = segment.props.offsetY ?? 0;
        const renderText = segment.tabLeader ?? segment.text;

        let segmentWidth = segment.width;
        const segmentSpaces = countSpaces(segment.text);

        if (align === "justify" && segmentSpaces > 0) {
          segmentWidth += addedSpaceWidth * segmentSpaces;
        }

        // textX is the LEFT edge of the segment, used both for the decoration
        // rects and as the run origin. Canvas2D needed a separate right-edge
        // anchor for RTL; a Skia paragraph is always placed by its left edge
        // and right-aligns its RTL content inside the width it was laid out at.
        // Decrement first for RTL so offsetX points at that left edge.
        if (isRTL) offsetX -= segmentWidth;
        const textX = x + left + offsetX;
        const textY = y + line.baseline + top + offsetY + spanOffsetY;

        // underline
        if (
          typeof segment.props.underline === "number" &&
          segment.props.underline !== 0
        ) {
          const underlineHeight = segment.props.size! * 0.08;

          p.canvas.drawRect(
            p.ck.XYWHRect(
              textX,
              textY + underlineHeight,
              segmentWidth,
              underlineHeight,
            ),
            p.arena.fill(
              decorationColor(
                segment.props.underlineColor,
                segment.props.color,
              ),
            ),
          );
        }

        // overline
        if (
          typeof segment.props.overline === "number" &&
          segment.props.overline !== 0
        ) {
          const overlineHeight = segment.props.size! * 0.08;

          p.canvas.drawRect(
            p.ck.XYWHRect(
              textX,
              textY - segment.metrics.fontBoundingBoxAscent,
              segmentWidth,
              overlineHeight,
            ),
            p.arena.fill(
              decorationColor(segment.props.overlineColor, segment.props.color),
            ),
          );
        }

        const actualTextY =
          textY - segment.height + segment.metrics.fontBoundingBoxDescent;

        // draw span highlightColor
        if (segment.props.highlightColor != null) {
          p.canvas.drawRect(
            p.ck.XYWHRect(textX, actualTextY, segmentWidth, segment.height),
            p.arena.fill(segment.props.highlightColor),
          );
        }

        // draw segment — font, spacing and colour travel through the props
        // rather than through context state.
        const drawProps: SpanProps =
          align === "justify" && segmentSpaces > 0
            ? {
                ...segment.props,
                wordSpacing: (segment.props.wordSpacing ?? 0) + addedSpaceWidth,
              }
            : segment.props;

        // Determine text direction for this segment.
        // Per-span textDir overrides paragraph baseDir.
        const segDir = segment.props.textDir ?? (isRTL ? "rtl" : "ltr");

        if (segment.props.dropShadows) {
          for (const shadowProperties of segment.props.dropShadows) {
            if (typeof shadowProperties === "string") continue;
            // Canvas2D's default shadowColor is fully transparent, so an
            // unset colour draws nothing — same as before.
            const shadowColor = shadowProperties.color ?? "transparent";
            // Canvas2D's shadowBlur is twice the Gaussian sigma Skia takes.
            const sigma = shadowProperties.blurRadius / 2;
            const filter = p.arena.own(
              p.ck.ImageFilter.MakeDropShadowOnly(
                shadowProperties.offsetX,
                shadowProperties.offsetY,
                sigma,
                sigma,
                parseColor(shadowColor),
                null,
              ),
            );
            p.canvas.saveLayer(p.arena.layer({ filter }));
            p.text.drawRun(p.canvas, p.arena, renderText, drawProps, {
              x: textX,
              baselineY: textY,
              width: segmentWidth,
              direction: segDir,
              fill: p.arena.fill(shadowColor),
            });
            p.canvas.restore();
          }
        }

        let stroke: SkPaint | undefined;
        if (
          segment.props.strokeColor != null &&
          segment.props.strokeWidth != null &&
          segment.props.strokeWidth !== 0
        ) {
          stroke = p.arena.stroke(
            segment.props.strokeColor,
            segment.props.strokeWidth,
            { join: "round", miterLimit: 2 },
          );
        }

        let fill: SkPaint;
        if (Array.isArray(segment.props.color)) {
          fill = p.arena.fill("black");
          for (const gradient of segment.props.color) {
            const [shader] = createGradientFillStyleList(
              p,
              [gradient],
              x,
              y,
              segment.width,
              segment.height,
            );
            if (shader != null) fill = p.arena.shaderFill(shader);
          }
        } else {
          fill = p.arena.fill(
            typeof segment.props.color === "string"
              ? segment.props.color
              : "black",
          );
        }

        // One call: drawRun paints the stroke then the fill, matching the
        // strokeText-then-fillText order.
        p.text.drawRun(p.canvas, p.arena, renderText, drawProps, {
          x: textX,
          baselineY: textY,
          width: segmentWidth,
          direction: segDir,
          fill,
          stroke,
        });

        // draw line-through
        if (
          typeof segment.props.lineThrough === "number" &&
          segment.props.lineThrough !== 0
        ) {
          const lineThroughHeight = segment.props.size! * 0.08;

          p.canvas.drawRect(
            p.ck.XYWHRect(
              textX,
              textY -
                (segment.metrics.fontBoundingBoxAscent -
                  segment.metrics.fontBoundingBoxDescent) /
                  2,
              segmentWidth,
              lineThroughHeight,
            ),
            p.arena.fill(
              decorationColor(
                segment.props.lineThroughColor,
                segment.props.color,
              ),
            ),
          );
        }

        // debug view
        const debug = renderer.debug();

        if (debug.text) {
          // draw debug rect
          p.canvas.drawRect(
            p.ck.XYWHRect(textX, actualTextY, segmentWidth, segment.height),
            p.arena.stroke("cyan", renderer.dpr() * 2),
          );
        }

        if (!isRTL) {
          offsetX += segmentWidth;
        }
      }

      offsetY += line.height;
    }
  }
}
