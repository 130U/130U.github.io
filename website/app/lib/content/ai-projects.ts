import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parseResearchMarkdown, type ResearchArticleContent } from "./research-markdown";

export const AI_DOMAIN_PATH = "/past-experience/artificial-intelligence/";
export const aiResearchProjectSlugs = [
  "statistical-inference-and-resource-allocation-in-expert-data-production",
  "task-validity-in-financial-synthetic-data",
  "verification-and-supervision-in-scientific-reasoning-tasks",
  "evidence-uncertainty-and-decision-guarantees-in-investment-research",
] as const;

export const aiResearchProjects: readonly ResearchArticleContent[] = aiResearchProjectSlugs.map((slug) => {
  const source = JSON.parse(readFileSync(join(process.cwd(), "content", "artificial-intelligence", `${slug}.json`), "utf8")) as Omit<ResearchArticleContent, "blocks">;
  if (source.slug !== slug || !source.title || !source.markdown || !source.sourceUrl || !source.sourceEditedAt) {
    throw new Error(`Incomplete AI research project: ${slug}`);
  }
  return { ...source, blocks: parseResearchMarkdown(source.markdown) };
});

export function aiResearchProjectPath(slug: string) {
  return `${AI_DOMAIN_PATH}${slug}/`;
}

export function getAiResearchProject(slug: string) {
  return aiResearchProjects.find((project) => project.slug === slug);
}
