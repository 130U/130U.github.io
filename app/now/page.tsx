import type { Metadata } from "next";
import { SiteShell } from "../components/SiteShell";

export const metadata: Metadata = {
  title: "Current Chapter",
  description:
    "A personal note on Theodore Ouyang's July 2026 relocation and exploration of World Models and World-Action Models.",
};

export default function NowPage() {
  return (
    <SiteShell active="now">
      <header className="page-intro current-chapter-intro">
        <p className="chapter-context">
          <time dateTime="2026-07">July 2026</time>
        </p>
        <h1 className="chapter-title" id="now-heading">
          <span>A New Chapter:</span>
          <span className="chapter-title-route">
            From Nashua, New Hampshire to Wudaokou, Beijing
          </span>
        </h1>
        <p className="chapter-subtitle">
          From efficiency to additionality—and from predicting the world to
          acting within it.
        </p>
      </header>

      <article className="current-chapter" aria-labelledby="now-heading">
        <section className="chapter-section" aria-labelledby="chapter-question">
          <p className="chapter-number" aria-hidden="true">01</p>
          <div className="chapter-section-copy">
            <h2 id="chapter-question">The Question</h2>
            <p>
              Large language models are a genuine game changer. They have made
              knowledge work faster and more accessible, while making guidance,
              information, writing, and creative support available far beyond
              technical users. Their value is real.
            </p>
            <p>
              Yet utility, efficiency, and additionality are not the same thing.
              When the same report is written faster, the same question is
              answered more quickly, or the same decision is made with less
              effort, productivity may improve without creating a new service,
              expanding access, or producing a new real-world outcome.
            </p>
            <p>
              The question that matters to me is not whether large language
              models are valuable. It is whether their economic delta will
              ultimately match the scale of their technological leap.
            </p>
          </div>
        </section>

        <section className="chapter-section" aria-labelledby="chapter-thesis">
          <p className="chapter-number" aria-hidden="true">02</p>
          <div className="chapter-section-copy">
            <h2 id="chapter-thesis">The Thesis</h2>
            <p>
              My working thesis is that the next consequential frontier lies in
              narrowing the distance between intelligence that advises and
              intelligence that acts.
            </p>
            <p>
              The path I have chosen to explore is World Models → World-Action
              Models: systems that learn how the world changes, reason about the
              consequences of intervention, and translate prediction into
              purposeful action.
            </p>
            <p>
              The promise is not simply to do existing work faster. It is to
              make previously inaccessible or uneconomic actions possible:
              mobility for people who cannot independently travel; assistive
              machines that extend human capability through non-invasive,
              multimodal interfaces; and flexible industrial systems that could
              allow one person to supervise a larger production cell while
              making high-mix, variable production more economical.
            </p>
            <p>
              These outcomes are not guaranteed, and the field remains early.
              But they point toward a more demanding measure of progress: not
              only how much work intelligence can compress, but how much new
              possibility it can create.
            </p>
          </div>
        </section>

        <section className="chapter-section" aria-labelledby="chapter-decision">
          <p className="chapter-number" aria-hidden="true">03</p>
          <div className="chapter-section-copy">
            <h2 id="chapter-decision">The Decision</h2>
            <p>
              As a strategy analyst, I am accustomed to examining the futures
              of organizations and industries. The harder responsibility is to
              apply the same discipline to my own future.
            </p>
            <p>
              In July 2026, after weighing the opportunity, uncertainty, and
              cost, I chose to relocate from Nashua, New Hampshire, to Wudaokou,
              Beijing. I saw a rare, asymmetric opportunity to work closer to
              the frontier I wanted to understand—not as a distant observer,
              but through direct commitment.
            </p>
            <p>
              This move is both a self-directed choice and a deliberate
              challenge. I cannot know the outcome in advance, and I do not
              pretend that the thesis is guaranteed. But I believe it is
              important enough to test seriously, and I am confident in my
              ability to make the decision meaningful.
            </p>
          </div>
        </section>

        <p className="chapter-closing">
          Strategy is ultimately a choice under uncertainty. This is mine.
        </p>
      </article>
    </SiteShell>
  );
}
