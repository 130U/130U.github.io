import type { Metadata } from "next";
import { SiteShell } from "./components/SiteShell";
import { ParticleBackground } from "./components/particle-background/ParticleBackground";
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
    <SiteShell
      active="home"
      background={<ParticleBackground />}
      frameClassName={styles.homeFrame}
      showProfile={false}
      skipHref="#home-profile"
      variant="particle"
    >
      <div className={styles.particleStage}>
        <a className={styles.scrollCue} href="#home-profile">
          <span>Scroll</span>
          <span className={styles.scrollLine} aria-hidden="true" />
        </a>
      </div>

      <section
        className={styles.profileSection}
        id="home-profile"
        aria-labelledby="home-heading"
      >
        <div className={styles.profileInner}>
          <header className={styles.identity}>
            <div className={styles.portrait}>
              <picture>
                <source
                  type="image/avif"
                  srcSet="/assets/profile/theodore-avatar-warm-384.avif 384w, /assets/profile/theodore-avatar-warm-768.avif 768w"
                  sizes="(max-width: 720px) 112px, 176px"
                />
                <source
                  type="image/webp"
                  srcSet="/assets/profile/theodore-avatar-warm-384.webp 384w, /assets/profile/theodore-avatar-warm-768.webp 768w"
                  sizes="(max-width: 720px) 112px, 176px"
                />
                <img
                  src="/assets/profile/theodore-avatar-warm.png"
                  alt="Illustrated portrait of Theodore Ouyang"
                  width="1024"
                  height="1536"
                  sizes="(max-width: 720px) 112px, 176px"
                />
              </picture>
            </div>

            <div className={styles.identityCopy}>
              <p className={styles.sectionLabel}>Profile</p>
              <h1 id="home-heading">Theodore Ouyang</h1>
              <ul className={styles.credentials} aria-label="Profile summary">
                <li>Exploring practical AI use cases</li>
                <li>Sequoia Scholar, Cohort 8</li>
              </ul>
            </div>
          </header>

          <div className={styles.biography}>
            <p className={styles.sectionLabel}>About</p>
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
            <p className={styles.sectionLabel}>Coordinates</p>
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
  );
}
