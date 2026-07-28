import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "./components/SiteShell";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Theodore Ouyang — AI Entrepreneur, Sequoia Scholar, and Duke University alumnus.",
};

export default function Home() {
  return (
    <SiteShell active="home">
      <header className="page-intro home-intro">
        <p className="eyebrow">AI · DECISION SYSTEMS · FINANCE</p>
        <h1>Building decision-grade systems for the frontier AI era.</h1>
        <p className="lede">
          Theodore Ouyang is an AI entrepreneur and Sequoia Scholar working at
          the intersection of frontier AI, finance, and disciplined decision
          making.
        </p>
      </header>

      <section className="current-grid" aria-labelledby="current-heading">
        <div className="section-heading">
          <p className="section-kicker">NOW</p>
          <h2 id="current-heading">Current focus</h2>
        </div>
        <article className="identity-card">
          <span className="identity-index">01</span>
          <div>
            <h3>AI Entrepreneur</h3>
            <p>
              Building within a fast-growing AI unicorn, with a focus on how
              frontier models become reliable products and operating systems.
            </p>
          </div>
        </article>
        <article className="identity-card">
          <span className="identity-index">02</span>
          <div>
            <h3>Sequoia Scholar</h3>
            <p>
              Cohort 8 — part of a community of founders and builders shaping
              the next generation of technology companies.
            </p>
          </div>
        </article>
      </section>

      <section className="prose-section" aria-labelledby="about-heading">
        <div className="section-heading">
          <p className="section-kicker">ABOUT</p>
          <h2 id="about-heading">Personal summary</h2>
        </div>
        <p>
          Trained in mathematics and risk engineering at Duke University,
          Theodore works across artificial intelligence, finance, and decision
          systems. His work emphasizes disciplined judgment under constraint:
          turning complex models, incomplete evidence, and changing market
          conditions into decisions that can withstand scrutiny.
        </p>
        <p>
          He is particularly interested in standards, validation protocols,
          and operating frameworks that make AI deployable in regulated and
          high-stakes environments — rigorous enough for real capital and real
          users, yet adaptive enough to capture technological advantage.
        </p>
      </section>

      <section className="threads-section" aria-labelledby="threads-heading">
        <div className="section-heading">
          <p className="section-kicker">THREADS</p>
          <h2 id="threads-heading">What I keep returning to</h2>
        </div>
        <div className="thread-list">
          <div><span>01</span><p>Frontier model evaluation and capability boundaries</p></div>
          <div><span>02</span><p>AI-native products and operating workflows</p></div>
          <div><span>03</span><p>Decision systems for finance and regulated capital</p></div>
          <div><span>04</span><p>Mathematical rigor, risk, and evidence under uncertainty</p></div>
        </div>
      </section>

      <aside className="history-note">
        <p>
          Looking for earlier roles and projects? They are collected separately
          as historical experience through June 30, 2026.
        </p>
        <Link className="text-link" href="/past-experience/">
          View past experience <span aria-hidden="true">→</span>
        </Link>
      </aside>
    </SiteShell>
  );
}
