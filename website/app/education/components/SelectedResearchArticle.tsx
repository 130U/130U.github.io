import Link from "next/link";
import { Fragment } from "react";
import { SiteShell } from "../../components/SiteShell";
import { type AiResearchInline, type AiResearchProject } from "../../lib/content/ai-projects";
import { renderExperienceText } from "../../past-experience/components/ExperienceDomainPage";
import { AiResearchMath } from "../../past-experience/components/AiResearchMath";
import readingStyles from "../../past-experience/components/LegalPaperPage.module.css";
import mathStyles from "../../past-experience/components/AiResearchMath.module.css";
import styles from "../../past-experience/components/AiResearchProjectPage.module.css";

function InlineContent({ inlines }: { inlines: AiResearchInline[] }) {
  return inlines.map((inline, index) => {
    if (inline.type === "math") return <AiResearchMath key={index} tex={inline.tex} />;
    if (inline.type === "line-break") return <br key={index} />;
    return <Fragment key={index}>{renderExperienceText(inline.text)}</Fragment>;
  });
}

export function SelectedResearchArticle({ project }: { project: AiResearchProject }) {
  const returnPath = `/education/#${project.slug}`;
  return (
    <SiteShell active="education" frameClassName="ai-research-page">
      <article className={readingStyles.paper} aria-labelledby="ai-project-title">
        <header className="page-intro plain-page-intro">
          <Link className="back-link" href={returnPath}><span aria-hidden="true">←</span> Selected Research</Link>
          <h1 id="ai-project-title" tabIndex={-1}>{project.title}</h1>
        </header>

        <div className={`${readingStyles.body} ${readingStyles.readingColumn} ${styles.body}`}>
          {project.blocks.map((block, index) => {
            const marker = { "data-ai-block": index, "data-ai-block-type": block.type };
            if (block.type === "paragraph") return <p {...marker} key={index}><InlineContent inlines={block.inlines} /></p>;
            if (block.type === "heading") {
              const Heading = block.level === 3 ? "h3" : "h2";
              return <Heading {...marker} id={block.id} tabIndex={-1} key={index}><InlineContent inlines={block.inlines} /></Heading>;
            }
            if (block.type === "equation") {
              return (
                <div {...marker} className={mathStyles.equation} key={index} tabIndex={0} role="region" aria-label="Mathematical equation">
                  <AiResearchMath tex={block.tex} display />
                </div>
              );
            }
            const tableRows = block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>{row.map((cell, cellIndex) => {
                const Cell = block.headerRow && rowIndex === 0 ? "th" : "td";
                return <Cell key={cellIndex} scope={Cell === "th" ? "col" : undefined} style={{ padding: "0.75rem", borderBottom: "1px solid var(--rule)", verticalAlign: "top" }}><InlineContent inlines={cell.inlines} /></Cell>;
              })}</tr>
            ));
            return (
              <div key={index} tabIndex={0} role="region" aria-label="Research data table" style={{ overflowX: "auto", overflowY: "hidden", maxWidth: "100%", margin: "1.25rem 0" }}>
                <table {...marker} style={{ width: "100%", minWidth: "32rem", borderCollapse: "collapse", textAlign: "left", font: "inherit" }}>
                  {block.headerRow && <thead>{tableRows[0]}</thead>}
                  <tbody>{block.headerRow ? tableRows.slice(1) : tableRows}</tbody>
                </table>
              </div>
            );
          })}
        </div>

        <footer className={readingStyles.paperFooter}>
          <Link className="back-link" href={returnPath}><span aria-hidden="true">←</span> Selected Research</Link>
          <a href="#ai-project-title">Back to top</a>
        </footer>
      </article>
    </SiteShell>
  );
}
