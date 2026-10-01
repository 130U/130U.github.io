import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalPaper, legalPapers, legalPaperPath } from "../../../lib/content/legal-papers";
import { createPageMetadata } from "../../../lib/content/site";
import { LegalPaperPage } from "../../components/LegalPaperPage";

export const dynamicParams = false;

export function generateStaticParams() {
  return legalPapers.map(({ slug }) => ({ slug: "legal-research-and-policy-analysis", paper: slug }));
}

type Params = { params: Promise<{ slug: string; paper: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, paper: paperSlug } = await params;
  const paper = getLegalPaper(paperSlug);
  if (slug !== "legal-research-and-policy-analysis" || !paper) notFound();
  const metadata = createPageMetadata({
    title: paper.subtitle ? `${paper.title}: ${paper.subtitle}` : paper.title,
    description: paper.abstract.map(({ text }) => text).join(" ").slice(0, 260),
    path: legalPaperPath(paper.slug),
  });
  return { ...metadata, authors: [{ name: paper.author }], openGraph: { ...metadata.openGraph, type: "article", authors: [paper.author] } };
}

export default async function PaperPage({ params }: Params) {
  const { slug, paper: paperSlug } = await params;
  const paper = getLegalPaper(paperSlug);
  if (slug !== "legal-research-and-policy-analysis" || !paper) notFound();
  return <LegalPaperPage paper={paper} />;
}
