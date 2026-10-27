export type ProseNumber = { base: string; exponent?: string; suffix?: string };

/** Recognize only complete numeric literals; mathematical relations stay in TeX. */
export function proseNumber(tex: string): ProseNumber | undefined {
  const compact = tex.trim().replace(/\s+/gu, "");
  const number = String.raw`[+-]?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|\.\d+)`;
  const plain = compact.match(new RegExp(`^(${number})(\\\\%)?$`, "u"));
  if (plain) return { base: plain[1].replace(/^-/u, "−"), ...(plain[2] ? { suffix: "%" } : {}) };
  const scientific = compact.match(new RegExp(`^(?:(${number})\\\\times)?10\\^\\{([+-]?\\d+)\\}(\\\\%)?$`, "u"));
  if (!scientific) return undefined;
  return {
    base: scientific[1] === undefined ? "10" : `${scientific[1].replace(/^-/u, "−")} × 10`,
    exponent: scientific[2].replace(/^-/u, "−"),
    ...(scientific[3] ? { suffix: "%" } : {}),
  };
}
