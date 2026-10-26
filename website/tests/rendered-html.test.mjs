import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { secureStaticHtml } from "../scripts/secure-static-html.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const REPOSITORY_ROOT = path.dirname(ROOT.replace(/[\\/]$/u, ""));
const OUT = path.join(ROOT, "out");
const SITE_ORIGIN = "https://www.theodoreoy.com";
const LAW_ROUTE = "/past-experience/legal-research-and-policy-analysis/";
const ARTICLES = [
  ["autonomous-authority-in-space", "Autonomous Authority in Space: Risk Tradeoffs and the Law of Delegation", "", 30],
  ["small-states-and-strategic-space-dependence", "Small States and the Governance of Strategic Space Dependence", "", 32],
  ["solar-geoengineering-comparison-and-continuity", "Who May Choose the Lesser Risk", "Solar Geoengineering and the Legal Duties of Comparison and Continuity", 30],
  ["mangrove-restoration-and-compensatory-mitigation", "Mangrove Restoration and the Limits of Compensatory Mitigation", "Lessons from Florida for the Greater Bay Area", 41],
];
const ARTICLE_ROUTES = ARTICLES.map(([slug]) => `${LAW_ROUTE}${slug}/`);
const AI_ROUTE = "/past-experience/artificial-intelligence/";
const AI_PROJECT_SLUGS = [
  "statistical-inference-and-resource-allocation-in-expert-data-production",
  "task-validity-in-financial-synthetic-data",
  "verification-and-supervision-in-scientific-reasoning-tasks",
  "evidence-uncertainty-and-decision-guarantees-in-investment-research",
];
const EXPERIENCE_DETAIL_SLUGS = new Map([
  [5, "jiritsu-network"],
  [6, "euromonitor-international"],
  [7, "china-construction-bank"],
  [12, "jones-lang-lasalle"],
  [13, "hubble-technology-investment"],
  [14, "saif-partners"],
  [15, "citic-securities"],
  [16, "ey-parthenon"],
  [17, "independent-stem-olympiad-training"],
  [18, "stem-olympiad-competitions"],
]);
const EXPERIENCE_DETAIL_ROUTES = [...EXPERIENCE_DETAIL_SLUGS.values()].map((slug) => `/experience/${slug}/`);
const LEGAL_LISTING_TITLES = [
  "Duke Law School: Space Law and Autonomous Systems Research",
  "Duke Law School: Space Law and Strategic Infrastructure Research",
  "Duke Law School: Climate Law and Geoengineering Governance Research",
  "Duke Law School: Environmental Law and Ecological Restoration Research",
];
const DISPLAY_DETAIL_TITLES = new Map([
  [8, "Autonomous Authority in Space — Risk Tradeoffs and the Law of Delegation"],
  [10, "Who May Choose the Lesser Risk — Solar Geoengineering and the Legal Duties of Comparison and Continuity"],
  [11, "Mangrove Restoration and the Limits of Compensatory Mitigation — Lessons from Florida for the Greater Bay Area"],
]);
const ROUTES = [
  "/",
  "/education/",
  "/education/certified-valuation-arithmetic-asian-options/",
  "/education/certified-rough-heston-valuation/",
  "/now/",
  "/experience/",
  ...EXPERIENCE_DETAIL_ROUTES,
  "/past-experience/",
  "/past-experience/artificial-intelligence/",
  "/past-experience/data-science/",
  LAW_ROUTE,
  "/past-experience/finance/",
  "/past-experience/stem-academic-competitions-and-training/",
  ...ARTICLE_ROUTES,
  ...AI_PROJECT_SLUGS.map((slug) => `${AI_ROUTE}${slug}/`),
];
const NAVIGATION = [
  ["About", "/"],
  ["Experience", "/experience/"],
];
const CANONICAL_ROUTES = [
  "/", "/experience/",
  ...EXPERIENCE_DETAIL_ROUTES,
  "/education/certified-valuation-arithmetic-asian-options/",
  "/education/certified-rough-heston-valuation/",
  ...ARTICLE_ROUTES,
  ...AI_PROJECT_SLUGS.map((slug) => `${AI_ROUTE}${slug}/`),
];
// Expected category placement is independent of the renderer and route registry.
const DOMAINS = [
  ["AI Research and Engineering", "artificial-intelligence", [1, 2, 3, 4]],
  ["Data Science", "data-science", [5, 6, 7]],
  ["Legal Research and Policy Analysis", "legal-research-and-policy-analysis", [8, 9, 10, 11]],
  ["Finance and Consulting", "finance", [12, 13, 14, 15, 16]],
  ["STEM Academic Competitions and Training", "stem-academic-competitions-and-training", [17, 18]],
];
const EXPECTED_PUBLIC_ASSETS = [
  "assets/brand/apple-touch-icon.png",
  "assets/brand/favicon-16.png",
  "assets/brand/favicon-32.png",
  "assets/brand/favicon.ico",
  "assets/brand/lo-mark.svg",
  "assets/brand/og-1774.jpg",
  "assets/fonts/InterVariable-Italic.woff2",
  "assets/fonts/InterVariable.woff2",
  "assets/fonts/LICENSE.txt",
  "assets/fonts/inter.css",
];

function decodeHtml(value) {
  const named = new Map([["amp", "&"], ["apos", "'"], ["gt", ">"], ["lt", "<"], ["nbsp", " "], ["quot", '"']]);
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/giu, (match, entity) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return named.get(entity.toLowerCase()) ?? match;
  });
}

function normalizeSpace(value) {
  return decodeHtml(value).replace(/\s+/gu, " ").trim();
}

