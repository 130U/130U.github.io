// Manuscript passages the site presents as research tables, keyed by article
// slug, as article-figures.ts keys figures. A passage that reports a list of
// results, several many-digit numbers or intervals strung through a sentence or
// set as a bare display, reads as a table: the manuscript's words become the
// table's title, column heads and row labels, and its formulas become the cells.
//
// A passage runs from `from` (the opening of its first block; with `at`, from
// those words on, the text before them staying a paragraph) through `through`
// (the opening of its last block; with `after`, up to and including those
// words, the text after them staying a paragraph). A table reads by rows, or,
// declared `reading: "columns"`, down its columns: a passage that lists one
// quantity's values and then another's ("estimates …, with standard errors …")
// sets each quantity as a column, its points down the rows, as the manuscript's
// neighboring tables set them. The build fails unless the table restates the
// passage exactly:
// - its formulas are the passage's formulas, every one of them, whole and in the
//   manuscript's order (title, heads, then rows left to right, or columns top to
//   bottom);
// - every number the passage writes in digits outside a formula stands in the
//   table, and every number the table writes outside a formula is one the
//   passage or a cited `source` states;
// - every word of the title, heads and row labels is one the passage, a cited
//   `source`, or the heads of the manuscript table whose form it takes (`form`) uses;
// - a display of the passage becomes a row that shows its equation number and
//   carries its TeX whole (`display`), and no display is dropped.
// The paper repositories, importers and frozen sources stay as they are.

import type { ResearchBlock } from "./research-markdown";

type Row = {
  /** Markdown cells, the first the row label. */
  cells: string[];
  /** The display this row presents, by its equation number: the row shows the number and its value cell carries the display's TeX. */
  display?: string;
};

type PassageTableSpec = {
  id: string;
  from: string;
  at?: string;
  through: string;
  after?: string;
  /** The caption opening of the manuscript table whose form the table takes, as "Table 7.". */
  form?: string;
  /** Manuscript text elsewhere that states a value or names a quantity the table writes. */
  sources?: string[];
  /** The order in which the table's cells restate the passage: by rows (the default), or down its columns. */
  reading?: "rows" | "columns";
  title: string;
  head: string[];
  rows: Row[];
};

const passageTables: Readonly<Record<string, readonly PassageTableSpec[]>> = {
  "certified-valuation-of-arithmetic-asian-options": [
    {
      id: "asian-certificate",
      from: "Section 5 turns the bound into a certificate for a contract on which it is not small",
      at: "The continuous price lies in",
      through: "the price under absorbed Euler with step $`h=1/768`$ lies in",
      form: "Table 7.",
      title: "The certificate for the 95–110 call spread",
      head: ["Quantity", "Enclosure"],
      rows: [
        { cells: ["Continuous price", ""], display: "1.3" },
        { cells: ["Price under absorbed Euler, $`h=1/768`$", "$`[6.507844281,\\;6.519014106]`$"] },
        { cells: ["Difference", "$`[-0.011024692273,\\;0.010642371599]`$"] },
      ],
    },
    {
      id: "asian-coefficient-estimates",
      from: "A sampling estimate of the coefficient itself",
      through: "A sampling estimate of the coefficient itself",
      after: "and $`0.001274`$.",
      // The estimates stand "in increasing order of initial variance", at the four points of Table 9.
      sources: ["| 0.03 | $`[-3.441491358,3.441491358]`$ |", "| 0.04 | $`[-0.928189505,0.928189505]`$ |", "| 0.05 | $`[-0.785853082,0.785853082]`$ |", "| 0.06 | $`[-2.057270822,2.057270822]`$ |"],
      // The initial variances run down the rows, as in Tables 9 and 10 beside it; the passage's
      // estimates, then its standard errors, run down the columns.
      reading: "columns",
      title: "Sampling estimate of the coefficient itself, with 2,097,152 Gaussian vectors per point",
      head: ["Initial variance", "Estimate", "Standard error"],
      rows: [
        { cells: ["0.03", "$`-0.041015`$", "$`0.002079`$"] },
        { cells: ["0.04", "$`-0.011364`$", "$`0.000566`$"] },
        { cells: ["0.05", "$`0.008329`$", "$`0.000483`$"] },
        { cells: ["0.06", "$`0.019917`$", "$`0.001274`$"] },
      ],
    },
  ],
};

/** A cell's Markdown; a display's value cell also carries the display's TeX and number. */
type PassageCell = { source: string; display?: { tex: string; number: string } };

