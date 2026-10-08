import { pastExperience } from "./experience";
import { coreRoutes } from "./site";
import { legalPapers, legalPaperPath } from "./legal-papers";
import { aiResearchProjects, aiResearchProjectPath } from "./ai-projects";
import { selectedResearchProjects } from "./selected-research";

export const publicRoutes = [
  ...coreRoutes,
  ...selectedResearchProjects.map(({ path }) => path),
  ...pastExperience.map(({ path }) => path),
  ...legalPapers.map(({ slug }) => legalPaperPath(slug)),
  ...aiResearchProjects.map(({ slug }) => aiResearchProjectPath(slug)),
];

if (new Set(publicRoutes).size !== publicRoutes.length) {
  throw new Error("The public route registry contains duplicate paths.");
}
