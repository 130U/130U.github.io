import Link from "next/link";
import { type ReactNode } from "react";
import { SiteShell } from "../SiteShell";
import { ArticleReadingLayout } from "../article/ArticleReadingLayout";
import type { ResearchArticleContent } from "../../lib/content/research-markdown";
import { buildArticleHeadingMap, formatArticleHeadings, linkArticleSectionReferences, type ArticleInline } from "../../lib/content/article-headings";
import type { ActivePage } from "../../lib/content/site";
import { ResearchMath } from "./ResearchMath";
import readingStyles from "../../past-experience/components/LegalPaperPage.module.css";
import mathStyles from "./ResearchMath.module.css";
import styles from "./ResearchArticle.module.css";

function ProofEnd({ source }: { source?: ReactNode }) {
  return <span className={styles.proofEnd} data-proof-end>{source && <span hidden>{source}</span>}<abbr title="End of proof">Q.E.D.</abbr></span>;
}

function InlineContent({ inlines }: { inlines: ArticleInline[] }) {
  return inlines.map((inline, index) => {
    if (inline.type === "math") return inline.tex.trim() === "\\square"
      ? <ProofEnd key={index} source={<ResearchMath tex={inline.tex} />} />
      : <ResearchMath key={index} tex={inline.tex} />;
    if (inline.type === "line-break") return <br key={index} />;
    if (inline.type === "strong") return <strong key={index}><InlineContent inlines={inline.inlines} /></strong>;
    if (inline.type === "emphasis") return <em key={index}><InlineContent inlines={inline.inlines} /></em>;
    if (inline.type === "code") return <code key={index}>{inline.text}</code>;
    if (inline.type === "link") return <a key={index} href={inline.href} title={inline.title}><InlineContent inlines={inline.inlines} /></a>;
    if (inline.type === "text") return inline.text.split(/(∎)/u).map((part, partIndex) => part === "∎" ? <ProofEnd key={`${index}-${partIndex}`} /> : part);
  });
}

export function ResearchArticle({ project, active, returnPath, returnLabel, titleId }: {
  project: ResearchArticleContent;
  active: ActivePage;
  returnPath: string;
  returnLabel: string;
  titleId: string;
}) {
  const firstHeading = project.blocks.findIndex((block) => block.type === "heading");
  const hasAbstract = project.blocks[firstHeading]?.source.trim() === "## Abstract";
  const frontMatterCount = hasAbstract ? firstHeading : 1;
  const bodyStart = hasAbstract ? project.blocks.findIndex((block, index) => index > firstHeading && block.type === "heading") : firstHeading;
  const headingMap = buildArticleHeadingMap(project.blocks);
  const headingPresentations = formatArticleHeadings(project.blocks);
  const renderedBlocks = project.blocks.map((block, index) => {
    const marker = { "data-research-block": index, "data-research-block-type": block.type };
    if (block.type === "paragraph") return <p {...marker} id={block.id} key={index}><InlineContent inlines={linkArticleSectionReferences(block.inlines, project.slug, headingMap)} /></p>;
    if (block.type === "heading") {
      const Heading = block.level === 3 ? "h3" : "h2";
      const heading = headingPresentations.get(block.id)!;
      return <Heading {...marker} data-source-number={heading.sourceNumber} id={block.id} tabIndex={-1} key={index}><InlineContent inlines={heading.displayInlines} /></Heading>;
    }
    if (block.type === "equation") {
      return <div {...marker} className={mathStyles.equation} key={index} tabIndex={0} role="region" aria-label="Mathematical equation"><ResearchMath tex={block.tex} display /></div>;
    }
    const tableRows = block.rows.map((row, rowIndex) => (
      <tr key={rowIndex}>{row.map((cell, cellIndex) => {
        const Cell = block.headerRow && rowIndex === 0 ? "th" : "td";
        return <Cell key={cellIndex} scope={Cell === "th" ? "col" : undefined} className={styles.cell}><InlineContent inlines={linkArticleSectionReferences(cell.inlines, project.slug, headingMap)} /></Cell>;
      })}</tr>
    ));
    return (
      <div key={index} tabIndex={0} role="region" aria-label="Research data table" className={styles.tableRegion}>
        <table {...marker} className={styles.table}>
          {block.headerRow && <thead>{tableRows[0]}</thead>}
          <tbody>{block.headerRow ? tableRows.slice(1) : tableRows}</tbody>
        </table>
      </div>
    );
  });
  return (
    <SiteShell active={active}>
      <article className={readingStyles.paper} aria-labelledby={titleId}>
        <header className={`page-intro plain-page-intro ${readingStyles.header}`}>
          <Link className="back-link" href={returnPath}><span aria-hidden="true">←</span> {returnLabel}</Link>
          <h1 id={titleId} tabIndex={-1}>{project.title}</h1>
          {frontMatterCount > 0 && <div className={styles.frontMatter}>{renderedBlocks.slice(0, frontMatterCount)}</div>}
          {project.repositoryUrl && <p className={styles.sourceLinks}><a href={project.repositoryUrl}>GitHub</a><a href={project.sourceUrl}>Full manuscript</a></p>}
        </header>

        <ArticleReadingLayout
          overview={<>{!hasAbstract && <h2 id="overview" tabIndex={-1}>Overview</h2>}{renderedBlocks.slice(frontMatterCount, bodyStart)}</>}
          items={[
            ...(!hasAbstract ? [{ id: "overview", text: "Overview", level: 1 }] : []),
            ...project.blocks.filter((block) => block.type === "heading").map((heading) => ({ id: heading.id, text: headingPresentations.get(heading.id)!.text, level: heading.level - 1 })),
          ]}
        >
          <div className={`${readingStyles.body} ${styles.body}`}>{renderedBlocks.slice(bodyStart)}</div>
        </ArticleReadingLayout>

        <footer className={readingStyles.paperFooter}>
          <Link className="back-link" href={returnPath}><span aria-hidden="true">←</span> {returnLabel}</Link>
          <a href={`#${titleId}`}>Back to top</a>
        </footer>
      </article>
    </SiteShell>
  );
}