function stripMarkup(value) {
  return normalizeSpace(value.replace(/<script\b[\s\S]*?<\/script>/giu, " ").replace(/<style\b[\s\S]*?<\/style>/giu, " ").replace(/<[^>]+>/gu, " "));
}

function inlineText(value) {
  return normalizeSpace(value.replace(/<[^>]+>/gu, ""));
}

function attribute(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = tag.match(new RegExp(`(?:^|\\s)${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "iu"));
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3] ?? "") : undefined;
}

function openingTags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, "giu")) ?? [];
}

function elementHtmlById(html, id) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const opening = new RegExp(`<([a-z][\\w:-]*)\\b[^>]*\\bid="${escapedId}"[^>]*>`, "iu").exec(html);
  assert.ok(opening, `Missing element #${id}`);
  const end = html.indexOf(`</${opening[1]}>`, opening.index + opening[0].length);
  assert.ok(end >= 0, `Incomplete element #${id}`);
  return html.slice(opening.index, end);
}

function elementsWithClass(html, tagName, className) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, "giu"))].filter((match) =>
    (attribute(match[1], "class") ?? "").split(/\s+/u).includes(className),
  );
}

function metaContent(html, key, value) {
  const tag = openingTags(html, "meta").find((candidate) => attribute(candidate, key)?.toLowerCase() === value.toLowerCase());
  return tag ? attribute(tag, "content") : undefined;
}

function canonicalUrl(html) {
  const tag = openingTags(html, "link").find((candidate) => (attribute(candidate, "rel") ?? "").split(/\s+/u).includes("canonical"));
  return tag ? attribute(tag, "href") : undefined;
}

function primaryNavigation(html) {
  const nav = [...html.matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/giu)].find((match) => attribute(match[1], "aria-label") === "Primary navigation");
  assert.ok(nav, "Primary navigation is missing");
  return [...nav[2].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/giu)].map((match) => [stripMarkup(match[2]), attribute(match[1], "href")]);
}

function expectedCanonical(route) {
  if (route === "/education/") return "/";
  if (["/past-experience/", "/now/"].includes(route)) return "/experience/";
  const domain = DOMAINS.find(([, slug]) => route === `/past-experience/${slug}/`);
  return domain ? "/experience/" : route;
}

async function approvedExperience() {
  return JSON.parse(await readFile(path.join(ROOT, "content", "experience-showcase.json"), "utf8")).entries;
}

function expectedExperiencePresentation(entry) {
  const legal = entry.categoryId === "03";
  const ai = entry.categoryId === "01";
  const organization = legal ? "Duke Law School" : entry.organization;
  const slug = ai ? AI_PROJECT_SLUGS[entry.id - 1]
    : legal ? ARTICLES[entry.id - 8][0] : EXPERIENCE_DETAIL_SLUGS.get(entry.id);
  assert.ok(slug, `Entry ${entry.id} needs an independent expected route`);
  return {
    listingTitle: legal ? LEGAL_LISTING_TITLES[entry.id - 8] : entry.organization,
    pageTitle: `${organization}: ${DISPLAY_DETAIL_TITLES.get(entry.id) ?? entry.detailTitle}`,
    path: ai ? `${AI_ROUTE}${slug}/` : legal ? `${LAW_ROUTE}${slug}/` : `/experience/${slug}/`,
    slug,
  };
}

function experienceEntries(html) {
  return [...html.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/giu)]
    .filter((match) => attribute(match[1], "data-experience-entry") !== undefined)
    .map((match) => ({ id: Number(attribute(match[1], "data-experience-entry")), html: match[2] }));
}

function assertExperienceDetails(html, expected) {
  const metadata = [...html.matchAll(/<dl\b([^>]*)>([\s\S]*?)<\/dl>/giu)]
    .filter((match) => attribute(match[1], "data-experience-metadata") !== undefined);
  assert.equal(metadata.length, 1, `Entry ${expected.id} must have one metadata group`);
  const metadataRows = [...metadata[0][2].matchAll(/<div\b[^>]*>([\s\S]*?)<\/div>/giu)];
  assert.equal(metadataRows.length, 3, `Entry ${expected.id} must keep Position, Location, and Dates in separate rows`);
  for (const [index, row] of metadataRows.entries()) {
    assert.equal(openingTags(row[1], "dt").length, 1, `Entry ${expected.id}, metadata row ${index + 1}`);
    assert.equal(openingTags(row[1], "dd").length, 1, `Entry ${expected.id}, metadata row ${index + 1}`);
  }
  assert.deepEqual([...metadata[0][2].matchAll(/<d[td]\b[^>]*>([\s\S]*?)<\/d[td]>/giu)].map((match) => stripMarkup(match[1])), [
    "Position", expected.metadata.position, "Location", expected.metadata.location, "Dates", expected.metadata.dates,
  ]);
  const contributions = [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/giu)]
    .find((match) => attribute(match[1], "data-experience-contributions") === String(expected.id));
  assert.ok(contributions, `Entry ${expected.id} is missing its contribution block`);
  assert.equal(stripMarkup(contributions[2].match(/<h[2-6]\b[^>]*>([\s\S]*?)<\/h[2-6]>/iu)?.[1] ?? ""), expected.contributionsLabel);
  assert.deepEqual([...contributions[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/giu)].map((match) => stripMarkup(match[1])), [...expected.keyContributions, ...expected.notes].map(normalizeSpace));
  assert.equal(openingTags(contributions[2], "p").length, 0, "Supporting notes must be exact trailing list items, not separate paragraphs");
}

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    else files.push(absolute);
  }
  return files;
}

