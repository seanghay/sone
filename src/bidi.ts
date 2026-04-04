/**
 * Bidirectional text support utilities.
 * Implements a subset of the Unicode Bidirectional Algorithm (UBA)
 * sufficient for paragraph-level direction detection and RTL rendering.
 */

/**
 * Regex matching strong RTL characters across major RTL script ranges:
 * Hebrew, Arabic, Syriac, Thaana, N'Ko, Samaritan, Mandaic,
 * Arabic Supplement, Arabic Extended, and Arabic Presentation Forms.
 */
const RTL_RANGE =
  /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u07C0-\u07FF\u0800-\u085F\u0860-\u086F\u08A0-\u08FF\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF]/u;

/**
 * Returns true if the string contains at least one strong RTL character.
 */
export function hasRTLText(text: string): boolean {
  return RTL_RANGE.test(text);
}

/**
 * Detect paragraph direction using the Unicode Bidirectional Algorithm
 * first-strong heuristic (P2–P3 rules).
 *
 * Scans the text for the first character with a strong directional type:
 * - RTL (Hebrew, Arabic, etc.) → returns "rtl"
 * - LTR (Latin, Greek, Cyrillic, CJK, etc.) → returns "ltr"
 * - No strong character found → defaults to "ltr"
 */
export function detectParagraphDirection(text: string): "ltr" | "rtl" {
  for (const char of text) {
    if (RTL_RANGE.test(char)) return "rtl";

    const cp = char.codePointAt(0)!;
    // Strong LTR ranges: Basic Latin letters, Latin Extended, Greek, Cyrillic,
    // Armenian, Georgian, Hangul, CJK, Hiragana, Katakana
    if (
      (cp >= 0x0041 && cp <= 0x005a) || // A-Z
      (cp >= 0x0061 && cp <= 0x007a) || // a-z
      (cp >= 0x00c0 && cp <= 0x02b8) || // Latin Extended
      (cp >= 0x0370 && cp <= 0x03ff) || // Greek
      (cp >= 0x0400 && cp <= 0x04ff) || // Cyrillic
      (cp >= 0x0530 && cp <= 0x058f) || // Armenian
      (cp >= 0x10a0 && cp <= 0x10ff) || // Georgian
      (cp >= 0x1100 && cp <= 0x11ff) || // Hangul Jamo
      (cp >= 0x3040 && cp <= 0x30ff) || // Hiragana / Katakana
      (cp >= 0x3400 && cp <= 0x4dbf) || // CJK Extension A
      (cp >= 0x4e00 && cp <= 0x9fff) || // CJK Unified Ideographs
      (cp >= 0xac00 && cp <= 0xd7af) // Hangul Syllables
    ) {
      return "ltr";
    }
  }
  return "ltr";
}

/**
 * Resolve the effective paragraph direction from user props and text content.
 *
 * @param text - the full paragraph text (used for auto-detection)
 * @param baseDir - user-specified direction hint
 * @returns "ltr" or "rtl"
 */
export function resolveParagraphDirection(
  text: string,
  baseDir: "ltr" | "rtl" | "auto" | undefined,
): "ltr" | "rtl" {
  if (baseDir === "rtl") return "rtl";
  if (baseDir === "ltr") return "ltr";
  if (baseDir === "auto") return detectParagraphDirection(text);
  return "ltr";
}
