import type { Metadata } from "next";
import { AboutContent } from "../components/AboutContent";
import { SiteShell } from "../components/SiteShell";
import { createPageMetadata, ABOUT_DESCRIPTION, HOME_TITLE } from "../lib/content/site";
import styles from "../home.module.css";

// Preserve old bookmarks and research fragments on the static host.
// About is canonical; this alias shares its content without repeating the entrance.
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
