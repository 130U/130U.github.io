import Link from "next/link";
import { join } from "node:path";
import { Fragment, cache } from "react";
import sharp from "sharp";
import { SiteShell } from "../SiteShell";
import { ArticleReadingLayout } from "../article/ArticleReadingLayout";
import { ArchitecturalContext, ExperienceDiagram, ExperienceMetadata, KeyContributions } from "../experience/ExperienceDetails";
import type { ShowcaseEntry } from "../../lib/content/experience-showcase";
import type { ResearchArticleContent, ResearchCell } from "../../lib/content/research-markdown";
import { buildArticleHeadingMap, formatArticleHeadings, linkArticleSectionReferences } from "../../lib/content/article-headings";
import { emphasisFor, placeFigures } from "../../lib/content/article-figures";
import { ArticleFigure, FigureController } from "../figures";
import type { ActivePage } from "../../lib/content/site";
import { ResearchMath } from "./ResearchMath";
import { InlineContent } from "./ResearchInline";
import readingStyles from "../legal/LegalPaperPage.module.css";
import mathStyles from "./ResearchMath.module.css";
import styles from "./ResearchArticle.module.css";
import experienceStyles from "../experience/Experience.module.css";

const figureDimensions = cache(async (src: string) => {
  const { width, height } = await sharp(join(process.cwd(), "public", src.slice(1))).metadata();
  if (!width || !height) throw new Error(`Research figure has no intrinsic dimensions: ${src}`);
  return { width, height };
});

async function FigureImage({ src, label, captionId }: { src: string; label: string; captionId: string }) {
  const dimensions = await figureDimensions(src);
  // Intrinsic dimensions reserve the manuscript image's aspect ratio before loading.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} {...dimensions} alt={label} aria-describedby={captionId} loading="lazy" decoding="async" />;
}

// A numeric cell holds a number, a list of numbers, an interval or a dash; such
// columns align on the right with tabular figures.
const NUMBER = String.raw`[-+−]?(?:\d[\d,]*(?:\.\d+)?|\.\d+)(?:[eE][-+]?\d+)?%?`;
const NUMERIC_CELL = new RegExp(String.raw`^(?:${NUMBER}(?:\s*\/\s*${NUMBER})*|\[\s*${NUMBER}\s*,\s*${NUMBER}\s*\]|—)$`, "u");

