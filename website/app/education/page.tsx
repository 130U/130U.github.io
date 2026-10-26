import type { Metadata } from "next";
import { AboutContent } from "../components/AboutContent";
import { SiteShell } from "../components/SiteShell";
import { createPageMetadata, ABOUT_DESCRIPTION, HOME_TITLE } from "../lib/content/site";
import styles from "../home.module.css";

// Static compatibility route for About content and its research fragment links.
// Canonical metadata points to /; shared content omits the particle entrance.
export const metadata: Metadata = createPageMetadata({
  title: HOME_TITLE,
  description: ABOUT_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

export default function EducationAlias() {
  return (
    <SiteShell active="about" frameClassName={styles.homeFrame}>
      <AboutContent />
    </SiteShell>
  );
}
