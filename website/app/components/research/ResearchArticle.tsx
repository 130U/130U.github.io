import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { BackToTop } from "../BackToTop";
import { ReturnArrow } from "../ReturnArrow";
import { SiteShell } from "../SiteShell";
import { TitleText } from "../TitleText";
import { ArticleReadingLayout } from "../article/ArticleReadingLayout";
import { ExperienceDiagram, ExperienceMetadata, KeyContributions, ProblemAndApproach } from "../experience/ExperienceDetails";
import type { ShowcaseEntry } from "../../lib/content/experience-showcase";
import { parseResearchMarkdown, type ResearchArticleContent, type ResearchCell, type ResearchInline } from "../../lib/content/research-markdown";
import { RESEARCH_MATH_GUTTER_EM, parseResearchDisplayTable, renderResearchDisplayTable, renderResearchMath } from "../../lib/content/research-math";
import { mathTableTitle } from "../../lib/content/math-tables";
import { buildArticleHeadingMap, buildReferenceTargets, formatArticleHeadings, linkArticleSectionReferences, type ArticleInline } from "../../lib/content/article-headings";
import { emphasisFor, manuscriptFigureFor, placeFigures } from "../../lib/content/article-figures";
import { placePassageTables, type PlacedPassageTable } from "../../lib/content/passage-tables";
import { alignColumn, isInterval, parseTableNumber, type AlignedNumber } from "../../lib/content/research-number";
import { TableValue } from "./TableValue";
import { argumentUnit, closesProof } from "../../lib/content/argument-units";
import { ArticleFigure, FigureCaption, FigureController, ManuscriptFigure } from "../figures";
import type { ActivePage } from "../../lib/content/site";
import { ResearchMath } from "./ResearchMath";
import { ResearchMathTable } from "./ResearchMathTable";
import { InlineContent } from "./ResearchInline";
import { ZoomStage } from "./ZoomStage";
import { MathFit } from "./MathFit";
import { ZoomGlyph } from "../ZoomGlyph";
import stageStyles from "./Stage.module.css";
import readingStyles from "../legal/LegalPaperPage.module.css";
import mathStyles from "./ResearchMath.module.css";
import styles from "./ResearchArticle.module.css";
import experienceStyles from "../experience/Experience.module.css";

// A numeric cell holds a number, a list of numbers, an interval or a dash; such
// columns align on the right with tabular figures.
const NUMBER = String.raw`[-+−]?(?:\d[\d,]*(?:\.\d+)?|\.\d+)(?:[eE][-+]?\d+)?%?`;
const NUMERIC_CELL = new RegExp(String.raw`^(?:${NUMBER}(?:\s*\/\s*${NUMBER})*|\[\s*${NUMBER}\s*,\s*${NUMBER}\s*\]|—)$`, "u");

