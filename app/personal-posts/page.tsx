import type { Metadata } from "next";
import Link from "next/link";
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

      <article className="post-listing" aria-labelledby="posts-heading">
        <span className="posts-number">001</span>
        <div>
          <p className="section-kicker">RESEARCH NOTE</p>
          <h2 id="posts-heading">
            <Link href="/personal-posts/from-vision-and-instructions-to-robot-actions/">
              From Vision and Instructions to Robot Actions: Two Emerging Paths
            </Link>
          </h2>
          <p className="post-listing-summary">
            A practical taxonomy for VLM-to-VLA and video/world-model-to-action
            systems, organized by training targets, internal representations,
            and inference-time computation.
          </p>
          <p className="post-listing-meta">
            <time dateTime="2026-07-29">July 29, 2026</time>
            <span aria-hidden="true">·</span>
            <span>12 min read</span>
            <Link href="/personal-posts/from-vision-and-instructions-to-robot-actions/">
              Read essay <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </article>
    </SiteShell>
  );
}
