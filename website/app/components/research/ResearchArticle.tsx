import Link from "next/link";
import { Fragment, type CSSProperties } from "react";
import { ReturnArrow } from "../ReturnArrow";
import { SiteShell } from "../SiteShell";
import { ArticleReadingLayout } from "../article/ArticleReadingLayout";
import { ArchitecturalContext, ExperienceDiagram, ExperienceMetadata, KeyContributions } from "../experience/ExperienceDetails";
import type { ShowcaseEntry } from "../../lib/content/experience-showcase";
import type { ResearchArticleContent, ResearchCell, ResearchInline } from "../../lib/content/research-markdown";
import { renderResearchMath } from "../../lib/content/research-math";
import { buildArticleHeadingMap, formatArticleHeadings, linkArticleSectionReferences } from "../../lib/content/article-headings";
import { emphasisFor, manuscriptFigureFor, placeFigures } from "../../lib/content/article-figures";
import { ArticleFigure, FigureController, ManuscriptFigure } from "../figures";
import type { ActivePage } from "../../lib/content/site";
import { ResearchMath } from "./ResearchMath";
import { InlineContent } from "./ResearchInline";
import { TableStage } from "./TableStage";
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
  return NUMERIC_CELL.test(formula ? formula[1].replace(/\s+/gu, "") : value);
}

function numericColumns(rows: ResearchCell[][]) {
  const body = rows.slice(1);
  return rows[0].map((_, column) => column > 0 && body.length > 0
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

function sentenceColumns(rows: ResearchCell[][]) {
  const body = rows.slice(1);
  return rows[0].map((_, column) => body.some((row) => contentWidth(row[column].inlines) > SENTENCE_EM));
}

// A heading may take two lines beside short values, never more.
function headingFloor(cell: ResearchCell) {
  return { "--heading-floor": `${(contentWidth(cell.inlines) * 0.6).toFixed(2)}em` } as CSSProperties;
}

function ZoomGlyph() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.75" />
      <path d="m10.5 10.5 3 3M5 7h4" />
      <path d="M7 5v4" data-zoom-plus />
    </svg>
  );
}

// A manuscript table caption is a bold "Table N." paragraph directly before its
// table; it is set as the title inside the table's frame.
const TABLE_CAPTION = /^\*\*Table \d+\./u;

