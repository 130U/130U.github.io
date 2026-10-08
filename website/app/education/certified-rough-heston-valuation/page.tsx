import type { Metadata } from "next";
import { ResearchArticle } from "../../components/research/ResearchArticle";
import { roughHestonResearch } from "../../lib/content/selected-research";
import { createPageMetadata } from "../../lib/content/site";

const pageMetadata = createPageMetadata({
  title: roughHestonResearch.title,
  description: roughHestonResearch.description,
  path: roughHestonResearch.path,
});

export const metadata: Metadata = {
  ...pageMetadata,
  authors: [{ name: "Theodore Ouyang" }],
  openGraph: { ...pageMetadata.openGraph, type: "article", authors: ["Theodore Ouyang"] },
};

export default function RoughHestonResearchPage() {
  return <ResearchArticle project={roughHestonResearch} active="education" returnPath={`/education/#${roughHestonResearch.slug}`} returnLabel="Selected Research" titleId="research-article-title" />;
}
