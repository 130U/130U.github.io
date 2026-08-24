import type { Metadata } from "next";
import { DitheredEntrance } from "./components/dithered-entrance/DitheredEntrance";
import { SiteShell } from "./components/SiteShell";
import {
  createPageMetadata,
  DEFAULT_DESCRIPTION,
  HOME_TITLE,
} from "./lib/content/site";
import styles from "./home.module.css";

export const metadata: Metadata = createPageMetadata({
  title: HOME_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#home-profile">
        Skip to main content
      </a>
      <DitheredEntrance />
      <SiteShell
        active="home"
        frameClassName={styles.homeFrame}
        showSkipLink={false}
      >
        <section
          className={styles.profileSection}
          id="home-profile"
          aria-labelledby="home-heading"
        >
          <div className={styles.profileInner}>
            <header className={styles.identity}>
              <p className={styles.sectionIndex} aria-hidden="true">
                01
              </p>
              <div className={styles.identityCopy}>
                <h1 id="home-heading">Theodore Ouyang</h1>
                <ul className={styles.credentials} aria-label="Profile summary">
                  <li>Exploring practical AI use cases</li>
                  <li>Sequoia Scholar, Cohort 8</li>
                </ul>
              </div>
            </header>

            <div className={styles.biography}>
              <p className={styles.sectionIndex} aria-hidden="true">
                02
              </p>
              <div className={styles.biographyCopy}>
                <p>
                  Theodore Ouyang holds a Bachelor of Science and a Master of
                  Engineering from Duke University. His interests span artificial
                  intelligence, strategy, and finance, with a particular curiosity
                  about how emerging technologies become genuinely useful in
                  everyday life.
                </p>
                <p>He is a Sequoia Scholar in Cohort 8.</p>
              </div>
            </div>

            <div className={styles.contactSection}>
              <p className={styles.sectionIndex} aria-hidden="true">
                03
              </p>
              <ul className={styles.contactStrip}>
                <li>
                  <span className={styles.contactLabel}>
                    <span aria-hidden="true">⌖</span>
                    Location
                  </span>
                  <span>Beijing | Boston</span>
                </li>
                <li>
                  <span className={styles.contactLabel}>
                    <span aria-hidden="true">◇</span>
                    Education
                  </span>
                  <span>Duke University</span>
                </li>
                <li>
                  <span className={styles.contactLabel}>
                    <span aria-hidden="true">@</span>
                    Email
                  </span>
                  <a href="mailto:10@alumni.duke.edu">10@alumni.duke.edu</a>
                </li>
                <li>
                  <span className={styles.contactLabel}>
                    <span aria-hidden="true">GH</span>
                    Online
                  </span>
                  <a href="https://github.com/130U" rel="me">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </SiteShell>
    </>
  );
}
