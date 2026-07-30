import type { Metadata } from "next";
import { SiteShell } from "../components/SiteShell";

export const metadata: Metadata = {
  title: "Now",
  description: "A new chapter beginning in July 2026.",
};

export default function NowPage() {
  return (
    <SiteShell active="now">
      <header className="page-intro plain-page-intro now-intro">
        <p className="eyebrow">
          <time dateTime="2026-07">July 2026</time>
        </p>
        <h1 id="now-heading">A New Chapter</h1>
      </header>

      <section className="now-story" aria-labelledby="now-heading">
        <dl className="journey-route" aria-label="Relocation">
          <div>
            <dt>From</dt>
            <dd>Nashua, New Hampshire</dd>
          </div>
          <div>
            <dt>To</dt>
            <dd>Wudaokou, Beijing</dd>
          </div>
        </dl>

        <div className="now-copy">
          <p>
            In July 2026, after independently weighing multiple considerations,
            I chose to relocate from Nashua, New Hampshire, to Wudaokou,
            Beijing, and begin another chapter of my life.
          </p>
          <p>
            I also chose to explore a new field—World Models and World-Action
            Models—as a self-directed choice and challenge.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
