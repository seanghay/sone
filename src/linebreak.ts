let segmenter: Intl.Segmenter | null = null;

const END_SYM = "។៕)]?!»៖";
const START_SYM = "([«";

export function* defaultLineBreakerIterator(
  text: string,
): Generator<number, void, unknown> {
  if (segmenter == null) {
    segmenter = new Intl.Segmenter(undefined, {
      granularity: "word",
    });
  }
  for (const segment of segmenter.segment(text)) {
    // Skip Khmer subscript characters
    if (segment.segment.endsWith("\u17d2")) continue;
    const next = text[segment.index];
    if (next !== undefined && END_SYM.indexOf(next) !== -1) continue;
    const prev = text[segment.index - 1];
    if (prev !== undefined && START_SYM.indexOf(prev) !== -1) continue;
    yield segment.index;
  }
}
