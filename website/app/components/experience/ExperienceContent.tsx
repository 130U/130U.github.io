import Link from "next/link";
import { showcaseDomains, type ShowcaseDomain, type ShowcaseEntry } from "../../lib/content/experience-showcase";
import { ExperienceMetadata, KeyContributions } from "./ExperienceDetails";
import styles from "./Experience.module.css";

function ReadingArrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ExperienceEntry({ entry }: { entry: ShowcaseEntry }) {
  const title = entry.articlePath ? entry.detailTitle : entry.organization;
  return (
    <article className={styles.entry} id={entry.slug} data-experience-entry={entry.id}>
      <h3 className={styles.entryTitle}>{title}</h3>
      {entry.articlePath && entry.organization !== entry.detailTitle && <p className={styles.organization}>{entry.organization}</p>}
      <p className={styles.summary} data-experience-summary>{entry.summary}</p>
      {entry.articlePath ? (
        <Link className={styles.readMore} href={entry.articlePath} aria-label={`Read more about ${entry.detailTitle}`}>
          {entry.readMoreLabel}<ReadingArrow />
        </Link>
      ) : (
        <details className={styles.details}>
          <summary className={styles.readMore}>
            <span className={styles.closedLabel}>{entry.readMoreLabel}</span><span className={styles.openLabel}>Show less</span><span className={styles.visuallyHidden}> about {entry.organization}</span><ReadingArrow />
          </summary>
          <div className={styles.detailBody}>
            <h4>{entry.detailTitle}</h4>
            <ExperienceMetadata entry={entry} />
            <KeyContributions entry={entry} id={`${entry.slug}-key-contributions`} nested />
          </div>
        </details>
      )}
    </article>
  );
}
export function ExperienceSection({ domain, standalone = false }: { domain: ShowcaseDomain; standalone?: boolean }) {
  const Heading = standalone ? "h1" : "h2";
  return (
    <section className={styles.section} id={domain.slug} aria-labelledby={`${domain.slug}-heading`}>
      <span className={styles.sectionIndex} aria-hidden="true">{domain.number}</span>
      <div className={styles.sectionBody}>
        <Heading className={styles.sectionTitle} id={`${domain.slug}-heading`} tabIndex={-1}>{domain.name}</Heading>
        {domain.entries.map((entry) => <ExperienceEntry entry={entry} key={entry.id} />)}
      </div>
    </section>
  );
}
export function ExperienceContent() {
  return (
    <>
      <header className={styles.intro}>
        <h1>Experience</h1>
        <nav className={styles.directory} aria-label="Experience sections">
          {showcaseDomains.map((domain) => <a href={`#${domain.slug}`} key={domain.number}><span>{domain.number}</span>{domain.name}</a>)}
        </nav>
      </header>
      {showcaseDomains.map((domain) => <ExperienceSection domain={domain} key={domain.number} />)}
    </>
  );
}
