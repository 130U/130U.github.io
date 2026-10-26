import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "../../components/SiteShell";
import { ExperienceMetadata, KeyContributions } from "../../components/experience/ExperienceDetails";
import { getShowcaseEntry, showcaseEntries } from "../../lib/content/experience-showcase";
import { createPageMetadata } from "../../lib/content/site";
import styles from "../../components/experience/Experience.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return showcaseEntries.filter((entry) => !entry.articlePath).map(({ slug }) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const entry = getShowcaseEntry((await params).slug);
  if (!entry || entry.articlePath) notFound();
  return createPageMetadata({ title: entry.pageTitle, description: entry.summary, path: entry.detailPath });
}

export default async function ExperienceDetailPage({ params }: PageProps) {
  const entry = getShowcaseEntry((await params).slug);
  if (!entry || entry.articlePath) notFound();
  const returnPath = `/experience/#${entry.slug}`;
  return (
    <SiteShell active="experience" frameClassName={styles.frame}>
      <article className={styles.detailPage} aria-labelledby="experience-title">
        <header className={`page-intro plain-page-intro ${styles.detailHeader}`}>
          <Link className="back-link" href={returnPath}><span aria-hidden="true">←</span> Experience</Link>
          <h1 id="experience-title" tabIndex={-1}>{entry.pageTitle}</h1>
          <ExperienceMetadata entry={entry} />
        </header>
        <KeyContributions entry={entry} />
        <footer className={styles.detailFooter}>
          <Link className="back-link" href={returnPath}><span aria-hidden="true">←</span> Experience</Link>
          <a href="#experience-title">Back to top</a>
        </footer>
      </article>
    </SiteShell>
  );
}