function routeFile(route) {
  return route === "/" ? path.join(OUT, "index.html") : path.join(OUT, ...route.split("/").filter(Boolean), "index.html");
}

async function routeHtml(route) {
  return readFile(routeFile(route), "utf8");
}

async function exportedRoutes() {
  return (await walk(OUT))
    .filter((file) => path.basename(file) === "index.html" && !file.includes(`${path.sep}_next${path.sep}`))
    .map((file) => {
      const relative = path.relative(OUT, path.dirname(file)).split(path.sep).join("/");
      return relative ? `/${relative}/` : "/";
    })
    .filter((route) => route !== "/404/" && route !== "/_not-found/")
    .sort();
}

test("the static export retains the unified Experience page, legacy routes, and the architecture viewer", async () => {
  assert.deepEqual(await exportedRoutes(), [...ROUTES, "/architecture/"].sort());
  assert.ok(existsSync(path.join(OUT, "404.html")));
});

test("the architecture viewer preserves its source with a static security policy", async () => {
  const source = await readFile(path.join(REPOSITORY_ROOT, "architecture", "index.html"), "utf8");
  const published = await readFile(path.join(OUT, "architecture", "index.html"), "utf8");
  assert.equal(published, secureStaticHtml(source));
  assert.match(published, /<!doctype html>/iu);
  assert.match(published, /<svg\b/iu);
});

test("every route keeps canonical metadata, CSP, and the same navigation", async () => {
  const requiredCsp = [
    "default-src 'self'",
    "script-src 'self' 'sha256-",
    "script-src-attr 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ];
  for (const route of ROUTES) {
    const html = await routeHtml(route);
    const absolute = new URL(expectedCanonical(route), SITE_ORIGIN).toString();
    assert.equal(canonicalUrl(html), absolute);
    assert.equal(metaContent(html, "property", "og:url"), absolute);
    assert.equal(metaContent(html, "name", "theme-color"), "#f7f6f5");
    assert.deepEqual(primaryNavigation(html), NAVIGATION);
    const csp = metaContent(html, "http-equiv", "Content-Security-Policy") ?? "";
    for (const directive of requiredCsp) assert.ok(csp.includes(directive), `${route} lost ${directive}`);
  }
});

test("About retains its interactive name entrance before the combined profile", async () => {
  const home = await routeHtml("/");
  assert.equal(openingTags(home, "canvas").length, 1);
  assert.match(home, /data-state="loading"/u);
  assert.ok(home.indexOf("<canvas") < home.indexOf('id="home-profile"'));
  assert.match(home, /href="#home-profile"[^>]*>Scroll<\/a>/u);
  const heading = home.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/u);
  assert.ok(heading);
  assert.equal(stripMarkup(heading[1]), "Thinking mathematically Working in AI");
  assert.match(home, /<title>About \| Theodore Ouyang<\/title>/u);
  assert.match(home, /id="home-profile"/u);
  for (const index of ["01", "02", "03"]) {
    assert.match(home, new RegExp(`aria-hidden="true"[^>]*>${index}<`, "u"));
  }
  assert.ok(stripMarkup(home).includes("Mathematics is how I make sense of things. I want to know which assumptions underlie a conclusion, what happens when they change, and where intuition stops being reliable."));
  assert.ok(stripMarkup(home).includes("My work increasingly centers on AI. I build and experiment to understand these systems firsthand, and to work out what is worth doing with them."));
  for (const id of ["selected-research", "education", "coursework", "contact"]) {
    assert.match(home, new RegExp(`id="${id}"`, "u"));
  }
  assert.match(home, /href="mailto:10@alumni\.duke\.edu"/u);
  assert.match(home, /href="https:\/\/github\.com\/130U"/u);
  assert.equal(openingTags(home, "img").length, 0);
  for (const route of ROUTES.slice(1)) assert.equal(openingTags(await routeHtml(route), "canvas").length, 0);
});

test("the education compatibility page shares About content and marks About as current", async () => {
  const home = await routeHtml("/");
  const alias = await routeHtml("/education/");
  const mainText = (html) => stripMarkup(html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/u)?.[1] ?? "");
  assert.ok(mainText(home));
  assert.equal(mainText(alias), mainText(home));
  assert.equal(canonicalUrl(alias), `${SITE_ORIGIN}/`);
  assert.equal(openingTags(alias, "canvas").length, 0);
  for (const html of [home, alias]) {
    const current = openingTags(html, "a").filter((tag) => attribute(tag, "aria-current") === "page");
    assert.equal(current.length, 1);
    assert.equal(attribute(current[0], "href"), "/");
  }
});

test("Experience compatibility pages share the unified text-focused page", async () => {
  for (const route of ["/education/", "/experience/", "/past-experience/", "/now/"]) {
    const html = await routeHtml(route);
    assert.equal(openingTags(html, "img").length, 0, `${route} must use text-focused content`);
  }
  const experience = await routeHtml("/experience/");
  const mainText = (html) => stripMarkup(html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/u)?.[1] ?? "");
  assert.ok(mainText(experience));
  for (const route of ["/past-experience/", "/now/"]) {
    const alias = await routeHtml(route);
    assert.equal(mainText(alias), mainText(experience));
    assert.equal(canonicalUrl(alias), `${SITE_ORIGIN}/experience/`);
  }
  for (const route of ["/experience/", "/past-experience/", "/now/"]) {
    const current = openingTags(await routeHtml(route), "a").filter((tag) => attribute(tag, "aria-current") === "page");
    assert.equal(current.length, 1);
    assert.equal(attribute(current[0], "href"), "/experience/");
  }
});

