import { pastExperience } from "./experience";
import { personalPosts } from "./posts";
import { coreRoutes } from "./site";

export const publicRoutes = [
  ...coreRoutes,
  ...pastExperience.map(({ path }) => path),
  ...personalPosts.map(({ path }) => path),
];

if (new Set(publicRoutes).size !== publicRoutes.length) {
  throw new Error("The public route registry contains duplicate paths.");
}
