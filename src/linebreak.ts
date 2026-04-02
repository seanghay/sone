let segmenter: Intl.Segmenter | null = null;

const END_SYM = "។៕)]?!»៖$រៗ%,;:";
const START_SYM = "([«$#@";
const END_SYM_SET = new Set([...END_SYM]);
const START_SYM_SET = new Set([...START_SYM]);
const NON_BREAKING_SPACE = "\u00a0";
const WORD_JOINER = "\u2060";
const GLUE_CHARACTERS = new Set([NON_BREAKING_SPACE, WORD_JOINER]);
const INLINE_WHITESPACE = /[^\S\r\n]/u;

// Absolute URLs (http/https/ftp) and bare www. URLs
const URL_PATTERN =
  /(?:https?|ftp):\/\/[^\s<>"{}|\\^`[\]]+|www\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+(?:[^\s<>"{}|\\^`[\]]*)/gu;

// Digit–separator–digit: protects hyphens/dots between digit groups (e.g. phone numbers)
const PHONE_SEP_PATTERN = /\d[-.\u2010\u2011\u2012\u2013]\d/gu;

function isInlineWhitespace(value: string | undefined): boolean {
  return value != null && INLINE_WHITESPACE.test(value);
}

function collectProtectedBoundaries(text: string): Set<number> {
  const boundaries = new Set<number>();

  // Glue characters: non-breaking space and word joiner
  for (let index = 0; index < text.length; index++) {
    if (!GLUE_CHARACTERS.has(text[index]!)) continue;

    let start = index;
    while (start > 0 && isInlineWhitespace(text[start - 1])) {
      start--;
    }

    let end = index + 1;
    while (end < text.length && isInlineWhitespace(text[end])) {
      end++;
    }

    for (let boundary = start; boundary <= end; boundary++) {
      boundaries.add(boundary);
    }
  }

  // URLs: protect all internal positions; leave the start and end open
  // so text can still wrap before or after the URL.
  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index!;
    const end = start + match[0].length;
    for (let pos = start + 1; pos < end; pos++) {
      boundaries.add(pos);
    }
  }

  // Phone number separators: protect digit–separator–digit sequences so
  // "123-4567" and "123.456" are never broken at the separator.
  for (const match of text.matchAll(PHONE_SEP_PATTERN)) {
    boundaries.add(match.index! + 1);
    boundaries.add(match.index! + 2);
  }

  return boundaries;
}

export function* defaultLineBreakerIterator(
  text: string,
): Generator<number, void, unknown> {
  if (segmenter == null) {
    segmenter = new Intl.Segmenter(undefined, {
      granularity: "word",
    });
  }

  const protectedBoundaries = collectProtectedBoundaries(text);

  for (const segment of segmenter.segment(text)) {
    // Skip Khmer subscript characters
    if (segment.segment.endsWith("\u17d2")) continue;
    if (protectedBoundaries.has(segment.index)) continue;
    const next = text[segment.index];
    if (next !== undefined && END_SYM_SET.has(next)) continue;
    const prev = text[segment.index - 1];
    if (prev !== undefined && START_SYM_SET.has(prev)) continue;
    yield segment.index;
  }
}
