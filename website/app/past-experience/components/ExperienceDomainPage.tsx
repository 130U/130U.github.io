import { SiteShell } from "../../components/SiteShell";
import { ExperienceSection } from "../../components/experience/ExperienceContent";
import type { ShowcaseDomain } from "../../lib/content/experience-showcase";
import styles from "../../components/experience/Experience.module.css";

// Compatibility category pages render the approved Experience entries.
export function ExperienceDomainPage({ domain }: { domain: ShowcaseDomain }) {
  return (
    <SiteShell active="experience" parent={{ href: `/experience/#${domain.slug}`, label: "Experience" }} frameClassName={styles.frame}>
      <ExperienceSection domain={domain} standalone />
    </SiteShell>
  );
}
