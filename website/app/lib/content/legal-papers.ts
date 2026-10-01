import { readFileSync } from "node:fs";
import { join } from "node:path";

export type PaperRun = {
  text: string;
  italic?: boolean;
  bold?: boolean;
  smallCaps?: boolean;
  superscript?: boolean;
  footnoteRef?: number | string;
};

export type PaperParagraph = {
  text: string;
  runs: PaperRun[];
  sourcePages?: number[];
};

export type PaperBlock = PaperParagraph & {
  type: "heading" | "paragraph";
  level?: number;
  id?: string;
};

export type LegalPaper = {
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  date: string;
  abstract: PaperParagraph[];
  acknowledgment: PaperParagraph;
  blocks: PaperBlock[];
  footnotes: Array<PaperParagraph & { number: number }>;
};

export const LEGAL_DOMAIN_PATH = "/past-experience/legal-research-and-policy-analysis/";
export const legalPaperSlugs = [
  "autonomous-authority-in-space",
  "small-states-and-strategic-space-dependence",
  "solar-geoengineering-comparison-and-continuity",
  "mangrove-restoration-and-compensatory-mitigation",
] as const;

export const legalPapers: readonly LegalPaper[] = legalPaperSlugs.map((slug) => {
  const paper = JSON.parse(readFileSync(join(process.cwd(), "content", "legal-papers", `${slug}.json`), "utf8")) as LegalPaper;
  if (paper.slug !== slug || !paper.title || !paper.author || !paper.abstract.length || !paper.blocks.length) {
    throw new Error(`Incomplete legal paper: ${slug}`);
  }
  const ids = paper.blocks.filter(({ type }) => type === "heading").map(({ id }) => id);
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) {
    throw new Error(`Legal paper headings need unique anchors: ${slug}`);
  }
  if (paper.footnotes.some(({ number }, index) => number !== index + 1)) {
    throw new Error(`Legal paper footnotes must remain sequential: ${slug}`);
  }
  return paper;
});

export function legalPaperPath(slug: string) {
  return `${LEGAL_DOMAIN_PATH}${slug}/`;
}

export function getLegalPaper(slug: string) {
  return legalPapers.find((paper) => paper.slug === slug);
}
