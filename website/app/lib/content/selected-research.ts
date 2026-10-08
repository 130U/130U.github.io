import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseResearchMarkdown, type ResearchArticleContent } from "./research-markdown";

export const SELECTED_RESEARCH_PATH = "/education/certified-valuation-arithmetic-asian-options/";
export const SELECTED_RESEARCH_TITLE = "Certified Valuation of Arithmetic Asian Options";

type SelectedResearchSource = Omit<ResearchArticleContent, "blocks"> & {
  description: string;
  repositoryUrl: string;
  sourceCommit: string;
  sourceBlob: string;
};

function readResearch(slug: string) {
  const source = JSON.parse(readFileSync(join(process.cwd(), "content", "selected-research", `${slug}.json`), "utf8")) as SelectedResearchSource;
  if (source.slug !== slug || !source.title || !source.markdown || !source.description || !/^[a-f0-9]{40}$/u.test(source.sourceCommit) || !/^[a-f0-9]{40}$/u.test(source.sourceBlob) || source.repositoryUrl !== `https://github.com/130U/${slug}` || !source.sourceUrl.startsWith(`${source.repositoryUrl}/blob/${source.sourceCommit}/`)) {
    throw new Error(`Incomplete selected research source: ${slug}.`);
  }
  return { ...source, path: `/education/${slug}/`, blocks: parseResearchMarkdown(source.markdown) };
}

export const selectedResearchProjects = [
  readResearch("certified-valuation-arithmetic-asian-options"),
  readResearch("certified-rough-heston-valuation"),
];

export const selectedResearch = selectedResearchProjects[0];
export const roughHestonResearch = selectedResearchProjects[1];
