import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "../components/SiteShell";
import { personalPosts } from "../lib/content/posts";
import { createPageMetadata } from "../lib/content/site";

export const metadata: Metadata = createPageMetadata({
  title: "Personal Posts",
  description: "Personal writing, projects, and selected work by Theodore Ouyang.",
  path: "/personal-posts/",
});

export default function PersonalPostsPage() {
  return (
    <SiteShell active="posts">
      <header className="page-intro plain-page-intro">
        <h1>Personal Posts</h1>
      </header>

      {personalPosts.map((post) => {
        return (
          <article className="post-listing" aria-labelledby={post.headingId} key={post.slug}>
            <span className="posts-number">{post.number}</span>
            <div>
              <p className="section-kicker">{post.kicker}</p>
              <h2 id={post.headingId}>
                <Link href={post.path}>{post.title}</Link>
              </h2>
              <p className="post-listing-summary">{post.description}</p>
              <p className="post-listing-meta">
                <time dateTime={post.publishedDate}>{post.publishedDateDisplay}</time>
                <span aria-hidden="true">·</span>
                <span>{post.readingTime}</span>
                <Link href={post.path}>
                  Read essay <span aria-hidden="true">→</span>
                </Link>
              </p>
            </div>
          </article>
        );
      })}
    </SiteShell>
  );
}