test("About research titles link to complete papers with their source links preserved", async () => {
  const about = await routeHtml("/");
  assert.ok(about.indexOf('id="selected-research"') < about.indexOf('id="education"'));
  assert.ok(about.indexOf('id="education"') < about.indexOf('id="coursework"'));
  assert.doesNotMatch(about, /Developed a mathematical framework for certifying|Read more about Certified/u);
  for (const [slug, title, description, tables] of [
    ["certified-valuation-arithmetic-asian-options", "Certified Valuation of Arithmetic Asian Options", "discretization-error bound below 0.011025 price units", 11],
    ["certified-rough-heston-valuation", "Certified Joint Pricing Errors in Rough Heston", "tightens the complete error bound by 7.6%", 13],
  ]) {
    assert.match(about, new RegExp(`id="${slug}"`, "u"));
    const headings = [...about.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gu)].map((match) => stripMarkup(match[1]));
    assert.ok(headings.includes(title));
    assert.ok(stripMarkup(about).includes(description));
    const entry = about.match(new RegExp(`<article\\b[^>]*id="${slug}"[^>]*>([\\s\\S]*?)</article>`, "u"))?.[1] ?? "";
    const titleLink = entry.match(/<h3\b[^>]*>\s*<a\b([^>]*)>([\s\S]*?)<\/a>\s*<\/h3>/u);
    assert.equal(attribute(titleLink?.[1] ?? "", "href"), `/education/${slug}/`);
    assert.equal(stripMarkup(titleLink?.[2] ?? ""), title);
    assert.equal(openingTags(entry, "a").length, 1);
    const article = await routeHtml(`/education/${slug}/`);
    assert.equal(openingTags(article, "h1").length, 1);
    assert.equal(openingTags(article, "table").length, tables);
    assert.match(article, /aria-label="Article contents"/u);
    assert.match(article, /This page includes the complete main text and references/u);
    assert.match(article, new RegExp(`href="/#${slug}"`, "u"));
    const current = openingTags(article, "a").find((tag) => attribute(tag, "aria-current") === "page");
    assert.equal(attribute(current ?? "", "href"), "/");
    assert.match(article, new RegExp(`href="https://github.com/130U/${slug}">GitHub repository</a>`, "u"));
  }
});

test("Experience presents five numbered sections and all eighteen approved entries in order", async () => {
  const html = await routeHtml("/experience/");
  const expected = await approvedExperience();
  assert.deepEqual(expected.map(({ id }) => id), Array.from({ length: 18 }, (_, index) => index + 1));
  assert.deepEqual(expected.map(({ keyContributions }) => keyContributions.length), [6, 6, 6, 6, 9, 7, 6, 5, 5, 5, 5, 7, 5, 6, 1, 1, 2, 4]);
  assert.deepEqual(experienceEntries(html).map(({ id }) => id), expected.map(({ id }) => id));
  assert.equal(openingTags(html, "h1").length, 1);
  assert.match(html, /<h1>Experience<\/h1>/u);
  const directory = [...html.matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/giu)]
    .find((match) => attribute(match[1], "aria-label") === "Experience sections");
  assert.ok(directory);
  const sectionLinks = [...directory[2].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/giu)];
  assert.deepEqual(sectionLinks.map((match) => attribute(match[1], "href")), DOMAINS.map(([, slug]) => `#${slug}`));
  for (const [index, [name, slug, ids]] of DOMAINS.entries()) {
    assert.equal(inlineText(sectionLinks[index][2]), `${String(index + 1).padStart(2, "0")}${name}`);
    assert.ok(openingTags(html, "section").some((tag) => attribute(tag, "id") === slug));
    assert.equal(stripMarkup(elementHtmlById(html, `${slug}-heading`)), name);
    assert.deepEqual(expected.filter(({ categoryId }) => categoryId === String(index + 1).padStart(2, "0")).map(({ id }) => id), ids);
  }
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/u)?.[1] ?? "";
  assert.doesNotMatch(stripMarkup(main), /\p{Script=Han}/u, "The public Experience copy must be English only");
  assert.doesNotMatch(stripMarkup(main), /Experience through September 2026|Past Experience|Current Chapter|Experience Website Copy|Latest version English and Chinese|English layout specification|Full articles are omitted here/u);
  const oldIntroductions = [
    "Developed AI research and production methods that domain experts could apply consistently across teams.",
    "Applied statistical learning, data engineering, and market analysis to counterparty screening, market entry, and green-credit assessment.",
    "Authored four research papers examining how legal institutions allocate authority and responsibility under technological and environmental uncertainty.",
    "Applied market research, valuation analysis, and risk screening to real estate acquisition advice, technology commercialization, dental-sector research, and equity research.",
    "Combined advanced physics and mathematics Olympiad training with peer mentoring and independent instruction.",
  ];
  for (const introduction of oldIntroductions) assert.ok(!stripMarkup(main).includes(introduction), "General category introductions must not return");
});

