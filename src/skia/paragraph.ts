/**
 * Single-run text painting.
 *
 * Sone has already broken lines, resolved bidi and positioned every segment by
 * the time this runs, so each call paints exactly one run at one baseline.
 *
 * `ParagraphBuilder` is used rather than `Shaper` because a run still needs
 * full shaping — Khmer cluster formation, Arabic joining, and multi-font
 * fallback across the family list. `Shaper` shapes against a single resolved
 * font, so reproducing fallback on top of it would mean reimplementing much of
 * SkFontCollection. Paragraph also carries letterSpacing/wordSpacing/direction,
 * all of which sone needs.
 */
import type { SpanProps } from "../core.ts";
import type { Arena, SkPaint } from "./arena.ts";
import type { SkCanvas } from "./canvas.ts";
import type { FontRegistry } from "./fonts.ts";
import { ck } from "./init.ts";
import { buildTextStyle, type TextMeasurer } from "./measure.ts";

/**
 * Layout width that cannot wrap. Deliberately large but well short of
 * MAX_SAFE_INTEGER, which loses precision once Skia converts it to a float.
 */
const UNCONSTRAINED = 1e7;

export interface DrawRunOptions {
  /** Left edge of the run. Sone has already positioned the segment box. */
  x: number;
  /** Alphabetic baseline, matching Canvas2D `fillText` semantics. */
  baselineY: number;
  /** Measured width of the run, kept for callers that lay out around it. */
  width?: number;
  /** "rtl" flips paragraph direction for this run. */
  direction?: "ltr" | "rtl";
  /** Fill paint — a solid colour or a gradient shader. */
  fill?: SkPaint;
  /** Optional outline, painted beneath the fill as Canvas2D does. */
  stroke?: SkPaint;
}

/**
 * `pushPaintStyle` requires a non-null background paint: passing `null` throws,
 * and a default `new Paint()` is opaque black, which would paint a filled box
 * behind every run. A fully transparent paint is the only workable value.
 */
let transparentPaint: SkPaint | null = null;

function backgroundPaint(): SkPaint {
  if (transparentPaint == null) {
    const kit = ck();
    transparentPaint = new kit.Paint();
    transparentPaint.setColor(kit.Color(0, 0, 0, 0));
  }
  return transparentPaint;
}

export class ParagraphPainter {
  private readonly fonts: FontRegistry;
  private readonly measurer: TextMeasurer;

  constructor(fonts: FontRegistry, measurer: TextMeasurer) {
    this.fonts = fonts;
    this.measurer = measurer;
  }

  /**
   * Paint one shaped run.
   *
   * Stroke and fill are separate draws at the same origin, preserving the
   * strokeText-then-fillText order the Canvas2D path used.
   */
  drawRun(
    canvas: SkCanvas,
    arena: Arena,
    text: string,
    props: SpanProps,
    options: DrawRunOptions,
  ): void {
    if (text.length === 0) return;

    // Canvas2D fillText draws from the alphabetic baseline; a Paragraph draws
    // from its top. This is the same ascent measureText reports, so painting
    // and measurement cannot disagree.
    const { fontBoundingBoxAscent } = this.measurer.verticalMetrics(props);
    const top = options.baselineY - fontBoundingBoxAscent;

    if (options.stroke != null) {
      this.paint(canvas, arena, text, props, options, options.stroke, top);
    }
    if (options.fill != null) {
      this.paint(canvas, arena, text, props, options, options.fill, top);
    }
  }

  private paint(
    canvas: SkCanvas,
    arena: Arena,
    text: string,
    props: SpanProps,
    options: DrawRunOptions,
    paint: SkPaint,
    top: number,
  ): void {
    const kit = ck();
    const rtl = options.direction === "rtl";

    const style = new kit.ParagraphStyle({
      textStyle: buildTextStyle(kit, this.fonts, props),
      // Direction drives bidi reordering within the run.
      textDirection: rtl ? kit.TextDirection.RTL : kit.TextDirection.LTR,
      // Alignment is forced Left — including for RTL — so the run always starts
      // at the paragraph origin. Sone has already positioned the segment box,
      // so anchoring is its job, not the paragraph's. Leaving RTL on its
      // default (Right) alignment would push the run to the far edge of the
      // layout width. Reordering is unaffected by alignment.
      textAlign: kit.TextAlign.Left,
    });

    const builder = kit.ParagraphBuilder.MakeFromFontProvider(
      style,
      this.fonts.provider(),
    );
    builder.pushPaintStyle(
      new kit.TextStyle(buildTextStyle(kit, this.fonts, props)),
      paint,
      backgroundPaint(),
    );
    builder.addText(text);

    const paragraph = builder.build();
    // Always lay out unconstrained. Constraining to the measured width — even
    // the run's own width — lets floating-point rounding push the last cluster
    // onto a second line, which then draws stacked inside the segment's box and
    // reads as overlapping text.
    paragraph.layout(UNCONSTRAINED);
    canvas.drawParagraph(paragraph, options.x, top);

    arena.own(paragraph);
    arena.own(builder);
  }
}

/** Release the shared transparent paint. For teardown and tests. */
export function releaseParagraphResources(): void {
  transparentPaint?.delete?.();
  transparentPaint = null;
}
