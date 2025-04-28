const segmenter = new Intl.Segmenter(undefined, {
  granularity: "word",
});

/**
 * @param {string} text
 */
export function* lineBreakTokenizer(text) {
  let prepend = "";
  for (const segment of segmenter.segment(text)) {
    if (segment.segment.endsWith("\u17d2")) {
      prepend += segment.segment;
      continue;
    }
    yield prepend + segment.segment;
    prepend = "";
  }
}
