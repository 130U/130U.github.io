import { readFileSync } from "node:fs";
import { join } from "node:path";
import { experienceDomainDefinitions } from "./experience-domains";
import { aiResearchProjectSlugs, aiResearchProjectPath } from "./ai-projects";
import { legalPaperSlugs, legalPaperPath } from "./legal-papers";

type CopySection = { title: string; text: string };

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
  keyContributionDetails?: Record<string, { ordered: boolean; items: string[] }>;
  notes: string[];
  disclosure?: CopySection;
  architecturalContext?: CopySection;
};

export type ShowcaseEntry = SourceEntry & {
  slug: string;
  articlePath?: string;
  detailPath: string;
  listingTitle: string;
  pageTitle: string;
};
export type ShowcaseDomain = { number: string; name: string; slug: string; entries: ShowcaseEntry[]; disclosure?: CopySection };
const source = JSON.parse(readFileSync(join(process.cwd(), "content", "experience-showcase.json"), "utf8")) as {
  categories: { id: string; disclosure?: CopySection }[];
  entries: SourceEntry[];
};
const entrySlugs = [
  ...aiResearchProjectSlugs, "jiritsu-network", "euromonitor-international", "china-construction-bank",
  ...legalPaperSlugs, "jones-lang-lasalle", "hubble-technology-investment", "saif-partners",
  "citic-securities", "ey-parthenon", "independent-stem-olympiad-training", "stem-olympiad-competitions",
];
// Presentation labels are separate from the approved Experience copy.
const legalResearchAreas: Record<number, string> = {
  8: "Space Law and Autonomous Systems Research",
  9: "Space Law and Strategic Infrastructure Research",
  10: "Climate Law and Geoengineering Governance Research",
  11: "Environmental Law and Ecological Restoration Research",
};

export const showcaseEntries: readonly ShowcaseEntry[] = source.entries.map((entry, index) => {
  if (entry.id !== index + 1 || !entry.summary || !entry.detailTitle || !entry.keyContributions.length ||
      !entry.metadata.position || !entry.metadata.location || !entry.metadata.dates) {
    throw new Error(`Incomplete approved Experience entry: ${entry.id}`);
  }
  const slug = entrySlugs[index];
  const articlePath = entry.categoryId === "01" ? aiResearchProjectPath(slug)
    : entry.categoryId === "03" ? legalPaperPath(slug) : undefined;
  const organization = entry.categoryId === "03" ? "Duke Law School" : entry.organization;
  const listingTitle = entry.categoryId === "03" ? `${organization}: ${legalResearchAreas[entry.id]}` : organization;
  return {
    ...entry, slug, articlePath,
    detailPath: articlePath ?? `/experience/${slug}/`,
    listingTitle,
    pageTitle: `${organization}: ${entry.detailTitle.replace(/:\s*/gu, " — ")}`,
  };
});
if (showcaseEntries.length !== 18) throw new Error("The approved Experience document contains 18 entries.");

export const showcaseDomains: readonly ShowcaseDomain[] = experienceDomainDefinitions.map((domain) => ({
  ...domain, entries: showcaseEntries.filter((entry) => entry.categoryId === domain.number),
  disclosure: source.categories.find((category) => category.id === domain.number)?.disclosure,
}));
export function getShowcaseDomain(slug: string) { return showcaseDomains.find((domain) => domain.slug === slug); }
export function getShowcaseEntry(slug: string) { return showcaseEntries.find((entry) => entry.slug === slug); }
export function getShowcaseEntryForArticle(slug: string) { return showcaseEntries.find((entry) => entry.slug === slug && entry.articlePath); }
