import type { ShowcaseEntry } from "../../lib/content/experience-showcase";
import { InlineMarkdown } from "../research/ResearchInline";
import styles from "./Experience.module.css";

export function ExperienceMetadata({ entry }: { entry: ShowcaseEntry }) {
  return (
    <dl className={styles.metadata} data-experience-metadata>
      <div className={styles.position}><dt>Position</dt><dd>{entry.metadata.position}</dd></div>
      <div><dt>Location</dt><dd>{entry.metadata.location}</dd></div>
      <div><dt>Dates</dt><dd>{entry.metadata.dates}</dd></div>
    </dl>
  );
}

export function ExperienceDisclosure({ entry }: { entry: ShowcaseEntry }) {
  if (!entry.disclosure) return null;
  return (
    <aside className={styles.disclosure} aria-labelledby="confidentiality-disclosure" data-experience-disclosure>
      <h2 id="confidentiality-disclosure">{entry.disclosure.title}</h2>
      <p><InlineMarkdown text={entry.disclosure.text} /></p>
    </aside>
  );
}

export function ArchitecturalContext({ entry }: { entry: ShowcaseEntry }) {
  if (!entry.architecturalContext) return null;
  return (
    <section className={styles.architecturalContext} aria-labelledby="architectural-context" data-architectural-context>
      <h2 id="architectural-context" tabIndex={-1}>{entry.architecturalContext.title}</h2>
      {entry.architecturalContext.text.split(/\n+/u).map((text, index) => <p key={index}><InlineMarkdown text={text} /></p>)}
    </section>
  );
}

export function KeyContributions({ entry, id = "key-contributions", nested = false }: { entry: ShowcaseEntry; id?: string; nested?: boolean }) {
  const Heading = nested ? "h5" : "h2";
  return (
    <section className={styles.contributions} aria-labelledby={id} data-experience-contributions={entry.id}>
      <Heading id={id} tabIndex={-1}>{entry.contributionsLabel}</Heading>
      <ul>{[...entry.keyContributions, ...entry.notes].map((text, index) => <li key={index}>{entry.categoryId === "01" ? <InlineMarkdown text={text} /> : text}</li>)}</ul>
    </section>
  );
}
