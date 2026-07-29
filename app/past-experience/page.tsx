import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "../components/SiteShell";
import { domainRoutes } from "./domainRoutes";

export const metadata: Metadata = {
  title: "Past Experience",
  description:
    "Theodore before July 1st, 2026: a full personal record organized across five domains.",
};

export default function PastExperiencePage() {
  return (
    <SiteShell active="experience">
      <header className="page-intro plain-page-intro experience-intro">
        <h1>Theodore before July 1st, 2026.</h1>
        <p className="lede">Select a domain to view the complete record.</p>
      </header>

      <nav className="domain-directory" aria-label="Experience domains">
        {domainRoutes.map((domain) => (
          <Link
            className="domain-directory-link"
            href={`/past-experience/${domain.slug}/`}
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
