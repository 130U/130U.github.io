import Link from "next/link";
import { selectedResearchProjects } from "../lib/content/selected-research";
import { ReadingArrow } from "./ReadingArrow";
import styles from "../home.module.css";

const researchSummaries: Record<string, string> = {
  "critical-dependence-stress-for-portfolio-diversification":
    "How far can the dependence between positions move before a diversification trade stops reducing Expected Shortfall, when every individual loss distribution stays fixed? I prove that the critical stress budget is quadratic in the trade size and identify its leading coefficient through a variational limit. The sensitivity at zero stress understates that budget. I introduce the marginal-restoration premium to measure the gap, characterize exactly when it is positive, and prove that it is at least 30% in a uniform benchmark. At equal effective costs, continuous flow–cut duality gives the premium's response to background displacement costs.",
  "certified-valuation-of-arithmetic-asian-options":
    "What does an arithmetic Asian option lose when exercise is decided on the geometric average of its fixings? I prove that the loss is at most the dispersion of the fixings divided by the level risk that precedes them, and that in Black's model it grows with the cube of volatility and the square of the averaging window. For a one-month crude oil average price option the bound is below a hundredth of a cent per barrel, against 2.6 cents for the classical first-order bound. Under Heston, validated transforms turn the bound into a proved price interval for a twelve-fixing call spread and a proved bound on its Euler discretization error, with executable certificates.",
  "certified-joint-pricing-errors-in-rough-heston":
    "How far can stored option prices sit from the exact model prices, measured across a whole portfolio? Every strike at one expiry is priced from the same characteristic function, so its numerical error is a common factor. I prove that a portfolio's exposure to that error at each frequency is the Fourier transform of its payoff: spreads and butterflies hedge it, and baskets over many strikes diversify it. In rough Heston, a residual in the fractional Riccati equation moves the log-characteristic function by at most the residual integrated against a forward variance curve, with constant one. On S&P 500 options, netting the legs certifies a half-point tolerance for all 28 six-month spreads, butterflies and baskets tested, against 13 without.",
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
              Most of it is in finance and AI. From 2023 to 2026 I designed
              review and verification systems with a foundation model
              developer, a frontier AI lab, and a global alternative asset
              manager. I also build systems of my own:{" "}
              <a className={styles.inlineLink} href="https://github.com/130U/130U-FinLLM" target="_blank" rel="noopener noreferrer">a language model</a>{" "}
              trained from scratch on financial text, and{" "}
              <a className={styles.inlineLink} href="https://github.com/130U/agent-evaluation-methodology" target="_blank" rel="noopener noreferrer">a gate</a>{" "}
              that decides which evaluation feedback an agent&apos;s optimizer may act on.
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

      <section className={styles.section} id="fellowship" aria-labelledby="fellowship-heading">
        <p className={styles.sectionIndex} aria-hidden="true">04</p>
        <div className={styles.sectionBody}>
          <h2 className={styles.sectionTitle} id="fellowship-heading">Fellowship</h2>
          <div className={`ledger ${styles.fellowship}`}>
            <div className="ledger-item">
              <h3 className="ledger-title">Sequoia Fellow</h3>
              <div className="ledger-body">
                <p className="ledger-prose">
                  I am a fellow of the program that{" "}
                  <a className={styles.inlineLink} href="https://www.hongshan.com/" target="_blank" rel="noopener noreferrer">HongShan</a>, the venture firm formerly known as Sequoia China, runs with its portfolio companies. It selects people early in their careers by application and brings them into the firm&apos;s circle of founders, mentors, and peers in technology and entrepreneurship. Fellows stay on as an alumni community, with access to the firm&apos;s closed-door events and industry exchanges.
                </p>
              </div>
            </div>
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
