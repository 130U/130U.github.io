export type ResearchInline =
  | { type: "text"; text: string }
  | { type: "math"; tex: string }
  | { type: "strong" | "emphasis"; inlines: ResearchInline[] }
  | { type: "code"; text: string }
  | { type: "link"; href: string; inlines: ResearchInline[] }
  | { type: "line-break" };

export type ResearchCell = { source: string; inlines: ResearchInline[] };

export type ResearchBlock =
  | { type: "paragraph"; source: string; inlines: ResearchInline[]; id?: string }
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
  repositoryUrl?: string;
};

const MATH_PREFIX = "@@RESEARCH-MATH-";

export function parseResearchMarkdown(markdown: string, options: { joinSoftLines?: boolean } = {}): ResearchBlock[] {
  if (markdown.includes(MATH_PREFIX)) throw new Error("Research source contains a reserved equation marker.");

  const formulas: Array<{ tex: string; display: boolean; source: string }> = [];
  // Protect TeX before parsing inline markup: comparisons can contain < or >,
  // and optimality notation can contain stars that are not Markdown emphasis.
  const protectedText = markdown.replace(/```math\r?\n([\s\S]*?)\r?\n```|\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$`([^`]*?)`\$|(?<!\\)\$([^$\r\n]+?)(?<!\\)\$/gu, (source, fencedTex, displayTex, bracketTex, parenTex, inlineTex, dollarTex) => {
    const index = formulas.length;
    const tex = fencedTex ?? displayTex ?? bracketTex ?? parenTex ?? inlineTex ?? dollarTex;
    if (!tex.trim()) throw new Error("Research equations cannot be empty.");
    formulas.push({ tex, display: fencedTex !== undefined || displayTex !== undefined || bracketTex !== undefined, source });
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

  function paragraphBoundary(line: string) {
    const value = line.trim();
    if (!value || /^(?:#{1,6} |<table\b|<a id=|\||(?:[-*+]|\d+[.)])\s)/u.test(value)) return true;
    const display = value.match(/^@@RESEARCH-MATH-(\d+)@@$/u);
    return display !== null && formulaAt(Number(display[1])).display;
  }

  function inlines(source: string): ResearchInline[] {
    const result: ResearchInline[] = [];
    let offset = 0;
    for (const match of source.matchAll(/<br\s*\/?>|@@RESEARCH-MATH-(\d+)@@|\*\*([\s\S]+?)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(((?:https?:\/\/|mailto:|#)[^\s)]+)\)/giu)) {
      if (match.index > offset) result.push({ type: "text", text: source.slice(offset, match.index) });
      if (match[2] !== undefined || match[3] !== undefined) {
        result.push({ type: match[2] !== undefined ? "strong" : "emphasis", inlines: inlines(match[2] ?? match[3]) });
      } else if (match[4] !== undefined) {
        result.push({ type: "code", text: match[4] });
      } else if (match[5] !== undefined) {
        result.push({ type: "link", href: match[6], inlines: inlines(match[5]) });
      } else if (match[1] === undefined) {
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
  let paragraphId: string | undefined;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const structuralLine = line.trim();
    if (!structuralLine) continue;

    const anchor = structuralLine.match(/^<a id="([A-Za-z][A-Za-z0-9-]*)"><\/a>$/u);
    if (anchor) {
      if (paragraphId) throw new Error("Research anchor lacks its reference paragraph.");
      paragraphId = anchor[1];
      continue;
    }

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

    if (structuralLine.startsWith("|")) {
      const tableLines = [structuralLine];
      while (index + 1 < lines.length && lines[index + 1].trim().startsWith("|")) {
        index += 1;
        tableLines.push(lines[index].trim());
      }
      const cells = (row: string) => row.replace(/^\||\|$/gu, "").split("|").map((cell) => cell.trim());
      if (tableLines.length < 2 || !cells(tableLines[1]).every((cell) => /^:?-+:?$/u.test(cell))) {
        throw new Error("Research Markdown tables require a header separator.");
      }
      const rows = [tableLines[0], ...tableLines.slice(2)].map((row) => cells(row).map((cell) => ({ source: restoreSource(cell), inlines: inlines(cell) })));
      if (!rows[0].length || rows.some((row) => row.length !== rows[0].length)) throw new Error("Research tables must retain complete rectangular rows.");
      blocks.push({ type: "table", source: restoreSource(tableLines.join("\n")), headerRow: true, rows });
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
    const paragraphLines = [line];
    if (options.joinSoftLines) {
      while (index + 1 < lines.length && !paragraphBoundary(lines[index + 1])) {
        index += 1;
        paragraphLines.push(lines[index]);
      }
    }
    blocks.push({ type: "paragraph", source: restoreSource(paragraphLines.join("\n")), inlines: inlines(paragraphLines.join(" ")), ...(paragraphId ? { id: paragraphId } : {}) });
    paragraphId = undefined;
  }

  if (paragraphId || !blocks.length || uses.some((count) => count !== 1)) throw new Error("Research source blocks lost or duplicated equations.");
  return blocks;
}
