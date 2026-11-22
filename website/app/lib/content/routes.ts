import { coreRoutes } from "./site";
import { selectedResearchProjects } from "./selected-research";
import { showcaseEntries } from "./experience-showcase";
import { blogPosts } from "./blog";

// About and its children: /, /coursework/, and /<manuscript>/.
// Experience and its children: /experience/ and /experience/<entry>/.
// Blog and its children: /blog/ and /blog/<post>/.
export const publicRoutes = [
  ...coreRoutes,
  ...selectedResearchProjects.map(({ path }) => path),
  ...showcaseEntries.map(({ detailPath }) => detailPath),
  ...blogPosts.map(({ path }) => path),
];

if (new Set(publicRoutes).size !== publicRoutes.length) {
  throw new Error("The public route registry contains duplicate paths.");
}
