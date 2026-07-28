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
      <header className="page-intro home-intro">
        <p className="eyebrow">WORLD MODELS · STRATEGY · FINANCE</p>
        <h1>
          Strategy at a World Model Unicorn <span aria-hidden="true">|</span>{" "}
          Duke B.S. &amp; M.Eng. <span aria-hidden="true">|</span>{" "}
          Sequoia Scholar, Cohort 8
        </h1>
      </header>

      <section className="prose-section summary-section" aria-labelledby="about-heading">
        <div className="section-heading">
          <p className="section-kicker">PERSONAL SUMMARY</p>
          <h2 id="about-heading">Summary</h2>
        </div>
        <div className="summary-copy">
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
        </div>

        <article className="practice-note">
          <p className="section-kicker">CURRENT PRACTICE</p>
          <h3>Constructive internal dissent</h3>
          <p>
            In his current role, Theodore acts as a strategic naysayer:
            stress-testing product assumptions, surfacing failure modes, and
            making the strongest reasonable case against a direction before
            the market has to do it.
          </p>
        </article>
      </section>
    </SiteShell>
  );
}
