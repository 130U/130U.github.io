import Link from "next/link";
import { showcaseDomains, type ShowcaseDomain, type ShowcaseEntry } from "../../lib/content/experience-showcase";
import { InlineMarkdown } from "../research/ResearchInline";
import { ReadingArrow } from "../ReadingArrow";
import { SectionDirectory } from "../SectionDirectory";
import styles from "./Experience.module.css";

function ExperienceEntry({ entry }: { entry: ShowcaseEntry }) {
  return (
    <article className="ledger-item" id={entry.slug} data-experience-entry={entry.id}>
      <h3 className="ledger-title">{entry.listingTitle}</h3>
      <div className="ledger-body">
        <p className="ledger-prose" data-experience-summary>{entry.categoryId === "01" ? <InlineMarkdown text={entry.summary} /> : entry.summary}</p>
        <Link className="read-more" href={entry.detailPath} aria-label={`Read more about ${entry.pageTitle}`}>
          {entry.readMoreLabel}<ReadingArrow />
        </Link>
      </div>
    </article>
  );
}
function ExperienceSection({ domain }: { domain: ShowcaseDomain }) {
  return (
    <section className={styles.section} id={domain.slug} aria-labelledby={`${domain.slug}-heading`}>
      <span className={styles.sectionIndex} aria-hidden="true">{domain.number}</span>
      <div className={styles.sectionBody}>
        <h2 className={styles.sectionTitle} id={`${domain.slug}-heading`} tabIndex={-1}>{domain.name}</h2>
        {/* The note introduces "the following four projects", so it opens the section. */}
        {domain.disclosure && <aside className={styles.indexDisclosure} aria-labelledby={`${domain.slug}-disclosure`} data-experience-disclosure>
          <h3 className="visually-hidden" id={`${domain.slug}-disclosure`}>{domain.disclosure.title}</h3>
          <p><InlineMarkdown text={domain.disclosure.text} /></p>
        </aside>}
        <div className="ledger">
          {domain.entries.map((entry) => <ExperienceEntry entry={entry} key={entry.id} />)}
        </div>
      </div>
    </section>
  );
}
export function ExperienceContent() {
  return (
    <>
      <header className={styles.intro}>
        <h1>Experience: Areas of Focus</h1>
        <SectionDirectory label="Experience sections" items={showcaseDomains.map((domain) => ({
          number: domain.number,
          title: domain.name,
          href: `#${domain.slug}`,
        }))} />
      </header>
      {showcaseDomains.map((domain) => <ExperienceSection domain={domain} key={domain.number} />)}
    </>
  );
}
