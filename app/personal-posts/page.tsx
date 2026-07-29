import type { Metadata } from "next";
import { SiteShell } from "../components/SiteShell";

export const metadata: Metadata = {
  title: "Personal Posts",
  description: "Personal writing, projects, and selected work by Theodore Ouyang.",
};

export default function PersonalPostsPage() {
  return (
    <SiteShell active="posts">
      <header className="page-intro plain-page-intro">
        <h1>Personal Posts</h1>
      </header>

      <section className="posts-empty" aria-labelledby="posts-heading">
        <span className="posts-number">001</span>
        <div>
          <p className="section-kicker">COMING SOON</p>
          <h2 id="posts-heading">The first post is being prepared.</h2>
          <p>
            Future entries may include essays, research notes, product
            reflections, and selected personal projects. Nothing placeholder or
            invented has been published here yet.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
