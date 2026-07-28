import type { Metadata } from "next";
import { SiteShell } from "../components/SiteShell";

export const metadata: Metadata = {
  title: "Past Experience",
  description: "Selected historical roles and projects through June 30, 2026.",
};

const entries = [
  {
    period: "2025 — 2026",
    organization: "Alignerr",
    role: "Domain Expert",
    tags: ["Frontier AI", "Evaluation", "RLHF"],
    summary:
      "Designed graduate-level scientific reasoning benchmarks and end-to-end preference-data workflows, translating hard-to-measure model behavior into reusable scenarios, rubrics, and ranking signals.",
  },
  {
    period: "2025 — 2026",
    organization: "Micro1",
    role: "Domain Expert",
    tags: ["LLM Products", "Experimentation", "Advertising"],
    summary:
      "Led domain reasoning for contextual advertising in LLM chat experiences, using structured research, expert debate, and A/B validation to turn ambiguous product trade-offs into operating guidance.",
  },
  {
    period: "2024 — 2025",
    organization: "Jiritsu Network",
    role: "Business Development Analyst & Business Analyst",
    tags: ["Data Science", "Digital Assets", "Screening"],
    summary:
      "Built an issuer-screening pipeline that reduced an 18,000-token universe to a diligence-ready shortlist using ETL, ranking models, clustering, governance filters, and disclosure review.",
  },
  {
    period: "2024 — 2025",
    organization: "Duke University",
    role: "Research Assistant",
    tags: ["AI Workflows", "Equity Research", "Sustainability"],
    summary:
      "Created a labeled sustainability-event dataset connecting filings and news flow with subsequent stock returns for research backtests and future AI workflows.",
  },
  {
    period: "2024",
    organization: "Jones Lang LaSalle (JLL)",
    role: "Capital Markets Intern",
    tags: ["Real Estate", "Valuation", "ESG"],
    summary:
      "Supported Greater China office underwriting across market screening, DCF and comparable valuation, ESG risk gates, dashboarding, and due-diligence preparation.",
  },
  {
    period: "2024",
    organization: "Duke Law School & Nicholas School of the Environment",
    role: "Research Assistant",
    tags: ["Governance", "Policy", "LCA"],
    summary:
      "Worked across coastal regulation, nature-based solutions, shareholder stewardship, governance risk, and life-cycle assessment with decision-oriented memos and measurable recommendations.",
  },
  {
    period: "2023 — 2024",
    organization: "Hubble Network",
    role: "ESG & Business Analytics Analyst",
    tags: ["Strategy", "Market Research", "Analytics"],
    summary:
      "Delivered market landscape research, segmentation models, ESG positioning, and board-level recommendations for an IoT business entering new markets.",
  },
  {
    period: "2022",
    organization: "SAIF Partners",
    role: "Investment Analyst Intern",
    tags: ["Private Equity", "Thematic Research", "Diligence"],
    summary:
      "Built a Greater China dental investment database and governance-focused screening framework that shaped target selection, management questions, and diligence depth.",
  },
  {
    period: "2021 — 2022",
    organization: "Euromonitor International",
    role: "In-Country Analyst",
    tags: ["Market Entry", "ETL", "Consumer Data"],
    summary:
      "Led the China workstream for a green-appliance market-entry study and standardized 50,000 e-commerce SKUs across five platforms through an automated Python pipeline.",
  },
  {
    period: "2021",
    organization: "CITIC Securities & China Construction Bank Asia",
    role: "Research and Fintech Internships",
    tags: ["Equity Research", "Issuer Scoring", "PCA"],
    summary:
      "Supported sector research, valuation stress testing, and a PCA-based sustainability scoring system spanning 2,000 issuers.",
  },
  {
    period: "2016 — 2026",
    organization: "STEM Olympiad Training",
    role: "Competitor, Instructor & Original Problem Designer",
    tags: ["Physics", "Mathematics", "Teaching"],
    summary:
      "Built an IPhO-level physics and mathematics foundation, earned first prizes in the 2018 Chinese Physics and Mathematical Olympiads, taught advanced students, and designed more than 100 original problems.",
  },
];

export default function PastExperiencePage() {
  return (
    <SiteShell active="experience">
      <header className="page-intro">
        <p className="eyebrow">PAST EXPERIENCE</p>
        <h1>Selected roles and projects before July 1, 2026.</h1>
        <p className="lede">
          This archive describes earlier work rather than Theodore’s current
          position. It is organized chronologically, with domains used only as
          context — not as separate identities.
        </p>
      </header>

      <div className="archive-note" role="note">
        <span>ARCHIVE BOUNDARY</span>
        <p>Experience information on this page is current through June 30, 2026.</p>
      </div>

      <section className="experience-list" aria-label="Past experience">
        {entries.map((entry) => (
          <article className="experience-entry" key={`${entry.period}-${entry.organization}`}>
            <div className="experience-period">{entry.period}</div>
            <div className="experience-body">
              <p className="entry-place">{entry.organization}</p>
              <h2>{entry.role}</h2>
              <p>{entry.summary}</p>
              <ul className="tag-list" aria-label="Areas">
                {entry.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            </div>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
