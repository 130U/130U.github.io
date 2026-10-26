import type { Metadata } from "next";
import { ResearchArticle } from "../../components/research/ResearchArticle";
import { dependenceResearch } from "../../lib/content/selected-research";
import { createPageMetadata } from "../../lib/content/site";

const pageMetadata = createPageMetadata({
  title: dependenceResearch.title,
  description: dependenceResearch.description,
  path: dependenceResearch.path,
});

export const metadata: Metadata = {
  ...pageMetadata,
  authors: [{ name: "Theodore Ouyang" }],
  openGraph: { ...pageMetadata.openGraph, type: "article", authors: ["Theodore Ouyang"] },
};

export default function DependenceResearchPage() {
  return <ResearchArticle project={dependenceResearch} active="about" returnPath={`/#${dependenceResearch.slug}`} returnLabel="Selected Research" titleId="research-article-title" />;
}
