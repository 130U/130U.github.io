import type { ShowcaseEntry } from "../../lib/content/experience-showcase";
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

export function KeyContributions({ entry, id = "key-contributions", nested = false }: { entry: ShowcaseEntry; id?: string; nested?: boolean }) {
  const Heading = nested ? "h5" : "h2";
  return (
    <section className={styles.contributions} aria-labelledby={id} data-experience-contributions={entry.id}>
      <Heading id={id} tabIndex={-1}>{entry.contributionsLabel}</Heading>
      <ul>{[...entry.keyContributions, ...entry.notes].map((text, index) => <li key={index}>{text}</li>)}</ul>
    </section>
  );
}
