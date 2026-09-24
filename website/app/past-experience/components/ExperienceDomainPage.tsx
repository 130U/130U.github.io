import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import type { ExperienceDomain } from "../../lib/content/experience";

const metadataOrder = ["Position", "Location", "Dates", "Website"] as const;
const entryIndices = "abcdefghijklmnopqrstuvwxyz";

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
            key={`${entry.organization}-${entryIndex}`}
          >
            <div className="archive-entry-number" aria-hidden="true">
              {entryIndices[entryIndex]}
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
              {entry.projects.map((project, projectIndex) => {
                const contextStart = project.title.indexOf(" — ");
                const title = contextStart < 0 ? project.title : project.title.slice(0, contextStart);
                const context = contextStart < 0 ? null : project.title.slice(contextStart + 1);

                return (
                  <div className="entry-project-group" key={`${project.title}-${projectIndex}`}>
                    <h3 className="entry-project">{title}</h3>
                    {context && <p className="entry-project-context">{context}</p>}
                    {project.sections.map((section, sectionIndex) => (
                      <div className="entry-project-section" key={sectionIndex}>
                        {section.heading && (
                          <h4 className="entry-section-heading">{section.heading}</h4>
                        )}
                        <ul className="archive-bullets">
                          {section.bullets.map((bullet, bulletIndex) => (
                            <li key={bulletIndex}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
