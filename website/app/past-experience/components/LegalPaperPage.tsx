import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { SiteShell } from "../../components/SiteShell";
import { LEGAL_DOMAIN_PATH, type LegalPaper, type PaperRun } from "../../lib/content/legal-papers";
import styles from "./LegalPaperPage.module.css";

function noteKey(number: number | string) {
  return number === "*" ? "author" : String(number);
}

function referenceParts(run: PaperRun) {
  return (run.text || String(run.footnoteRef)).split(/([,;])/u);
}

function linkedText(text: string) {
  return text.split(/(https?:\/\/[^\s<>"\])]+)/u).map((part, index) => {
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

export function LegalPaperPage({ paper }: { paper: LegalPaper }) {
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
  paper.blocks.forEach(({ runs }, index) => collect(runs, `body-${index}`));
  const acknowledgment = paper.acknowledgment;

  function Backlinks({ number }: { number: number | string }) {
    return <span className={styles.backlinks}>{(references.get(noteKey(number)) ?? []).map((id, index) => <a key={id} href={`#${id}`} role="doc-backlink" aria-label={`Return to footnote ${number} in the text${index ? `, reference ${index + 1}` : ""}`}>Return to text{index ? ` ${index + 1}` : ""}</a>)}</span>;
  }

  return (
    <SiteShell active="experience" frameClassName="legal-paper-page">
      <article className={styles.paper} aria-labelledby="paper-title">
        <header className={`page-intro ${styles.header}`}>
          <Link className="back-link" href={`${LEGAL_DOMAIN_PATH}#${paper.slug}`}><span aria-hidden="true">←</span> Legal Research and Policy Analysis</Link>
          <p className={styles.kicker}>Research paper</p>
          <h1 id="paper-title">{paper.title}</h1>
          {paper.subtitle && <p className={styles.subtitle}>{paper.subtitle}</p>}
          <div className={styles.byline}>
            <p>{paper.author}{acknowledgment && <sup className={styles.reference}><a id="fnref-author" href="#fn-author" role="doc-noteref" aria-label="Author note">*</a></sup>}</p>
            {paper.date && <p>{paper.date}</p>}
          </div>
        </header>

        <section className={styles.abstract} aria-labelledby="abstract-heading">
          <h2 id="abstract-heading">Abstract</h2>
          {paper.abstract.map((paragraph, index) => <p key={index}><RunText runs={paragraph.runs} prefix={`abstract-${index}`} /></p>)}
        </section>

        <details className={styles.contents}>
          <summary>Contents</summary>
          <nav aria-label="Article contents"><ol>{headings.map((heading) => <li key={heading.id} className={(heading.level ?? 1) > 1 ? styles.subsectionLink : undefined}><a href={`#${heading.id}`}>{heading.text}</a></li>)}<li><a href="#footnotes">Footnotes</a></li></ol></nav>
        </details>

        <div className={styles.body}>
          {paper.blocks.map((block, index) => {
            const content = <RunText runs={block.runs} prefix={`body-${index}`} />;
            if (block.type !== "heading") return <p data-paper-block={index} key={index}>{content}</p>;
            const Heading = (block.level ?? 1) > 1 ? "h3" : "h2";
            return <Heading id={block.id} data-paper-block={index} key={index}>{content}</Heading>;
          })}
        </div>

        <section className={styles.footnotes} id="footnotes" role="doc-endnotes" aria-labelledby="footnotes-heading">
          <h2 id="footnotes-heading">Footnotes</h2>
          {acknowledgment && <div className={styles.authorNote} id="fn-author"><span className={styles.noteNumber} aria-hidden="true">*</span><div><p><RunText runs={acknowledgment.runs} prefix="author-note" /></p><a href="#fnref-author" role="doc-backlink" aria-label="Return to author credit">Return to author</a></div></div>}
          <ol>{paper.footnotes.map((note) => <li id={`fn-${note.number}`} key={note.number}><span className={styles.noteNumber} aria-hidden="true">{note.number}</span><div><p><RunText runs={note.runs} prefix={`note-${note.number}`} /></p><Backlinks number={note.number} /></div></li>)}</ol>
        </section>

        <footer className={styles.paperFooter}><Link className="back-link" href={`${LEGAL_DOMAIN_PATH}#${paper.slug}`}><span aria-hidden="true">←</span> Legal Research and Policy Analysis</Link><a href="#paper-title">Back to top</a></footer>
      </article>
    </SiteShell>
  );
}
