import Link from "next/link";
import type { ReactNode } from "react";
import { courseworkGroups } from "../lib/content/about";
import { selectedResearchProjects } from "../lib/content/selected-research";
import styles from "../home.module.css";

const researchSummaries: Record<string, ReactNode[]> = {
  "critical-dependence-stress-for-portfolio-diversification": [
    <>
      I develop a variational framework for measuring the dependence stress needed to reverse a portfolio’s Expected Shortfall advantage while preserving individual loss distributions. I prove a quadratic law for the critical stress budget and characterize exactly when marginal restoration adds a premium. In a uniform benchmark, the asymptotic reversal budget is <strong>at least 30% higher</strong> than the initial-sensitivity prediction. Continuous flow–cut duality characterizes the premium’s sensitivity to background displacement costs, turning local risk sensitivity into a mathematically derived threshold for portfolio decision reversal.
    </>,
  ],
  "certified-valuation-arithmetic-asian-options": [
    "I develop a weighted payoff-remainder method that turns an exact conditional price representation into certified arithmetic Asian valuations. Combining shared Gaussian smoothing with validated Heston transforms, I obtain a complete projected Euler discretization-error bound below 0.011025 price units for a one-year call spread with twelve monthly fixings. I also derive a direct coupling bound that reduces the nonlinear remainder width by 99.4% in a deterministic-variance example, with proofs and executable certificates supporting both results.",
  ],
  "certified-rough-heston-valuation": [
    <>
      I develop a deterministic framework for certifying rough Heston portfolio valuations. I derive a finite-history propagation kernel and the exact support function of a joint error enclosure, capturing shared Fourier errors that separate option-by-option bounds lose. In a matched benchmark, finite-history propagation tightens the complete pricing-error upper bound by <strong>72.91%</strong> without changing the pricing output. Mathematical proofs and executable certificates connect the theoretical advances to verifiable financial results.
    </>,
  ],
};

export function AboutContent() {
  return (
    <div className={styles.profileSection}>
      <header className={styles.identity} id="home-profile">
        <p className={styles.sectionIndex} aria-hidden="true">01</p>
        <div className={styles.sectionBody}>
          <h1 id="home-heading">
            <span>Thinking mathematically</span>{" "}
            <span>Working in AI</span>
          </h1>
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
          <div>
            {selectedResearchProjects.map((project) => (
              <article className={styles.researchEntry} key={project.slug} id={project.slug}>
                <Link className={styles.researchLink} href={project.path} aria-labelledby={`${project.slug}-title`}>
                  <h3 className={styles.researchTitle} id={`${project.slug}-title`}>{project.title}</h3>
                  {researchSummaries[project.slug].map((paragraph, index) => (
                    <p className={styles.researchSummary} key={index}>{paragraph}</p>
                  ))}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="education" aria-labelledby="education-heading">
        <p className={styles.sectionIndex} aria-hidden="true">03</p>
        <div className={styles.sectionBody}>
          <h2 className={styles.sectionTitle} id="education-heading">Education</h2>
          <h3 className={styles.institution}>Duke University</h3>
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
          <details className={styles.coursework} id="coursework">
            <summary className={styles.courseworkButton}>View coursework</summary>
            <div className={styles.courseworkContent}>
              <h3 className={styles.courseworkHeading} id="coursework-heading">Selected Coursework</h3>
              <div className={styles.courseGrid}>
                {courseworkGroups.map((group) => (
                  <article key={group.title}>
                    <h4 className={styles.courseTitle}>{group.title}</h4>
                    <ul className="course-list">
                      {group.courses.map((course) => <li key={course}>{course}</li>)}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </details>
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