test("all eighteen approved Experience entries use institution titles and real links to complete detail pages", async () => {
  const html = await routeHtml("/experience/");
  const expected = await approvedExperience();
  const entries = experienceEntries(html);
  assert.equal(openingTags(html, "details").length, 0, "Experience must not expand entries inline");
  assert.equal(openingTags(html, "summary").length, 0);
  assert.doesNotMatch(html, /data-experience-metadata|data-experience-contributions/u, "Detail content belongs on the linked page");
  const destinations = [];
  for (const entry of expected) {
    const presentation = expectedExperiencePresentation(entry);
    const rendered = entries.find(({ id }) => id === entry.id).html;
    const summaries = [...rendered.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/giu)]
      .filter((match) => attribute(match[1], "data-experience-summary") !== undefined);
    assert.equal(summaries.length, 1);
    assert.equal(stripMarkup(summaries[0][2]), normalizeSpace(entry.summary));
    assert.equal(openingTags(rendered, "p").length, 1, `Entry ${entry.id} must have one outer summary`);
    assert.equal(stripMarkup(rendered.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/u)?.[1] ?? ""), presentation.listingTitle);
    const links = [...rendered.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/giu)];
    assert.equal(links.length, 1, `Entry ${entry.id} needs one Read More action`);
    assert.equal(attribute(links[0][1], "href"), presentation.path);
    assert.equal(stripMarkup(links[0][2]), entry.readMoreLabel);
    assert.doesNotMatch(links[0][1], /\bonclick\s*=|role="button"/iu, "Read More must remain a native link");
    destinations.push(presentation.path);

    const detailPage = await routeHtml(presentation.path);
    assert.equal(openingTags(detailPage, "h1").length, 1);
    assert.equal(stripMarkup(detailPage.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/u)?.[1] ?? ""), presentation.pageTitle);
    assert.equal((presentation.pageTitle.match(/:/gu) ?? []).length, 1, "Only the institution separator may remain a colon");
    assertExperienceDetails(detailPage, entry);
    assert.ok(detailPage.indexOf("data-experience-metadata") < detailPage.indexOf("data-experience-contributions"));
    const returns = openingTags(detailPage, "a").filter((tag) => attribute(tag, "href") === `/experience/#${presentation.slug}`);
    assert.equal(returns.length, 2, `Entry ${entry.id} needs header and footer links to its listing anchor`);
    assert.ok(openingTags(html, "article").some((tag) => attribute(tag, "id") === presentation.slug));
    const current = openingTags(detailPage, "a").filter((tag) => attribute(tag, "aria-current") === "page");
    assert.equal(current.length, 1);
    assert.equal(attribute(current[0], "href"), "/experience/");
  }
  assert.equal(new Set(destinations).size, 18);
  assert.deepEqual(destinations.filter((route) => route.startsWith("/experience/")), EXPERIENCE_DETAIL_ROUTES);
  assert.equal(expected.find(({ id }) => id === 16).metadata.location, "Beijing, China");
  assert.deepEqual(expected.filter(({ categoryId }) => ["02", "04", "05"].includes(categoryId)).map(({ keyContributions }) => keyContributions.length), [9, 7, 6, 7, 5, 6, 1, 1, 2, 4]);
  assert.equal(expected.find(({ id }) => id === 18).notes.length, 1, "The school-program context must survive the detailed-bullet merge");
});

test("the ten nonresearch detail routes are complete static pages with vertically stacked metadata", async () => {
  const metadataStyles = await readFile(path.join(ROOT, "app", "components", "experience", "Experience.module.css"), "utf8");
  const metadataRules = [...metadataStyles.matchAll(/(?:^|\n)\s*\.metadata\s*\{([^}]+)\}/gu)];
  assert.ok(metadataRules.length > 0, "Experience metadata needs an explicit layout rule");
  for (const [, declarations] of metadataRules) {
    assert.match(declarations, /grid-template-columns:\s*1fr\s*;/u, "Metadata must remain a single column at every defined breakpoint");
  }
  for (const route of EXPERIENCE_DETAIL_ROUTES) {
    const html = await routeHtml(route);
    assert.equal(openingTags(html, "article").length, 1);
    assert.equal(openingTags(html, "details").length, 0);
    assert.match(html, /<h1\b[^>]*\bid="experience-title"/u);
    assert.match(html, /href="#experience-title"/u);
    assert.equal(canonicalUrl(html), `${SITE_ORIGIN}${route}`);
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/u)?.[1] ?? "";
    assert.doesNotMatch(stripMarkup(main), /\p{Script=Han}/u);
    assert.doesNotMatch(main, /data-experience-summary/u, "The outer summary must not be repeated on the detail page");
  }
});

test("legacy domain routes preserve approved sections, canonicalize to Experience, and return to valid anchors", async () => {
  const main = await routeHtml("/experience/");
  const mainEntries = experienceEntries(main);
  for (const [name, slug, ids] of DOMAINS) {
    const html = await routeHtml(`/past-experience/${slug}/`);
    const entries = experienceEntries(html);
    assert.deepEqual(entries.map(({ id }) => id), ids);
    assert.equal(stripMarkup(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/u)?.[1] ?? ""), name);
    assert.equal(canonicalUrl(html), `${SITE_ORIGIN}/experience/`);
    assert.ok(openingTags(html, "a").some((tag) => attribute(tag, "href") === `/experience/#${slug}`));
    assert.ok(openingTags(main, "section").some((tag) => attribute(tag, "id") === slug));
    for (const entry of entries) assert.equal(entry.html, mainEntries.find(({ id }) => id === entry.id).html);
    const current = openingTags(html, "a").filter((tag) => attribute(tag, "aria-current") === "page");
    assert.equal(current.length, 1);
    assert.equal(attribute(current[0], "href"), "/experience/");
  }
});

