import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import { pastExperience } from "../../lib/pastExperience";

const metadataOrder = ["Location", "Position", "Dates"];

export function ExperienceDomainPage({
  domainName,
  domainNumber,
}: {
  domainName: string;
  domainNumber: string;
}) {
  const domain = pastExperience.find((item) => item.name === domainName);

  if (!domain) {
    throw new Error(`Experience domain not found: ${domainName}`);
  }

  return (
    <SiteShell active="experience">
      <header className="page-intro plain-page-intro domain-page-intro">
        <Link className="back-link" href="/past-experience/">
          <span aria-hidden="true">←</span> Past Experience
        </Link>
        <p className="domain-page-number">{domainNumber}</p>
        <h1>{domain.name}</h1>
      </header>

      <section className="domain-panel domain-panel-standalone" aria-label={domain.name}>
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
      </section>
    </SiteShell>
  );
}
