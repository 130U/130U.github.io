import type { Metadata } from "next";
import { AboutContent } from "./components/AboutContent";
import { ClarinetHero } from "./components/clarinet-hero/ClarinetHero";
import { SiteShell } from "./components/SiteShell";
import { createPageMetadata, DEFAULT_DESCRIPTION, HOME_TITLE } from "./lib/content/site";
import styles from "./home.module.css";

export const metadata: Metadata = createPageMetadata({
  title: HOME_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

export default function AboutPage() {
  return (
    <>
      <a className="skip-link" href="#home-profile">Skip to Main Content</a>
      <ClarinetHero />
      <SiteShell active="about" frameClassName={styles.homeFrame} guides="index" showSkipLink={false}>
        <AboutContent hasHero />
      </SiteShell>
    </>
  );
}
