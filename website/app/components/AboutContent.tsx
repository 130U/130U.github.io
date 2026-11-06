import Link from "next/link";
import type { ReactNode } from "react";
import { selectedResearchProjects } from "../lib/content/selected-research";
import styles from "../home.module.css";

const researchSummaries: Record<string, ReactNode[]> = {
  "critical-dependence-stress-for-portfolio-diversification": [
    <>
      I develop a variational framework that measures how much dependence stress it takes to reverse a portfolio’s Expected Shortfall advantage while every individual loss distribution stays fixed. I prove a quadratic law for the critical stress budget, introduce the marginal-restoration premium, and characterize exactly when it is positive. In a uniform benchmark, the asymptotic reversal budget is at least 30% higher than the initial-sensitivity prediction. At equal effective costs, continuous flow–cut duality characterizes how the premium responds to background displacement costs. Together these results turn local risk sensitivity into a mathematically derived threshold for portfolio decision reversal.
    </>,
  ],
  "certified-valuation-arithmetic-asian-options": [
    "I develop a weighted payoff-remainder method and use it to turn an exact conditional price representation into certified valuations of arithmetic Asian options. Shared Gaussian smoothing and validated Heston transforms together give a complete projected Euler discretization-error bound below 0.011025 price units for a one-year call spread with twelve monthly fixings at a specified Heston parameter point and step size. I also derive a direct coupling bound, which cuts the nonlinear remainder width by 99.4% in a deterministic-variance example. Both results come with proofs and executable certificates.",
  ],
  "certified-rough-heston-valuation": [
    <>
      I develop a deterministic framework for certifying rough Heston portfolio valuations. I derive a finite-history propagation kernel and the exact support function of a joint error enclosure, which captures the shared Fourier errors that separate option-by-option bounds lose. In a matched benchmark, finite-history propagation tightens the complete pricing-error upper bound by 72.91% with the pricing output unchanged. Mathematical proofs and executable certificates tie these theoretical advances to financial results that can be verified.
    </>,
  ],
};

function ReadingArrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function AboutContent({ hasHero = false }: { hasHero?: boolean }) {
  const Heading = hasHero ? "h2" : "h1";
  return (
    <div className={styles.profileSection}>
      <header className={styles.identity} id="home-profile">
        <p className={styles.sectionIndex} aria-hidden="true">01</p>
        <div className={styles.sectionBody}>
          <Heading id="home-heading">
            <span>Thinking mathematically</span>{" "}
            <span>Working in AI</span>
          </Heading>
          <div className={styles.biographyCopy}>
            <p>
              Mathematics is how I make sense of things. I want to know which
              assumptions underlie a conclusion, what happens when they change,
              and where intuition stops being reliable.
            </p>
            <p>
              My work increasingly centers on AI. I build and experiment to
              understand these systems firsthand, and to work out what is worth
              doing with them.
            </p>
          </div>
        </div>
      </header>

      <section className={styles.section} id="selected-research" aria-labelledby="research-heading">
        <p className={styles.sectionIndex} aria-hidden="true">02</p>
        <div className={styles.sectionBody}>
          <h2 className={styles.sectionTitle} id="research-heading">Selected Research</h2>
          <div className={styles.rows}>
            {selectedResearchProjects.map((project) => (
              <article className={styles.row} key={project.slug} id={project.slug}>
                <h3 className={styles.rowTitle} id={`${project.slug}-title`}>{project.title}</h3>
                <div className={styles.rowBody}>
                  {researchSummaries[project.slug].map((paragraph, index) => (
                    <p className={styles.researchSummary} key={index}>{paragraph}</p>
                  ))}
                  <Link className={styles.readMore} href={project.path} aria-label={`Read more about ${project.title}`}>
                    Read More<ReadingArrow />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="education" aria-labelledby="education-heading">
        <p className={styles.sectionIndex} aria-hidden="true">03</p>
        <div className={styles.sectionBody}>
          <h2 className={styles.sectionTitle} id="education-heading">Education</h2>
          <div className={styles.rows}>
            <div className={styles.row}>
              <h3 className={styles.institution}>Duke University</h3>
              <div className={styles.rowBody}>
                <div className={styles.educationList}>
                  <article className="education-entry">
                    <h4 className="education-degree">Master of Engineering in Risk Engineering</h4>
                    <p className="entry-subtitle">Financial Risk Concentration</p>
                    <div className="education-notes">
                      <p className="education-note education-advisor">
                        Academic Advisor:{" "}
                        <a href="https://cee.duke.edu/people/mark-borsuk/" target="_blank" rel="noopener noreferrer">Mark Borsuk, Ph.D.</a>
                      </p>
                      <p className="education-note">Pratt School of Engineering Merit Scholarship</p>
                    </div>
                  </article>
                  <article className="education-entry">
                    <h4 className="education-degree">Bachelor of Science in Mathematics</h4>
                    <p className="entry-subtitle">Dual-Degree Undergraduate Program</p>
                    <p className="education-note">Undergraduate Merit Scholarship</p>
                  </article>
                </div>
                <div className={styles.coursework} id="coursework">
                  <Link className={styles.readMore} href="/coursework/" aria-label="Read more about coursework">Read More<ReadingArrow /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="contact" aria-label="Contact">
        <p className={styles.sectionIndex} aria-hidden="true">04</p>
        <div className={styles.sectionBody}>
          <ul className={styles.contactStrip}>
            <li>
              <span className={styles.contactLabel}>Email</span>
              <a href="mailto:10@alumni.duke.edu">10@alumni.duke.edu</a>
            </li>
            <li>
              <span className={styles.contactLabel}>GitHub</span>
              <a href="https://github.com/130U" rel="me">github.com/130U</a>
            </li>
            <li>
              <span className={styles.contactLabel}>X (Twitter)</span>
              <a href="https://x.com/D3rfr31schutz" rel="me">@D3rfr31schutz</a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