test("law papers preserve article identity, chapter navigation, and bidirectional footnotes", async () => {
  const approved = await approvedExperience();
  for (const [index, [slug, title, subtitle, expectedFootnotes]] of ARTICLES.entries()) {
    const route = `${LAW_ROUTE}${slug}/`;
    const html = await routeHtml(route);
    const text = stripMarkup(html);
    const titleMatch = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/iu);
    assert.ok(titleMatch, `${route} is missing its article title`);
    assert.equal(stripMarkup(titleMatch[1]), expectedExperiencePresentation(approved.find(({ id }) => id === index + 8)).pageTitle);
    assert.ok(text.includes(title.split(": ").join(" — ")), `${route} lost its original article-title wording`);
    if (subtitle) assert.ok(text.includes(subtitle), `${route} lost its original subtitle`);
    assert.ok(text.includes("Letao Ouyang"), `${route} lost its original author name`);
    assert.ok(text.includes("December 2024"), `${route} lost its original date`);
    assert.ok(text.includes("Abstract"), `${route} is missing its abstract`);
    assert.equal(openingTags(html, "article").length, 1, `${route} must have one article reading region`);
    assert.ok(openingTags(html, "a").some((tag) => attribute(tag, "href") === `/experience/#${slug}`), `${route} is missing its return link`);

    const allIds = [...html.matchAll(/\bid="([^"]+)"/giu)].map((match) => decodeHtml(match[1]));
    const ids = new Set(allIds);
    assert.equal(ids.size, allIds.length, `${route} has duplicate anchors`);
    const links = openingTags(html, "a");
    const chapterIds = [...html.matchAll(/<h[2-6]\b[^>]*\bid="(section-[^"]+)"[^>]*>/giu)].map((match) => decodeHtml(match[1]));
    assert.ok(chapterIds.length > 0, `${route} is missing chapter anchors`);
    for (const id of chapterIds) assert.ok(links.some((tag) => attribute(tag, "href") === `#${id}`), `${route} is missing its contents link to ${id}`);

    const references = links.filter((tag) => attribute(tag, "role") === "doc-noteref");
    assert.ok(references.length >= expectedFootnotes, `${route} lost footnote references`);
    const referencedNumbers = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/giu)]
      .filter((match) => attribute(match[1], "role") === "doc-noteref")
      .map((match) => stripMarkup(match[2]))
      .filter((number) => /^\d+$/u.test(number))
      .map(Number);
    assert.deepEqual([...new Set(referencedNumbers)].sort((a, b) => a - b), Array.from({ length: expectedFootnotes }, (_, index) => index + 1), `${route} lost or combined numbered references`);
    const noteTargets = new Set();
    for (const reference of references) {
      const referenceId = attribute(reference, "id");
      const href = attribute(reference, "href");
      assert.ok(referenceId && href?.startsWith("#"), `${route} has an unaddressable footnote reference`);
      const targetId = href.slice(1);
      assert.ok(ids.has(targetId), `${route} has a dangling footnote target: ${href}`);
      noteTargets.add(targetId);
      const note = elementHtmlById(html, targetId);
      assert.ok(openingTags(note, "a").some((tag) => attribute(tag, "href") === `#${referenceId}`), `${route} is missing the backlink for ${referenceId}`);
    }
    assert.ok(noteTargets.size >= expectedFootnotes, `${route} is missing distinct footnotes`);
    for (const link of links) {
      const href = attribute(link, "href") ?? "";
      if (href.startsWith("#")) assert.ok(ids.has(href.slice(1)), `${route} has a broken local anchor ${href}`);
      if (!/^https?:/iu.test(href)) assert.doesNotMatch(href, /\.pdf(?:[?#]|$)/iu, `${route} must not link to an original PDF`);
    }
    assert.equal(openingTags(html, "iframe").length + openingTags(html, "embed").length + openingTags(html, "object").length, 0);
  }
});

test("law articles expose one complete native contents menu and source-only publication details", async () => {
  for (const [slug] of ARTICLES) {
    const source = JSON.parse(await readFile(path.join(ROOT, "content", "legal-papers", `${slug}.json`), "utf8"));
    const html = await routeHtml(`${LAW_ROUTE}${slug}/`);
    const menus = [...html.matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/giu)]
      .filter((match) => attribute(match[1], "aria-label") === "Article contents");
    assert.equal(menus.length, 1, `${slug} must expose one article contents menu`);
    const links = [...menus[0][2].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/giu)]
      .map((match) => ({ href: attribute(match[1], "href"), text: inlineText(match[2]) }));
    const expectedLinks = [
      { href: "#key-contributions", text: "Key Contributions" },
      { href: "#abstract-heading", text: "Abstract" },
      ...source.blocks.filter(({ type }) => type === "heading").map(({ id, text }) => ({ href: `#${id}`, text: normalizeSpace(text) })),
      { href: "#footnotes", text: "Footnotes" },
    ];
    assert.deepEqual(links, expectedLinks, `${slug} must link the approved contributions, abstract, every source heading, and footnotes in reading order`);
    const targets = [...openingTags(html, "h2"), ...openingTags(html, "h3"), ...openingTags(html, "section")];
    for (const { href } of expectedLinks) {
      assert.ok(targets.some((tag) => attribute(tag, "id") === href.slice(1)), `${slug} has a contents target that needs JavaScript: ${href}`);
    }

    const frontmatter = html.match(/<article\b[^>]*>[\s\S]*?<header\b[^>]*>([\s\S]*?)<\/header>/iu);
    assert.ok(frontmatter, `${slug} lost its article frontmatter`);
    const expected = (await approvedExperience()).find(({ id }) => id === ARTICLES.findIndex(([articleSlug]) => articleSlug === slug) + 8);
    const metadata = [...frontmatter[1].matchAll(/<d[td]\b[^>]*>([\s\S]*?)<\/d[td]>/giu)].map((match) => inlineText(match[1]));
    assert.deepEqual(metadata, ["Position", expected.metadata.position, "Location", expected.metadata.location, "Dates", expected.metadata.dates]);
    assert.ok(html.indexOf('id="key-contributions"') < html.indexOf('id="abstract-heading"'));
    for (const key of ["citation_journal_title", "citation_doi", "citation_volume", "citation_issue", "citation_issn", "citation_conference_title"]) {
      assert.equal(metaContent(html, "name", key), undefined, `${slug} invents unsupported ${key}`);
    }
  }
});

