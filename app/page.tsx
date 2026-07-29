import type { Metadata } from "next";
import { SiteShell } from "./components/SiteShell";

export const metadata: Metadata = {
  title: {
    absolute:
      "Strategy at a World Model Unicorn | Duke B.S. & M.Eng. | Sequoia Scholar, Cohort 8",
  },
  description:
    "Theodore Ouyang works at the intersection of artificial intelligence, strategy, and finance, with a current focus on strategy at a world model unicorn.",
};

export default function Home() {
  return (
    <SiteShell active="home">
      <header className="page-intro plain-page-intro">
        <h1 lang="la">Quis ego sum?</h1>
      </header>

      <section className="summary-copy summary-copy-alone" aria-label="Personal summary">
        <p>
          Theodore Ouyang holds a Bachelor of Science and a Master of
          Engineering from Duke University. He works at the intersection of
          artificial intelligence, strategy, and finance, and currently
          focuses on strategy at a unicorn developing world models.
        </p>
        <p>
          His work centers on translating frontier AI capabilities into
          products, operating models, and long-term business advantage,
          particularly in financial and other high-stakes decision
          environments. He is also a Sequoia Scholar in Cohort 8.
        </p>
      </section>
    </SiteShell>
  );
}
