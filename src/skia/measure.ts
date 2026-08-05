/**
 * Text measurement.
 *
 * Sone breaks its own lines, so this only ever measures a single run and only
 * ever needs three numbers. Two caches back it, because the two halves have
 * wildly different cardinality:
 *
 *   - ascent/descent depend only on (family, size) and are text-independent, so
 *     a handful of entries covers a whole document;
 *   - width depends on the text as well, so it needs a bounded LRU.
 *
 * Both are synchronous by necessity — `measureText` is called from inside the
 * layout pass — which is why this uses plain Maps rather than `p-memoize`.
 */
import type { SpanProps } from "../core.ts";
import type { SoneTextMetrics } from "../renderer.ts";
import { fontBuilder } from "../utils.ts";
import type { FontRegistry } from "./fonts.ts";
import { ck } from "./init.ts";

/** Widths are cheap to recompute and unbounded in variety; cap the cache. */
const MAX_WIDTH_ENTRIES = 20_000;

/** Mirrors DEFAULT_TEXT_PROPS.size; used only when a span has no size at all. */
const DEFAULT_FONT_SIZE = 11;

/**
 * Layout width that cannot wrap. Large, but well short of MAX_SAFE_INTEGER,
 * which loses precision once Skia converts it to a float.
 */
const UNCONSTRAINED = 1e7;

interface VerticalMetrics {
  fontBoundingBoxAscent: number;
  fontBoundingBoxDescent: number;
}

export class TextMeasurer {
  private readonly vertical = new Map<string, VerticalMetrics>();
  private readonly widths = new Map<string, number>();
  private readonly fonts: FontRegistry;

  constructor(fonts: FontRegistry) {
    this.fonts = fonts;
    // Registration changes invalidate every cached measurement.
    fonts.subscribe(() => this.clear());
  }

  clear(): void {
    this.vertical.clear();
    this.widths.clear();
  }

  measure(text: string, props: SpanProps): SoneTextMetrics {
    const { fontBoundingBoxAscent, fontBoundingBoxDescent } =
      this.verticalMetrics(props);
    return {
      width: this.width(text, props),
      fontBoundingBoxAscent,
      fontBoundingBoxDescent,
    };
  }

  /**
   * Font-derived ascent/descent.
   *
   * Deliberately taken from `Font.getMetrics()` rather than a paragraph's line
   * metrics: it must not vary with the glyphs on the line, or line heights
   * would shift with content. This is the same value `drawRun` uses to convert
   * an alphabetic baseline into a paragraph top, so measurement and painting
   * cannot drift apart.
   */
  verticalMetrics(props: SpanProps): VerticalMetrics {
    const size = props.size ?? DEFAULT_FONT_SIZE;
    const key = `${(props.font ?? []).join(",")}|${size}`;

    const hit = this.vertical.get(key);
    if (hit != null) return hit;

    const font = this.fonts.fontFor(props.font, size);
    const metrics = font.getMetrics();
    const value: VerticalMetrics = {
      // Skia reports ascent as negative (above the baseline); CSS
      // fontBoundingBoxAscent is positive.
      fontBoundingBoxAscent: -metrics.ascent,
      fontBoundingBoxDescent: metrics.descent,
    };

    this.vertical.set(key, value);
    return value;
  }

  /** Shaped advance width of a single run. */
  width(text: string, props: SpanProps): number {
    if (text.length === 0) return 0;

    const key = `${fontBuilder(props)}|${props.letterSpacing ?? 0}|${props.wordSpacing ?? 0}|${text}`;
    const hit = this.widths.get(key);
    if (hit != null) return hit;

    const value = this.shapeWidth(text, props);

    // Cheap FIFO eviction: measurement is fast enough that a precise LRU would
    // cost more in bookkeeping than it saves in recomputation.
    if (this.widths.size >= MAX_WIDTH_ENTRIES) {
      const oldest = this.widths.keys().next().value;
      if (oldest != null) this.widths.delete(oldest);
    }
    this.widths.set(key, value);
    return value;
  }

  private shapeWidth(text: string, props: SpanProps): number {
    const kit = ck();
    const style = new kit.ParagraphStyle({
      textStyle: buildTextStyle(kit, this.fonts, props),
    });

    const builder = kit.ParagraphBuilder.MakeFromFontProvider(
      style,
      this.fonts.provider(),
    );
    builder.addText(text);
    const paragraph = builder.build();
    // Unconstrained: sone has already decided where this run ends.
    paragraph.layout(UNCONSTRAINED);
    const width = paragraph.getMaxIntrinsicWidth();

    // Cache the number, never the Paragraph — these must not accumulate.
    paragraph.delete();
    builder.delete();
    return width;
  }
}

/**
 * Build the CanvasKit TextStyle for a span.
 *
 * Shared with the draw path so shaping inputs are identical between measuring
 * and painting — any divergence here shows up as text that does not fit the box
 * it was measured into.
 */
/**
 * CSS font-weight -> numeric weight.
 *
 * `lighter`/`bolder` are relative to an inherited weight in CSS; there is no
 * inheritance chain here, so they resolve against the normal 400 baseline.
 */
export function resolveWeight(weight: SpanProps["weight"]): number {
  if (typeof weight === "number") return weight;
  if (weight == null) return 400;
  switch (weight) {
    case "normal":
      return 400;
    case "bold":
      return 700;
    case "lighter":
      return 300;
    case "bolder":
      return 700;
    default: {
      const parsed = Number.parseInt(weight, 10);
      return Number.isNaN(parsed) ? 400 : parsed;
    }
  }
}

export function buildTextStyle(
  kit: ReturnType<typeof ck>,
  fonts: FontRegistry,
  props: SpanProps,
  // biome-ignore lint/suspicious/noExplicitAny: CanvasKit TextStyle input
): any {
  const weight = resolveWeight(props.weight);
  return {
    fontFamilies: fonts.resolve(props.font),
    // Never fall through to 0: a zero-size font measures every run as
    // zero-width, which surfaces far downstream as collapsed layout rather
    // than an obvious error.
    fontSize: props.size ?? DEFAULT_FONT_SIZE,
    fontStyle: {
      weight: { value: weight },
      slant:
        props.style === "italic"
          ? kit.FontSlant.Italic
          : props.style === "oblique"
            ? kit.FontSlant.Oblique
            : kit.FontSlant.Upright,
    },
    // Variable fonts need the axis set explicitly — `fontStyle.weight` alone
    // selects among *static* faces and has no effect on a `wght` axis. Skia
    // ignores an axis the typeface does not expose, and clamps to its range,
    // so this is safe for static fonts too.
    fontVariations: [{ axis: "wght", value: weight }],
    letterSpacing: props.letterSpacing ?? 0,
    wordSpacing: props.wordSpacing ?? 0,
  };
}
