import { createRequire } from "node:module";

/** Minimum characters that must remain before the hyphen */
const MIN_BEFORE = 2;
/** Minimum characters that must remain after the hyphen */
const MIN_AFTER = 2;

/**
 * Language codes supported by the `hyphen` package.
 * Values match the sub-path exports of the `hyphen` npm package.
 */
export const SUPPORTED_LOCALES = [
  "af",
  "be",
  "bg",
  "ca",
  "cs",
  "cy",
  "da",
  "de",
  "de-1901",
  "de-1996",
  "el",
  "el-monoton",
  "el-polyton",
  "en",
  "en-gb",
  "en-us",
  "es",
  "et",
  "eu",
  "fi",
  "fr",
  "gl",
  "hr",
  "hu",
  "hy",
  "ia",
  "id",
  "is",
  "it",
  "ka",
  "la",
  "lt",
  "lv",
  "mk",
  "mn",
  "nb",
  "nl",
  "nn",
  "no",
  "oc",
  "pl",
  "pt",
  "rm",
  "ro",
  "ru",
  "sh",
  "sk",
  "sl",
  "sq",
  "sr",
  "sv",
  "tk",
  "tr",
  "uk",
  "zh-latn-pinyin",
] as const;

/** Canonical alias map (common locale tags → `hyphen` package sub-paths) */
const LOCALE_ALIASES: Record<string, string> = {
  en: "en-us",
  "en-au": "en-gb",
  "de-de": "de",
  "de-at": "de",
  "de-ch": "de-ch-1901",
  nb: "nb",
  no: "nb",
  "pt-br": "pt",
  "pt-pt": "pt",
  "zh-pinyin": "zh-latn-pinyin",
};

type SyncHyphenateFn = (word: string) => string;

// Cache: locale → sync hyphenator (null if unavailable)
const hyphenatorCache = new Map<string, SyncHyphenateFn | null>();

let _require: ReturnType<typeof createRequire> | null = null;
try {
  _require = createRequire(import.meta.url);
} catch {
  // Browser / non-Node environments
}

function loadHyphenModule(locale: string): SyncHyphenateFn | null {
  if (hyphenatorCache.has(locale)) {
    return hyphenatorCache.get(locale) ?? null;
  }
  if (_require == null) {
    hyphenatorCache.set(locale, null);
    return null;
  }
  try {
    const mod = _require(`hyphen/${locale}`) as {
      hyphenateSync: SyncHyphenateFn;
    };
    const fn: SyncHyphenateFn = (w) => mod.hyphenateSync(w);
    hyphenatorCache.set(locale, fn);
    return fn;
  } catch {
    hyphenatorCache.set(locale, null);
    return null;
  }
}

/**
 * Resolve a user-supplied `hyphenation` prop value to a concrete locale
 * sub-path understood by the `hyphen` package, or `null` if unsupported.
 *
 * @example resolveHyphenLocale(true)   // → "en-us"
 * @example resolveHyphenLocale("fr")   // → "fr"
 * @example resolveHyphenLocale("xx")   // → null (unknown)
 */
export function resolveHyphenLocale(value: string | boolean): string | null {
  if (value === false) return null;
  const raw = value === true ? "en" : value.toLowerCase();
  const locale = LOCALE_ALIASES[raw] ?? raw;
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale)
    ? locale
    : null;
}

/**
 * Return the valid hyphenation break positions within `word` for the given
 * locale.  Positions near the word edges are filtered out according to
 * MIN_BEFORE / MIN_AFTER constants.
 *
 * Returns an empty array when the locale is unavailable or the word is too
 * short to hyphenate.
 */
export function getHyphenBreaks(word: string, locale: string): number[] {
  if (word.length < MIN_BEFORE + 1 + MIN_AFTER) return [];
  const hyphenate = loadHyphenModule(locale);
  if (hyphenate == null) return [];

  const hyphenated = hyphenate(word);
  const positions: number[] = [];
  let offset = 0;

  for (let i = 0; i < hyphenated.length; i++) {
    if (hyphenated[i] === "\u00AD") {
      const pos = i - offset;
      if (pos >= MIN_BEFORE && pos <= word.length - MIN_AFTER) {
        positions.push(pos);
      }
      offset++;
    }
  }
  return positions;
}

/**
 * Apply hyphenation to a span of text, inserting SOFT HYPHEN (\u00AD)
 * characters at all valid break positions within each word.
 *
 * Non-word characters (spaces, digits, punctuation) are left untouched.
 */
export function hyphenateText(text: string, locale: string): string {
  const hyphenate = loadHyphenModule(locale);
  if (hyphenate == null) return text;
  // Only hyphenate sequences of Unicode letters
  return text.replace(/\p{L}+/gu, (word) => hyphenate(word));
}
