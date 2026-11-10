import type { Metadata } from "next";
import Link from "next/link";
import { AboutContent } from "./components/AboutContent";
import { ClarinetHero } from "./components/clarinet-hero/ClarinetHero";
import { SiteShell } from "./components/SiteShell";
import { createPageMetadata, DEFAULT_DESCRIPTION, HOME_TITLE, navigation } from "./lib/content/site";
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
      <div className={styles.opening}>
        <nav className={styles.openingNav} aria-label="Opening navigation" data-opening-navigation>
          <div className={styles.openingLinks}>
            {navigation.map((item) => item.key === "about" ? (
              <a aria-current="page" href="#home-profile" key={item.key}>{item.label}</a>
            ) : (
              <Link href={item.href} key={item.key}>{item.label}</Link>
            ))}
          </div>
        </nav>
        <ClarinetHero />
      </div>
      <SiteShell active="about" frameClassName={styles.homeFrame} guides="index" showSkipLink={false}>
        <AboutContent hasHero />
      </SiteShell>
    </>
  );
}