test("law article paragraphs, headings, and citations exactly match the approved structured sources", async () => {
  for (const [slug] of ARTICLES) {
    const source = JSON.parse(await readFile(path.join(ROOT, "content", "legal-papers", `${slug}.json`), "utf8"));
    const html = await routeHtml(`${LAW_ROUTE}${slug}/`);
    const abstract = [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/giu)]
      .find((match) => attribute(match[1], "aria-labelledby") === "abstract-heading");
    assert.ok(abstract, `${slug} lost its abstract region`);
    const abstractHeadingEnd = abstract[2].indexOf("</h2>") + "</h2>".length;
    assert.ok(abstractHeadingEnd >= "</h2>".length, `${slug} lost its Abstract heading`);
    const byline = abstract[2].slice(0, abstractHeadingEnd);
    assert.deepEqual([...byline.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/giu)].map((match) => inlineText(match[1])), [
      `${source.author}${source.acknowledgment ? "*" : ""}`,
      ...(source.date ? [normalizeSpace(source.date)] : []),
    ], `${slug} must preserve the original author and date before its abstract`);
    const abstractParagraphs = [...abstract[2].slice(abstractHeadingEnd).matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/giu)].map((match) => inlineText(match[1]));
    assert.deepEqual(abstractParagraphs, source.abstract.map(({ text }) => normalizeSpace(text)), `${slug} changed abstract text`);

    const blocks = [...html.matchAll(/<(p|h2|h3)\b([^>]*)>([\s\S]*?)<\/\1>/giu)]
      .filter((match) => attribute(match[2], "data-paper-block") !== undefined)
      .map((match) => ({ index: Number(attribute(match[2], "data-paper-block")), tag: match[1], text: inlineText(match[3]) }));
    assert.deepEqual(blocks, source.blocks.map(({ type, level, text }, index) => ({ index, tag: type === "heading" ? (level > 1 ? "h3" : "h2") : "p", text: normalizeSpace(text) })), `${slug} changed or omitted body text or heading structure`);

    for (const note of source.footnotes) {
      const noteHtml = elementHtmlById(html, `fn-${note.number}`);
      const paragraphs = [...noteHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/giu)].map((match) => inlineText(match[1]));
      assert.deepEqual(paragraphs, [normalizeSpace(note.text)], `${slug} changed footnote ${note.number}`);
    }
    const acknowledgmentHtml = elementHtmlById(html, "fn-author");
    const acknowledgment = acknowledgmentHtml.match(/<p\b[^>]*>([\s\S]*?)<\/p>/iu);
    assert.ok(acknowledgment, `${slug} lost its acknowledgment`);
    assert.equal(inlineText(acknowledgment[1]), normalizeSpace(source.acknowledgment.text), `${slug} changed its acknowledgment`);
  }
});

test("original PDFs remain absent from public assets and the exported website", async () => {
  for (const directory of [path.join(ROOT, "public"), OUT]) {
    assert.deepEqual((await walk(directory)).filter((file) => /\.pdf$/iu.test(file)), [], `${directory} exposes an original PDF`);
  }
});

test("About and its education alias preserve both degrees, 49 courses, and the advisor record", async () => {
  for (const route of ["/", "/education/"]) {
    const html = await routeHtml(route);
    assert.equal(elementsWithClass(html, "article", "education-entry").length, 2);
    const lists = elementsWithClass(html, "ul", "course-list");
    assert.equal(lists.length, 4);
    assert.equal(lists.reduce((total, list) => total + (list[2].match(/<li\b/giu) ?? []).length, 0), 49);
    const text = stripMarkup(html);
    for (const record of ["Master of Engineering in Risk Engineering", "Financial Risk Concentration", "Bachelor of Science in Mathematics", "Dual-Degree Undergraduate Program", "Pratt School of Engineering Merit Scholarship", "Undergraduate Merit Scholarship", "Academic advisor:", "Mark Borsuk, Ph.D."]) {
      assert.ok(text.includes(record), `${route} is missing ${record}`);
    }
    assert.equal((text.match(/Duke University/gu) ?? []).length, 1);
    assert.doesNotMatch(text, /Sequoia Fellow/u);
    assert.doesNotMatch(text, /highest-tier merit awards/u);
  }
});

test("the website uses its local brand assets without remote runtime resources", async () => {
  const assets = (await walk(path.join(OUT, "assets"))).map((file) => path.relative(OUT, file).replaceAll("\\", "/")).sort();
  assert.deepEqual(assets, EXPECTED_PUBLIC_ASSETS);
  for (const route of ROUTES) {
    const html = await routeHtml(route);
    for (const tag of [...openingTags(html, "script"), ...openingTags(html, "img"), ...openingTags(html, "source")]) {
      for (const name of ["src", "srcset"]) assert.doesNotMatch(attribute(tag, name) ?? "", /^https?:/iu);
    }
  }
});

test("the LO identity stays monochrome across browser and touch icons", async () => {
  const sourceMark = await readFile(path.join(ROOT, "source-assets", "brand", "lo-mark.svg"));
  const publicMark = await readFile(path.join(ROOT, "public", "assets", "brand", "lo-mark.svg"));
  assert.deepEqual(publicMark, sourceMark);
  assert.match(sourceMark.toString("utf8"), /fill="#0b0b0b"/u);

  for (const [asset, size] of [["favicon-16.png", 16], ["favicon-32.png", 32], ["apple-touch-icon.png", 180]]) {
    const { data, info } = await sharp(path.join(ROOT, "public", "assets", "brand", asset))
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.equal(info.width, size);
    assert.equal(info.height, size);
    for (let index = 0; index < data.length; index += info.channels) {
      assert.equal(data[index], data[index + 1], `${asset} contains a chromatic red/green pixel`);
      assert.equal(data[index + 1], data[index + 2], `${asset} contains a chromatic green/blue pixel`);
    }
  }
});

