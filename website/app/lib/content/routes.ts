import { coreRoutes } from "./site";
import { legalPapers, legalPaperPath } from "./legal-papers";
import { aiResearchProjects, aiResearchProjectPath } from "./ai-projects";
import { selectedResearchProjects } from "./selected-research";
import { showcaseEntries } from "./experience-showcase";

export const publicRoutes = [
  ...coreRoutes,
  ...selectedResearchProjects.map(({ path }) => path),
  ...legalPapers.map(({ slug }) => legalPaperPath(slug)),
  ...aiResearchProjects.map(({ slug }) => aiResearchProjectPath(slug)),
  ...showcaseEntries.filter((entry) => !entry.articlePath).map(({ detailPath }) => detailPath),
];

if (new Set(publicRoutes).size !== publicRoutes.length) {
  throw new Error("The public route registry contains duplicate paths.");
}
