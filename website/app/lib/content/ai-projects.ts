import { readFileSync } from "node:fs";
import { join } from "node:path";

export type AiResearchInline =
  | { type: "text"; text: string }
  | { type: "math"; tex: string }
  | { type: "line-break" };

export type AiResearchCell = { source: string; inlines: AiResearchInline[] };

export type AiResearchBlock =
  | { type: "paragraph"; source: string; inlines: AiResearchInline[] }
  | { type: "heading"; source: string; level: 2 | 3; id: string; inlines: AiResearchInline[] }
  | { type: "equation"; source: string; tex: string }
  | { type: "table"; source: string; headerRow: boolean; rows: AiResearchCell[][] };

export type AiResearchProject = {
  slug: string;
  title: string;
  sourceUrl: string;
  sourceEditedAt: string;
  markdown: string;
  blocks: AiResearchBlock[];
};

export const AI_DOMAIN_PATH = "/past-experience/artificial-intelligence/";
export const aiResearchProjectSlugs = [
  "statistical-inference-and-resource-allocation-in-expert-data-production",
  "task-validity-in-financial-synthetic-data",
  "verification-and-supervision-in-scientific-reasoning-tasks",
  "evidence-uncertainty-and-decision-guarantees-in-investment-research",
] as const;

const MATH_PREFIX = "@@AI-MATH-";

export function parseAiResearchMarkdown(markdown: string): AiResearchBlock[] {
  if (markdown.includes(MATH_PREFIX)) throw new Error("AI research source contains a reserved equation marker.");

  const formulas: Array<{ tex: string; display: boolean; source: string }> = [];
  // Protect TeX before parsing Notion markup: comparisons can contain < or >,
  // and optimality notation can contain stars that are not Markdown emphasis.
  const protectedText = markdown.replace(/\$\$([\s\S]*?)\$\$|\$`([^`]*?)`\$/gu, (source, displayTex, inlineTex) => {
    const index = formulas.length;
    const tex = displayTex ?? inlineTex;
    if (!tex.trim()) throw new Error("AI research equations cannot be empty.");
    formulas.push({ tex, display: displayTex !== undefined, source });
    return `${MATH_PREFIX}${index}@@`;
  });
  const uses = formulas.map(() => 0);

  function formulaAt(index: number) {
    const formula = formulas[index];
    if (!formula) throw new Error(`Unknown AI research equation: ${index}`);
    return formula;
  }

  function restoreSource(source: string) {
    return source.replace(/@@AI-MATH-(\d+)@@/gu, (_, index) => formulaAt(Number(index)).source);
  }

  function inlines(source: string): AiResearchInline[] {
    const result: AiResearchInline[] = [];
    let offset = 0;
    for (const match of source.matchAll(/<br\s*\/?>|@@AI-MATH-(\d+)@@/giu)) {
      if (match.index > offset) result.push({ type: "text", text: source.slice(offset, match.index) });
      if (match[1] === undefined) {
        result.push({ type: "line-break" });
      } else {
        const index = Number(match[1]);
        const formula = formulaAt(index);
        if (formula.display) throw new Error("AI research display equations must occupy their own source block.");
        uses[index] += 1;
        result.push({ type: "math", tex: formula.tex });
      }
      offset = match.index + match[0].length;
    }
    if (offset < source.length) result.push({ type: "text", text: source.slice(offset) });
    return result;
  }

  function table(source: string): AiResearchBlock {
    const match = source.match(/^<table\b([^>]*)>([\s\S]*?)<\/table>$/u);
    if (!match) throw new Error("Incomplete AI research table.");
    const rows: AiResearchCell[][] = [];
    let rowOffset = 0;
    for (const row of match[2].matchAll(/<tr>\s*([\s\S]*?)\s*<\/tr>/gu)) {
      if (match[2].slice(rowOffset, row.index).trim()) throw new Error("Unexpected content between AI research table rows.");
      const cells: AiResearchCell[] = [];
      let cellOffset = 0;
      for (const cell of row[1].matchAll(/<td>([\s\S]*?)<\/td>/gu)) {
        if (row[1].slice(cellOffset, cell.index).trim()) throw new Error("Unexpected content between AI research table cells.");
        cells.push({ source: restoreSource(cell[1]), inlines: inlines(cell[1]) });
        cellOffset = cell.index + cell[0].length;
      }
      if (!cells.length || row[1].slice(cellOffset).trim()) throw new Error("Incomplete AI research table row.");
      rows.push(cells);
      rowOffset = row.index + row[0].length;
    }
    if (!rows.length || match[2].slice(rowOffset).trim() || rows.some((row) => row.length !== rows[0].length)) {
      throw new Error("AI research tables must retain complete rectangular rows.");
    }
    return { type: "table", source: restoreSource(source), headerRow: /\bheader-row="true"/u.test(match[1]), rows };
  }

  const blocks: AiResearchBlock[] = [];
  const lines = protectedText.split(/\r?\n/u);
  let headingCount = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const structuralLine = line.trim();
    if (!structuralLine) continue;

    const display = structuralLine.match(/^@@AI-MATH-(\d+)@@$/u);
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
        if (index >= lines.length) throw new Error("Unclosed AI research table.");
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
    if (/^#{1,6} /u.test(structuralLine)) throw new Error("Unsupported AI research source heading level.");
    blocks.push({ type: "paragraph", source: restoreSource(line), inlines: inlines(line) });
  }

  if (!blocks.length || uses.some((count) => count !== 1)) throw new Error("AI research source blocks lost or duplicated equations.");
  return blocks;
}

export const aiResearchProjects: readonly AiResearchProject[] = aiResearchProjectSlugs.map((slug) => {
  const source = JSON.parse(readFileSync(join(process.cwd(), "content", "artificial-intelligence", `${slug}.json`), "utf8")) as Omit<AiResearchProject, "blocks">;
  if (source.slug !== slug || !source.title || !source.markdown || !source.sourceUrl || !source.sourceEditedAt) {
    throw new Error(`Incomplete AI research project: ${slug}`);
  }
  return { ...source, blocks: parseAiResearchMarkdown(source.markdown) };
});

export function aiResearchProjectPath(slug: string) {
  return `${AI_DOMAIN_PATH}${slug}/`;
}

export function getAiResearchProject(slug: string) {
  return aiResearchProjects.find((project) => project.slug === slug);
}
