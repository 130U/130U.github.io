import Link from "next/link";
import { Fragment } from "react";
import { SiteShell } from "../../components/SiteShell";
import { AI_DOMAIN_PATH, type AiResearchInline, type AiResearchProject } from "../../lib/content/ai-projects";
import { renderExperienceText } from "./ExperienceDomainPage";
import { AiResearchMath } from "./AiResearchMath";
import readingStyles from "./LegalPaperPage.module.css";

function InlineContent({ inlines }: { inlines: AiResearchInline[] }) {
  return inlines.map((inline, index) => {
    if (inline.type === "math") return <AiResearchMath key={index} tex={inline.tex} />;
    if (inline.type === "line-break") return <br key={index} />;
    return <Fragment key={index}>{renderExperienceText(inline.text)}</Fragment>;
  });
}

export function AiResearchProjectPage({ project }: { project: AiResearchProject }) {
  const returnPath = `${AI_DOMAIN_PATH}#${project.slug}`;
  return (
    <SiteShell active="experience" frameClassName="ai-research-page">
      <article className={readingStyles.paper} aria-labelledby="ai-project-title">
        <header className="page-intro plain-page-intro">
          <Link className="back-link" href={returnPath}><span aria-hidden="true">←</span> AI Research and Engineering</Link>
          <h1 id="ai-project-title" tabIndex={-1}>{project.title}</h1>
        </header>

        <div className={`${readingStyles.body} ${readingStyles.readingColumn}`}>
          {project.blocks.map((block, index) => {
            const marker = { "data-ai-block": index, "data-ai-block-type": block.type };
            if (block.type === "paragraph") return <p {...marker} key={index}><InlineContent inlines={block.inlines} /></p>;
            if (block.type === "heading") {
              const Heading = block.level === 3 ? "h3" : "h2";
              return <Heading {...marker} id={block.id} tabIndex={-1} key={index}><InlineContent inlines={block.inlines} /></Heading>;
            }
            if (block.type === "equation") {
              return (
                <div {...marker} key={index} tabIndex={0} role="region" aria-label="Mathematical equation" style={{ overflowX: "auto", overflowY: "hidden", maxWidth: "100%", paddingBlock: "0.125em", margin: "1.25rem 0" }}>
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
          <Link className="back-link" href={returnPath}><span aria-hidden="true">←</span> AI Research and Engineering</Link>
          <a href="#ai-project-title">Back to top</a>
        </footer>
      </article>
    </SiteShell>
  );
}
