import type { Metadata } from "next";
import { SiteShell } from "../components/SiteShell";

export const metadata: Metadata = {
  title: "Personal Posts",
  description: "Personal writing, projects, and selected work by Theodore Ouyang.",
};

export default function PersonalPostsPage() {
  return (
    <SiteShell active="posts">
      <header className="page-intro">
        <p className="eyebrow">PERSONAL POSTS</p>
        <h1>Ideas, projects, and work in progress.</h1>
        <p className="lede">
          This will be the home for personal writing, selected work, and the
          projects that are worth sharing in public.
        </p>
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

      <aside className="contact-note">
        <p>For now, the best way to follow Theodore’s work is through GitHub.</p>
        <a className="text-link" href="https://github.com/130U">
          Visit GitHub <span aria-hidden="true">→</span>
        </a>
      </aside>
    </SiteShell>
  );
}
