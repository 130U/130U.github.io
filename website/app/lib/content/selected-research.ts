import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseResearchMarkdown, type ResearchArticleContent } from "./research-markdown";

type SelectedResearchSource = Omit<ResearchArticleContent, "blocks"> & {
  description: string;
  repositoryUrl: string;
  sourceCommit: string;
  sourceBlob: string;
};

// Each article is the import of its manuscript at one upstream commit, with the page description.
function readResearch(slug: string, repository = slug) {
  const source = JSON.parse(readFileSync(join(process.cwd(), "content", "selected-research", `${slug}.json`), "utf8")) as SelectedResearchSource;
  if (source.slug !== slug || !source.title || !source.markdown || !source.description || !/^[a-f0-9]{40}$/u.test(source.sourceCommit) || !/^[a-f0-9]{40}$/u.test(source.sourceBlob) || source.repositoryUrl !== `https://github.com/130U/${repository}` || !source.sourceUrl.startsWith(`${source.repositoryUrl}/blob/${source.sourceCommit}/`)) {
    throw new Error(`Incomplete selected research source: ${slug}.`);
  }
  return { ...source, path: `/${slug}/`, blocks: parseResearchMarkdown(source.markdown, { joinSoftLines: true }) };
}

const selectedResearch = readResearch("certified-valuation-of-arithmetic-asian-options", "RESEARCH-Certified-Valuation-of-Arithmetic-Asian-Options");
const roughHestonResearch = {
  ...readResearch("certified-joint-pricing-errors-in-rough-heston", "RESEARCH-Certified-Joint-Pricing-Errors-in-Rough-Heston"),
  sourceUrl: "https://github.com/130U/RESEARCH-Certified-Joint-Pricing-Errors-in-Rough-Heston/blob/V_20261101/ARTICLE.md",
};
const dependenceResearch = readResearch("critical-dependence-stress-for-diversification-gains-under-fixed-marginals", "RESEARCH-Critical-Dependence-Stress-for-Diversification-Gains-under-Fixed-Marginals");
export const selectedResearchProjects = [dependenceResearch, selectedResearch, roughHestonResearch];
