import Link from "next/link";
import { Fragment } from "react";
import { SiteShell } from "../SiteShell";
import type { ResearchInline, ResearchArticleContent } from "../../lib/content/research-markdown";
import type { ActivePage } from "../../lib/content/site";
import { renderInlineText } from "../InlineText";
import { ResearchMath } from "./ResearchMath";
import readingStyles from "../../past-experience/components/LegalPaperPage.module.css";
import mathStyles from "./ResearchMath.module.css";
import styles from "./ResearchArticle.module.css";

function InlineContent({ inlines }: { inlines: ResearchInline[] }) {
  return inlines.map((inline, index) => {
    if (inline.type === "math") return <ResearchMath key={index} tex={inline.tex} />;
    if (inline.type === "line-break") return <br key={index} />;
    return <Fragment key={index}>{renderInlineText(inline.text)}</Fragment>;
  });
}

export function ResearchArticle({ project, active, returnPath, returnLabel, titleId }: {
  project: ResearchArticleContent;
  active: ActivePage;
  returnPath: string;
  returnLabel: string;
  titleId: string;
}) {
  return (
    <SiteShell active={active}>
      <article className={readingStyles.paper} aria-labelledby={titleId}>
        <header className="page-intro plain-page-intro">
          <Link className="back-link" href={returnPath}><span aria-hidden="true">←</span> {returnLabel}</Link>
          <h1 id={titleId} tabIndex={-1}>{project.title}</h1>
        </header>

        <div className={`${readingStyles.body} ${readingStyles.readingColumn} ${styles.body}`}>
          {project.blocks.map((block, index) => {
            const marker = { "data-research-block": index, "data-research-block-type": block.type };
            if (block.type === "paragraph") return <p {...marker} key={index}><InlineContent inlines={block.inlines} /></p>;
            if (block.type === "heading") {
              const Heading = block.level === 3 ? "h3" : "h2";
              return <Heading {...marker} id={block.id} tabIndex={-1} key={index}><InlineContent inlines={block.inlines} /></Heading>;
            }
            if (block.type === "equation") {
              return (
                <div {...marker} className={mathStyles.equation} key={index} tabIndex={0} role="region" aria-label="Mathematical equation">
                  <ResearchMath tex={block.tex} display />
                </div>
              );
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
          })}
        </div>

        <footer className={readingStyles.paperFooter}>
          <Link className="back-link" href={returnPath}><span aria-hidden="true">←</span> {returnLabel}</Link>
          <a href={`#${titleId}`}>Back to top</a>
        </footer>
      </article>
    </SiteShell>
  );
}
