import type { Metadata } from "next";
import { SelectedResearchArticle } from "../components/SelectedResearchArticle";
import { selectedResearch, SELECTED_RESEARCH_PATH } from "../../lib/content/selected-research";
import { createPageMetadata } from "../../lib/content/site";

const pageMetadata = createPageMetadata({
  title: selectedResearch.title,
  description: "Computable pricing-error bounds for arithmetic Asian options under projected Euler, with joint weak expansions and posterior quantile transfer.",
  path: SELECTED_RESEARCH_PATH,
});

export const metadata: Metadata = {
  ...pageMetadata,
  authors: [{ name: "Theodore Ouyang" }],
  openGraph: { ...pageMetadata.openGraph, type: "article", authors: ["Theodore Ouyang"] },
};

export default function SelectedResearchPage() {
  return <SelectedResearchArticle project={selectedResearch} />;
}
