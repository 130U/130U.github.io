import Link from "next/link";
import { selectedResearchProjects } from "../lib/content/selected-research";
import { ReadingArrow } from "./ReadingArrow";
import styles from "../home.module.css";

const researchSummaries: Record<string, string> = {
  "critical-dependence-stress-for-portfolio-diversification":
    "How far can the dependence between positions move before a diversification trade stops reducing Expected Shortfall, when every individual loss distribution stays fixed? I prove that the critical stress budget is quadratic in the trade size and identify its leading coefficient through a variational limit. The sensitivity at zero stress understates that budget. I introduce the marginal-restoration premium to measure the gap, characterize exactly when it is positive, and prove that it is at least 30% in a uniform benchmark. At equal effective costs, continuous flow–cut duality gives the premium's response to background displacement costs.",
  "certified-valuation-arithmetic-asian-options":
    "I prove a weighted payoff-remainder bound for arithmetic Asian options and use it to certify how far a projected Euler price can lie from the continuous Heston price. For a one-year call spread with twelve monthly fixings, at a specified parameter point and step size, the complete discretization-error bound is below 0.17% of the price, with transform tails, branch choices and rounding inside the same budget. I also derive a direct coupling bound that tightens the nonlinear remainder. Both results come with proofs and executable certificates.",
  "certified-rough-heston-valuation":
    "I develop a method for certifying portfolio valuation errors in rough Heston, carrying continuous Riccati residual bounds through to complete pricing guarantees. Options at one maturity are priced from the same Fourier values, so their numerical errors move together, and keeping that shared structure certifies portfolio tolerances that separate price bounds cannot. On twelve half-year strikes, the joint bounds bring all 28 spread, butterfly and basket positions tested within a half-point error budget, against 13 for separate bounds. The public research package includes the proofs, all 27 numerical banks, exact error ledgers and recorded six-stage reconstruction results.",
};

export function AboutContent({ hasHero = false }: { hasHero?: boolean }) {
  const Heading = hasHero ? "h2" : "h1";
  return (
    <div className={styles.profileSection}>
      <header className={styles.identity} id="home-profile">
        <p className={styles.sectionIndex} aria-hidden="true">01</p>
        <div className={styles.sectionBody}>
          <Heading id="home-heading">
            <span>Thinking Mathematically</span>{" "}
            <span>Working in AI</span>
          </Heading>
          <div className={styles.biographyCopy}>
            <p>
              Mathematics is how I make sense of things. I want to know which
              assumptions underlie a conclusion, what happens when they change,
              and where intuition stops being reliable.
            </p>
            <p>
              My work makes high-stakes conclusions verifiable: certified error
              bounds in derivative pricing, layered verification in frontier AI
              evaluation, and evidence standards for delegating authority to
              autonomous systems.
            </p>
            <p>
              AI is now the center of that work. I build and experiment to
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
          <div className="ledger">
            {selectedResearchProjects.map((project) => (
              <article className="ledger-item" key={project.slug} id={project.slug}>
                <h3 className="ledger-title" id={`${project.slug}-title`}>{project.title}</h3>
                <div className="ledger-body">
                  <p className="ledger-prose">{researchSummaries[project.slug]}</p>
                  <Link className="read-more" href={project.path} aria-label={`Read more about ${project.title}`}>
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
          <div className="ledger">
            <div className="ledger-item">
              <h3 className="ledger-title">Duke University</h3>
              <div className="ledger-body">
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
                  <Link className="read-more" href="/coursework/" aria-label="Read more about coursework">Read More<ReadingArrow /></Link>
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
