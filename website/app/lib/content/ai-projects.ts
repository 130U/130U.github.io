import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parseResearchMarkdown, type ResearchArticleContent } from "./research-markdown";

export const aiResearchProjectSlugs = [
  "large-scale-domain-expert-feedback-governance-and-adaptive-review",
  "financial-task-design-and-synthetic-data-engineering",
  "general-reasoning-evaluation-and-layered-verification",
  "evidence-verification-and-robust-comparison-in-investment-research",
] as const;

const aiResearchProjects: readonly ResearchArticleContent[] = aiResearchProjectSlugs.map((slug) => {
  const source = JSON.parse(readFileSync(join(process.cwd(), "content", "artificial-intelligence", `${slug}.json`), "utf8")) as Omit<ResearchArticleContent, "blocks">;
  if (source.slug !== slug || !source.title || !source.markdown || !source.sourceUrl || !source.sourceEditedAt) {
    throw new Error(`Incomplete AI research project: ${slug}`);
  }
  return { ...source, blocks: parseResearchMarkdown(source.markdown) };
});

export function getAiResearchProject(slug: string) {
  return aiResearchProjects.find((project) => project.slug === slug);
}
