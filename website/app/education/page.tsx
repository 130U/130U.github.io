import type { Metadata } from "next";
import { SiteShell } from "../components/SiteShell";
import { createPageMetadata } from "../lib/content/site";

const courseworkGroups = [
  {
    title: "Mathematics",
    courses: [
      "Abstract Algebra",
      "Advanced Linear Algebra",
      "Algorithmic Game Theory",
      "Applied Computational Analysis",
      "Complex Analysis",
      "Differential Geometry",
      "Financial Derivatives",
      "Geometry",
      "Introduction to Stochastic Calculus",
      "Mathematical Cryptography",
      "Mathematical Finance",
      "Mathematical Modeling",
      "Mathematical Numerical Analysis",
      "Mathematics of Machine Learning",
      "Measure and Integration",
      "Number Theory",
      "Numerical Linear Algebra, Optimization and Monte Carlo Simulation",
      "Ordinary and Partial Differential Equations",
      "Real Analysis",
      "Statistical Inference",
      "Topological Data Analysis",
      "Topology",
    ],
  },
  {
    title: "AI & Data Science",
    courses: [
      "Advanced Stochastic Modeling and Machine Learning",
      "Artificial Intelligence",
      "Bayesian Inference and Decision",
      "Bayesian Statistical Modeling and Data Analysis",
      "Deep Learning Fundamentals",
      "Machine Learning and Data Mining",
      "Multilevel and Hierarchical Models",
      "Statistical Optimization",
    ],
  },
  {
    title: "Finance & Economics",
    courses: [
      "Asset Pricing & Risk Management",
      "Corporate Finance",
      "Data Science and Decision Optimization in Banking & Financial Services",
      "Econometrics",
      "Empirical Methods in High Frequency Financial Econometrics",
      "Environment, Social, Governance (ESG) Investing",
      "Financial Accounting",
      "Independent Study in Economics",
      "Investment Strategies",
      "Macroeconomics",
      "Mathematical Analysis of Macroeconomics",
      "Microeconomics",
      "Structuring Venture Capital and Private Equity Transactions",
      "Technology-Driven Quantitative Finance",
      "Venture Capital",
    ],
  },
  {
    title: "Law, Ethics & Global Affairs",
    courses: [
      "Ethics and Leadership",
      "Global China and Global Challenges",
      "Ocean and Coastal Law",
      "Space Law",
    ],
  },
] as const;

export const metadata: Metadata = createPageMetadata({
  title: "Education",
  description: "Theodore Ouyang’s education at Duke University.",
  path: "/education/",
});

export default function EducationPage() {
  return (
    <SiteShell active="education">
      <header className="page-intro plain-page-intro">
        <h1>Education</h1>
      </header>

      <section className="education-list" aria-label="Degrees">
        <article className="education-entry">
          <header className="education-institution">
            <h2>Duke University</h2>
          </header>
          <h3 className="education-degree">
            Master of Engineering in Risk Engineering
          </h3>
          <p className="entry-subtitle">Financial Risk Concentration</p>
          <div
            className="education-notes"
            role="group"
            aria-label="Academic distinctions"
          >
            <p className="education-note education-advisor">
              Academic Advisor:{" "}
              <a
                href="https://cee.duke.edu/people/mark-borsuk/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mark Borsuk, Ph.D.
              </a>
            </p>
            <p className="education-note">
              Pratt School of Engineering Merit Scholarship — one of the
              school’s highest-tier merit awards, covering 50% of tuition.
            </p>
          </div>
        </article>

        <article className="education-entry">
          <header className="education-institution">
            <h2>Duke University</h2>
          </header>
          <h3 className="education-degree">
            Bachelor of Science in Mathematics
          </h3>
          <p className="entry-subtitle">Dual-Degree Undergraduate Program</p>
          <p className="education-note">
            Undergraduate Merit Scholarship — a merit-based award covering
            25% of tuition.
          </p>
        </article>
      </section>

      <section className="coursework" aria-labelledby="coursework-heading">
        <div className="section-heading single-section-heading">
          <h2 id="coursework-heading">Selected Coursework</h2>
        </div>
        <div className="course-grid">
          {courseworkGroups.map((group) => (
            <article key={group.title}>
              <h3>{group.title}</h3>
              <ul className="course-list">
                {group.courses.map((course) => (
                  <li key={course}>{course}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
