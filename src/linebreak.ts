let segmenter: Intl.Segmenter | null = null;

const END_SYM = "។៕)]?!»៖$រៗ%";
const START_SYM = "([«$";
const NON_BREAKING_SPACE = "\u00a0";
const WORD_JOINER = "\u2060";
const GLUE_CHARACTERS = new Set([NON_BREAKING_SPACE, WORD_JOINER]);
const INLINE_WHITESPACE = /[^\S\r\n]/u;

function isInlineWhitespace(value: string | undefined): boolean {
  return value != null && INLINE_WHITESPACE.test(value);
}

function collectProtectedBoundaries(text: string): Set<number> {
  const boundaries = new Set<number>();

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

  const protectedBoundaries = Array.from(GLUE_CHARACTERS).some((char) =>
    text.includes(char),
  )
    ? collectProtectedBoundaries(text)
    : null;

  for (const segment of segmenter.segment(text)) {
    // Skip Khmer subscript characters
    if (segment.segment.endsWith("\u17d2")) continue;
    if (protectedBoundaries?.has(segment.index)) continue;
    const next = text[segment.index];
    if (next !== undefined && END_SYM.indexOf(next) !== -1) continue;
    const prev = text[segment.index - 1];
    if (prev !== undefined && START_SYM.indexOf(prev) !== -1) continue;
    yield segment.index;
  }
}
