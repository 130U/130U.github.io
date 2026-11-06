import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "../../components/SiteShell";
import { ExperienceMetadata, KeyContributions } from "../../components/experience/ExperienceDetails";
import { LegalPaperPage } from "../../components/legal/LegalPaperPage";
import { ResearchArticle } from "../../components/research/ResearchArticle";
import { getAiResearchProject } from "../../lib/content/ai-projects";
import { getShowcaseEntry, showcaseEntries, type ShowcaseEntry } from "../../lib/content/experience-showcase";
import { getLegalPaper } from "../../lib/content/legal-papers";
import { createMetadataExcerpt } from "../../lib/content/metadata-excerpt";
import { createPageMetadata } from "../../lib/content/site";
import styles from "../../components/experience/Experience.module.css";

// Every Experience entry lives at /experience/<slug>/: AI projects and legal papers
// open as full articles, the other entries as detail pages.
export const dynamicParams = false;

export function generateStaticParams() {
  return showcaseEntries.map(({ slug }) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

function entryFor(slug: string): ShowcaseEntry {
  const entry = getShowcaseEntry(slug);
  if (!entry) notFound();
  return entry;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const entry = entryFor((await params).slug);
  if (entry.article === "ai") {
    return createPageMetadata({ title: entry.pageTitle, description: createMetadataExcerpt(entry.summary.replace(/[*`]/gu, "")), path: entry.detailPath });
  }
  if (entry.article === "legal") {
    const paper = getLegalPaper(entry.slug);
    if (!paper) notFound();
    const metadata = createPageMetadata({ title: entry.pageTitle, description: createMetadataExcerpt(entry.summary), path: entry.detailPath });
    return { ...metadata, authors: [{ name: paper.author }], openGraph: { ...metadata.openGraph, type: "article", authors: [paper.author] } };
  }
  return createPageMetadata({ title: entry.pageTitle, description: entry.summary, path: entry.detailPath });
}

export default async function ExperienceEntryPage({ params }: PageProps) {
  const entry = entryFor((await params).slug);
  const returnPath = `/experience/#${entry.slug}`;
  if (entry.article === "ai") {
    const project = getAiResearchProject(entry.slug);
    if (!project) notFound();
    return <ResearchArticle project={project} active="experience" returnPath={returnPath} returnLabel="Experience" titleId="ai-project-title" showcase={entry} />;
  }
  if (entry.article === "legal") {
    const paper = getLegalPaper(entry.slug);
    if (!paper) notFound();
    return <LegalPaperPage paper={paper} showcase={entry} />;
  }
  return (
    <SiteShell active="experience" parent={{ href: returnPath, label: "Experience" }} frameClassName={styles.frame} guides="index">
      <article className={styles.detailPage} aria-labelledby="experience-title">
        <header className={`page-intro ${styles.detailHeader}`}>
          <h1 id="experience-title" tabIndex={-1}>{entry.headline}</h1>
          <ExperienceMetadata entry={entry} />
        </header>
        <KeyContributions entry={entry} />
        <footer className={styles.detailFooter}>
          <Link className="back-link" href={returnPath}><span aria-hidden="true">←</span> Experience</Link>
          <a href="#experience-title">Back to Top</a>
        </footer>
      </article>
    </SiteShell>
  );
}
