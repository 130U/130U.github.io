import { architectureDiagrams } from "../../lib/content/architecture-diagrams";
import type { ShowcaseEntry } from "../../lib/content/experience-showcase";
import { LogicDiagram } from "./LogicDiagram";
import { InlineMarkdown } from "../research/ResearchInline";
import styles from "./Experience.module.css";

export function ExperienceMetadata({ entry }: { entry: ShowcaseEntry }) {
  return (
    <dl className={styles.metadata} data-experience-metadata>
      <div><dt>Organization</dt><dd>{entry.institution}</dd></div>
      <div><dt>Position</dt><dd>{entry.metadata.position}</dd></div>
      <div><dt>Location</dt><dd>{entry.metadata.location}</dd></div>
      <div><dt>Dates</dt><dd>{entry.metadata.dates}</dd></div>
    </dl>
  );
}

/** The project's logic architecture, shown under the record strip as the article's visual abstract. */
export function ExperienceDiagram({ entry }: { entry: ShowcaseEntry }) {
  const diagram = architectureDiagrams[entry.id];
  return diagram ? <LogicDiagram diagram={diagram} /> : null;
}

export function ProblemAndApproach({ entry }: { entry: ShowcaseEntry }) {
  if (!entry.problemAndApproach) return null;
  return (
    <section className={styles.problemAndApproach} aria-labelledby="problem-and-approach" data-problem-and-approach>
      <h2 id="problem-and-approach" tabIndex={-1}>{entry.problemAndApproach.title}</h2>
      {entry.problemAndApproach.text.split(/\n+/u).map((text, index) => <p key={index}><InlineMarkdown text={text} /></p>)}
    </section>
  );
}

export function KeyContributions({ entry }: { entry: ShowcaseEntry }) {
  return (
    <section className={styles.contributions} aria-labelledby="key-contributions" data-experience-contributions={entry.id}>
      <h2 id="key-contributions" tabIndex={-1}>{entry.contributionsLabel}</h2>
      <ol>{[...entry.keyContributions, ...entry.notes].map((text, index) => {
        const detail = entry.keyContributionDetails?.[String(index)];
        const DetailList = detail?.ordered ? "ol" : "ul";
        return <li key={index} data-contribution-item={index}>
          <div>
            {entry.categoryId === "01" ? <InlineMarkdown text={text} /> : text}
            {detail && <DetailList className={styles.contributionDetails} data-contribution-details={index}>
              {detail.items.map((item, childIndex) => <li key={childIndex} data-contribution-detail={childIndex}><InlineMarkdown text={item} /></li>)}
            </DetailList>}
          </div>
        </li>;
      })}</ol>
    </section>
  );
}
