import { coreRoutes } from "./site";
import { selectedResearchProjects } from "./selected-research";
import { showcaseEntries } from "./experience-showcase";

// About and its children: /, /coursework/, and /<manuscript>/.
// Experience and its children: /experience/ and /experience/<entry>/.
export const publicRoutes = [
  ...coreRoutes,
  ...selectedResearchProjects.map(({ path }) => path),
  ...showcaseEntries.map(({ detailPath }) => detailPath),
];

if (new Set(publicRoutes).size !== publicRoutes.length) {
  throw new Error("The public route registry contains duplicate paths.");
}
