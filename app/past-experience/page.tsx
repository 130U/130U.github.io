import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "../components/SiteShell";
import { pastExperience } from "../lib/content/experience";
import { createPageMetadata } from "../lib/content/site";

export const metadata: Metadata = createPageMetadata({
  title: "Past Experience",
  description:
    "Theodore before July 1st, 2026: a full personal record organized across five domains.",
  path: "/past-experience/",
});

export default function PastExperiencePage() {
  return (
    <SiteShell active="experience">
      <header className="page-intro plain-page-intro experience-intro">
        <h1>Theodore before July 1st, 2026.</h1>
        <p className="lede">Select a domain to view the complete record.</p>
      </header>

      <nav className="domain-directory" aria-label="Experience domains">
        {pastExperience.map((domain) => (
          <Link
            className="domain-directory-link"
            href={domain.path}
            key={domain.slug}
          >
            <span className="domain-number">{domain.number}</span>
            <span className="domain-name">{domain.name}</span>
            <span className="domain-arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </nav>
    </SiteShell>
  );
}
