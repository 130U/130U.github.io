import Link from "next/link";
import { courseworkGroups } from "../lib/content/about";
import { selectedResearchProjects } from "../lib/content/selected-research";
import { FELLOWSHIP } from "../lib/content/site";
import styles from "../home.module.css";

const researchSummaries: Record<string, string> = {
  "certified-valuation-arithmetic-asian-options":
    "I use a shared Gaussian factor to control the nonsmooth payoff of an arithmetic Asian option, then combine the resulting bounds with validated Heston transforms. The resulting certificate bounds projected Euler time-discretization error in the paper’s monthly call-spread example, with numerical integration and rounding errors explicitly accounted for.",
  "certified-rough-heston-valuation":
    "I propagate fractional Riccati residuals into price bounds while retaining the Fourier errors shared across strikes. The resulting joint certificate captures cancellation in portfolios that separate price bounds miss. In the paper’s quarter-year call-spread example, the joint bound meets a 0.25-point budget that the corresponding separate bounds do not certify.",
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
                <p className={styles.researchSummary}>{researchSummaries[project.slug]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="education" aria-labelledby="education-heading">
        <p className={styles.sectionIndex} aria-hidden="true">03</p>
        <div className={styles.sectionBody}>
          <h2 className={styles.sectionTitle} id="education-heading">Education</h2>
          <div className={styles.educationList}>
            <article className="education-entry">
              <h3 className={styles.institution}>Duke University</h3>
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
              <h3 className={styles.institution}>Duke University</h3>
              <h4 className="education-degree">Bachelor of Science in Mathematics</h4>
              <p className="entry-subtitle">Dual-Degree Undergraduate Program</p>
              <p className="education-note">Undergraduate Merit Scholarship</p>
            </article>
          </div>
          <p className={styles.fellowship}>{`${FELLOWSHIP.title}, Cohort ${FELLOWSHIP.cohort}`}</p>
        </div>
      </section>

      <section className={styles.section} id="coursework" aria-labelledby="coursework-heading">
        <p className={styles.sectionIndex} aria-hidden="true">04</p>
        <div className={styles.sectionBody}>
          <h2 className={styles.sectionTitle} id="coursework-heading">Selected Coursework</h2>
          <div className={`course-grid ${styles.courseGrid}`}>
            {courseworkGroups.map((group) => (
              <article key={group.title}>
                <h3>{group.title}</h3>
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
