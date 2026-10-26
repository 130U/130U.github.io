import Link from "next/link";
import type { ReactNode } from "react";
import { courseworkGroups } from "../lib/content/about";
import { selectedResearchProjects } from "../lib/content/selected-research";
import styles from "../home.module.css";

const researchSummaries: Record<string, ReactNode[]> = {
  "certified-valuation-arithmetic-asian-options": [
    "I develop a weighted payoff-remainder method that turns an exact conditional price representation into certified arithmetic Asian valuations. Combining shared Gaussian smoothing with validated Heston transforms, I obtain a complete projected Euler discretization-error bound below 0.011025 price units for a one-year call spread with twelve monthly fixings. I also derive a direct coupling bound that reduces the nonlinear remainder width by 99.4% in a deterministic-variance example, with proofs and executable certificates supporting both results.",
  ],
  "certified-rough-heston-valuation": [
    "I develop a mathematical framework for certifying rough Heston portfolio valuations. Starting from the fractional Riccati equation, I derive a history kernel that carries continuous residuals into rigorous pricing bounds. A joint error set preserves Fourier perturbations shared across strikes, and its exact support function identifies when separate price bounds lose information. I also prove denominator and left-half-plane guarantees for the Gatheral–Radoicic rational output across all real frequencies and positive times on a specified parameter domain.",
    <>
      For the six-month 4400–4500 call spread at α=0.52, finite-history propagation tightens the complete error upper bound by <strong>72.91%</strong>, from <strong>1.397612096 to 0.378598956 index points</strong>, with the output and reference centre fixed. For the quarter-year spread, shared aggregation across <strong>1,025 nodes</strong> lowers the complete upper bound by <strong>7.56%</strong>, from <strong>0.252393939 to 0.233318843 points</strong>, certifying a <strong>0.25-point budget</strong>. Both results retain the complete valuation error account, including quadrature, omitted frequencies, the infinite tail and arithmetic.
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
                <h3 className={styles.researchTitle}>
                  <Link href={project.path}>{project.title}</Link>
                </h3>
                {researchSummaries[project.slug].map((paragraph, index) => (
                  <p className={styles.researchSummary} key={index}>{paragraph}</p>
                ))}
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
                  Academic advisor:{" "}
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
        </div>
      </section>

      <section className={styles.section} id="coursework" aria-labelledby="coursework-heading">
        <p className={styles.sectionIndex} aria-hidden="true">04</p>
        <div className={styles.sectionBody}>
          <h2 className={styles.sectionTitle} id="coursework-heading">Selected Coursework</h2>
          <div className={styles.courseGrid}>
            {courseworkGroups.map((group) => (
              <article key={group.title}>
                <h3 className={styles.courseTitle}>{group.title}</h3>
                <ul className="course-list">
                  {group.courses.map((course) => <li key={course}>{course}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="contact" aria-label="Contact">
        <p className={styles.sectionIndex} aria-hidden="true">05</p>
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
          </ul>
        </div>
      </section>
    </div>
  );
}
