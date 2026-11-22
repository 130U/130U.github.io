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

type PaperParagraph = {
  text: string;
  runs: PaperRun[];
};

type PaperBlock = PaperParagraph & {
  type: "heading" | "paragraph" | "table";
  level?: number;
  id?: string;
  /** A table's rows; the first row holds the column headings. */
  rows?: PaperParagraph[][];
  /** A table's numbered caption, "Table N." and its sentence. */
  caption?: PaperParagraph;
};

export type LegalPaper = {
  slug: string;
  title: string;
  author: string;
  date: string;
  /** The paper's repository and its manuscript there. */
  repositoryUrl: string;
  sourceUrl: string;
  abstract: PaperParagraph[];
  acknowledgment: PaperParagraph;
  blocks: PaperBlock[];
  footnotes: Array<PaperParagraph & { number: number }>;
};

export const legalPaperSlugs = [
  "autonomous-authority-in-space",
  "small-states-and-the-governance-of-strategic-space-dependence",
  "who-may-choose-the-lesser-risk",
  "mangrove-restoration-and-the-limits-of-compensatory-mitigation",
] as const;

const legalPapers: readonly LegalPaper[] = legalPaperSlugs.map((slug) => {
  const paper = JSON.parse(readFileSync(join(process.cwd(), "content", "legal-papers", `${slug}.json`), "utf8")) as LegalPaper;
  if (paper.slug !== slug || !paper.title || !paper.author || !paper.abstract.length || !paper.blocks.length ||
      !paper.repositoryUrl.startsWith("https://github.com/130U/LAW-") || !paper.sourceUrl.startsWith(`${paper.repositoryUrl}/blob/main/manuscript/`)) {
    throw new Error(`Incomplete legal paper: ${slug}`);
  }
  const ids = paper.blocks.filter(({ type }) => type === "heading").map(({ id }) => id);
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) {
    throw new Error(`Legal paper headings need unique anchors: ${slug}`);
  }
  if (paper.blocks.some(({ type, rows }) => type === "table" && (!rows || rows.length < 2 || rows.some((row) => row.length !== rows[0].length)))) {
    throw new Error(`Legal paper tables need a heading row and rows of equal width: ${slug}`);
  }
  if (paper.footnotes.some(({ number }, index) => number !== index + 1)) {
    throw new Error(`Legal paper footnotes must remain sequential: ${slug}`);
  }
  return paper;
});

export function getLegalPaper(slug: string) {
  return legalPapers.find((paper) => paper.slug === slug);
}
