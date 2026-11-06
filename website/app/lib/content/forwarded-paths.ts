import { experienceDomainDefinitions } from "./experience-domains";
import { showcaseEntries } from "./experience-showcase";
import { selectedResearchProjects } from "./selected-research";

// Addresses outside the site's two sections, each mapped to the page that holds its
// content. They are not exported as pages, so the host answers 404 for them; the 404
// page forwards a visitor who arrives by one of them.
const domainSlug = (categoryId: string) => experienceDomainDefinitions.find(({ number }) => number === categoryId)!.slug;

export const forwardedPaths: Readonly<Record<string, string>> = Object.fromEntries([
  ["/education/", "/"],
  ["/now/", "/experience/"],
  ["/past-experience/", "/experience/"],
  ...selectedResearchProjects.map(({ slug, path }) => [`/education/${slug}/`, path]),
  ...experienceDomainDefinitions.map(({ slug }) => [`/past-experience/${slug}/`, `/experience/#${slug}`]),
  ...showcaseEntries
    .filter((entry) => entry.article)
    .map((entry) => [`/past-experience/${domainSlug(entry.categoryId)}/${entry.slug}/`, entry.detailPath]),
]);

/** Runs inline on the 404 page; the static CSP admits it by hash. */
export const forwardScript = `(() => {
  const paths = ${JSON.stringify(forwardedPaths)};
  const target = paths[location.pathname.replace(/\\/?$/, "/")];
  if (target) location.replace(target.includes("#") ? target : target + location.hash);
})();`;
