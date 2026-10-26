import { readFileSync } from "node:fs";
import { join } from "node:path";
import { experienceDomainDefinitions } from "./experience";
import { aiResearchProjectSlugs, aiResearchProjectPath } from "./ai-projects";
import { legalPaperSlugs, legalPaperPath } from "./legal-papers";

type SourceEntry = {
  id: number;
  categoryId: string;
  organization: string;
  summary: string;
  readMoreLabel: string;
  detailTitle: string;
  metadata: { position: string; location: string; dates: string };
  contributionsLabel: string;
  keyContributions: string[];
  notes: string[];
};

export type ShowcaseEntry = SourceEntry & { slug: string; articlePath?: string };
export type ShowcaseDomain = { number: string; name: string; slug: string; entries: ShowcaseEntry[] };
const source = JSON.parse(readFileSync(join(process.cwd(), "content", "experience-showcase.json"), "utf8")) as { entries: SourceEntry[] };
const entrySlugs = [
  ...aiResearchProjectSlugs, "jiritsu-network", "euromonitor-international", "china-construction-bank",
  ...legalPaperSlugs, "jones-lang-lasalle", "hubble-technology-investment", "saif-partners",
  "citic-securities", "ey-parthenon", "independent-stem-olympiad-training", "stem-olympiad-competitions",
];

export const showcaseEntries: readonly ShowcaseEntry[] = source.entries.map((entry, index) => {
  if (entry.id !== index + 1 || !entry.summary || !entry.detailTitle || !entry.keyContributions.length ||
      !entry.metadata.position || !entry.metadata.location || !entry.metadata.dates) {
    throw new Error(`Incomplete approved Experience entry: ${entry.id}`);
  }
  const slug = entrySlugs[index];
  const articlePath = entry.categoryId === "01" ? aiResearchProjectPath(slug)
    : entry.categoryId === "03" ? legalPaperPath(slug) : undefined;
  return { ...entry, slug, articlePath };
});
if (showcaseEntries.length !== 18) throw new Error("The approved Experience document contains 18 entries.");

export const showcaseDomains: readonly ShowcaseDomain[] = experienceDomainDefinitions.map((domain) => ({
  ...domain, entries: showcaseEntries.filter((entry) => entry.categoryId === domain.number),
}));
export function getShowcaseDomain(slug: string) { return showcaseDomains.find((domain) => domain.slug === slug); }
export function getShowcaseEntryForArticle(slug: string) { return showcaseEntries.find((entry) => entry.slug === slug && entry.articlePath); }
