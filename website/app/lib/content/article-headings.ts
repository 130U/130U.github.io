import type { ResearchBlock, ResearchInline } from "./research-markdown";

export type ArticleInline =
  | Extract<ResearchInline, { type: "text" | "math" | "line-break" | "code" }>
  | { type: "strong" | "emphasis"; inlines: ArticleInline[] }
  | { type: "link"; href: string; title?: string; inlines: ArticleInline[] };

type ResearchHeading = Extract<ResearchBlock, { type: "heading" }>;

export type ArticleHeadingPresentation = {
  id: string;
  displayInlines: ArticleInline[];
  text: string;
  sourceNumber?: string;
  displayNumber?: string;
  referenceLabel?: string;
};

function roman(number: number) {
  if (!Number.isSafeInteger(number) || number < 1 || number > 3999) return undefined;
  let remaining = number;
  let result = "";
  for (const [value, label] of [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]] as const) {
    while (remaining >= value) { result += label; remaining -= value; }
  }
  return result;
}

function letter(number: number) {
  if (!Number.isSafeInteger(number) || number < 1 || number > 26) return undefined;
  return String.fromCharCode(64 + number);
}

const headingMathLabels = new Map([
  [String.raw`\mathsfH_s`, "Hₛ"],
  [String.raw`\mathsfH_v`, "Hᵥ"],
  [String.raw`\mathsfA\Rightarrow\mathsfH`, "A ⇒ H"],
  [String.raw`\mathsfC\Rightarrow\mathsfH`, "C ⇒ H"],
]);

function headingMathText(tex: string) {
  const label = headingMathLabels.get(tex.replace(/\s+/gu, ""));
  if (label !== undefined) return label;
  throw new Error(`Heading mathematics needs a reviewed plain-text label: ${tex}`);
}

function inlineText(inlines: readonly ArticleInline[]): string {
  return inlines.map((inline) => {
    if (inline.type === "text" || inline.type === "code") return inline.text;
    if (inline.type === "math") return headingMathText(inline.tex);
    if (inline.type === "line-break") return " ";
    return inlineText(inline.inlines);
  }).join("");
}

/** Present existing section identities without renumbering the source or changing its anchors. */
export function formatArticleHeading(heading: ResearchHeading): ArticleHeadingPresentation {
  const unchanged = { id: heading.id, displayInlines: heading.inlines, text: inlineText(heading.inlines) };
  const first = heading.inlines[0];
  if (first?.type !== "text") return unchanged;
  const prefix = first.text.match(heading.level === 2 ? /^([1-9]\d*)\.?\s+/u : /^([1-9]\d*)\.([1-9]\d*)\.?\s+/u);
  if (!prefix) return unchanged;
  const chapter = roman(Number(prefix[1]));
  const subsection = heading.level === 3 ? letter(Number(prefix[2])) : undefined;
  if (!chapter || (heading.level === 3 && !subsection)) return unchanged;
  const sourceNumber = heading.level === 3 ? `${prefix[1]}.${prefix[2]}` : prefix[1];
  const displayNumber = `${subsection ?? chapter}.`;
  const displayInlines: ArticleInline[] = [{ type: "text", text: `${displayNumber} ${first.text.slice(prefix[0].length)}` }, ...heading.inlines.slice(1)];
  return {
    id: heading.id, displayInlines, text: inlineText(displayInlines), sourceNumber, displayNumber,
    referenceLabel: subsection ? `${chapter}.${subsection}.` : `${chapter}.`,
  };
}

/** Assign letters in actual webpage order, including originally unnumbered subsections. */
export function formatArticleHeadings(blocks: readonly ResearchBlock[]) {
  const headings = new Map<string, ArticleHeadingPresentation>();
  let chapter: ArticleHeadingPresentation | undefined;
  let subsection = 0;
  for (const block of blocks) {
    if (block.type !== "heading") continue;
    let heading = formatArticleHeading(block);
    if (block.level === 2) {
      chapter = heading;
      subsection = 0;
    } else {
      subsection += 1;
      const label = letter(subsection);
      if (!label) throw new Error("Article subsection numbering exceeds the reviewed A–Z range.");
      if (heading.sourceNumber && heading.sourceNumber.split(".")[0] !== chapter?.sourceNumber) {
        throw new Error(`Source subsection ${heading.sourceNumber} does not belong to its preceding chapter.`);
      }
      const displayNumber = `${label}.`;
      const first = block.inlines[0];
      const displayInlines: ArticleInline[] = first?.type === "text"
        ? [{ type: "text", text: `${displayNumber} ${heading.sourceNumber ? first.text.replace(/^[1-9]\d*\.[1-9]\d*\.?\s+/u, "") : first.text}` }, ...block.inlines.slice(1)]
        : [{ type: "text", text: `${displayNumber} ` }, ...block.inlines];
      heading = {
        ...heading, displayInlines, text: inlineText(displayInlines), displayNumber,
        referenceLabel: chapter?.displayNumber ? `${chapter.displayNumber}${displayNumber}` : displayNumber,
      };
    }
    if (headings.has(heading.id)) throw new Error(`Duplicate heading anchor: ${heading.id}`);
    headings.set(heading.id, heading);
  }
  return headings;
}

