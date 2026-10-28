import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { secureStaticHtml } from "../scripts/secure-static-html.mjs";
import { courseworkGroups } from "../app/lib/content/about.ts";

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
  "/coursework/",
  "/education/critical-dependence-stress-for-portfolio-diversification/",
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
  "/", "/coursework/", "/experience/",
  ...EXPERIENCE_DETAIL_ROUTES,
  "/education/critical-dependence-stress-for-portfolio-diversification/",
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
  "assets/research/dependence/budget-comparison.png",
  "assets/research/dependence/corner-capacity.png",
  "assets/research/dependence/optimal-flow-shares.png",
  "assets/research/dependence/tail-layer-repair.png",
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

function markdownInlineText(value) {
  let formula = 0;
  return normalizeSpace(value
    .replace(/\$`([^`]*?)`\$|(?<!\\)\$([^$\r\n]+?)(?<!\\)\$/gu, () => ` MATH_${formula++} `)
    .replace(/\[([^\]]+)\]\((?:https?:\/\/|#)[^\s)]+\)/gu, "$1")
    .replace(/\*\*([\s\S]+?)\*\*|\*([^*]+)\*|`([^`]+)`/gu, (_, strong, emphasis, code) => strong ?? emphasis ?? code));
}

function renderedInlineText(value) {
  let formula = 0;
  return normalizeSpace(value
    .replace(/<svg\b[\s\S]*?<\/svg>/giu, "")
    .replace(/<span\b([^>]*\bdata-research-number\b[^>]*)>[\s\S]*?<\/span>/giu, (whole, attributes) => attribute(attributes, "aria-hidden") === "true" ? "" : whole)
    .replace(/<math\b[\s\S]*?<\/math>/giu, () => ` MATH_${formula++} `)
    .replace(/<[^>]+>/gu, ""));
}

