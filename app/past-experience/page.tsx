import type { Metadata } from "next";
import { SiteShell } from "../components/SiteShell";
import { pastExperience } from "../lib/pastExperience";

export const metadata: Metadata = {
  title: "Past Experience",
  description:
    "Theodore before July 1st, 2026: a full personal record organized across five domains.",
};

const metadataOrder = ["Location", "Position", "Dates"];

export default function PastExperiencePage() {
  return (
    <SiteShell active="experience">
      <header className="page-intro plain-page-intro experience-intro">
        <h1>Theodore before July 1st, 2026.</h1>
        <p className="lede">Select a domain to view the complete record.</p>
      </header>

      <section className="domain-accordion" aria-label="Experience domains">
        {pastExperience.map((domain, domainIndex) => (
          <details className="domain-disclosure" key={domain.name}>
            <summary>
              <span className="domain-number">
                {String(domainIndex + 1).padStart(2, "0")}
              </span>
              <span className="domain-name">{domain.name}</span>
              <span className="domain-toggle" aria-hidden="true">+</span>
            </summary>

            <div className="domain-panel">
              {domain.entries.map((entry, entryIndex) => (
                <article
                  className="archive-entry"
                  key={`${entry.organization}-${entry.metadata.Project ?? entryIndex}`}
                >
                  <div className="archive-entry-number" aria-hidden="true">
                    {String(entryIndex + 1).padStart(2, "0")}
                  </div>
                  <div className="archive-entry-content">
                    <h2>{entry.organization}</h2>
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
          </details>
        ))}
      </section>
    </SiteShell>
  );
}
