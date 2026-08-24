import type { Metadata } from "next";
import { SiteShell } from "../components/SiteShell";
import { createPageMetadata } from "../lib/content/site";

export const metadata: Metadata = createPageMetadata({
  title: "Current Chapter",
  description:
    "Theodore Ouyang explores practical, real-world uses of artificial intelligence in everyday life.",
  path: "/now/",
});

export default function NowPage() {
  return (
    <SiteShell active="now">
      <header className="page-intro current-chapter-intro">
        <p className="chapter-context">Current Chapter</p>
        <h1 id="now-heading">Exploring AI in everyday life.</h1>
      </header>

      <article className="current-chapter-brief" aria-labelledby="now-heading">
        <p>
          Theodore Ouyang is exploring how artificial intelligence can become
          genuinely useful in everyday life. He is especially interested in
          practical applications that solve real problems, expand human
          capability, and create lasting value beyond novelty.
        </p>
      </article>
    </SiteShell>
  );
}
