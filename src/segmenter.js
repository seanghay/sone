// TODO: Add fallback to icu4x when Intl.Segmenter is unavailable
let segmenter = null;
/**
 * @param {string} text
 */
export function* lineBreakTokenizer(text) {
  // lazily load
  if (segmenter == null) {
    segmenter = new Intl.Segmenter(undefined, {
      granularity: "word",
    });
  }

  let prepend = "";
  for (const segment of segmenter.segment(text)) {
    if (segment.segment.endsWith("\u17d2")) {
      prepend += segment.segment;
      continue;
    }
    yield prepend + segment.segment;
    prepend = "";
  }

  if (prepend) {
    yield prepend;
  }
}
