import type { Metadata } from "next";
import { SiteShell } from "../components/SiteShell";

export const metadata: Metadata = {
  title: "Education",
  description: "Theodore Ouyang’s education at Duke University.",
};

export default function EducationPage() {
  return (
    <SiteShell active="education">
      <header className="page-intro">
        <p className="eyebrow">EDUCATION</p>
        <h1>Mathematics, risk, and applied decision making.</h1>
        <p className="lede">
          An interdisciplinary foundation spanning mathematics, engineering,
          finance, data science, law, and ethics.
        </p>
      </header>

      <section className="education-list" aria-label="Degrees">
        <article className="education-entry">
          <div className="entry-date">2025</div>
          <div>
            <p className="entry-place">Duke University · Durham, USA</p>
            <h2>Master of Engineering in Risk Engineering</h2>
            <p className="entry-subtitle">Financial Risk Concentration</p>
            <p>
              Pratt School of Engineering Merit Scholarship — one of the
              school’s highest-tier merit awards, covering 50% of tuition.
            </p>
          </div>
        </article>

        <article className="education-entry">
          <div className="entry-date">2023</div>
          <div>
            <p className="entry-place">Duke University · Durham, USA</p>
            <h2>Bachelor of Science in Mathematics</h2>
            <p className="entry-subtitle">Dual-Degree Undergraduate Program</p>
            <p>
              Undergraduate Merit Scholarship — a merit-based award covering
              25% of tuition.
            </p>
          </div>
        </article>
      </section>

      <section className="coursework" aria-labelledby="coursework-heading">
        <div className="section-heading">
          <p className="section-kicker">SELECTED COURSEWORK</p>
          <h2 id="coursework-heading">A deliberately broad toolkit</h2>
        </div>
        <div className="course-grid">
          <article>
            <h3>Mathematics</h3>
            <p>
              Real and complex analysis, measure theory, topology, stochastic
              processes, stochastic differential equations, numerical analysis,
              ODEs and PDEs, mathematical modeling, and financial mathematics.
            </p>
          </article>
          <article>
            <h3>Data & Computing</h3>
            <p>
              Statistical methodology, machine learning, deep learning,
              algorithms, engineering computing, and technology-driven
              quantitative finance.
            </p>
          </article>
          <article>
            <h3>Finance & Economics</h3>
            <p>
              Corporate finance, financial accounting, venture capital,
              microeconomics, macroeconomics, econometrics, and mathematical
              analysis of macroeconomics.
            </p>
          </article>
          <article>
            <h3>Law, Ethics & Global Affairs</h3>
            <p>
              Space law, ocean and coastal law, global China and global
              challenges, and ethics and leadership.
            </p>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
