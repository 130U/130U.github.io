import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import type { ExperienceDomain } from "../../lib/content/experience";

const metadataOrder = ["Location", "Website", "Position", "Dates"] as const;

function formatWebsiteLabel(website: string) {
  return website.replace(/^https?:\/\/(?:www\.)?/u, "").replace(/\/$/u, "");
}

export function ExperienceDomainPage({
  domain,
}: {
  domain: ExperienceDomain;
}) {
  return (
    <SiteShell active="experience">
      <header className="page-intro plain-page-intro domain-page-intro">
        <Link className="back-link" href="/past-experience/">
          <span aria-hidden="true">←</span> Past Experience
        </Link>
        <p className="domain-page-number">{domain.number}</p>
        <h1>{domain.name}</h1>
      </header>

      <section className="domain-panel domain-panel-standalone" aria-label={domain.name}>
        {domain.entries.map((entry, entryIndex) => (
          <article
            className="archive-entry"
            key={`${entry.organization}-${entry.metadata.Project}`}
          >
            <div className="archive-entry-number" aria-hidden="true">
              {String(entryIndex + 1).padStart(2, "0")}
            </div>
            <div className="archive-entry-content">
              <h2>{entry.organization}</h2>
              <dl className="entry-metadata">
                {metadataOrder.map((label) => {
                  const value = entry.metadata[label];
                  if (!value) return null;

                  return (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>
                        {label === "Website" ? (
                          <a
                            className="entry-website-link"
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Visit ${entry.organization} website (opens in a new tab)`}
                          >
                            <span>{formatWebsiteLabel(value)}</span>
                            <span className="entry-website-arrow" aria-hidden="true">
                              ↗
                            </span>
                          </a>
                        ) : (
                          value
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              <p className="entry-project">
                <span>Project</span>
                {entry.metadata.Project}
              </p>
              {entry.summaries.map((summary, summaryIndex) => (
                <p className="entry-summary" key={`${summary.slice(0, 48)}-${summaryIndex}`}>
                  {summary}
                </p>
              ))}
              <ul className="archive-bullets">
                {entry.bullets.map((bullet, bulletIndex) => (
                  <li key={`${bullet.slice(0, 48)}-${bulletIndex}`}>{bullet}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