function assertApprovedInline(html, source) {
  assert.equal(renderedInlineText(html), markdownInlineText(source), "Approved inline prose must survive Markdown rendering exactly");
  const expected = [...source.matchAll(/\$`([^`]*?)`\$|(?<!\\)\$([^$\r\n]+?)(?<!\\)\$/gu)].map((match) => match[1] ?? match[2]);
  const actual = [...html.matchAll(/<annotation\b[^>]*encoding="application\/x-tex"[^>]*>([\s\S]*?)<\/annotation>/giu)].map((match) => decodeHtml(match[1]));
  assert.deepEqual(actual, expected, "Approved inline equations must preserve their exact TeX");
  const numericExpected = expected.map((tex) => {
    const compact = tex.replace(/\s+/gu, "");
    const suffix = compact.endsWith("\\%") ? "%" : "";
    const value = suffix ? compact.slice(0, -2) : compact;
    const numeric = /^[+-]?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|\.\d+)$/u;
    const scientific = value.match(/^(?:(.+)\\times)?10\^\{([+-]?\d+)\}$/u);
    const minus = (text) => text.replace(/^-/u, "−");
    if (scientific && (scientific[1] === undefined || numeric.test(scientific[1]))) {
      const base = scientific[1] === undefined ? "10" : `${minus(scientific[1])} × 10`;
      return `${base}<sup>${minus(scientific[2])}</sup>${suffix}`;
    }
    return numeric.test(value) ? `${minus(value)}${suffix}` : undefined;
  });
  const visibleNumbers = [...html.matchAll(/<span\b([^>]*\bdata-research-number\b[^>]*)>([\s\S]*?)<\/span>/giu)];
  assert.deepEqual(visibleNumbers.map((match) => decodeHtml(match[2].replace(/<!--[\s\S]*?-->/gu, ""))), numericExpected.filter((number) => number !== undefined), "Visible numeric literals must preserve exact bases, superscripts, and percent suffixes");
  for (const match of visibleNumbers) assert.equal(attribute(match[1], "aria-hidden"), "true");
  const vectorCount = openingTags(html, "svg").filter((tag) => attribute(tag, "data-research-svg") !== undefined).length;
  assert.equal(vectorCount, expected.length - visibleNumbers.length, "All other inline expressions retain their mathematical SVG rendering");
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

function topLevelListItems(html) {
  const items = [];
  let depth = 0;
  let opening;
  for (const tag of html.matchAll(/<\/?li\b[^>]*>/giu)) {
    if (!tag[0].startsWith("</")) {
      if (depth === 0) opening = tag;
      depth += 1;
    } else {
      depth -= 1;
      assert.ok(depth >= 0, "List items must have balanced tags");
      if (depth === 0) items.push({ attributes: opening[0], html: html.slice(opening.index + opening[0].length, tag.index) });
    }
  }
  assert.equal(depth, 0, "List items must remain complete");
  return items;
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
  const items = topLevelListItems(contributions[2]);
  const approvedItems = [...expected.keyContributions, ...expected.notes];
  assert.equal(items.length, approvedItems.length);
  for (const [index, item] of items.entries()) {
    assert.equal(attribute(item.attributes, "data-contribution-item"), String(index), "Top-level contribution order must remain explicit");
    const nested = [...item.html.matchAll(/<(ul|ol)\b([^>]*\bdata-contribution-details\b[^>]*)>([\s\S]*?)<\/\1>/giu)];
    const approvedDetails = expected.keyContributionDetails?.[String(index)];
    assert.equal(nested.length, approvedDetails ? 1 : 0, "Each contribution retains exactly its approved nested detail group");
    const parentCopy = nested.length ? item.html.slice(0, nested[0].index) + item.html.slice(nested[0].index + nested[0][0].length) : item.html;
    if (expected.categoryId === "01") assertApprovedInline(parentCopy, approvedItems[index]);
    else assert.equal(stripMarkup(parentCopy), normalizeSpace(approvedItems[index]));
    if (approvedDetails) {
      assert.equal(nested[0][1], approvedDetails.ordered ? "ol" : "ul", "Numbered and bulleted source lists retain their semantics");
      assert.equal(attribute(nested[0][2], "data-contribution-details"), String(index));
      const childItems = topLevelListItems(nested[0][3]);
      assert.equal(childItems.length, approvedDetails.items.length);
      childItems.forEach((child, childIndex) => {
        assert.equal(attribute(child.attributes, "data-contribution-detail"), String(childIndex));
        assertApprovedInline(child.html, approvedDetails.items[childIndex]);
      });
    }
  }
  assert.equal(openingTags(contributions[2], "p").length, 0, "Supporting notes must be exact trailing list items, not separate paragraphs");
  if (expected.categoryId === "01") {
    const disclosure = [...html.matchAll(/<aside\b([^>]*)>([\s\S]*?)<\/aside>/giu)]
      .find((match) => attribute(match[1], "data-experience-disclosure") !== undefined);
    assert.ok(disclosure, "AI detail pages need their approved confidentiality disclosure");
    assert.equal(stripMarkup(disclosure[2].match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/iu)?.[1] ?? ""), expected.disclosure.title);
    assertApprovedInline(disclosure[2].match(/<p\b[^>]*>([\s\S]*?)<\/p>/iu)?.[1] ?? "", expected.disclosure.text);
    const context = [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/giu)]
      .find((match) => attribute(match[1], "data-architectural-context") !== undefined);
    assert.ok(context, "AI contributions need the approved architectural bridge");
    assert.equal(stripMarkup(context[2].match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/iu)?.[1] ?? ""), expected.architecturalContext.title);
    const paragraphs = [...context[2].matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/giu)];
    const approvedParagraphs = expected.architecturalContext.text.split(/\n+/u);
    assert.equal(paragraphs.length, approvedParagraphs.length);
    paragraphs.forEach((paragraph, index) => assertApprovedInline(paragraph[1], approvedParagraphs[index]));
    assert.ok(metadata[0].index < disclosure.index && disclosure.index < contributions.index && contributions.index < context.index, "Metadata, disclosure, contributions, and architectural context must retain their reading order");
  }
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
  for (const index of ["01", "02", "03", "04"]) {
    assert.match(home, new RegExp(`aria-hidden="true"[^>]*>${index}<`, "u"));
  }
  assert.ok(stripMarkup(home).includes("Mathematics is how I make sense of things. I want to know which assumptions underlie a conclusion, what happens when they change, and where intuition stops being reliable."));
  assert.ok(stripMarkup(home).includes("My work increasingly centers on AI. I build and experiment to understand these systems firsthand, and to work out what is worth doing with them."));
  for (const id of ["selected-research", "education", "coursework", "contact"]) {
    assert.match(home, new RegExp(`id="${id}"`, "u"));
  }
  assert.match(home, /href="mailto:10@alumni\.duke\.edu"/u);
  assert.match(home, /href="https:\/\/github\.com\/130U"/u);
  const contact = elementHtmlById(home, "contact");
  assert.deepEqual(openingTags(contact, "a").map((tag) => attribute(tag, "href")), [
    "mailto:10@alumni.duke.edu", "https://github.com/130U", "https://x.com/D3rfr31schutz",
  ]);
  assert.ok(stripMarkup(contact).includes("@D3rfr31schutz"));
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
  assert.doesNotMatch(about, /I developed|Developed a mathematical framework for certifying|Read more about Certified/u);
  const researchEntries = [...about.matchAll(/<article\b[^>]*id="([^"]+)"[^>]*>[\s\S]*?<\/article>/gu)].map((match) => match[1]).filter((id) => id.startsWith("critical-dependence-") || id.startsWith("certified-"));
  assert.deepEqual(researchEntries, ["critical-dependence-stress-for-portfolio-diversification", "certified-valuation-arithmetic-asian-options", "certified-rough-heston-valuation"]);
  for (const [slug, title, description, tables, sections, repository] of [
    ["critical-dependence-stress-for-portfolio-diversification", "Critical Dependence Stress for Portfolio Diversification", "I develop a variational framework", 0, 5, "mathematical-finance-project"],
    ["certified-valuation-arithmetic-asian-options", "Certified Valuation of Arithmetic Asian Options", "discretization-error bound below 0.011025 price units", 11, 10, "certified-valuation-arithmetic-asian-options"],
    ["certified-rough-heston-valuation", "Certified Joint Pricing Errors in Rough Heston", "finite-history propagation tightens the complete pricing-error upper bound by 72.91%", 13, 8, "certified-rough-heston-valuation"],
  ]) {
    assert.match(about, new RegExp(`id="${slug}"`, "u"));
    const headings = [...about.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gu)].map((match) => stripMarkup(match[1]));
    assert.ok(headings.includes(title));
    assert.ok(stripMarkup(about).includes(description));
    const entry = about.match(new RegExp(`<article\\b[^>]*id="${slug}"[^>]*>([\\s\\S]*?)</article>`, "u"))?.[1] ?? "";
    const researchLink = entry.match(/<a\b([^>]*)>([\s\S]*?)<\/a>/u);
    assert.equal(attribute(researchLink?.[1] ?? "", "href"), `/education/${slug}/`);
    assert.equal(attribute(researchLink?.[1] ?? "", "aria-labelledby"), `${slug}-title`);
    assert.equal(stripMarkup(elementHtmlById(researchLink?.[2] ?? "", `${slug}-title`)), title);
    assert.ok(stripMarkup(researchLink?.[2] ?? "").includes(description), "The manuscript link includes its summary so the complete row is actionable.");
    assert.equal(openingTags(entry, "a").length, 1);
    const article = await routeHtml(`/education/${slug}/`);
    assert.equal(openingTags(article, "h1").length, 1);
    const articleHeader = article.match(/<article\b[^>]*>\s*<header\b[^>]*>([\s\S]*?)<\/header>/u)?.[1] ?? "";
    assert.equal(stripMarkup(articleHeader), `← Selected Research ${title} GitHub Full Manuscript`, "Selected Research headers contain only the return link, title, and source links.");
    assert.equal(openingTags(article, "table").length, tables);
    assert.deepEqual(openingTags(article, "h2").map((tag) => attribute(tag, "data-source-number")).filter(Boolean), Array.from({ length: sections }, (_, index) => String(index + 1)), `${slug}: every numbered main chapter is rendered once and in order.`);
    assert.match(article, /aria-label="Article contents"/u);
    assert.match(article, /This page includes the complete (?:main text and references|abstract, five main sections)/u);
    assert.match(article, new RegExp(`href="/#${slug}"`, "u"));
    const current = openingTags(article, "a").find((tag) => attribute(tag, "aria-current") === "page");
    assert.equal(attribute(current ?? "", "href"), "/");
    const githubLink = openingTags(articleHeader, "a").find((tag) => attribute(tag, "href") === `https://github.com/130U/${repository}`);
    assert.ok(githubLink, `${slug}: the article header links to its actual source repository.`);
  }
});

