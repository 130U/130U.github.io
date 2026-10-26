import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import { ExperienceSection } from "../../components/experience/ExperienceContent";
import type { ShowcaseDomain } from "../../lib/content/experience-showcase";
import styles from "../../components/experience/Experience.module.css";

// Legacy category URLs remain useful, with the same approved copy as Experience.
export function ExperienceDomainPage({ domain }: { domain: ShowcaseDomain }) {
  return (
    <SiteShell active="experience" frameClassName={styles.frame}>
      <div className={styles.domainHeader}>
        <Link className="back-link" href={`/experience/#${domain.slug}`}><span aria-hidden="true">←</span> Experience</Link>
      </div>
      <ExperienceSection domain={domain} standalone />
    </SiteShell>
  );
}
