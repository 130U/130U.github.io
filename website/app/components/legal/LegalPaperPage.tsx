import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { ReturnArrow } from "../ReturnArrow";
import { SiteShell } from "../SiteShell";
import { ArticleReadingLayout } from "../article/ArticleReadingLayout";
import { ExperienceDiagram, ExperienceMetadata, KeyContributions } from "../experience/ExperienceDetails";
import { type LegalPaper, type PaperRun } from "../../lib/content/legal-papers";
import type { ResearchCell } from "../../lib/content/research-markdown";
import type { ShowcaseEntry } from "../../lib/content/experience-showcase";
import { placeFigures } from "../../lib/content/article-figures";
import { ArticleFigure, FigureController } from "../figures";
import { ZoomStage } from "../research/ZoomStage";
import { headingFloor, numericColumns, sentenceColumns } from "../research/ResearchArticle";
import { ZoomGlyph } from "../ZoomGlyph";
import researchStyles from "../research/ResearchArticle.module.css";
import stageStyles from "../research/Stage.module.css";
import { LegalPaperReader } from "./LegalPaperReader";
import styles from "./LegalPaperPage.module.css";
import experienceStyles from "../experience/Experience.module.css";

function noteKey(number: number | string) {
  return number === "*" ? "author" : String(number);
}

function referenceParts(run: PaperRun) {
  return (run.text || String(run.footnoteRef)).split(/([,;])/u);
}

// An address may hold balanced parentheses ("…Plan%20(Ref.%20Z22-03).pdf"); a closing
// parenthesis without its partner ends the address, as in "(see https://…)".
function linkedText(text: string) {
  return text.split(/(https?:\/\/(?:[^\s<>"\]()]|\([^\s<>"()]*\))+)/u).map((part, index) => {
    if (!/^https?:\/\//u.test(part)) return part;
    const url = part.replace(/[.,;:]+$/u, "");
    return <Fragment key={index}><a href={url}>{url}</a>{part.slice(url.length)}</Fragment>;
  });
}

function RunText({ runs, prefix }: { runs: PaperRun[]; prefix: string }) {
  return runs.map((run, index) => {
    if (run.footnoteRef !== undefined) {
      return <sup key={index} className={styles.reference}>{referenceParts(run).map((part, partIndex) => {
        if (!/^\d+$|^\*$/u.test(part)) return part;
        const key = noteKey(part);
        return <a key={partIndex} id={`fnref-${key}-${prefix}-${index}-${partIndex}`} href={`#fn-${key}`} role="doc-noteref" aria-label={`Footnote ${part}`}>{part}</a>;
      })}</sup>;
    }
    let content: ReactNode = linkedText(run.text);
    if (run.smallCaps) content = <span className={styles.smallCaps}>{content}</span>;
    if (run.italic) content = <em>{content}</em>;
    if (run.bold) content = <strong>{content}</strong>;
    if (run.superscript) content = <sup>{content}</sup>;
    return <Fragment key={index}>{content}</Fragment>;
  });
}

/** A legal table in the paper tables' frame: the same title, zoom, column fitting and cell classes. */
function PaperTable({ rows, caption, index }: { rows: NonNullable<LegalPaper["blocks"][number]["rows"]>; caption?: LegalPaper["blocks"][number]["caption"]; index: number }) {
  const cells: ResearchCell[][] = rows.map((row) => row.map(({ text }) => ({ source: text, inlines: [{ type: "text", text }] })));
  const numeric = numericColumns(cells);
  const sentences = sentenceColumns(cells);
  const tableRows = rows.map((row, rowIndex) => (
    <tr key={rowIndex}>{row.map((cell, cellIndex) => {
      const Cell = rowIndex === 0 ? "th" : "td";
      return (
        <Cell
          key={cellIndex}
          scope={Cell === "th" ? "col" : undefined}
          className={[researchStyles.cell, numeric[cellIndex] && researchStyles.numeric, sentences[cellIndex] && researchStyles.sentence].filter(Boolean).join(" ")}
          style={Cell === "th" ? headingFloor(cells[rowIndex][cellIndex]) : undefined}
        >
          <RunText runs={cell.runs} prefix={`table-${index}-${rowIndex}-${cellIndex}`} />
        </Cell>
      );
    })}</tr>
  ));
  return (
    <div className={researchStyles.tableFrame} data-table-frame data-paper-block={index}>
      {caption && <p className={researchStyles.tableTitle} data-table-title><RunText runs={caption.runs} prefix={`caption-${index}`} /></p>}
      <button type="button" className={`${stageStyles.control} ${researchStyles.zoom}`} data-table-zoom aria-label="Zoom in" aria-haspopup="dialog" hidden><ZoomGlyph /></button>
      <div tabIndex={0} role="region" aria-label="Table" className={researchStyles.tableRegion}>
        <table className={researchStyles.table} data-research-table data-research-block-type="table">
          <thead>{tableRows[0]}</thead>
          <tbody>{tableRows.slice(1)}</tbody>
        </table>
      </div>
    </div>
  );
}

