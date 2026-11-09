import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseResearchMarkdown, type ResearchArticleContent } from "./research-markdown";

type SelectedResearchSource = Omit<ResearchArticleContent, "blocks"> & {
  description: string;
  introduction: string[];
  repositoryUrl: string;
  sourceCommit: string;
  sourceBlob: string;
};

// The frozen import in content/selected-research/ stays pinned to its upstream commit. The site
// edition revises the expository prose for this site; tests hold its mathematics to that import.
function readSiteEdition(slug: string) {
  const source = readFileSync(join(process.cwd(), "content", "selected-research", "site-edition", `${slug}.md`), "utf8").replace(/\r\n?/gu, "\n");
  const edition = source.match(/^---\ndescription: (.+)\n---\n\n([\s\S]+)$/u);
  if (!edition) throw new Error(`Incomplete site edition: ${slug}.`);
  return { description: edition[1], markdown: edition[2] };
}

function readResearch(slug: string, repository = slug) {
  const source = JSON.parse(readFileSync(join(process.cwd(), "content", "selected-research", `${slug}.json`), "utf8")) as SelectedResearchSource;
  if (source.slug !== slug || !source.title || !source.markdown || !source.description || !/^[a-f0-9]{40}$/u.test(source.sourceCommit) || !/^[a-f0-9]{40}$/u.test(source.sourceBlob) || source.repositoryUrl !== `https://github.com/130U/${repository}` || !source.sourceUrl.startsWith(`${source.repositoryUrl}/blob/${source.sourceCommit}/`)) {
    throw new Error(`Incomplete selected research source: ${slug}.`);
  }
  const edition = readSiteEdition(slug);
  return { ...source, ...edition, path: `/${slug}/`, blocks: parseResearchMarkdown(edition.markdown, { joinSoftLines: true }) };
}

const selectedResearch = readResearch("certified-valuation-arithmetic-asian-options");
const roughHestonResearch = {
  ...readResearch("certified-rough-heston-valuation"),
  sourceUrl: "https://github.com/130U/certified-rough-heston-valuation/blob/f97a4a183f671bdd89716974bb581dce4aeff499/ARTICLE.md",
};
const dependenceResearch = readResearch("critical-dependence-stress-for-portfolio-diversification", "mathematical-finance-project");
export const selectedResearchProjects = [dependenceResearch, selectedResearch, roughHestonResearch];
