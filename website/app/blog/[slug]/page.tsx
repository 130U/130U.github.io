import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogImage } from "../../components/blog/BlogImage";
import { ReadingArrow } from "../../components/ReadingArrow";
import { InlineContent } from "../../components/research/ResearchInline";
import { SiteShell } from "../../components/SiteShell";
import { blogPosts, formatBlogDate, getBlogPost, type BlogBlock, type BlogPost } from "../../lib/content/blog";
import { SITE_NAME, createPageMetadata } from "../../lib/content/site";
import styles from "../blog.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map(({ slug }) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

function postFor(slug: string): BlogPost {
  const post = getBlogPost(slug);
  if (!post) notFound();
  return post;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = postFor((await params).slug);
  const metadata = createPageMetadata({
    title: post.title,
    description: post.summary,
    path: post.path,
    image: { url: post.image.src, width: 1200, height: 630, alt: post.image.alt },
  });
  return {
    ...metadata,
    authors: [{ name: SITE_NAME }],
    openGraph: { ...metadata.openGraph, type: "article", publishedTime: post.date, authors: [SITE_NAME] },
  };
}

function Block({ block }: { block: BlogBlock }) {
  if (block.type === "heading") return <h2 id={block.id} tabIndex={-1}>{block.text}</h2>;
  if (block.type === "epigraph") {
    return (
      <figure className={styles.epigraph}>
        <blockquote><p><InlineContent inlines={block.quote} /></p></blockquote>
        <figcaption><InlineContent inlines={block.source} /></figcaption>
      </figure>
    );
  }
  if (block.type === "figure") {
    return (
      <figure className={styles.figure}>
        <div className={styles.media}><BlogImage src={block.src} alt={block.alt} /></div>
        <figcaption><InlineContent inlines={block.caption} /></figcaption>
      </figure>
    );
  }
  return <p><InlineContent inlines={block.inlines} /></p>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = postFor((await params).slug);
  const returnPath = `/blog/#${post.slug}`;
  return (
    <SiteShell active="blog" parent={{ href: returnPath, label: "Blog" }} frameClassName={styles.frame} guides="article">
      <article className={styles.post} aria-labelledby="post-title">
        <header className={styles.header}>
          <h1 id="post-title" tabIndex={-1}>{post.title}</h1>
          <p className={styles.byline}>
            <span>By {SITE_NAME}</span>
            <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
          </p>
        </header>
        <BlogImage className={styles.hero} src={post.hero.src} alt={post.hero.alt} priority />
        {/* The work is a separate site on this domain, so it opens as a full page load. */}
        <a className={styles.work} href={post.work.href} data-blog-work>
          <span className={styles.workText}>
            <span className={styles.workTitle}>{post.title}</span>
            <span className={styles.workDescription}>{post.work.description}</span>
          </span>
          <span className={styles.workAction}>View Now<ReadingArrow /></span>
        </a>
        <div className={styles.body}>
          {post.blocks.map((block, index) => <Block block={block} key={index} />)}
        </div>
        <footer className={styles.footer}>
          <Link className="back-link" href={returnPath}><span aria-hidden="true">←</span> Blog</Link>
          <a href="#post-title">Back to Top</a>
        </footer>
      </article>
    </SiteShell>
  );
}
