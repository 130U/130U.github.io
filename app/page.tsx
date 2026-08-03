import type { Metadata } from "next";
import { SiteShell } from "./components/SiteShell";
import { ParticleBackground } from "./components/particle-background/ParticleBackground";
import {
  createPageMetadata,
  DEFAULT_DESCRIPTION,
  HOME_TITLE,
} from "./lib/content/site";

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
      variant="particle"
      background={<ParticleBackground />}
    >
      <section className="home-hero" aria-labelledby="home-heading">
        <div className="home-hero-intro">
          <p className="home-question" lang="la">Quis ego sum?</p>
          <h1 className="visually-hidden" id="home-heading">
            Theodore Ouyang
          </h1>
          <p className="home-thesis">Identity emerges from possibility.</p>
        </div>

        <div className="home-summary-panel" aria-label="Personal summary">
          <p>
            Theodore Ouyang holds a Bachelor of Science and a Master of
            Engineering from Duke University. His interests span artificial
            intelligence, strategy, and finance, with a particular curiosity
            about how emerging technologies become genuinely useful in everyday
            life.
          </p>
          <p>He is a Sequoia Scholar in Cohort 8.</p>
        </div>
      </section>
    </SiteShell>
  );
}