export type PlacedPassageTable = {
  id: string;
  /** The first and last block of the passage. */
  start: number;
  end: number;
  /** The Markdown of the first block before the table, and of the last block after it, each a paragraph. */
  head?: string;
  tail?: string;
  title: string;
  /** Whether the table restates its passage down its columns rather than by rows. */
  reading: "rows" | "columns";
  /** The heads, then the rows. */
  rows: PassageCell[][];
  /** For each passage block presented by the table, the row that first presents it (-1 for the table itself). */
  blockRows: Map<number, number>;
};

const FORMULA = /```math\r?\n([\s\S]*?)\r?\n```|\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$`([^`]*?)`\$/gu;

/** The formulas of Markdown text in order, each with its TeX and whether it is a display. */
export function formulasOf(text: string) {
  return [...text.matchAll(FORMULA)].map((match) => ({ tex: match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5], display: match[1] !== undefined || match[2] !== undefined || match[3] !== undefined }));
}

/** Text outside formulas, links' targets and anchors. */
function proseOf(text: string) {
  return text.replace(FORMULA, " ").replace(/\]\([^)]*\)/gu, "]").replace(/<a id="[^"]*"><\/a>/gu, " ");
}

/** Numbers written outside formulas, as written ("2,097,152", "95", "110"). */
export function numbersOf(text: string) {
  return proseOf(text).match(/\d[\d,]*(?:\.\d+)?|\.\d+/gu)?.map((number) => number.replace(/,$/u, "")) ?? [];
}

/** Words of two letters or more, lowercased, a plural's "s" aside. */
export function wordsOf(text: string) {
  return (proseOf(text).match(/\p{L}{2,}/gu) ?? []).map((word) => word.toLowerCase().replace(/(?<=\p{L}{3})s$/u, ""));
}

function cell(markdown: string): PassageCell {
  return { source: markdown };
}

/** A display's value as the table writes it: its expression, without environment, number or closing punctuation. */
function displayValue(tex: string) {
  return tex.replace(/\\tag\{[^}]*\}/gu, "").replace(/\\(?:begin|end)\{gathered\}/gu, "").trim().replace(/[.,;]$/u, "").trim();
}

function tagOf(tex: string) {
  return /\\tag\{([^}]+)\}/u.exec(tex)?.[1];
}

function opening(block: ResearchBlock) {
  return block.type === "equation" ? block.source.trim() : block.source.trimStart();
}

function single(blocks: readonly ResearchBlock[], text: string, id: string) {
  const matches = blocks.flatMap((block, index) => (opening(block).startsWith(text) ? [index] : []));
  if (matches.length !== 1) throw new Error(`Passage table ${id} must open on exactly one block: "${text}" opens ${matches.length}.`);
  return matches[0];
}

function once(source: string, text: string, id: string) {
  const index = source.indexOf(text);
  if (index < 0 || source.indexOf(text, index + 1) >= 0) throw new Error(`Passage table ${id}: "${text}" must occur once in its block.`);
  return index;
}

/**
 * Resolve an article's passage tables against its blocks and check that each
 * restates its passage. `markdown` is the article's complete text, in which every
 * cited source must occur.
 */
export function placePassageTables(slug: string, blocks: readonly ResearchBlock[], markdown: string, specs: readonly PassageTableSpec[] = passageTables[slug] ?? []) {
  const placed: PlacedPassageTable[] = [];
  for (const spec of specs) {
    const start = single(blocks, spec.from, spec.id);
    const end = single(blocks, spec.through, spec.id);
    if (end < start) throw new Error(`Passage table ${spec.id} ends before it starts.`);
    const passage = blocks.slice(start, end + 1);
    const first = passage[0].source;
    const last = passage.at(-1)!.source;
    const cut = spec.at === undefined ? 0 : once(first, spec.at, spec.id);
    const resume = spec.after === undefined ? last.length : once(last, spec.after, spec.id) + spec.after.length;
    const replaced = start === end
      ? first.slice(cut, resume)
      : [first.slice(cut), ...passage.slice(1, -1).map((block) => block.source), last.slice(0, resume)].join("\n\n");
    const passageText = passage.map((block) => block.source).join("\n\n");

    // The sources a table may cite: text elsewhere in the article, and the heads of the table whose form it takes.
    for (const source of spec.sources ?? []) if (!markdown.includes(source)) throw new Error(`Passage table ${spec.id} cites text missing from the article: ${source}`);
    let formHead = "";
    if (spec.form) {
      const caption = blocks.findIndex((block) => block.type === "paragraph" && block.source.startsWith(`**${spec.form}`));
      const table = blocks[caption + 1];
      if (caption < 0 || table?.type !== "table") throw new Error(`Passage table ${spec.id} takes the form of ${spec.form}, which the article does not hold.`);
      formHead = table.rows[0].map((head) => head.source).join(" ");
    }
    const cited = [passageText, ...(spec.sources ?? []), formHead].join("\n");

    // Each display of the passage is presented by the row that names its number.
    const displays = passage.flatMap((block) => (block.type === "equation" ? [block] : []));
    const displayRows = spec.rows.filter((row) => row.display !== undefined);
    if (displayRows.length !== displays.length) throw new Error(`Passage table ${spec.id} must present each of the passage's ${displays.length} displays in a row.`);
    const rows: PassageCell[][] = [spec.head.map(cell)];
    for (const row of spec.rows) {
      const cells: PassageCell[] = row.cells.map(cell);
      if (row.display !== undefined) {
        const display = displays.find((block) => tagOf(block.tex) === row.display);
        if (!display) throw new Error(`Passage table ${spec.id} presents (${row.display}), which its passage does not display.`);
        const value = `$\`${displayValue(display.tex)}\`$`;
        if (row.cells[1]) throw new Error(`Passage table ${spec.id}: the row of (${row.display}) takes its value from the display.`);
        cells[1] = { source: value, display: { tex: display.tex, number: row.display } };
      }
      rows.push(cells);
    }

    // Formulas: the passage's, whole and in order, read by rows or down the columns.
    const formulasIn = (entry: PassageCell) => (entry.display ? [{ tex: entry.display.tex, display: true }] : formulasOf(entry.source));
    const [heads, ...body] = rows;
    const read = spec.reading === "columns"
      ? [...heads.flatMap(formulasIn), ...heads.flatMap((_, column) => body.flatMap((row) => (row[column] ? formulasIn(row[column]) : [])))]
      : rows.flatMap((row) => row.flatMap(formulasIn));
    const tableFormulas = [...formulasOf(spec.title), ...read];
    const passageFormulas = formulasOf(replaced);
    if (JSON.stringify(tableFormulas) !== JSON.stringify(passageFormulas)) {
      throw new Error(`Passage table ${spec.id} must carry the passage's formulas whole and in order.\npassage ${JSON.stringify(passageFormulas)}\ntable   ${JSON.stringify(tableFormulas)}`);
    }
    // Numbers outside formulas: none dropped, none invented.
    const tableText = [spec.title, ...spec.head, ...spec.rows.flatMap((row) => row.cells)].join("\n");
    for (const number of numbersOf(replaced)) {
      if (!numbersOf(tableText).includes(number)) throw new Error(`Passage table ${spec.id} drops the number ${number}.`);
    }
    for (const number of numbersOf(tableText)) {
      if (!numbersOf(cited).includes(number)) throw new Error(`Passage table ${spec.id} writes ${number}, which its passage does not state.`);
    }
    // Words of the title, heads and labels: the passage's own.
    const vocabulary = new Set(wordsOf(cited));
    for (const word of wordsOf([spec.title, ...spec.head, ...spec.rows.map((row) => row.cells[0])].join("\n"))) {
      if (!vocabulary.has(word)) throw new Error(`Passage table ${spec.id} names "${word}", a word its passage does not use.`);
    }

    // The element that first presents each block, so every block keeps one marker, in order: a first
    // block the table opens on is the table's; each later block is its first row's, a display's row
    // presenting its display and the next row the block after it.
    const blockRows = new Map<number, number>();
    if (spec.at === undefined) blockRows.set(start, -1);
    let row = 0;
    for (let index = start + 1; index <= end; index += 1) {
      const block = blocks[index];
      const at = block.type === "equation"
        ? spec.rows.findIndex((entry) => entry.display === tagOf(block.tex))
        : spec.rows.findIndex((entry, position) => position >= row && entry.display === undefined);
      if (at < 0) throw new Error(`Passage table ${spec.id} presents no row for block ${index}.`);
      blockRows.set(index, at);
      row = at + 1;
    }
    placed.push({
      id: spec.id,
      start,
      end,
      head: spec.at === undefined ? undefined : first.slice(0, cut).trimEnd(),
      tail: spec.after === undefined ? undefined : last.slice(resume).trimStart(),
      title: spec.title,
      reading: spec.reading ?? "rows",
      rows,
      blockRows,
    });
  }
  return placed;
}

export function passageTablesFor(slug: string) {
  return passageTables[slug] ?? [];
}