test("robots and sitemap share the exact route manifest", async () => {
  const robots = await readFile(path.join(OUT, "robots.txt"), "utf8");
  assert.match(robots, /^Sitemap:\s*https:\/\/www\.theodoreoy\.com\/sitemap\.xml$/imu);
  const sitemap = await readFile(path.join(OUT, "sitemap.xml"), "utf8");
  const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/giu)].map((match) => new URL(decodeHtml(match[1])).pathname).sort();
  assert.deepEqual(routes, [...CANONICAL_ROUTES].sort());
});

test("the production design contract is restrained and dependency-light", async () => {
  const globals = await readFile(path.join(ROOT, "app", "globals.css"), "utf8");
  const home = await readFile(path.join(ROOT, "app", "home.module.css"), "utf8");
  const homePage = await readFile(path.join(ROOT, "app", "page.tsx"), "utf8");
  const navigation = await readFile(path.join(ROOT, "app", "components", "SiteNavigation.tsx"), "utf8");
  const structuralGrid = await readFile(path.join(ROOT, "app", "components", "StructuralGrid.tsx"), "utf8");
  const layout = await readFile(path.join(ROOT, "app", "layout.tsx"), "utf8");
  const packageJson = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  for (const token of ["--page: #f7f6f5", "--ink: #0b0b0b", "--muted: #70706c", "--accent: #2200ff", "repeat(3, minmax(calc(var(--rail-min-width) / 3), 1fr)) repeat(12, minmax(0, 1fr))"]) assert.ok(globals.includes(token));
  assert.doesNotMatch(globals, /box-shadow|backdrop-filter/u);
  assert.doesNotMatch(home, /box-shadow|backdrop-filter|linear-gradient/u);
  assert.match(homePage, /<DitheredEntrance \/>/u);
  assert.match(globals, /@media \(pointer:\s*coarse\)[\s\S]*?\.primary-nav a,[\s\S]*?\.entry-website-link[\s\S]*?min-height:\s*44px/u);
  assert.match(home, /@media \(pointer:\s*coarse\)[\s\S]*?\.contactStrip a[\s\S]*?min-height:\s*44px/u);
  assert.match(globals, /width:\s*min\(100%,\s*1440px\)/u);
  assert.match(globals, /\.content-column\s*\{[\s\S]*?grid-template-columns:\s*repeat\(12,[\s\S]*?padding:\s*176px 0 144px/u);
  assert.match(globals, /\.structural-guide-tick\s*\{[\s\S]*?position:\s*sticky[\s\S]*?height:\s*20px/u);
  assert.match(globals, /\.domain-directory\s*\{[\s\S]*?grid-column:\s*1\s*\/\s*span\s*11/u);
  assert.match(globals, /\.domain-directory-link\s*\{[\s\S]*?grid-template-columns:\s*repeat\(11,/u);
  assert.match(globals, /\.archive-entry\s*\{[\s\S]*?grid-template-columns:\s*repeat\(11,/u);
  assert.doesNotMatch(globals, /\.education-entry\s*\{[^}]*grid-template-columns/u);
  for (const guide of ["frame-start", "rail-boundary", "reading-start", "reading-measure", "reading-end"]) assert.ok(structuralGrid.includes(`"${guide}"`));
  for (const contract of ["aria-controls=\"site-menu\"", "aria-expanded={menuOpen}", 'event.key === "Escape"', 'document.body.classList.add("menu-open")', 'querySelectorAll<HTMLElement>']) assert.ok(navigation.includes(contract));
  assert.match(navigation, /backgroundRegions[\s\S]*?region\.inert = true[\s\S]*?region\.inert = false/u);
  assert.match(navigation, /rail\.dataset\.enhanced = "true"/u);
  assert.match(navigation, /matchMedia\("\(min-width: 768px\)"\)[\s\S]*?if \(desktopQuery\.matches\) closeMenu\(false\)/u);
  assert.match(navigation, /desktopQuery\.addEventListener\("change", onViewportChange\)[\s\S]*?desktopQuery\.removeEventListener\("change", onViewportChange\)/u);
  assert.match(globals, /\.site-rail\[data-enhanced="true"\] \.rail-panel\s*\{[^}]*visibility:\s*hidden/u);
  assert.match(navigation, /wordmark-lockup[\s\S]*?wordmark-mark[\s\S]*?wordmark-name[\s\S]*?>Theodore Ouyang<\/span>/u);
  assert.match(layout, /assets\/brand\/lo-mark\.svg/u);
  assert.match(globals, /\.entry-metadata\s*\{[\s\S]*?grid-template-columns:\s*1fr/u);
  assert.match(globals, /\.entry-project\s*\{[\s\S]*?color:\s*var\(--ink\)/u);
  assert.match(globals, /\.archive-bullets li::before\s*\{[\s\S]*?width:\s*3px[\s\S]*?content:\s*""/u);
  assert.deepEqual(Object.keys(packageJson.dependencies).sort(), ["@mathjax/mathjax-tex-font", "@mathjax/src", "next", "react", "react-dom"]);
  assert.equal(packageJson.dependencies["@mathjax/src"], "4.1.3");
  assert.equal(packageJson.dependencies["@mathjax/mathjax-tex-font"], "4.1.3");
});
