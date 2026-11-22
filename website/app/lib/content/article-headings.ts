import type { ResearchBlock, ResearchInline } from "./research-markdown";

export type ArticleInline =
  | Extract<ResearchInline, { type: "text" | "math" | "line-break" | "code" }>
  | { type: "strong" | "emphasis"; inlines: ArticleInline[] }
  | { type: "link"; href: string; title?: string; inlines: ArticleInline[] };

type ResearchHeading = Extract<ResearchBlock, { type: "heading" }>;

type ArticleHeadingPresentation = {
  id: string;
  displayInlines: ArticleInline[];
  text: string;
  sourceNumber?: string;
  displayNumber?: string;
};

/** A heading's label in the article contents, where every heading reads as plain text. */
function inlineText(inlines: readonly ArticleInline[]): string {
  return inlines.map((inline) => {
    if (inline.type === "text" || inline.type === "code") return inline.text;
    if (inline.type === "math") throw new Error(`Heading mathematics needs a reviewed plain-text label: ${inline.tex}`);
    if (inline.type === "line-break") return " ";
    return inlineText(inline.inlines);
  }).join("");
}

/**
 * Present a heading with the manuscript's own number, so that "Section 5",
 * "(5.1)" and "Appendix A.5" in the text match what the reader sees. A chapter
 * reads "5." as the papers and the repositories' manuscripts write it; a
 * subsection keeps the source's form ("5.1" or "5.1."). The source and its
 * anchors are never renumbered.
 */
export function formatArticleHeading(heading: ResearchHeading): ArticleHeadingPresentation {
  const unchanged = { id: heading.id, displayInlines: heading.inlines, text: inlineText(heading.inlines) };
  const first = heading.inlines[0];
  if (first?.type !== "text") return unchanged;
  const prefix = first.text.match(heading.level === 2 ? /^([1-9]\d*)\.?\s+/u : /^([1-9]\d*)\.([1-9]\d*)(\.?)\s+/u);
  if (!prefix) return unchanged;
  const sourceNumber = heading.level === 3 ? `${prefix[1]}.${prefix[2]}` : prefix[1];
  const displayNumber = heading.level === 3 ? `${sourceNumber}${prefix[3]}` : `${sourceNumber}.`;
  const displayInlines: ArticleInline[] = [{ type: "text", text: `${displayNumber} ${first.text.slice(prefix[0].length)}` }, ...heading.inlines.slice(1)];
  return { id: heading.id, displayInlines, text: inlineText(displayInlines), sourceNumber, displayNumber };
}

