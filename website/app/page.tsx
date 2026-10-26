import type { Metadata } from "next";
import { AboutContent } from "./components/AboutContent";
import { DitheredEntrance } from "./components/dithered-entrance/DitheredEntrance";
import { SiteShell } from "./components/SiteShell";
import { createPageMetadata, ABOUT_DESCRIPTION, HOME_TITLE } from "./lib/content/site";
import styles from "./home.module.css";

export const metadata: Metadata = createPageMetadata({
  title: HOME_TITLE,
  description: ABOUT_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

export default function AboutPage() {
  return (
    <>
      <a className="skip-link" href="#home-profile">Skip to main content</a>
      <DitheredEntrance />
      <SiteShell active="about" frameClassName={styles.homeFrame} showSkipLink={false}>
        <AboutContent />
      </SiteShell>
    </>
  );
}
