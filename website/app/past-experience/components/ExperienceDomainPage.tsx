import Link from "next/link";
import { renderInlineText } from "../../components/InlineText";
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

function ProjectReadingLink({ path, slug, title, kind }: {
  path: string;
  slug: string;
  title: string;
  kind: "paper" | "analysis";
}) {
  const projectName = title.replace(/^Project(?: \d+)?:\s*/u, "");
  return (
    <Link
      className="entry-paper-link"
      href={`${path}${slug}/`}
      aria-label={kind === "paper" ? `Read ${projectName}` : `Read more about ${projectName}`}
    >
      {kind === "paper" ? "Read paper" : "Read more"}
      <svg className="entry-paper-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

export function ExperienceDomainPage({
  domain,
}: {
  domain: ExperienceDomain;
}) {
  return (
    <SiteShell
      active="experience"
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
              <p key={index}>{renderInlineText(paragraph)}</p>
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
                <div className="entry-project-group" id={project.paperSlug ?? project.readMoreSlug} key={`${project.title}-${projectIndex}`}>
                  <h3 className="entry-project">{project.title}</h3>
                  {project.introduction.map((paragraph, index) => (
                    <p className="entry-project-context" key={index}>{renderInlineText(paragraph)}</p>
                  ))}
                  {project.paperSlug && (
                    <ProjectReadingLink path={domain.path} slug={project.paperSlug} title={project.title} kind="paper" />
                  )}
                  {project.readMoreSlug && (
                    <ProjectReadingLink path={domain.path} slug={project.readMoreSlug} title={project.title} kind="analysis" />
                  )}
                  {project.sections.map((section, sectionIndex) => (
                    <div className="entry-project-section" key={sectionIndex}>
                      {section.heading && (
                        <h4 className="entry-section-heading">{section.heading}</h4>
                      )}
                      <ul className="archive-bullets">
                        {section.bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex}>{renderInlineText(bullet)}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
