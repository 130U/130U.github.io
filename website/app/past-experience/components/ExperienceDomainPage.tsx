import Link from "next/link";
import type { ReactNode } from "react";
import { SiteShell } from "../../components/SiteShell";
import type { ExperienceDomain } from "../../lib/content/experience";

const metadataOrder = [
  "Position", "Location", "Dates", "Website",
  "Research areas", "Author credit", "Manuscript dates",
] as const;
const entryIndices = "abcdefghijklmnopqrstuvwxyz";

function formatWebsiteLabel(website: string) {
  return website.replace(/^https?:\/\/(?:www\.)?/u, "").replace(/\/$/u, "");
}

export function renderExperienceText(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const inlineMarkup = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gu;
  let offset = 0;
  for (const match of text.matchAll(inlineMarkup)) {
    if (match.index > offset) parts.push(text.slice(offset, match.index));
    if (match[1]) {
      parts.push(<strong key={match.index}>{renderExperienceText(match[1])}</strong>);
    } else if (match[2]) {
      parts.push(<em key={match.index}>{renderExperienceText(match[2])}</em>);
    } else {
      parts.push(<a key={match.index} href={match[4]}>{renderExperienceText(match[3])}</a>);
    }
    offset = match.index + match[0].length;
  }
  if (offset < text.length) parts.push(text.slice(offset));
  return parts;
}

export function ExperienceDomainPage({
  domain,
}: {
  domain: ExperienceDomain;
}) {
  return (
    <SiteShell
      active="experience"
      frameClassName={domain.slug === "artificial-intelligence" ? "ai-research-page" : undefined}
    >
      <header className="page-intro plain-page-intro domain-page-intro">
        <Link className="back-link" href="/past-experience/">
          <span aria-hidden="true">←</span> Past Experience
        </Link>
        <p className="domain-page-number">{domain.number}</p>
        <h1>{domain.name}</h1>
        {domain.introduction.length > 0 && (
          <div className="archive-entry-content domain-introduction">
            {domain.introduction.map((paragraph, index) => (
              <p key={index}>{renderExperienceText(paragraph)}</p>
            ))}
          </div>
        )}
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
              {entry.projects.map((project, projectIndex) => (
                <div className="entry-project-group" id={project.paperSlug} key={`${project.title}-${projectIndex}`}>
                  <h3 className="entry-project">{project.title}</h3>
                  {project.introduction.map((paragraph, index) => (
                    <p className="entry-project-context" key={index}>{renderExperienceText(paragraph)}</p>
                  ))}
                  {project.sections.map((section, sectionIndex) => (
                    <div className="entry-project-section" key={sectionIndex}>
                      {section.heading && (
                        <h4 className="entry-section-heading">{section.heading}</h4>
                      )}
                      <ul className="archive-bullets">
                        {section.bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex}>{renderExperienceText(bullet)}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {project.paperSlug && (
                    <Link
                      className="entry-paper-link"
                      href={`${domain.path}${project.paperSlug}/`}
                      aria-label={`Read ${project.title.replace(/^Project(?: \d+)?:\s*/u, "")}`}
                    >
                      Read paper <span aria-hidden="true">↗</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
