import type { Metadata } from "next";
import Link from "next/link";
import { ReadingArrow } from "../components/ReadingArrow";
import { SiteShell } from "../components/SiteShell";
import { BLOG_DESCRIPTION, blogPosts, formatBlogDate } from "../lib/content/blog";
import { createPageMetadata } from "../lib/content/site";
import styles from "./blog.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Blog",
  description: BLOG_DESCRIPTION,
  path: "/blog/",
});

export default function BlogPage() {
  return (
    <SiteShell active="blog" frameClassName={styles.frame} guides="index">
      <header className={styles.intro}>
        <h1>Blog</h1>
      </header>
      <div className="ledger">
        {blogPosts.map((post) => (
          <article className="ledger-item" id={post.slug} key={post.slug} data-blog-entry={post.slug}>
            <div className={styles.entryHead}>
              <h2 className="ledger-title">{post.title}</h2>
              <time className={styles.date} dateTime={post.date}>{formatBlogDate(post.date)}</time>
            </div>
            <div className="ledger-body">
              <p className="ledger-prose">{post.summary}</p>
              <Link className="read-more" href={post.path} aria-label={`Read more about ${post.title}`}>
                Read More<ReadingArrow />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}