function numericCell({ source }: ResearchCell) {
  const value = source.trim().replace(/^\*\*([\s\S]+)\*\*$/u, "$1");
  const formula = value.match(/^\$`([^`]*)`\$$/u);
  return NUMERIC_CELL.test(formula ? formula[1].replace(/\s+/gu, "") : value) || parseTableNumber(source) !== undefined;
}

/**
 * The values of a table, by row and column, set for the page: each cell that
 * holds a number, percentage, interval or list of numbers, grouped and, where
 * every body cell of its column is such a value or a dash, aligned on the
 * decimal point with the rest of its column. `start` marks the columns that
 * align from their start, whose values hold different numbers of fields.
 */
export function tableValues(rows: ResearchCell[][]) {
  const values: (AlignedNumber | undefined)[][] = rows.map((row) => row.map(() => undefined));
  const start = rows[0].map(() => false);
  rows[0].forEach((_, column) => {
    const body = rows.slice(1).map((row) => parseTableNumber(row[column].source));
    const aligned = body.every((value, index) => value || /^(?:—|)$/u.test(rows[index + 1][column].source.trim()));
    const set = aligned ? alignColumn(body.filter((value) => value !== undefined)) : undefined;
    start[column] = set?.start ?? false;
    let next = 0;
    body.forEach((value, index) => {
      if (value) values[index + 1][column] = set ? set.values[next++] : alignColumn([value]).values[0];
    });
  });
  return { values, start };
}

// The row labels' column counts as numeric when it holds numbers (strikes, steps,
// widths), so its figures align as every column of values does.
export function numericColumns(rows: ResearchCell[][]) {
  const body = rows.slice(1);
  return rows[0].map((_, column) => body.length > 0
    && body.every((row) => numericCell(row[column]))
    && body.some((row) => row[column].source.trim() !== "—"));
}

// Values and labels hold one line, so a row reads as one line; a column wraps
// only when its widest cell is a sentence. Widths are estimated in ems.
const AVERAGE_GLYPH_EM = 0.5;
const SENTENCE_EM = 26;

function contentWidth(inlines: ResearchInline[]): number {
  let widest = 0;
  let line = 0;
  for (const inline of inlines) {
    if (inline.type === "line-break") {
      widest = Math.max(widest, line);
      line = 0;
    } else if (inline.type === "text" || inline.type === "code") {
      line += inline.text.length * AVERAGE_GLYPH_EM;
    } else if (inline.type === "math") {
      line += renderResearchMath(inline.tex).widthEm;
    } else {
      line += contentWidth(inline.inlines);
    }
  }
  return Math.max(widest, line);
}

export function sentenceColumns(rows: ResearchCell[][]) {
  const body = rows.slice(1);
  return rows[0].map((_, column) => body.some((row) => contentWidth(row[column].inlines) > SENTENCE_EM));
}

/** The words of a cell's text, formulas and numbers aside. */
function cellWords(inlines: ResearchInline[]): string[] {
  return inlines.flatMap((inline) => inline.type === "text" || inline.type === "code"
    ? inline.text.match(/\p{L}{2,}/gu) ?? []
    : inline.type === "math" || inline.type === "line-break" ? [] : cellWords(inline.inlines));
}

/**
 * Columns of phrases: a column that holds values neither as numbers nor as
 * sentences, but some of whose cells read as two words or more ("Crude oil
 * call, 1 month ahead", "75.0% (accepts 1,800 flawed solutions)"). Such a
 * column holds one line while its table fits, and wraps when the table would
 * otherwise scroll (ZoomStage).
 */
export function phraseColumns(rows: ResearchCell[][]) {
  const numeric = numericColumns(rows);
  const sentences = sentenceColumns(rows);
  const body = rows.slice(1);
  return rows[0].map((_, column) => !numeric[column] && !sentences[column] && body.some((row) => cellWords(row[column].inlines).length >= 2));
}

// A wrapping phrase keeps lines of a few words: its column folds to about half
// its widest phrase, to no less than 6em and no more than 10em, and never wider
// than the phrase itself.
const WRAP_FLOOR_MIN_EM = 6;
const WRAP_FLOOR_MAX_EM = 10;

function wrapFloor(rows: ResearchCell[][], column: number) {
  const widest = Math.max(...rows.slice(1).map((row) => contentWidth(row[column].inlines)));
  return Math.min(widest, Math.max(widest / 2 + 1, WRAP_FLOOR_MIN_EM), WRAP_FLOOR_MAX_EM);
}

/**
 * A heading over a column of values may take three lines, as a printed table
 * stacks a long head over a narrow column of figures; every other heading takes
 * at most two.
 */
export const stackedHeadings = numericColumns;

/** A table set as two halves side by side under one heading repeated (Strike, Bid, Ask, Width,
 * Strike, Bid, Ask, Width): the number of columns in a half, or 0. */
export function tableHalves(rows: ResearchCell[][]) {
  const heading = rows[0].map((cell) => cell.source.trim());
  const half = heading.length / 2;
  return Number.isInteger(half) && half >= 2 && heading.slice(0, half).every((cell, column) => cell && cell === heading[column + half]) ? half : 0;
}

/**
 * The classes and properties every cell of a research or legal table takes, from
 * its rows: numeric columns align right in tabular figures, a column of
 * sentences wraps, a column of phrases may wrap, and a heading over values may
 * stack on three lines. In a table with a column of sentences, its phrases
 * wrap too, and the numeric columns keep their content's width, leaving the
 * rest of the row to the text. The second of two halves set side by side stands
 * a second em from the first, and in less room follows it (ZoomStage).
 */
export function tableLayout(rows: ResearchCell[][]) {
  const numeric = numericColumns(rows);
  const sentences = sentenceColumns(rows);
  const phrases = phraseColumns(rows);
  const stacked = stackedHeadings(rows);
  const halves = tableHalves(rows);
  const floors = rows[0].map((_, column) => phrases[column] ? wrapFloor(rows, column) : 0);
  // Sentence columns beyond the row labels share the room left of a label column.
  const shared = sentences.filter((sentence, column) => sentence && column > 0).length;
  const intervals = rows.slice(1).some((row) => row.some((cell) => {
    const value = parseTableNumber(cell.source);
    return value !== undefined && isInterval(value);
  }));
  return {
    table: {
      "data-hug": sentences.some(Boolean) ? "" : undefined,
      "data-wraps": phrases.some(Boolean) || shared >= 2 ? "" : undefined,
      "data-breaks": intervals ? "" : undefined,
      "data-label": sentences[0] ? "sentence" : phrases[0] ? "phrase" : undefined,
      "data-sentence-columns": shared >= 2 ? shared : undefined,
      "data-halves": halves || undefined,
      style: shared >= 2 ? { "--sentence-columns": shared } as CSSProperties : undefined,
    },
    cell(rowIndex: number, column: number) {
      const head = rowIndex === 0;
      return {
        className: [styles.cell, numeric[column] && styles.numeric, sentences[column] && styles.sentence, phrases[column] && styles.phrase].filter(Boolean).join(" "),
        style: {
          ...(head ? headingFloor(rows[0][column], stacked[column] ? 3 : 2) : {}),
          ...(phrases[column] && !head ? { "--wrap-floor": `${floors[column].toFixed(2)}em` } : {}),
        } as CSSProperties,
        "data-stack": head && stacked[column] ? "" : undefined,
        "data-half": halves && column === halves ? "" : undefined,
      };
    },
  };
}

// A heading may take two lines beside its values, or three over a column of
// short values, never more: its column is at least as wide as the longest line
// of its most even break into that many lines. Advances of the label face are
// estimated by glyph class, in ems of the label size.
const LABEL_SPACE_EM = 0.27;
const LABEL_SLACK_EM = 0.25;

function labelAdvance(text: string) {
  let advance = 0;
  for (const glyph of text) {
    advance += /[ijlI]/u.test(glyph) ? 0.27
      : /[.,:;'()[\]/ftr1]/u.test(glyph) ? 0.36
      : /[mwM%—]/u.test(glyph) ? 0.92
      : glyph === "W" ? 1.03
      : /[A-Z]/u.test(glyph) ? 0.72
      : /[0-9×=+–-]/u.test(glyph) ? 0.64
      : 0.6;
  }
  return advance;
}

/** The advance of each unbreakable word of a heading; mathematics joins the word it touches. */
function headingWords(inlines: ResearchInline[]) {
  const words: number[] = [];
  let joined = false;
  const extend = (advance: number) => {
    if (joined) words[words.length - 1] += advance;
    else words.push(advance);
    joined = true;
  };
  const read = (list: ResearchInline[]) => {
    for (const inline of list) {
      if (inline.type === "line-break") {
        joined = false;
      } else if (inline.type === "math") {
        extend(renderResearchMath(inline.tex).widthEm - 2 * RESEARCH_MATH_GUTTER_EM);
      } else if (inline.type === "text" || inline.type === "code") {
        for (const part of inline.text.split(/(\s+)/u)) {
          if (!part) continue;
          if (/^\s/u.test(part)) joined = false;
          else extend(labelAdvance(part));
        }
      } else {
        read(inline.inlines);
      }
    }
  };
  read(inlines);
  return words;
}

export function headingFloor(cell: ResearchCell, lines: 2 | 3 = 2) {
  const words = headingWords(cell.inlines);
  const line = (from: number, to: number) => words.slice(from, to).reduce((sum, word) => sum + word, 0) + LABEL_SPACE_EM * Math.max(0, to - from - 1);
  // The narrowest width at which the words from `from` on fill at most `count` lines.
  const fill = (from: number, count: number): number => {
    if (count === 1 || words.length - from <= 1) return line(from, words.length);
    let best = line(from, words.length);
    for (let split = from + 1; split < words.length; split += 1) best = Math.min(best, Math.max(line(from, split), fill(split, count - 1)));
    return best;
  };
  return { "--heading-floor": `${(fill(0, lines) + LABEL_SLACK_EM).toFixed(2)}em` } as CSSProperties;
}

// The papers set "Proof." in italic; a manuscript that bolds it reads the same here.
function proofLabel(inlines: ArticleInline[]): ArticleInline[] {
  const [first, ...rest] = inlines;
  const label = first?.type === "strong" && first.inlines.length === 1 && first.inlines[0].type === "text" && /^Proof(?: of [^.]+)?\.$/u.test(first.inlines[0].text);
  return label ? [{ type: "emphasis", inlines: first.inlines }, ...rest] : inlines;
}

// A manuscript table caption is a bold "Table N." paragraph directly before its
// table; it is set as the title inside the table's frame.
const TABLE_CAPTION = /^\*\*Table \d+\./u;

function captionsTable(blocks: ResearchArticleContent["blocks"], index: number) {
  const block = blocks[index];
  return block?.type === "paragraph" && TABLE_CAPTION.test(block.source.trimStart()) && blocks[index + 1]?.type === "table";
}

// A list item is a paragraph written "• " or "1. " at the start of its line.
const LIST_MARKER = /^(?:•|\d+\.)\s+/u;

function listMarker(block: ResearchArticleContent["blocks"][number] | undefined) {
  const first = block?.type === "paragraph" ? block.inlines[0] : undefined;
  return first?.type === "text" ? LIST_MARKER.exec(first.text)?.[0] : undefined;
}

/** The digits of the widest number among each run of consecutive list items, by block index. */
export function listMarkerDigits(blocks: ResearchArticleContent["blocks"]) {
  const digits = new Map<number, number>();
  for (let start = 0; start < blocks.length;) {
    let end = start;
    while (end < blocks.length && listMarker(blocks[end])) end += 1;
    const widest = Math.max(1, ...blocks.slice(start, end).map((block) => /\d+/u.exec(listMarker(block)!)?.[0].length ?? 1));
    for (let index = start; index < end; index += 1) digits.set(index, widest);
    start = Math.max(end, start + 1);
  }
  return digits;
}

export function ResearchArticle({ project, active, returnPath, returnLabel, titleId, showcase }: {
  project: ResearchArticleContent;
  active: ActivePage;
  returnPath: string;
  returnLabel: string;
  titleId: string;
  showcase?: ShowcaseEntry;
}) {
  const firstHeading = project.blocks.findIndex((block) => block.type === "heading");
  // A paper's abstract stands before its first chapter; an AI article opens on its first chapter.
  const bodyStart = showcase ? firstHeading : project.blocks.findIndex((block, index) => index > firstHeading && block.type === "heading");
  const headingMap = buildArticleHeadingMap(project.blocks);
  const { targets, anchors } = buildReferenceTargets(project.slug, project.blocks);
  const link = (inlines: ArticleInline[], index: number) => linkArticleSectionReferences(inlines, project.slug, headingMap, targets, anchors.get(index));
  const headingPresentations = formatArticleHeadings(project.blocks);
  const markerDigits = listMarkerDigits(project.blocks);
  const figures = placeFigures(
    project.slug,
    project.blocks.map((block) => ({ type: block.type, source: block.source, firstCell: block.type === "table" ? block.rows[0][0].source : undefined })),
    project.markdown,
  );
  // A display that is one array is a table of mathematics, set as a research table.
  const framed = (block: ResearchArticleContent["blocks"][number]) => block.type === "table" || (block.type === "equation" && renderResearchDisplayTable(block.tex) !== undefined);
  // Passages the site presents as tables: each block of a passage renders through the table that presents it.
  const passages = new Map<number, PlacedPassageTable>();
  for (const passage of placePassageTables(project.slug, project.blocks, project.markdown)) {
    for (let index = passage.start; index <= passage.end; index += 1) passages.set(index, passage);
  }
  const enhanced = figures.size > 0 || passages.size > 0 || project.blocks.some((block) => block.type === "figure" || framed(block));
  const renderedBlocks = project.blocks.map((block, index) => {
    const passage = passages.get(index);
    const rendered = passage ? renderPassage(passage, index) : renderBlock(block, index);
    const placed = figures.get(index);
    return placed ? <Fragment key={index}>{rendered}{placed.map((id) => <ArticleFigure key={id} id={id} />)}</Fragment> : rendered;
  });

  /**
   * A research table in its frame: the manuscript's caption, or a passage
   * table's title, inside the frame; heads in a tinted band; values set in
   * tabular figures and aligned on the decimal point; a row that presents a
   * display shows the display's number beside its label and carries its TeX.
   */
  function renderTable({ key, rows, index, title, table, rowAttributes, emphasis }: {
    key: number;
    rows: (ResearchCell & { display?: { tex: string; number: string } })[][];
    index: number;
    title?: ReactNode;
    table: Record<string, unknown>;
    rowAttributes?: (row: number) => Record<string, unknown>;
    emphasis?: ReturnType<typeof emphasisFor>;
  }) {
    const layout = tableLayout(rows);
    const { values, start } = tableValues(rows);
    const tableRows = rows.map((row, rowIndex) => (
      <tr key={rowIndex} {...rowAttributes?.(rowIndex)} data-emphasis={emphasis?.row !== undefined && rowIndex - 1 === emphasis.row ? "" : undefined}>{row.map((cell, cellIndex) => {
        const Cell = rowIndex === 0 ? "th" : "td";
        const value = values[rowIndex][cellIndex];
        const display = row.find((entry) => entry.display)?.display;
        const cellLayout = layout.cell(rowIndex, cellIndex);
        return (
          <Cell
            key={cellIndex}
            scope={Cell === "th" ? "col" : undefined}
            {...cellLayout}
            className={start[cellIndex] ? `${cellLayout.className} ${styles.alignStart}` : cellLayout.className}
            data-interval={value?.interval ? "" : undefined}
            data-emphasis={emphasis?.column === cellIndex ? "" : undefined}
          >
            {value ? <TableValue value={value} display={cell.display?.tex} /> : <InlineContent inlines={link(cell.inlines, index)} />}
            {cellIndex === 0 && display && <span className={styles.rowNumber} data-equation-number aria-hidden="true">{`(${display.number})`}</span>}
          </Cell>
        );
      })}</tr>
    ));
    return (
      <div key={key} className={styles.tableFrame} data-table-frame>
        {title}
        <button type="button" className={`${stageStyles.control} ${styles.zoom}`} data-table-zoom aria-label="Zoom in" aria-haspopup="dialog" hidden><ZoomGlyph /></button>
        <div tabIndex={0} role="region" aria-label="Research data table" className={styles.tableRegion}>
          <table {...table} {...layout.table} className={styles.table} data-research-table data-research-block-type="table">
            <thead>{tableRows[0]}</thead>
            <tbody>{tableRows.slice(1)}</tbody>
          </table>
        </div>
      </div>
    );
  }

  function paragraphInlines(markdown: string) {
    const blocks = parseResearchMarkdown(markdown, { joinSoftLines: true });
    if (blocks.length !== 1 || blocks[0].type !== "paragraph") throw new Error(`A passage table's text must be one paragraph: ${markdown}`);
    return blocks[0].inlines;
  }

  /**
   * The blocks of a passage the site presents as a table: the words before it
   * stay a paragraph, the table restates the passage, and the words after it
   * stay a paragraph. Every block keeps its one marker, on the element that
   * first presents it, and a display's anchor moves to its row.
   */
  function renderPassage(passage: PlacedPassageTable, index: number) {
    if (index !== passage.start) return null;
    const first = project.blocks[index];
    const rows = passage.rows.map((row) => row.map((cell) => ({ ...cell, inlines: cell.source ? paragraphInlines(cell.source) : [] })));
    const rowBlocks = new Map([...passage.blockRows].filter(([, row]) => row >= 0).map(([block, row]) => [row + 1, block]));
    const unit = index >= bodyStart && first.type === "paragraph" ? { "data-unit": argumentUnit(first), "data-proof-close": closesProof(first) ? "" : undefined } : {};
    return (
      <Fragment key={index}>
        {passage.head && <p data-research-block={index} data-research-block-type="paragraph" {...unit} id={first.id ?? anchors.get(index)}><InlineContent inlines={proofLabel(link(paragraphInlines(passage.head), index))} /></p>}
        {renderTable({
          key: -index,
          rows,
          index,
          title: <p className={styles.tableTitle} data-table-title><InlineContent inlines={paragraphInlines(passage.title)} /></p>,
          table: { "data-passage-table": passage.id, ...(passage.blockRows.get(index) === -1 ? { "data-research-block": index, id: first.id ?? anchors.get(index) } : {}) },
          rowAttributes: (row) => {
            const block = rowBlocks.get(row);
            if (block === undefined) return {};
            const display = rows[row].find((cell) => cell.display)?.display;
            return { "data-research-block": block, id: project.blocks[block].id ?? anchors.get(block), "data-equation-row": display?.number };
          },
        })}
        {passage.tail && <p data-research-block-type="paragraph"><InlineContent inlines={link(paragraphInlines(passage.tail), passage.end)} /></p>}
      </Fragment>
    );
  }

  function renderBlock(block: ResearchArticleContent["blocks"][number], index: number) {
    const marker = { "data-research-block": index, "data-research-block-type": block.type };
    if (block.type === "paragraph") {
      // A table caption renders inside the frame of the table that follows it.
      if (captionsTable(project.blocks, index)) return null;
      // A list item hangs its marker in a column shared by its run of items.
      const first = block.inlines[0];
      const item = listMarker(block);
      if (item && first?.type === "text") {
        const rest = [{ ...first, text: first.text.slice(item.length) }, ...block.inlines.slice(1)];
        const digits = markerDigits.get(index) ?? 1;
        return (
          <p {...marker} data-list-item="" id={block.id ?? anchors.get(index)} key={index} style={digits > 1 ? { "--marker-digits": digits } as CSSProperties : undefined}>
            <span className={styles.listMarker} data-marker={item.startsWith("•") ? "bullet" : "number"}>{item}</span><InlineContent inlines={proofLabel(link(rest, index))} />
          </p>
        );
      }
      // In the chapters, a statement, a proof or a run-in head opens a unit of the argument.
      const unit = index >= bodyStart ? { "data-unit": argumentUnit(block), "data-proof-close": closesProof(block) ? "" : undefined } : {};
      return <p {...marker} {...unit} id={block.id ?? anchors.get(index)} key={index}><InlineContent inlines={proofLabel(link(block.inlines, index))} /></p>;
    }
    if (block.type === "heading") {
      const Heading = block.level === 3 ? "h3" : "h2";
      const heading = headingPresentations.get(block.id)!;
      return <Heading {...marker} data-source-number={heading.sourceNumber} id={block.id} tabIndex={-1} key={index}><InlineContent inlines={heading.displayInlines} /></Heading>;
    }
    if (block.type === "equation") {
      const table = renderResearchDisplayTable(block.tex);
      if (table) return <ResearchMathTable key={index} table={table} title={mathTableTitle(project.slug, parseResearchDisplayTable(block.tex)!)} id={block.id ?? anchors.get(index)} attributes={marker} />;
      return <div {...marker} id={block.id ?? anchors.get(index)} className={mathStyles.equation} key={index}><ResearchMath tex={block.tex} display /></div>;
    }
    if (block.type === "figure") {
      const caption = <FigureCaption inlines={link(block.inlines, index)} />;
      return <ManuscriptFigure key={index} id={manuscriptFigureFor(project.slug, block.src, project.markdown)} anchor={block.id ?? anchors.get(index)} captionId={`research-figure-${index}-caption`} attributes={marker} caption={caption} />;
    }
    const captionBlock = captionsTable(project.blocks, index - 1) ? project.blocks[index - 1] : undefined;
    return renderTable({
      key: index,
      rows: block.rows,
      index,
      title: captionBlock?.type === "paragraph" && (
        <p data-research-block={index - 1} data-research-block-type="paragraph" id={captionBlock.id ?? anchors.get(index - 1)} className={styles.tableTitle} data-table-title>
          <InlineContent inlines={link(captionBlock.inlines, index - 1)} />
        </p>
      ),
      table: { ...marker, id: block.id },
      emphasis: emphasisFor(project.slug, block.rows[0][0].source),
    });
  }
  return (
    <SiteShell active={active} parent={{ href: returnPath, label: returnLabel }} frameClassName={showcase ? experienceStyles.frame : undefined}>
      <article className={`${readingStyles.paper} ${styles.manuscript}`} aria-labelledby={titleId}>
        <header className={`page-intro ${readingStyles.header}`}>
          <h1 id={titleId} tabIndex={-1}><TitleText text={showcase?.headline ?? project.title} /></h1>
          {showcase && <ExperienceMetadata entry={showcase} />}
          {project.repositoryUrl && <p className={styles.sourceLinks}><a href={project.repositoryUrl}>GitHub</a><a href={project.sourceUrl}>Full Manuscript</a></p>}
          {showcase && <ExperienceDiagram entry={showcase} />}
        </header>

        <ArticleReadingLayout
          overview={showcase ? <><ProblemAndApproach entry={showcase} /><KeyContributions entry={showcase} /></> : renderedBlocks.slice(firstHeading, bodyStart)}
          items={[
            ...(showcase?.problemAndApproach ? [{ id: "problem-and-approach", text: showcase.problemAndApproach.title, level: 1 }] : []),
            ...(showcase ? [{ id: "key-contributions", text: showcase.contributionsLabel, level: 1 }] : []),
            ...project.blocks.filter((block) => block.type === "heading").map((heading) => ({ id: heading.id, text: headingPresentations.get(heading.id)!.text, level: heading.level - 1 })),
          ]}
        >
          <div className={`${readingStyles.body} ${styles.body}`}>{renderedBlocks.slice(bodyStart)}</div>
        </ArticleReadingLayout>

        <footer className={readingStyles.paperFooter}>
          <Link className="back-link" href={returnPath}><ReturnArrow />Back to {returnLabel}</Link>
          <BackToTop target={titleId} />
        </footer>
        {enhanced && <FigureController key={project.slug} />}
        <MathFit key={`${project.slug}-math`} />
        {enhanced && <ZoomStage key={`${project.slug}-stage`} />}
      </article>
    </SiteShell>
  );
}