/** Present every heading of an article, checking that each numbered subsection belongs to its chapter. */
export function formatArticleHeadings(blocks: readonly ResearchBlock[]) {
  const headings = new Map<string, ArticleHeadingPresentation>();
  let chapter: ArticleHeadingPresentation | undefined;
  for (const block of blocks) {
    if (block.type !== "heading") continue;
    const heading = formatArticleHeading(block);
    if (block.level === 2) chapter = heading;
    else if (heading.sourceNumber && heading.sourceNumber.split(".")[0] !== chapter?.sourceNumber) {
      throw new Error(`Source subsection ${heading.sourceNumber} does not belong to its preceding chapter.`);
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

// These manuscript-specific contexts match the two frozen sources. Unknown text
// stays unchanged: matching a section number alone cannot distinguish a
// reference to this article from a citation of somebody else's paper.
const internalReferenceContexts: Readonly<Record<string, readonly string[]>> = {
  "certified-valuation-of-arithmetic-asian-options": [
    "for the contract of Section 5",
    "twelve-fixing Heston contract of Section 5 with",
    "Section 3 proves the general statements",
    "Section 4 evaluates the bound where contracts trade",
    "Section 5 turns the bound into a certificate",
    "Section 6 explains the Euler error",
    "Section 7 carries the fixed-parameter bounds",
    "Section 8 describes two uses",
    "the cubic law of Section 4 gives its size",
    "(Section 4), so",
    "numerical profile of Section 5",
    "such as the Euler kernel of Section 5",
    "The Heston certificate of Section 5 uses",
    "are the contract of Section 5 with its variance frozen",
    "positive part (Section 6 and Appendix B)",
    "Three features agree with Section 3",
    "The contract and model of Section 5",
    "is the subject of Section 6",
    "or the spread of Section 5, the interval",
    "Section 6 gives its order",
  ],
  "certified-joint-pricing-errors-in-rough-heston": [
    "On the six-month example of Section 7, replacing",
    "Section 7 applies the certificate to S&P 500 index options",
    "Section 6 records a structural property",
    "Section 2 states the pricing problem",
    "Section 3 proves the residual bound and Section 4 turns it",
    "Section 5 treats portfolios",
    "Section 6 describes the stored output and Section 7 the evidence",
    "for the curve used in Section 7",
    "for the curve calibrated in Section 7",
    "parameters of Section 7",
    "For the curve of Section 7",
    "or the residual bound of Section 3",
    "comparison of the two bounds in Section 7 uses",
    "on the strike ladder of Section 7",
    "Section 7.4 finds both effects in the data",
    "on the parameter set of Section 7 the absence of poles",
    "the rational approximation of Section 6 evaluated in binary64",
    "The reference of Section 4 uses the Fourier step",
    "as Section 5.2 anticipated",
    "Section 5 is model-free",
  ],
};

// The papers whose manuscripts cite their own equations, statements, tables
// and figures in plain text. Each such reference links to its target, as the
// dependence paper's do from its TeX source: an equation by its parenthesized
// number, a statement, table or figure by its number.
const CROSS_REFERENCED = new Set(["certified-valuation-of-arithmetic-asian-options", "certified-joint-pricing-errors-in-rough-heston"]);
const LABELED = "Theorem|Proposition|Lemma|Corollary|Remark|Definition|Assumption|Example|Table|Figure";
const LABEL_NUMBER = String.raw`[A-Z]?\d+(?:\.\d+)?`;
const STATEMENT = new RegExp(String.raw`^(?:!\[)?\*\*(${LABELED}) (${LABEL_NUMBER})[ .(]`, "u");
const CITED_STATEMENTS = new RegExp(String.raw`\b(${LABELED})s? (${LABEL_NUMBER}(?:(?:,\s*(?:and\s+)?|\s+and\s+|\s*[–-]\s*)${LABEL_NUMBER})*)`, "gu");
const CITED_EQUATION = /\(((?:[A-Z]\.)?\d+\.\d+)\)/gu;
// A label right after a year or "their" belongs to another paper.
const OTHER_PAPER = /(?:\d{4}[a-z]?,|\btheir)\s*$/u;

/** The anchor of every numbered equation, statement, table and figure of a cross-referenced paper, and the label each block carries. */
export function buildReferenceTargets(slug: string, blocks: readonly ResearchBlock[]) {
  const targets = new Map<string, string>();
  const anchors = new Map<number, string>();
  if (!CROSS_REFERENCED.has(slug)) return { targets, anchors };
  const anchor = (index: number, key: string, id: string) => {
    if (targets.has(key)) throw new Error(`${slug}: ${key} is numbered twice.`);
    targets.set(key, id);
    anchors.set(index, id);
  };
  blocks.forEach((block, index) => {
    if (block.type === "equation") {
      const tag = /\\tag\{([^}]+)\}/u.exec(block.tex)?.[1];
      if (tag) anchor(index, `(${tag})`, `equation-${tag.replaceAll(".", "-")}`);
      return;
    }
    if (block.type !== "paragraph" && block.type !== "figure") return;
    const label = STATEMENT.exec(block.source.trimStart()) ?? /^!\[(Figure) (\d+)\./u.exec(block.source.trimStart());
    if (label) anchor(index, `${label[1]} ${label[2]}`, `${label[1].toLowerCase()}-${label[2].replaceAll(".", "-")}`);
  });
  return { targets, anchors };
}

type Reference = { start: number; end: number; href: string };

/**
 * Link audited internal Section references and, in a cross-referenced paper,
 * every reference to its own numbered equations, statements, tables and
 * figures; every numeral displays as the source writes it. `self` is the
 * anchor of the block being linked, which never links to itself.
 */
export function linkArticleSectionReferences(
  inlines: readonly ArticleInline[],
  slug: string,
  headings: ReadonlyMap<string, ArticleHeadingPresentation>,
  targets: ReadonlyMap<string, string> = new Map(),
  self?: string,
): ArticleInline[] {
  const contexts = internalReferenceContexts[slug] ?? [];
  if (!contexts.length && !targets.size) return [...inlines];
  function linkText(text: string): ArticleInline[] {
    const links: Reference[] = [];
    for (const context of contexts) {
      let offset = 0;
      for (let start = text.indexOf(context, offset); start >= 0; start = text.indexOf(context, offset)) {
        for (const reference of context.matchAll(/\bSections? ([1-9]\d*(?:\.\d+)*(?:(?:[–-]|(?:,\s*(?:and\s+)?|\s+and\s+))[1-9]\d*(?:\.\d+)*)*)/gu)) {
          const numbers = [...reference[1].matchAll(/[1-9]\d*(?:\.\d+)*/gu)];
          if (numbers.some((number) => !headings.has(number[0]))) continue;
          const numberOffset = reference.index + reference[0].indexOf(reference[1]);
          for (const number of numbers) {
            const from = start + numberOffset + number.index;
            links.push({ start: from, end: from + number[0].length, href: `#${headings.get(number[0])!.id}` });
          }
        }
        offset = start + context.length;
      }
    }
    const target = (key: string) => {
      const id = targets.get(key);
      return id && id !== self ? `#${id}` : undefined;
    };
    for (const equation of text.matchAll(CITED_EQUATION)) {
      const href = target(equation[0]);
      if (href) links.push({ start: equation.index, end: equation.index + equation[0].length, href });
    }
    for (const reference of text.matchAll(CITED_STATEMENTS)) {
      if (OTHER_PAPER.test(text.slice(0, reference.index))) continue;
      const listOffset = reference.index + reference[0].indexOf(reference[2], reference[1].length);
      for (const number of reference[2].matchAll(new RegExp(LABEL_NUMBER, "gu"))) {
        const href = target(`${reference[1]} ${number[0]}`);
        if (href) links.push({ start: listOffset + number.index, end: listOffset + number.index + number[0].length, href });
      }
    }
    links.sort((left, right) => left.start - right.start);
    const result: ArticleInline[] = [];
    let offset = 0;
    for (const link of links) {
      if (link.start < offset) continue;
      if (link.start > offset) result.push({ type: "text", text: text.slice(offset, link.start) });
      result.push({ type: "link", href: link.href, inlines: [{ type: "text", text: text.slice(link.start, link.end) }] });
      offset = link.end;
    }
    if (offset < text.length || !result.length) result.push({ type: "text", text: text.slice(offset) });
    return result;
  }
  return inlines.flatMap((inline): ArticleInline[] => {
    if (inline.type === "text") return linkText(inline.text);
    if (inline.type === "strong" || inline.type === "emphasis") return [{ ...inline, inlines: linkArticleSectionReferences(inline.inlines, slug, headings, targets, self) }];
    // Links, code and mathematics pass through unchanged.
    return [inline];
  });
}