function numericCell({ source }: ResearchCell) {
  const value = source.trim().replace(/^\*\*([\s\S]+)\*\*$/u, "$1");
  const formula = value.match(/^\$`([^`]*)`\$$/u);
  return NUMERIC_CELL.test(formula ? formula[1].replace(/\s+/gu, "") : value);
}

function numericColumns(rows: ResearchCell[][], headerRow: boolean) {
  const body = headerRow ? rows.slice(1) : rows;
  return rows[0].map((_, column) => column > 0 && body.length > 0
    && body.every((row) => numericCell(row[column]))
    && body.some((row) => row[column].source.trim() !== "—"));
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
  const hasAbstract = project.blocks[firstHeading]?.source.trim() === "## Abstract";
  const frontMatterCount = hasAbstract ? firstHeading : 1;
  const bodyStart = hasAbstract ? project.blocks.findIndex((block, index) => index > firstHeading && block.type === "heading") : firstHeading;
  const headingMap = buildArticleHeadingMap(project.blocks);
  const headingPresentations = formatArticleHeadings(project.blocks);
  const figures = placeFigures(
    project.slug,
    project.blocks.map((block) => ({ type: block.type, source: block.source, firstCell: block.type === "table" ? block.rows[0][0].source : undefined })),
    project.markdown,
  );
  const enhanced = figures.size > 0 || project.blocks.some((block) => block.type === "table");
  const renderedBlocks = project.blocks.map((block, index) => {
    const rendered = renderBlock(block, index);
    const placed = figures.get(index);
    return placed ? <Fragment key={index}>{rendered}{placed.map((id) => <ArticleFigure key={id} id={id} />)}</Fragment> : rendered;
  });
  function renderBlock(block: ResearchArticleContent["blocks"][number], index: number) {
    const marker = { "data-research-block": index, "data-research-block-type": block.type };
    if (block.type === "paragraph") return <p {...marker} id={block.id} key={index}><InlineContent inlines={linkArticleSectionReferences(block.inlines, project.slug, headingMap)} /></p>;
    if (block.type === "heading") {
      const Heading = block.level === 3 ? "h3" : "h2";
      const heading = headingPresentations.get(block.id)!;
      return <Heading {...marker} data-source-number={heading.sourceNumber} id={block.id} tabIndex={-1} key={index}><InlineContent inlines={heading.displayInlines} /></Heading>;
    }
    if (block.type === "equation") {
      return <div {...marker} id={block.id} className={mathStyles.equation} key={index} tabIndex={0} role="region" aria-label="Mathematical equation"><ResearchMath tex={block.tex} display /></div>;
    }
    if (block.type === "figure") {
      const captionId = `research-figure-${index}-caption`;
      const opening = block.inlines[0];
      const label = (opening?.type === "text" && opening.text.match(/^Figure \d+/u)?.[0]) || "Research figure";
      return <figure {...marker} id={block.id} className={styles.figure} key={index}>
        <a href={block.src} aria-label={`Open ${label.toLowerCase()} at full resolution`}>
          <FigureImage src={block.src} label={label} captionId={captionId} />
        </a>
        <figcaption id={captionId}><InlineContent inlines={linkArticleSectionReferences(block.inlines, project.slug, headingMap)} /></figcaption>
      </figure>;
    }
    const numeric = numericColumns(block.rows, block.headerRow);
    const emphasis = emphasisFor(project.slug, block.rows[0][0].source);
    const bodyOffset = block.headerRow ? 1 : 0;
    const tableRows = block.rows.map((row, rowIndex) => (
      <tr key={rowIndex} data-emphasis={emphasis?.row !== undefined && rowIndex - bodyOffset === emphasis.row ? "" : undefined}>{row.map((cell, cellIndex) => {
        const Cell = block.headerRow && rowIndex === 0 ? "th" : "td";
        return (
          <Cell
            key={cellIndex}
            scope={Cell === "th" ? "col" : undefined}
            className={numeric[cellIndex] ? `${styles.cell} ${styles.numeric}` : styles.cell}
            data-emphasis={emphasis?.column === cellIndex ? "" : undefined}
          >
            <InlineContent inlines={linkArticleSectionReferences(cell.inlines, project.slug, headingMap)} />
          </Cell>
        );
      })}</tr>
    ));
    return (
      <div key={index} tabIndex={0} role="region" aria-label="Research data table" className={styles.tableRegion}>
        <table {...marker} id={block.id} className={styles.table} data-research-table>
          {block.headerRow && <thead>{tableRows[0]}</thead>}
          <tbody>{block.headerRow ? tableRows.slice(1) : tableRows}</tbody>
        </table>
      </div>
    );
  }
  return (
    <SiteShell active={active} parent={{ href: returnPath, label: returnLabel }} frameClassName={showcase ? experienceStyles.frame : undefined}>
      <article className={readingStyles.paper} aria-labelledby={titleId}>
        <header className={`page-intro ${readingStyles.header}`}>
          <h1 id={titleId} tabIndex={-1}>{showcase?.headline ?? project.title}</h1>
          {showcase ? <ExperienceMetadata entry={showcase} /> : !project.repositoryUrl && frontMatterCount > 0 && <div className={styles.frontMatter}>{renderedBlocks.slice(0, frontMatterCount)}</div>}
          {project.repositoryUrl && <p className={styles.sourceLinks}><a href={project.repositoryUrl}>GitHub</a><a href={project.sourceUrl}>Full Manuscript</a></p>}
          {showcase && <ExperienceDiagram entry={showcase} />}
        </header>

        <ArticleReadingLayout
          overview={showcase ? <><KeyContributions entry={showcase} /><ArchitecturalContext entry={showcase} /></> : <>{!hasAbstract && <h2 id="overview" tabIndex={-1}>Overview</h2>}{renderedBlocks.slice(frontMatterCount, bodyStart)}</>}
          items={[
            ...(showcase ? [{ id: "key-contributions", text: showcase.contributionsLabel, level: 1 }] : !hasAbstract ? [{ id: "overview", text: "Overview", level: 1 }] : []),
            ...(showcase?.architecturalContext ? [{ id: "architectural-context", text: showcase.architecturalContext.title, level: 1 }] : []),
            ...project.blocks.filter((block) => block.type === "heading").map((heading) => ({ id: heading.id, text: headingPresentations.get(heading.id)!.text, level: heading.level - 1 })),
          ]}
        >
          <div className={`${readingStyles.body} ${styles.body}`}>{renderedBlocks.slice(bodyStart)}</div>
        </ArticleReadingLayout>

        <footer className={readingStyles.paperFooter}>
          <Link className="back-link" href={returnPath}><span aria-hidden="true">←</span> {returnLabel}</Link>
          <a href={`#${titleId}`}>Back to Top</a>
        </footer>
        {enhanced && <FigureController key={project.slug} />}
      </article>
    </SiteShell>
  );
}
