import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResearchArticle } from "../components/research/ResearchArticle";
import { selectedResearchProjects } from "../lib/content/selected-research";
import { createPageMetadata } from "../lib/content/site";

// About's Selected Research manuscripts live directly under About, at /<slug>/.
export const dynamicParams = false;

export function generateStaticParams() {
  return selectedResearchProjects.map(({ slug }) => ({ paper: slug }));
}

type PageProps = { params: Promise<{ paper: string }> };

async function projectFor(params: PageProps["params"]) {
  const { paper } = await params;
  const project = selectedResearchProjects.find(({ slug }) => slug === paper);
  if (!project) notFound();
  return project;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await projectFor(params);
  const metadata = createPageMetadata({ title: project.title, description: project.description, path: project.path });
  return { ...metadata, authors: [{ name: "Theodore Ouyang" }], openGraph: { ...metadata.openGraph, type: "article", authors: ["Theodore Ouyang"] } };
}

export default async function SelectedResearchPage({ params }: PageProps) {
  const project = await projectFor(params);
  return <ResearchArticle project={project} active="about" returnPath={`/#${project.slug}`} returnLabel="Selected Research" titleId="research-article-title" />;
}
