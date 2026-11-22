const sentences = new Intl.Segmenter("en", { granularity: "sentence" });

export function createMetadataExcerpt(text: string, maxLength = 260): string {
  if (!Number.isInteger(maxLength) || maxLength < 3) {
    throw new RangeError("Metadata excerpts need a length of at least three characters.");
  }

  const normalized = text.replace(/\s+/gu, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  let sentenceEnd = 0;
  for (const { segment, index } of sentences.segment(normalized)) {
    const complete = segment.trimEnd();
    const end = index + complete.length;
    if (end > maxLength) break;
    if (/[.!?]["')\]]*$/u.test(complete)) sentenceEnd = end;
  }
  if (sentenceEnd) return normalized.slice(0, sentenceEnd);

  // Reserve the ellipsis and keep the last complete word when the opening
  // sentence alone is too long for a metadata description.
  const wordEnd = normalized.slice(0, maxLength - 2).lastIndexOf(" ");
  return `${wordEnd > 0 ? normalized.slice(0, wordEnd) : ""}...`;
}
