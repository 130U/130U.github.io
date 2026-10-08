import Link from "next/link";
import { Fragment } from "react";
import { SiteShell } from "../SiteShell";
import type { ResearchInline, ResearchArticleContent } from "../../lib/content/research-markdown";
import type { ActivePage } from "../../lib/content/site";
import { ResearchMath } from "./ResearchMath";
import readingStyles from "../../past-experience/components/LegalPaperPage.module.css";
import mathStyles from "./ResearchMath.module.css";
import styles from "./ResearchArticle.module.css";

function InlineContent({ inlines }: { inlines: ResearchInline[] }) {
  return inlines.map((inline, index) => {
    if (inline.type === "math") return <ResearchMath key={index} tex={inline.tex} />;
    if (inline.type === "line-break") return <br key={index} />;
    if (inline.type === "strong") return <strong key={index}><InlineContent inlines={inline.inlines} /></strong>;
    if (inline.type === "emphasis") return <em key={index}><InlineContent inlines={inline.inlines} /></em>;
    if (inline.type === "code") return <code key={index}>{inline.text}</code>;
    if (inline.type === "link") return <a key={index} href={inline.href}><InlineContent inlines={inline.inlines} /></a>;
    if (inline.type === "text") return inline.text;
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
  const frontMatterCount = project.repositoryUrl && firstHeading > 0 ? firstHeading : 0;
  const renderedBlocks = project.blocks.map((block, index) => {
    const marker = { "data-research-block": index, "data-research-block-type": block.type };
    if (block.type === "paragraph") return <p {...marker} id={block.id} key={index}><InlineContent inlines={block.inlines} /></p>;
    if (block.type === "heading") {
      const Heading = block.level === 3 ? "h3" : "h2";
      return <Heading {...marker} id={block.id} tabIndex={-1} key={index}><InlineContent inlines={block.inlines} /></Heading>;
    }
    if (block.type === "equation") {
      return <div {...marker} className={mathStyles.equation} key={index} tabIndex={0} role="region" aria-label="Mathematical equation"><ResearchMath tex={block.tex} display /></div>;
    }
    const tableRows = block.rows.map((row, rowIndex) => (
      <tr key={rowIndex}>{row.map((cell, cellIndex) => {
        const Cell = block.headerRow && rowIndex === 0 ? "th" : "td";
        return <Cell key={cellIndex} scope={Cell === "th" ? "col" : undefined} className={styles.cell}><InlineContent inlines={cell.inlines} /></Cell>;
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
        <header className={`page-intro plain-page-intro ${styles.header}`}>
          <Link className="back-link" href={returnPath}><span aria-hidden="true">←</span> {returnLabel}</Link>
          <h1 id={titleId} tabIndex={-1}>{project.title}</h1>
          {frontMatterCount > 0 && <div className={styles.frontMatter}>{renderedBlocks.slice(0, frontMatterCount)}</div>}
          {project.repositoryUrl && <p className={styles.sourceLinks}><a href={project.repositoryUrl}>GitHub</a><a href={project.sourceUrl}>Full manuscript</a></p>}
        </header>

        <div className={`${readingStyles.body} ${readingStyles.readingColumn} ${styles.body}`}>
          {renderedBlocks.map((block, index) => (
            index < frontMatterCount ? null : <Fragment key={index}>
              {project.repositoryUrl && index === firstHeading && (
                <nav className={styles.contents} aria-label="Table of contents">
                  <details>
                    <summary>Contents</summary>
                    <ol>
                      {project.blocks.filter((heading) => heading.type === "heading" && heading.level === 2).map((heading) => heading.type === "heading" && <li key={heading.id}><a href={`#${heading.id}`}><InlineContent inlines={heading.inlines} /></a></li>)}
                    </ol>
                  </details>
                </nav>
              )}
              {block}
            </Fragment>
          ))}
        </div>

        <footer className={readingStyles.paperFooter}>
          <Link className="back-link" href={returnPath}><span aria-hidden="true">←</span> {returnLabel}</Link>
          <a href={`#${titleId}`}>Back to top</a>
        </footer>
      </article>
    </SiteShell>
  );
}