export function buildArticleHeadingMap(blocks: readonly ResearchBlock[]) {
  const headings = new Map<string, ArticleHeadingPresentation>();
  for (const heading of formatArticleHeadings(blocks).values()) {
    if (!heading.sourceNumber) continue;
    if (headings.has(heading.sourceNumber)) throw new Error(`Duplicate source section: ${heading.sourceNumber}`);
    headings.set(heading.sourceNumber, heading);
  }
  return headings;
}

// These manuscript-specific contexts have been checked against the two frozen
// sources. Unknown text stays unchanged: matching a section number alone cannot
// distinguish a reference to this article from a citation of somebody else's paper.
const internalReferenceContexts: Readonly<Record<string, readonly string[]>> = {
  "certified-valuation-arithmetic-asian-options": [
    "Section 2 defines these objects precisely",
    "Sections 3–5 prove the main chain of implications",
    "Sections 6 and 7 develop the weak expansion and posterior transfer",
    "Section 8 presents the numerical certificates and their financial use",
    "Section 9 specifies the domain of validity",
    "Section 4 analyzes the resulting certificate width",
    "point in Section 8.3, only",
    "transform loadings required in Section 3",
    "Section 5 establishes the common Gaussian structure",
    "Section 5 verifies a deterministic-variance class",
    "Section 8 varies the step at the principal point",
    "box in Section 7 is a separate certified region",
    "Section 6 gives a common expansion formula",
    "width plateau in Section 8",
  ],
  "certified-rough-heston-valuation": [
    "Sections 2–5 develop the pricing certificate",
    "Sections 7.1 and 7.5–7.6 give the matched experiments",
    "Section 6 and Appendix B treat the rational construction",
    "Section 7 compares curve and dissipative-kernel weights on matched inputs",
    "For the Lewis rule in Section 4, set",
    "numerical comparison in Section 7 is the evidence",
    "independent reference residual in Section 4",
  ],
};

/** Link only audited internal Section references; retain every original displayed numeral. */
export function linkArticleSectionReferences(
  inlines: readonly ArticleInline[],
  slug: string,
  headings: ReadonlyMap<string, ArticleHeadingPresentation>,
): ArticleInline[] {
  const contexts = internalReferenceContexts[slug] ?? [];
  if (!contexts.length) return [...inlines];
  function linkText(text: string): ArticleInline[] {
    const links: Array<{ start: number; end: number; heading: ArticleHeadingPresentation }> = [];
    for (const context of contexts) {
      let offset = 0;
      for (let start = text.indexOf(context, offset); start >= 0; start = text.indexOf(context, offset)) {
        for (const reference of context.matchAll(/\bSections? ([1-9]\d*(?:\.\d+)*(?:(?:[–-]|(?:,\s*(?:and\s+)?|\s+and\s+))[1-9]\d*(?:\.\d+)*)*)/gu)) {
          const numbers = [...reference[1].matchAll(/[1-9]\d*(?:\.\d+)*/gu)];
          if (numbers.some((number) => !headings.has(number[0]))) continue;
          const numberOffset = reference.index + reference[0].indexOf(reference[1]);
          for (const number of numbers) {
            const from = start + numberOffset + number.index;
            links.push({ start: from, end: from + number[0].length, heading: headings.get(number[0])! });
          }
        }
        offset = start + context.length;
      }
    }
    links.sort((left, right) => left.start - right.start);
    const result: ArticleInline[] = [];
    let offset = 0;
    for (const link of links) {
      if (link.start < offset) continue;
      if (link.start > offset) result.push({ type: "text", text: text.slice(offset, link.start) });
      result.push({
        type: "link", href: `#${link.heading.id}`,
        title: `Section ${link.heading.sourceNumber}; web heading ${link.heading.referenceLabel}`,
        inlines: [{ type: "text", text: text.slice(link.start, link.end) }],
      });
      offset = link.end;
    }
    if (offset < text.length || !result.length) result.push({ type: "text", text: text.slice(offset) });
    return result;
  }
  return inlines.flatMap((inline): ArticleInline[] => {
    if (inline.type === "text") return linkText(inline.text);
    if (inline.type === "strong" || inline.type === "emphasis") return [{ ...inline, inlines: linkArticleSectionReferences(inline.inlines, slug, headings) }];
    // Existing links, code and mathematics retain their identity and contents.
    return [inline];
  });
}
