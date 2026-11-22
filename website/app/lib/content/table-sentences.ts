/**
 * The columns of sentences of the site's tables: a column whose cells are
 * clauses, as a query written as an instruction ("Verify z₁, which determines
 * the sign of the score difference"), a step of a design ("Hold the generator
 * fixed; apply …") or a finding ("Platform command held; the American and
 * commercial payloads are separate"). Such a column wraps, at a 16rem minimum;
 * every other column of every table, row labels and long names included
 * ("H3: six months, reference through 128, upper band global"), holds one line.
 * Keyed by the page's slug and the table's first header cell, as figures and
 * emphases are keyed (article-figures.ts); columns count from 0, the row labels.
 */
const SENTENCE_COLUMNS: Readonly<Record<string, Readonly<Record<string, readonly number[]>>>> = {
  "financial-task-design-and-synthetic-data-engineering": { "Comparison stage": [0, 1, 2] },
  "evidence-verification-and-robust-comparison-in-investment-research": { "Verification query": [0] },
  "small-states-and-the-governance-of-strategic-space-dependence": { "Entitlement": [1, 2, 3] },
};

export function sentenceColumnsFor(slug: string, firstCell: string): readonly number[] {
  return SENTENCE_COLUMNS[slug]?.[firstCell.trim()] ?? [];
}

/** Every table the list names, by slug and first header cell, so a test can hold each to a table of the site. */
export function sentenceTables() {
  return Object.entries(SENTENCE_COLUMNS).flatMap(([slug, tables]) => Object.entries(tables).map(([firstCell, columns]) => ({ slug, firstCell, columns })));
}