test("Experience presents five numbered sections and all eighteen approved entries in order", async () => {
  const html = await routeHtml("/experience/");
  const expected = await approvedExperience();
  assert.deepEqual(expected.map(({ id }) => id), Array.from({ length: 18 }, (_, index) => index + 1));
  assert.deepEqual(expected.map(({ keyContributions }) => keyContributions.length), [7, 5, 6, 6, 9, 7, 6, 5, 5, 5, 5, 7, 5, 6, 1, 1, 2, 4]);
  assert.deepEqual(experienceEntries(html).map(({ id }) => id), expected.map(({ id }) => id));
  assert.equal(openingTags(html, "h1").length, 1);
  assert.match(html, /<h1>Experience<\/h1>/u);
  const directory = [...html.matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/giu)]
    .find((match) => attribute(match[1], "aria-label") === "Experience sections");
  assert.ok(directory);
  const sectionLinks = [...directory[2].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/giu)];
  assert.deepEqual(sectionLinks.map((match) => attribute(match[1], "href")), DOMAINS.map(([, slug]) => `#${slug}`));
  for (const [index, [name, slug, ids]] of DOMAINS.entries()) {
    const directoryLabels = [...sectionLinks[index][2].matchAll(/<span\b([^>]*)>([\s\S]*?)<\/span>/gu)];
    assert.deepEqual(directoryLabels.map((match) => stripMarkup(match[2])), [name, "View"]);
    assert.equal(attribute(directoryLabels[1][1], "aria-hidden"), "true", "The repeated visual action must not lengthen each section link's accessible name.");
    assert.ok(openingTags(html, "section").some((tag) => attribute(tag, "id") === slug));
    assert.equal(stripMarkup(elementHtmlById(html, `${slug}-heading`)), name);
    assert.deepEqual(expected.filter(({ categoryId }) => categoryId === String(index + 1).padStart(2, "0")).map(({ id }) => id), ids);
  }
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/u)?.[1] ?? "";
  const approvedDisclosure = JSON.parse(await readFile(path.join(ROOT, "content", "experience-showcase.json"), "utf8")).categories.find(({ id }) => id === "01").disclosure;
  const disclosure = [...html.matchAll(/<aside\b([^>]*)>([\s\S]*?)<\/aside>/giu)].find((match) => attribute(match[1], "data-experience-disclosure") !== undefined);
  assert.ok(disclosure, "The AI section must introduce its approved confidentiality disclosure");
  assert.equal(stripMarkup(disclosure[2].match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/iu)?.[1] ?? ""), approvedDisclosure.title);
  assertApprovedInline(disclosure[2].match(/<p\b[^>]*>([\s\S]*?)<\/p>/iu)?.[1] ?? "", approvedDisclosure.text);
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
    if (entry.categoryId === "01") assertApprovedInline(summaries[0][2], entry.summary);
    else assert.equal(stripMarkup(summaries[0][2]), normalizeSpace(entry.summary));
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
  assert.deepEqual(expected.filter(({ keyContributionDetails }) => keyContributionDetails).map((entry) => ({
    id: entry.id,
    groups: Object.entries(entry.keyContributionDetails).map(([index, detail]) => ({ index, ordered: detail.ordered, count: detail.items.length })),
  })), [
    { id: 2, groups: [{ index: "2", ordered: false, count: 4 }] },
    { id: 3, groups: [{ index: "0", ordered: true, count: 3 }] },
  ], "All seven original nested contributions must survive under their correct parent items");
});