export function LegalPaperPage({ paper, showcase }: { paper: LegalPaper; showcase: ShowcaseEntry }) {
  const headings = paper.blocks.filter(({ type }) => type === "heading");
  const references = new Map<string, string[]>();
  function collect(runs: PaperRun[], prefix: string) {
    runs.forEach((run, index) => {
      if (run.footnoteRef === undefined) return;
      referenceParts(run).forEach((part, partIndex) => {
        if (!/^\d+$|^\*$/u.test(part)) return;
        const key = noteKey(part);
        references.set(key, [...(references.get(key) ?? []), `fnref-${key}-${prefix}-${index}-${partIndex}`]);
      });
    });
  }
  paper.abstract.forEach(({ runs }, index) => collect(runs, `abstract-${index}`));
  paper.blocks.forEach(({ runs, rows }, index) => {
    collect(runs, `body-${index}`);
    rows?.forEach((row, rowIndex) => row.forEach((cell, cellIndex) => collect(cell.runs, `table-${index}-${rowIndex}-${cellIndex}`)));
  });
  const acknowledgment = paper.acknowledgment;
  const figures = placeFigures(paper.slug, paper.blocks, paper.blocks.map(({ text }) => text).join("\n"));

  function Backlinks({ number }: { number: number | string }) {
    return <span className={styles.backlinks}>{(references.get(noteKey(number)) ?? []).map((id, index) => <a key={id} href={`#${id}`} role="doc-backlink" aria-label={`Return to footnote ${number} in the text${index ? `, reference ${index + 1}` : ""}`}>Return to Text{index ? ` ${index + 1}` : ""}</a>)}</span>;
  }

  return (
    <SiteShell active="experience" parent={{ href: `/experience/#${showcase.slug}`, label: "Experience" }} frameClassName={`legal-paper-page ${experienceStyles.frame}`}>
      <article className={styles.paper} aria-labelledby="paper-title">
        <LegalPaperReader notes={[
          ...(acknowledgment ? [{ key: "author", label: "Author note", content: <RunText runs={acknowledgment.runs} prefix="preview-author" /> }] : []),
          ...paper.footnotes.map((note) => ({ key: String(note.number), label: String(note.number), content: <RunText runs={note.runs} prefix={`preview-${note.number}`} /> })),
        ]}>
          <header className={`page-intro ${styles.header}`}>
            <h1 id="paper-title" tabIndex={-1}>{showcase.headline}</h1>
            <ExperienceMetadata entry={showcase} />
            <p className={researchStyles.sourceLinks}><a href={paper.repositoryUrl}>GitHub</a><a href={paper.sourceUrl}>Full Manuscript</a></p>
            <ExperienceDiagram entry={showcase} />
          </header>

          <ArticleReadingLayout
            items={[
              { id: "key-contributions", text: showcase.contributionsLabel },
              { id: "abstract-heading", text: "Abstract" },
              ...headings.map(({ id, text, level }) => ({ id: id!, text, level })),
              { id: "footnotes", text: "Footnotes" },
            ]}
            overview={<KeyContributions entry={showcase} />}
          >
            <section className={styles.manuscriptAbstract} aria-labelledby="abstract-heading">
                <div className={styles.manuscriptByline}>
                  <p>{paper.author}{acknowledgment && <sup className={styles.reference}><a id="fnref-author" href="#fn-author" role="doc-noteref" aria-label="Author note">*</a></sup>}</p>
                  {paper.date && <p>{paper.date}</p>}
                </div>
                <h2 id="abstract-heading" tabIndex={-1}>Abstract</h2>
                {paper.abstract.map((paragraph, index) => <p key={index}><RunText runs={paragraph.runs} prefix={`abstract-${index}`} /></p>)}
            </section>
            <div className={styles.body}>
              {paper.blocks.map((block, index) => {
                const content = <RunText runs={block.runs} prefix={`body-${index}`} />;
                if (block.type === "table" && block.rows) return <PaperTable key={index} rows={block.rows} caption={block.caption} index={index} />;
                if (block.type === "heading") {
                  const Heading = (block.level ?? 1) > 1 ? "h3" : "h2";
                  return <Heading id={block.id} tabIndex={-1} data-paper-block={index} key={index}>{content}</Heading>;
                }
                const paragraph = <p data-paper-block={index}>{content}</p>;
                const placed = figures.get(index);
                return <Fragment key={index}>{paragraph}{placed?.map((id) => <ArticleFigure key={id} id={id} />)}</Fragment>;
              })}
            </div>

            <section className={styles.footnotes} id="footnotes" tabIndex={-1} role="doc-endnotes" aria-labelledby="footnotes-heading">
              <h2 id="footnotes-heading">Footnotes</h2>
              {acknowledgment && <div className={styles.authorNote} id="fn-author" tabIndex={-1}><span className={styles.noteNumber} aria-hidden="true">*</span><div><p><RunText runs={acknowledgment.runs} prefix="author-note" /></p><a href="#fnref-author" role="doc-backlink" aria-label="Return to author credit">Return to Author</a></div></div>}
              <ol>{paper.footnotes.map((note) => <li id={`fn-${note.number}`} tabIndex={-1} key={note.number}><span className={styles.noteNumber} aria-hidden="true">{note.number}</span><div><p><RunText runs={note.runs} prefix={`note-${note.number}`} /></p><Backlinks number={note.number} /></div></li>)}</ol>
            </section>
          </ArticleReadingLayout>

          <footer className={styles.paperFooter}><Link className="back-link" href={`/experience/#${showcase.slug}`}><ReturnArrow />Back to Experience</Link><a href="#paper-title">Back to Top</a></footer>
          {figures.size > 0 && <FigureController key={paper.slug} />}
          {(figures.size > 0 || paper.blocks.some(({ type }) => type === "table")) && <ZoomStage key={`${paper.slug}-stage`} />}
        </LegalPaperReader>
      </article>
    </SiteShell>
  );
}
