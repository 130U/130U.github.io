import type { Metadata } from "next";
import { SiteShell } from "../components/SiteShell";
import { pastExperience } from "../lib/pastExperience";

export const metadata: Metadata = {
  title: "Past Experience",
  description:
    "Leou before July 1, 2026: a full personal record organized across five domains.",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const metadataOrder = ["Location", "Position", "Dates"];

export default function PastExperiencePage() {
  return (
    <SiteShell active="experience">
      <header className="page-intro experience-intro">
        <p className="eyebrow">PAST EXPERIENCE</p>
        <h1>Leou before July 1, 2026.</h1>
        <p className="lede">
          A personal record of the work that mattered, preserved in full and
          organized by domain.
        </p>
      </header>

      <nav className="domain-index" aria-label="Experience domains">
        <p className="section-kicker">FIVE DOMAINS</p>
        <ol>
          {pastExperience.map((domain, index) => (
            <li key={domain.name}>
              <a href={`#${slugify(domain.name)}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {domain.name}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="domain-list">
        {pastExperience.map((domain, domainIndex) => (
          <section
            className="domain-section"
            id={slugify(domain.name)}
            key={domain.name}
            aria-labelledby={`${slugify(domain.name)}-heading`}
          >
            <header className="domain-heading">
              <span>{String(domainIndex + 1).padStart(2, "0")}</span>
              <h2 id={`${slugify(domain.name)}-heading`}>{domain.name}</h2>
            </header>

            <div className="domain-entries">
              {domain.entries.map((entry, entryIndex) => (
                <article
                  className="archive-entry"
                  key={`${entry.organization}-${entry.metadata.Project ?? entryIndex}`}
                >
                  <div className="archive-entry-number" aria-hidden="true">
                    {String(entryIndex + 1).padStart(2, "0")}
                  </div>
                  <div className="archive-entry-content">
                    <h3>{entry.organization}</h3>
                    <dl className="entry-metadata">
                      {metadataOrder.map((label) =>
                        entry.metadata[label] ? (
                          <div key={label}>
                            <dt>{label}</dt>
                            <dd>{entry.metadata[label]}</dd>
                          </div>
                        ) : null,
                      )}
                    </dl>
                    {entry.metadata.Project ? (
                      <p className="entry-project">
                        <span>Project</span>
                        {entry.metadata.Project}
                      </p>
                    ) : null}
                    <ul className="archive-bullets">
                      {entry.bullets.map((bullet, bulletIndex) => (
                        <li key={`${bullet.slice(0, 48)}-${bulletIndex}`}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </SiteShell>
  );
}