test("the ten nonresearch detail routes keep metadata in separate label/value rows", async () => {
  const metadataStyles = await readFile(path.join(ROOT, "app", "components", "experience", "Experience.module.css"), "utf8");
  const metadataRules = [...metadataStyles.matchAll(/(?:^|\n)\s*\.metadata\s*\{([^}]+)\}/gu)];
  assert.ok(metadataRules.length > 0, "Experience metadata needs an explicit layout rule");
  for (const [, declarations] of metadataRules) {
    assert.match(declarations, /grid-template-columns:\s*1fr\s*;/u, "Metadata must remain a single column at every defined breakpoint");
  }
  assert.match(metadataStyles, /\.metadata\s*>\s*div\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*6\.5em minmax\(0,\s*1fr\)[^}]*align-items:\s*baseline/u, "Metadata labels and values share a baseline, with label width scaling with the text size");
  assert.match(metadataStyles, /@media\s*\(width\s*<\s*420px\)\s*\{\s*\.metadata\s*>\s*div\s*\{[^}]*grid-template-columns:\s*1fr/u, "Narrow screens stack each label above its value without rearranging metadata rows");
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

test("About preserves both degrees and the advisor record while linking to all 49 courses on their own page", async () => {
  for (const route of ["/", "/education/"]) {
    const html = await routeHtml(route);
    assert.equal(elementsWithClass(html, "article", "education-entry").length, 2);
    const education = elementHtmlById(html, "education");
    const coursework = elementHtmlById(education, "coursework");
    const courseworkLink = coursework.match(/<a\b([^>]*)>([\s\S]*?)<\/a>/u);
    assert.equal(attribute(courseworkLink?.[1] ?? "", "href"), "/coursework/");
    assert.equal(stripMarkup(courseworkLink?.[2] ?? ""), "View coursework");
    assert.equal(openingTags(education, "details").length, 0, "The Education control navigates to a separate page.");
    assert.equal(elementsWithClass(html, "ul", "course-list").length, 0, "Course lists must not consume space on About.");
    for (const course of courseworkGroups.flatMap((group) => group.courses)) {
      assert.ok(!stripMarkup(education).includes(course), `${route}: ${course} belongs on the coursework page.`);
    }
    const text = stripMarkup(html);
    for (const record of ["Master of Engineering in Risk Engineering", "Financial Risk Concentration", "Bachelor of Science in Mathematics", "Dual-Degree Undergraduate Program", "Pratt School of Engineering Merit Scholarship", "Undergraduate Merit Scholarship", "Academic Advisor:", "Mark Borsuk, Ph.D."]) {
      assert.ok(text.includes(record), `${route} is missing ${record}`);
    }
    assert.equal((text.match(/Duke University/gu) ?? []).length, 1);
    assert.doesNotMatch(text, /Sequoia Fellow/u);
    assert.doesNotMatch(text, /highest-tier merit awards/u);
  }

  const html = await routeHtml("/coursework/");
  assert.equal(stripMarkup(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/u)?.[1] ?? ""), "Selected Coursework");
  assert.equal(canonicalUrl(html), `${SITE_ORIGIN}/coursework/`);
  assert.ok(openingTags(html, "a").some((tag) => attribute(tag, "href") === "/#education"), "Coursework must return to Education.");
  const current = openingTags(html, "a").filter((tag) => attribute(tag, "aria-current") === "page");
  assert.deepEqual(current.map((tag) => attribute(tag, "href")), ["/"]);
  const categories = ["mathematics", "ai-and-data-science", "finance-and-economics", "law-ethics-and-global-affairs"];
  const directory = [...html.matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/giu)]
    .find((match) => attribute(match[1], "aria-label") === "Coursework sections");
  assert.ok(directory);
  const links = [...directory[2].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/giu)];
  assert.deepEqual(links.map((match) => attribute(match[1], "href")), categories.map((id) => `#${id}`));
  const lists = elementsWithClass(html, "ul", "course-list");
  assert.equal(lists.length, 4);
  assert.equal(lists.reduce((total, list) => total + (list[2].match(/<li\b/giu) ?? []).length, 0), 49);
  for (const [index, group] of courseworkGroups.entries()) {
    const number = String(index + 1).padStart(2, "0");
    assert.equal(inlineText(links[index][2]), `${number}${group.title}`);
    const section = elementHtmlById(html, categories[index]);
    assert.match(section, new RegExp(`aria-hidden="true"[^>]*>${number}<`, "u"));
    assert.equal(stripMarkup(section.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/u)?.[1] ?? ""), group.title);
    const list = elementsWithClass(section, "ul", "course-list")[0];
    assert.ok(list);
    assert.deepEqual([...list[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gu)].map((match) => stripMarkup(match[1])), group.courses, "Every course retains its approved wording and order.");
    assert.equal(openingTags(list[2], "a").length, 0, "Course names are static text, not empty navigation targets.");
  }
});

