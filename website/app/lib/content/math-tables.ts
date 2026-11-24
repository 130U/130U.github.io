import type { ResearchDisplayTable } from "./research-math";

/**
 * The titles of the tables of mathematics. A display that is one array ends a
 * sentence, and the manuscript gives it no caption: it takes as its title the
 * words of that sentence that name what it holds, the subject the sentence sets
 * equal to it ("the four regime slopes are"), in sentence case. A table whose
 * sentence names nothing ("Then") stands untitled. Each title is keyed by its
 * paper and by the table's first cell; a test holds every title to the words of
 * its sentence.
 */
export const MATH_TABLE_TITLES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  "critical-dependence-stress-for-diversification-gains-under-fixed-marginals": {
    [String.raw`(1_{\{B>u\}},1_{\{A_\varepsilon>t\}})`]: "the four regime slopes",
  },
  "certified-valuation-of-arithmetic-asian-options": {
    [String.raw`\text{one quote:}`]: "the 2.5, 50 and 97.5 percent quantiles of the initial variance",
  },
};

/**
 * The column heads of a table of mathematics the manuscript does not head, in
 * the words of its sentence that name its columns ("the 2.5, 50 and 97.5
 * percent quantiles … lie in"), so the reader need not map the sentence onto
 * the columns; the row labels' column stands unheaded. Keyed as the titles are;
 * a test holds every head to the words and numbers of its sentence.
 */
export const MATH_TABLE_HEADS: Readonly<Record<string, Readonly<Record<string, readonly string[]>>>> = {
  "certified-valuation-of-arithmetic-asian-options": {
    [String.raw`\text{one quote:}`]: ["", "2.5 percent", "50 percent", "97.5 percent"],
  },
};

/** The title of a table of mathematics, in sentence case, or undefined for a table its sentence does not name. */
export function mathTableTitle(slug: string, table: ResearchDisplayTable) {
  const words = MATH_TABLE_TITLES[slug]?.[table.rows[0].cells[0]];
  return words && words[0].toUpperCase() + words.slice(1);
}

/** The column heads the site gives a table of mathematics whose manuscript heads none, or undefined. */
export function mathTableHeads(slug: string, table: ResearchDisplayTable) {
  const heads = MATH_TABLE_HEADS[slug]?.[table.rows[0].cells[0]];
  if (!heads) return undefined;
  if (table.rows[0].rule === "header") throw new Error(`A table of mathematics the manuscript heads takes no other heads: ${table.rows[0].cells[0]}.`);
  if (heads.length !== table.columns.length) throw new Error(`A table of mathematics takes one head for each of its ${table.columns.length} columns: ${table.rows[0].cells[0]}.`);
  return heads;
}
