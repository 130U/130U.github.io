import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalPaper, legalPapers, legalPaperPath } from "../../../lib/content/legal-papers";
import { createPageMetadata } from "../../../lib/content/site";
import { createMetadataExcerpt } from "../../../lib/content/metadata-excerpt";
import { LegalPaperPage } from "../../components/LegalPaperPage";
import { getAiResearchProject, aiResearchProjects, aiResearchProjectPath } from "../../../lib/content/ai-projects";
import { getShowcaseEntryForArticle } from "../../../lib/content/experience-showcase";
import { ResearchArticle } from "../../../components/research/ResearchArticle";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...legalPapers.map(({ slug }) => ({ slug: "legal-research-and-policy-analysis", paper: slug })),
    ...aiResearchProjects.map(({ slug }) => ({ slug: "artificial-intelligence", paper: slug })),
  ];
}

type Params = { params: Promise<{ slug: string; paper: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, paper: paperSlug } = await params;
  const showcase = getShowcaseEntryForArticle(paperSlug);
  if (!showcase) notFound();
  if (slug === "artificial-intelligence") {
    const project = getAiResearchProject(paperSlug);
    if (!project) notFound();
    return createPageMetadata({ title: showcase.detailTitle, description: createMetadataExcerpt(showcase.summary), path: aiResearchProjectPath(project.slug) });
  }
  const paper = getLegalPaper(paperSlug);
  if (slug !== "legal-research-and-policy-analysis" || !paper) notFound();
  const metadata = createPageMetadata({
    title: showcase.detailTitle,
    description: createMetadataExcerpt(showcase.summary),
    path: legalPaperPath(paper.slug),
  });
  return { ...metadata, authors: [{ name: paper.author }], openGraph: { ...metadata.openGraph, type: "article", authors: [paper.author] } };
}

export default async function PaperPage({ params }: Params) {
  const { slug, paper: paperSlug } = await params;
  const showcase = getShowcaseEntryForArticle(paperSlug);
  if (!showcase) notFound();
  if (slug === "artificial-intelligence") {
    const project = getAiResearchProject(paperSlug);
    if (!project) notFound();
    return <ResearchArticle project={project} active="experience" returnPath={`/experience/#${showcase.slug}`} returnLabel="Experience" titleId="ai-project-title" showcase={showcase} />;
  }
  const paper = getLegalPaper(paperSlug);
  if (slug !== "legal-research-and-policy-analysis" || !paper) notFound();
  return <LegalPaperPage paper={paper} showcase={showcase} />;
}