test("the website uses its local brand assets without remote runtime resources", async () => {
  const assets = (await walk(path.join(OUT, "assets"))).map((file) => path.relative(OUT, file).replaceAll("\\", "/")).sort();
  assert.deepEqual(assets, EXPECTED_PUBLIC_ASSETS);
  for (const route of ROUTES) {
    const html = await routeHtml(route);
    for (const tag of [...openingTags(html, "script"), ...openingTags(html, "img"), ...openingTags(html, "source")]) {
      for (const name of ["src", "srcset"]) {
        const value = attribute(tag, name)?.trim();
        if (!value) continue;
        const candidates = name === "srcset" ? value.split(",").map((candidate) => candidate.trim().split(/\s+/u)[0]) : [value];
        for (const candidate of candidates) {
          const resource = new URL(candidate, new URL(route, SITE_ORIGIN));
          assert.equal(resource.origin, SITE_ORIGIN, `${route}: ${name} resources must be served from this site.`);
        }
      }
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
  const experience = await readFile(path.join(ROOT, "app", "components", "experience", "Experience.module.css"), "utf8");
  assert.match(globals, /@media \(pointer:\s*coarse\)[\s\S]*?\.primary-nav a\s*\{[^}]*min-height:\s*44px/u);
  assert.match(home, /@media \(pointer:\s*coarse\)[\s\S]*?\.contactStrip a[\s\S]*?min-height:\s*44px/u);
  assert.match(globals, /width:\s*min\(100%,\s*1440px\)/u);
  assert.match(globals, /\.content-column\s*\{[\s\S]*?grid-template-columns:\s*repeat\(12,[\s\S]*?padding:\s*176px 0 144px/u);
  assert.match(globals, /\.structural-guide-tick\s*\{[\s\S]*?position:\s*sticky[\s\S]*?height:\s*20px/u);
  assert.match(experience, /\.directory\s*\{[^}]*grid-template-columns:\s*1fr/u);
  assert.match(experience, /\.section\s*\{[^}]*grid-template-columns:\s*repeat\(12,/u);
  assert.match(experience, /\.sectionBody\s*\{[^}]*grid-column:\s*2\s*\/\s*span\s*10[^}]*max-width:\s*var\(--reading-measure\)/u);
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
  assert.match(experience, /\.metadata\s*\{[^}]*grid-template-columns:\s*1fr/u);
  assert.match(experience, /\.entryTitle\s*\{[^}]*font-size:\s*var\(--type-subheading\)/u);
  assert.match(experience, /\.contributions > ul\s*\{[^}]*padding-left:\s*19px/u);
  assert.match(experience, /\.contributions > ul > li\s*\{[^}]*padding-left:\s*3px/u);
  assert.deepEqual(Object.keys(packageJson.dependencies).sort(), ["@mathjax/mathjax-tex-font", "@mathjax/src", "next", "react", "react-dom"]);
  assert.equal(packageJson.dependencies["@mathjax/src"], "4.1.3");
  assert.equal(packageJson.dependencies["@mathjax/mathjax-tex-font"], "4.1.3");
});

test("shared typography source roles preserve Inter numerals, article names, metadata, and mathematical scale", async () => {
  const [fonts, exportedFonts, globals, articles, experience, math, home, coursework] = await Promise.all([
    readFile(path.join(ROOT, "public", "assets", "fonts", "inter.css"), "utf8"),
    readFile(path.join(OUT, "assets", "fonts", "inter.css"), "utf8"),
    readFile(path.join(ROOT, "app", "globals.css"), "utf8"),
    readFile(path.join(ROOT, "app", "past-experience", "components", "LegalPaperPage.module.css"), "utf8"),
    readFile(path.join(ROOT, "app", "components", "experience", "Experience.module.css"), "utf8"),
    readFile(path.join(ROOT, "app", "components", "research", "ResearchMath.module.css"), "utf8"),
    readFile(path.join(ROOT, "app", "home.module.css"), "utf8"),
    readFile(path.join(ROOT, "app", "coursework", "coursework.module.css"), "utf8"),
  ]);
  const rule = (css, selector) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const match = css.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]+)\\}`, "u"));
    assert.ok(match, `Missing typography role ${selector}`);
    return match[1];
  };
  const fontRoot = rule(fonts, ":root");
  assert.equal(exportedFonts, fonts, "The export must ship the shared font stylesheet verbatim");
  assert.match(fontRoot, /--font-text:\s*"Inter",\s*sans-serif\s*;/u);
  assert.match(fontRoot, /font-optical-sizing:\s*none\s*;/u);
  assert.match(fontRoot, /font-variation-settings:\s*"opsz"\s+14\s*;/u);
  assert.match(fontRoot, /font-variant-numeric:\s*lining-nums\s+proportional-nums\s*;/u);
  assert.match(fontRoot, /font-synthesis:\s*none\s*;/u);
  assert.doesNotMatch(experience, /font-optical-sizing|font-variation-settings/u, "Experience must inherit the global optical settings rather than create a different font instance");
  assert.match(rule(globals, "body"), /font-family:\s*var\(--font-text\)/u);
  const tokens = rule(globals, ":root");
  assert.match(tokens, /--type-subheading:\s*1\.125rem\s*;/u);
  assert.match(tokens, /--type-index:\s*1\.125rem\s*;/u);
  assert.match(tokens, /--type-reading:\s*0\.875rem\s*;/u);
  assert.match(tokens, /--type-math:\s*1\.15em\s*;/u);
  for (const css of [home, experience, coursework]) {
    assert.match(rule(css, ".sectionIndex"), /font-size:\s*var\(--type-index\)\s*;/u, "Section indices share the 18px semantic role.");
  }
  for (const css of [experience, coursework]) {
    assert.match(rule(css, ".directory a"), /font-size:\s*var\(--type-subheading\)\s*;/u, "Top-level directories share the 18px semantic role.");
  }
  assert.match(rule(coursework, ".sectionBody h2"), /font-size:\s*var\(--type-heading\)\s*;/u);
  assert.match(rule(coursework, ".courseList"), /font-size:\s*var\(--type-reading\)\s*;/u);
  for (const declarations of [rule(articles, ".paper .header h1"), rule(experience, ".detailPage .detailHeader h1"), rule(experience, ".entryTitle")]) {
    assert.match(declarations, /font-size:\s*var\(--type-subheading\)\s*;/u, "Article and experience names must share the 18px semantic role");
    assert.match(declarations, /font-weight:\s*600\s*;/u);
    assert.match(declarations, /line-height:\s*var\(--subheading-leading\)\s*;/u);
  }
  assert.match(rule(math, ".formula"), /font-size:\s*var\(--type-math\)\s*;/u);
  assert.match(rule(math, ".inline"), /font-size:\s*1em\s*;/u, "Inline expressions must track surrounding prose rather than the display-math scale");
  assert.doesNotMatch(rule(math, ".display"), /font-size:/u, "Display expressions retain the shared 1.15em formula role");
  assert.match(rule(math, ".number"), /font:\s*inherit\s*;/u);
  assert.match(rule(math, ".number"), /font-variant-numeric:\s*lining-nums\s+proportional-nums\s*;/u);
  assert.match(rule(math, ".number sup"), /font-size:\s*0\.75em\s*;/u);
  assert.match(rule(math, ".number sup"), /vertical-align:\s*super\s*;/u);
  assert.match(rule(experience, ".metadata > div"), /grid-template-columns:\s*6\.5em minmax\(0,\s*1fr\)\s*;/u);
  assert.match(rule(experience, ".contributions > ul > li + li"), /border-top:\s*1px solid var\(--rule\)\s*;/u);
  assert.match(rule(experience, ".contributions > ul > li + li"), /padding-top:\s*16px\s*;/u);
  assert.doesNotMatch(experience, /\.contributions\s+li(?:\s*\+\s*li)?\s*\{/u, "Contribution spacing and dividers must not cascade into nested items");
  const nestedDetails = rule(experience, ".contributionDetails");
  assert.match(nestedDetails, /font-size:\s*var\(--type-reading\)\s*;/u);
  assert.match(nestedDetails, /gap:\s*8px\s*;/u);
  assert.match(nestedDetails, /padding-left:\s*20px\s*;/u);
  assert.doesNotMatch(nestedDetails, /border|font-family/u, "Nested lists inherit the same typeface and avoid per-item divider styling");

  const researchRoutes = CANONICAL_ROUTES.filter((route) => route.startsWith("/education/") || route.startsWith("/past-experience/"));
  const stylesheetCache = new Map();
  for (const route of [...researchRoutes, ...EXPERIENCE_DETAIL_ROUTES]) {
    const html = await routeHtml(route);
    const header = html.match(/<header\b([^>]*)>[\s\S]*?<h1\b/iu);
    assert.ok(header, `${route} needs a title inside its semantic page header`);
    const headerClass = researchRoutes.includes(route) ? "_header" : "_detailHeader";
    assert.ok(attribute(header[1], "class")?.split(/\s+/u).some((name) => name.endsWith(headerClass)), `${route} must bind its title to the shared article-name role`);
    const stylesheetHrefs = openingTags(html, "link").filter((tag) => attribute(tag, "rel") === "stylesheet").map((tag) => attribute(tag, "href"));
    const loadedStyles = await Promise.all(stylesheetHrefs.map(async (href) => {
      assert.ok(href?.startsWith("/"), "Typography assets must remain local");
      if (!stylesheetCache.has(href)) stylesheetCache.set(href, await readFile(path.join(OUT, ...href.split("/").filter(Boolean)), "utf8"));
      return stylesheetCache.get(href);
    }));
    assert.ok(loadedStyles.some((css) => /font-optical-sizing:\s*none/u.test(css) && /font-variation-settings:\s*"opsz"\s+14/u.test(css) && /font-variant-numeric:\s*lining-nums\s+proportional-nums/u.test(css)), `${route} must load the compiled shared Inter settings`);
  }
});
