import { pastExperience } from "./experience";
import { coreRoutes } from "./site";
import { legalPapers, legalPaperPath } from "./legal-papers";

export const publicRoutes = [
  ...coreRoutes,
  ...pastExperience.map(({ path }) => path),
  ...legalPapers.map(({ slug }) => legalPaperPath(slug)),
];

if (new Set(publicRoutes).size !== publicRoutes.length) {
  throw new Error("The public route registry contains duplicate paths.");
}
