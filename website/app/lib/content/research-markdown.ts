export type ResearchInline =
  | { type: "text"; text: string }
  | { type: "math"; tex: string }
  | { type: "line-break" };

export type ResearchCell = { source: string; inlines: ResearchInline[] };

export type ResearchBlock =
  | { type: "paragraph"; source: string; inlines: ResearchInline[] }
  | { type: "heading"; source: string; level: 2 | 3; id: string; inlines: ResearchInline[] }
  | { type: "equation"; source: string; tex: string }
  | { type: "table"; source: string; headerRow: boolean; rows: ResearchCell[][] };

export type ResearchArticleContent = {
  slug: string;
  title: string;
  sourceUrl: string;
  sourceEditedAt: string;
  markdown: string;
  blocks: ResearchBlock[];
};

const MATH_PREFIX = "@@RESEARCH-MATH-";

export function parseResearchMarkdown(markdown: string): ResearchBlock[] {
  if (markdown.includes(MATH_PREFIX)) throw new Error("Research source contains a reserved equation marker.");

  const formulas: Array<{ tex: string; display: boolean; source: string }> = [];
  // Protect TeX before parsing inline markup: comparisons can contain < or >,
  // and optimality notation can contain stars that are not Markdown emphasis.
  const protectedText = markdown.replace(/\$\$([\s\S]*?)\$\$|\$`([^`]*?)`\$/gu, (source, displayTex, inlineTex) => {
    const index = formulas.length;
    const tex = displayTex ?? inlineTex;
    if (!tex.trim()) throw new Error("Research equations cannot be empty.");
    formulas.push({ tex, display: displayTex !== undefined, source });
    return `${MATH_PREFIX}${index}@@`;
  });
  const uses = formulas.map(() => 0);

  function formulaAt(index: number) {
    const formula = formulas[index];
    if (!formula) throw new Error(`Unknown research equation: ${index}`);
    return formula;
  }

  function restoreSource(source: string) {
    return source.replace(/@@RESEARCH-MATH-(\d+)@@/gu, (_, index) => formulaAt(Number(index)).source);
  }

  function inlines(source: string): ResearchInline[] {
    const result: ResearchInline[] = [];
    let offset = 0;
    for (const match of source.matchAll(/<br\s*\/?>|@@RESEARCH-MATH-(\d+)@@/giu)) {
      if (match.index > offset) result.push({ type: "text", text: source.slice(offset, match.index) });
      if (match[1] === undefined) {
        result.push({ type: "line-break" });
      } else {
        const index = Number(match[1]);
        const formula = formulaAt(index);
        if (formula.display) throw new Error("Research display equations must occupy their own source block.");
        uses[index] += 1;
        result.push({ type: "math", tex: formula.tex });
      }
      offset = match.index + match[0].length;
    }
    if (offset < source.length) result.push({ type: "text", text: source.slice(offset) });
    return result;
  }

  function table(source: string): ResearchBlock {
    const match = source.match(/^<table\b([^>]*)>([\s\S]*?)<\/table>$/u);
    if (!match) throw new Error("Incomplete Research table.");
    const rows: ResearchCell[][] = [];
    let rowOffset = 0;
    for (const row of match[2].matchAll(/<tr>\s*([\s\S]*?)\s*<\/tr>/gu)) {
      if (match[2].slice(rowOffset, row.index).trim()) throw new Error("Unexpected content between Research table rows.");
      const cells: ResearchCell[] = [];
      let cellOffset = 0;
      for (const cell of row[1].matchAll(/<td>([\s\S]*?)<\/td>/gu)) {
        if (row[1].slice(cellOffset, cell.index).trim()) throw new Error("Unexpected content between Research table cells.");
        cells.push({ source: restoreSource(cell[1]), inlines: inlines(cell[1]) });
        cellOffset = cell.index + cell[0].length;
      }
      if (!cells.length || row[1].slice(cellOffset).trim()) throw new Error("Incomplete Research table row.");
      rows.push(cells);
      rowOffset = row.index + row[0].length;
    }
    if (!rows.length || match[2].slice(rowOffset).trim() || rows.some((row) => row.length !== rows[0].length)) {
      throw new Error("Research tables must retain complete rectangular rows.");
    }
    return { type: "table", source: restoreSource(source), headerRow: /\bheader-row="true"/u.test(match[1]), rows };
  }

  const blocks: ResearchBlock[] = [];
  const lines = protectedText.split(/\r?\n/u);
  let headingCount = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const structuralLine = line.trim();
    if (!structuralLine) continue;

    const display = structuralLine.match(/^@@RESEARCH-MATH-(\d+)@@$/u);
    if (display && formulaAt(Number(display[1])).display) {
      const formulaIndex = Number(display[1]);
      const formula = formulaAt(formulaIndex);
      uses[formulaIndex] += 1;
      blocks.push({ type: "equation", source: formula.source, tex: formula.tex });
      continue;
    }

    if (structuralLine.startsWith("<table")) {
      const tableLines = [structuralLine];
      while (!tableLines.at(-1)?.endsWith("</table>")) {
        index += 1;
        if (index >= lines.length) throw new Error("Unclosed Research table.");
        tableLines.push(lines[index]);
      }
      blocks.push(table(tableLines.join("\n")));
      continue;
    }

    const heading = structuralLine.match(/^(#{2,3}) (.+)$/u);
    if (heading) {
      headingCount += 1;
      blocks.push({
        type: "heading",
        source: restoreSource(line),
        level: heading[1].length as 2 | 3,
        id: `section-${headingCount}`,
        inlines: inlines(heading[2]),
      });
      continue;
    }
    if (/^#{1,6} /u.test(structuralLine)) throw new Error("Unsupported Research source heading level.");
    blocks.push({ type: "paragraph", source: restoreSource(line), inlines: inlines(line) });
  }

  if (!blocks.length || uses.some((count) => count !== 1)) throw new Error("Research source blocks lost or duplicated equations.");
  return blocks;
}

