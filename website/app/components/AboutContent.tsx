import Link from "next/link";
import { selectedResearchProjects } from "../lib/content/selected-research";
import { ReadingArrow } from "./ReadingArrow";
import styles from "../home.module.css";

const researchSummaries: Record<string, string> = {
  "critical-dependence-stress-for-diversification-gains-under-fixed-marginals":
    "How far can the dependence between positions move before a diversification trade stops reducing Expected Shortfall, when every individual loss distribution stays fixed? I prove that the critical stress budget is quadratic in the trade size and identify its leading coefficient through a variational limit. The sensitivity at zero stress can understate that budget. I introduce the marginal-restoration premium to measure the gap, characterize exactly when it is positive, and prove that it is at least 30% in a uniform benchmark. At equal effective costs, continuous flow–cut duality gives the premium's response to background displacement costs.",
  "certified-valuation-of-arithmetic-asian-options":
    "What does an arithmetic Asian option lose when exercise is decided on the geometric average of its fixings? I prove that the loss is at most the dispersion of the fixings divided by the level risk that precedes them, and that in Black's model the bound grows with the cube of volatility and the square of the averaging window. For a one-month crude oil average price option the bound is below a hundredth of a cent per barrel, against 2.6 cents for the classical first-order bound. Under Heston, validated transforms turn the bound into a proved price interval for a twelve-fixing call spread and a proved bound on its Euler discretization error, with executable certificates.",
  "certified-joint-pricing-errors-in-rough-heston":
    "How far can stored option prices sit from the exact model prices, measured across a whole portfolio? Every strike at one expiry is priced from the same characteristic function, so its numerical error is a common factor. I prove that a portfolio's exposure to that error at each frequency is the Fourier transform of its payoff: spreads and butterflies hedge it, and baskets over many strikes diversify it. In rough Heston, a residual in the fractional Riccati equation moves the log-characteristic function by at most the residual integrated against a forward variance curve, with constant one. On S&P 500 options, netting the legs certifies a half-point tolerance for all 28 six-month spreads, butterflies, and baskets tested, against 13 without.",
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
            <span>Working in Artificial Intelligence</span>
          </Heading>
          <div className={styles.biographyCopy}>
            <p>
              Mathematics is how I understand a problem. I want to know which
              assumptions underlie a conclusion, what happens when they change,
              and where intuition stops being reliable. I hold my research in
              quantitative finance to that standard: its central results are
              proved theorems and certified bounds.
            </p>
            <p>
              That is what sets me apart as an AI engineer: I look past what a
              model does to the mathematics of why it does it. I am a research
              engineer at a foundation model company, where I build personal
              agents, and I have worked with a frontier AI lab and a leading
              global alternative asset manager.
            </p>
            <p>
              Beyond work, what I value is simple: joy, and experiencing the
              world with my whole heart. I find it most in music and in nature,
              and the <Link className={styles.inlineLink} href="/blog/">Blog</Link>{" "}
              keeps what I make of them, from Chopin&apos;s études charted as
              stars to an essay on Weber&apos;s <em>Der Freischütz</em>.
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
            <div className={`ledger-item ${styles.educationItem}`}>
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
                  Founding partner Neil Shen launched this fellowship at{" "}
                  <a className={styles.inlineLink} href="https://www.hongshan.com/" target="_blank" rel="noopener noreferrer">HongShan</a>, the venture firm formerly known as Sequoia China, whose portfolio includes ByteDance, Meituan, and Pinduoduo. It is highly selective: the first cohort admitted 15 of 2,116 applicants. It centers on the technology industry, and its fellows form a lifelong community with closed-door access to the firm&apos;s investors and portfolio executives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="contact" aria-labelledby="contact-heading">
        <p className={styles.sectionIndex} aria-hidden="true">05</p>
        <div className={styles.sectionBody}>
          <h2 className={styles.sectionTitle} id="contact-heading">Contact</h2>
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