function captionsTable(blocks: ResearchArticleContent["blocks"], index: number) {
  const block = blocks[index];
  return block?.type === "paragraph" && TABLE_CAPTION.test(block.source.trimStart()) && blocks[index + 1]?.type === "table";
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
  const headingPresentations = formatArticleHeadings(project.blocks);
  const figures = placeFigures(
    project.slug,
    project.blocks.map((block) => ({ type: block.type, source: block.source, firstCell: block.type === "table" ? block.rows[0][0].source : undefined })),
    project.markdown,
  );
  const enhanced = figures.size > 0 || project.blocks.some((block) => block.type === "figure" || block.type === "table");
  const renderedBlocks = project.blocks.map((block, index) => {
    const rendered = renderBlock(block, index);
    const placed = figures.get(index);
    return placed ? <Fragment key={index}>{rendered}{placed.map((id) => <ArticleFigure key={id} id={id} />)}</Fragment> : rendered;
  });
  function renderBlock(block: ResearchArticleContent["blocks"][number], index: number) {
    const marker = { "data-research-block": index, "data-research-block-type": block.type };
    if (block.type === "paragraph") {
      // A table caption renders inside the frame of the table that follows it.
      if (captionsTable(project.blocks, index)) return null;
      return <p {...marker} id={block.id} key={index}><InlineContent inlines={linkArticleSectionReferences(block.inlines, project.slug, headingMap)} /></p>;
    }
    if (block.type === "heading") {
      const Heading = block.level === 3 ? "h3" : "h2";
      const heading = headingPresentations.get(block.id)!;
      return <Heading {...marker} data-source-number={heading.sourceNumber} id={block.id} tabIndex={-1} key={index}><InlineContent inlines={heading.displayInlines} /></Heading>;
    }
    if (block.type === "equation") {
      return <div {...marker} id={block.id} className={mathStyles.equation} key={index} tabIndex={0} role="region" aria-label="Mathematical equation"><ResearchMath tex={block.tex} display /></div>;
    }
    if (block.type === "figure") {
      const caption = <InlineContent inlines={linkArticleSectionReferences(block.inlines, project.slug, headingMap)} />;
      return <ManuscriptFigure key={index} id={manuscriptFigureFor(project.slug, block.src, project.markdown)} anchor={block.id} captionId={`research-figure-${index}-caption`} attributes={marker} caption={caption} />;
    }
    const numeric = numericColumns(block.rows);
    const sentences = sentenceColumns(block.rows);
    const emphasis = emphasisFor(project.slug, block.rows[0][0].source);
    const tableRows = block.rows.map((row, rowIndex) => (
      <tr key={rowIndex} data-emphasis={emphasis?.row !== undefined && rowIndex - 1 === emphasis.row ? "" : undefined}>{row.map((cell, cellIndex) => {
        const Cell = rowIndex === 0 ? "th" : "td";
        return (
          <Cell
            key={cellIndex}
            scope={Cell === "th" ? "col" : undefined}
            className={[styles.cell, numeric[cellIndex] && styles.numeric, sentences[cellIndex] && styles.sentence].filter(Boolean).join(" ")}
            style={Cell === "th" ? headingFloor(cell) : undefined}
            data-emphasis={emphasis?.column === cellIndex ? "" : undefined}
          >
            <InlineContent inlines={linkArticleSectionReferences(cell.inlines, project.slug, headingMap)} />
          </Cell>
        );
      })}</tr>
    ));
    const captionBlock = captionsTable(project.blocks, index - 1) ? project.blocks[index - 1] : undefined;
    return (
      <div key={index} className={styles.tableFrame} data-table-frame>
        {captionBlock?.type === "paragraph" && (
          <p data-research-block={index - 1} data-research-block-type="paragraph" id={captionBlock.id} className={styles.tableTitle}>
            <InlineContent inlines={linkArticleSectionReferences(captionBlock.inlines, project.slug, headingMap)} />
          </p>
        )}
        <button type="button" className={styles.zoom} data-table-zoom aria-label="Zoom in" aria-haspopup="dialog" hidden><ZoomGlyph /></button>
        <div tabIndex={0} role="region" aria-label="Research data table" className={styles.tableRegion}>
          <table {...marker} id={block.id} className={styles.table} data-research-table>
            <thead>{tableRows[0]}</thead>
            <tbody>{tableRows.slice(1)}</tbody>
          </table>
        </div>
      </div>
    );
  }
  return (
    <SiteShell active={active} parent={{ href: returnPath, label: returnLabel }} frameClassName={showcase ? experienceStyles.frame : undefined}>
      <article className={readingStyles.paper} aria-labelledby={titleId}>
        <header className={`page-intro ${readingStyles.header}`}>
          <h1 id={titleId} tabIndex={-1}>{showcase?.headline ?? project.title}</h1>
          {showcase && <ExperienceMetadata entry={showcase} />}
          {project.repositoryUrl && <p className={styles.sourceLinks}><a href={project.repositoryUrl}>GitHub</a><a href={project.sourceUrl}>Full Manuscript</a></p>}
          {showcase && <ExperienceDiagram entry={showcase} />}
        </header>

        <ArticleReadingLayout
          overview={showcase ? <><KeyContributions entry={showcase} /><ArchitecturalContext entry={showcase} /></> : renderedBlocks.slice(firstHeading, bodyStart)}
          items={[
            ...(showcase ? [{ id: "key-contributions", text: showcase.contributionsLabel, level: 1 }] : []),
            ...(showcase?.architecturalContext ? [{ id: "architectural-context", text: showcase.architecturalContext.title, level: 1 }] : []),
            ...project.blocks.filter((block) => block.type === "heading").map((heading) => ({ id: heading.id, text: headingPresentations.get(heading.id)!.text, level: heading.level - 1 })),
          ]}
        >
          <div className={`${readingStyles.body} ${styles.body}`}>{renderedBlocks.slice(bodyStart)}</div>
        </ArticleReadingLayout>

        <footer className={readingStyles.paperFooter}>
          <Link className="back-link" href={returnPath}><ReturnArrow />Back to {returnLabel}</Link>
          <a href={`#${titleId}`}>Back to Top</a>
        </footer>
        {enhanced && <FigureController key={project.slug} />}
        {project.blocks.some((block) => block.type === "table") && <TableStage key={`${project.slug}-tables`} />}
      </article>
    </SiteShell>
  );
}
