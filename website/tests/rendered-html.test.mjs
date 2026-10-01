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
const ROUTES = [
  "/",
  "/education/",
  "/now/",
  "/past-experience/",
  "/past-experience/artificial-intelligence/",
  "/past-experience/data-science/",
  LAW_ROUTE,
  "/past-experience/finance/",
  "/past-experience/stem-academic-competitions-and-training/",
  ...ARTICLE_ROUTES,
];
const NAVIGATION = [
  ["Home", "/"],
  ["Education", "/education/"],
  ["Past Experience", "/past-experience/"],
  ["Current Chapter", "/now/"],
];
// Expected entry and bullet counts are independent of the parser and route registry.
const DOMAINS = [
  ["AI Research and Engineering", "/past-experience/artificial-intelligence/", 3, 24],
  ["Data Science", "/past-experience/data-science/", 3, 40],
  ["Legal Research and Policy Analysis", LAW_ROUTE, 1, 8],
  ["Finance and Consulting", "/past-experience/finance/", 5, 24],
  ["STEM Academic Competitions and Training", "/past-experience/stem-academic-competitions-and-training/", 2, 7],
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

test("the static export contains thirteen website routes and the architecture viewer", async () => {
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
    const absolute = new URL(route, SITE_ORIGIN).toString();
    assert.equal(canonicalUrl(html), absolute);
    assert.equal(metaContent(html, "property", "og:url"), absolute);
    assert.equal(metaContent(html, "name", "theme-color"), "#f7f6f5");
    assert.deepEqual(primaryNavigation(html), NAVIGATION);
    const csp = metaContent(html, "http-equiv", "Content-Security-Policy") ?? "";
    for (const directive of requiredCsp) assert.ok(csp.includes(directive), `${route} lost ${directive}`);
  }
});

test("Home presents the interactive dither identity before the profile", async () => {
  const home = await routeHtml("/");
  assert.equal(openingTags(home, "canvas").length, 1);
  assert.match(home, /data-state="loading"/u);
  assert.match(home, /data-visible-copy-role="visual-identity"/u);
  assert.match(home, /<button\b[^>]*type="button"[^>]*>[\s\S]*?<canvas/u);
  assert.match(home, /THEODORE[\s\S]*?OUYANG/u);
  assert.match(home, /id="home-profile"/u);
  for (const index of ["01", "02", "03"]) {
    assert.match(home, new RegExp(`aria-hidden="true"[^>]*>${index}<`, "u"));
  }
  assert.match(stripMarkup(home), /genuinely useful in everyday life/u);
  assert.equal(openingTags(home, "img").length, 0);
  for (const route of ROUTES.slice(1)) assert.equal(openingTags(await routeHtml(route), "canvas").length, 0);
});

test("inner routes present text-focused pages and the Current Chapter introduction", async () => {
  for (const route of ["/education/", "/past-experience/", "/now/"]) {
    const html = await routeHtml(route);
    assert.equal(openingTags(html, "img").length, 0, `${route} must use text-focused content`);
  }
  const nowHtml = await routeHtml("/now/");
  const now = stripMarkup(nowHtml);
  assert.match(nowHtml, /<h1[^>]*>Current Chapter<\/h1>/u);
  assert.match(nowHtml, /class="page-intro-support">Exploring AI in everyday life<\/p>/u);
  assert.match(now, /Exploring AI in everyday life Theodore Ouyang/u);
  assert.match(now, /Theodore Ouyang is exploring how artificial intelligence/u);
  assert.match(now, /practical applications that solve real problems/u);
  assert.match(now, /expand human capability/u);
});

test("Past Experience presents five domains, 14 entries, and 103 bullets", async () => {
  const directory = await routeHtml("/past-experience/");
  assert.match(directory, /<h1>Past Experience<\/h1>/u);
  assert.match(directory, /class="page-intro-support">Experience through September 2026<\/p>/u);
  assert.equal(elementsWithClass(directory, "a", "domain-directory-link").length, 5);
  let entries = 0;
  let bullets = 0;
  for (const [name, route, expectedEntries, expectedBullets] of DOMAINS) {
    const html = await routeHtml(route);
    assert.match(stripMarkup(html), new RegExp(name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));
    const routeEntries = elementsWithClass(html, "article", "archive-entry");
    const routeIndices = elementsWithClass(html, "div", "archive-entry-number").map(
      (entry) => stripMarkup(entry[2]),
    );
    const routeBullets = elementsWithClass(html, "ul", "archive-bullets").reduce((total, list) => total + (list[2].match(/<li\b/giu) ?? []).length, 0);
    assert.equal(routeEntries.length, expectedEntries);
    assert.deepEqual(
      routeIndices,
      Array.from({ length: expectedEntries }, (_, index) =>
        String.fromCharCode("a".charCodeAt(0) + index),
      ),
    );
    assert.equal(routeBullets, expectedBullets);
    entries += routeEntries.length;
    bullets += routeBullets;
  }
  assert.equal(entries, 14);
  assert.equal(bullets, 103);
});

test("experience pages retain the resume project hierarchy and consulting placement", async () => {
  const ai = await routeHtml("/past-experience/artificial-intelligence/");
  const foundationModel = elementsWithClass(ai, "article", "archive-entry")[0][2];
  assert.match(foundationModel, /<h2>Duke University × Top-Tier Foundation Model Company<\/h2>/u);
  assert.deepEqual(elementsWithClass(foundationModel, "h3", "entry-project").map((match) => stripMarkup(match[2])), [
    "Project 1: Bayesian Quality Control and Adaptive Review",
    "Project 2: Financial Preference Data Engineering and Model Evaluation",
  ]);
  assert.equal(elementsWithClass(foundationModel, "h4", "entry-section-heading").length, 0);
  assert.deepEqual(elementsWithClass(foundationModel, "ul", "archive-bullets").map((match) => (match[2].match(/<li\b/gu) ?? []).length), [6, 6]);
  assert.match(stripMarkup(foundationModel), /September 2023 – September 2026/u);
  assert.match(ai, /<strong>Turned reliability estimates into an adaptive review policy\.<\/strong>/u);
  assert.match(ai, /<a href="https:\/\/arxiv\.org\/abs\/2210\.06812">CROWDLAB \(Goh et al\., 2022\)<\/a>/u);
  assert.match(stripMarkup(ai), /Partner identities, proprietary model details, and project-level performance metrics are subject to confidentiality obligations\./u);
  assert.match(stripMarkup(ai), /University–industry research collaboration with a leading global alternative asset manager \(\$300B\+ AUM as of June 2026; confidential partner\)/u);
  const finance = await routeHtml("/past-experience/finance/");
  assert.deepEqual(elementsWithClass(finance, "article", "archive-entry").map((match) => stripMarkup(match[2].match(/<h2>(.*?)<\/h2>/u)[1])), [
    "Jones Lang LaSalle Capital Markets Team", "Hubble Network", "SAIF Partners", "CITIC Securities", "EY-Parthenon",
  ]);
  const ey = elementsWithClass(finance, "article", "archive-entry")[4][2];
  assert.match(stripMarkup(ey), /Summer Intern Dates May 2021 – August 2021/u);
  assert.match(stripMarkup(ey), /Digital Transformation and Business-Line Restructuring/u);
  assert.match(stripMarkup(ey), /Helped the team review and restructure business lines and improve visibility into the business/u);
  const legal = await routeHtml(LAW_ROUTE);
  assert.doesNotMatch(legal, /Hubble Network/u);
  assert.deepEqual(elementsWithClass(legal, "h3", "entry-project").map((match) => stripMarkup(match[2])), [
    "Project 1: Autonomous Authority in Space: Risk Tradeoffs and the Law of Delegation",
    "Project 2: Small States and the Governance of Strategic Space Dependence",
    "Project 3: Who May Choose the Lesser Risk: Solar Geoengineering and the Legal Duties of Comparison and Continuity",
    "Project 4: Mangrove Restoration and the Limits of Compensatory Mitigation: Lessons from Florida for the Greater Bay Area",
  ]);
  for (const route of ARTICLE_ROUTES) {
    assert.equal(openingTags(legal, "a").filter((tag) => attribute(tag, "href") === route).length, 1, `Missing unique reading link to ${route}`);
  }
  for (const [slug] of ARTICLES) assert.ok(legal.includes(`id="${slug}"`), `Missing experience return anchor #${slug}`);
});

test("all five domains retain their updated introductions and substantive source claims", async () => {
  const sourceClaims = [
    ["/past-experience/artificial-intelligence/", "Developed and tested engineering adaptations of statistical learning, model evaluation, and interpretable analysis to address data validity, expert judgment, and the reliability of research conclusions."],
    ["/past-experience/data-science/", "Applied statistical learning, data engineering, and market analysis to counterparty screening, market entry, and green-credit assessment."],
    [LAW_ROUTE, "Authored four research papers examining how legal institutions allocate authority and responsibility under technological and environmental uncertainty."],
    ["/past-experience/finance/", "Applied market research, valuation analysis, and risk screening to real estate acquisition advice, technology commercialization, dental-sector research, and equity research."],
    ["/past-experience/stem-academic-competitions-and-training/", "Combined advanced physics and mathematics Olympiad training with peer mentoring and independent instruction."],
  ];
  for (const [route, sourceClaim] of sourceClaims) assert.ok(stripMarkup(await routeHtml(route)).includes(sourceClaim), `${route} lost its source introduction`);
  const dataScience = stripMarkup(await routeHtml("/past-experience/data-science/"));
  assert.ok(dataScience.includes("Owned data-driven business development for new issuers as the sole dedicated contributor, reporting directly to co-founder Asher Gottesman."));
  assert.ok(dataScience.includes("Diagnosed gaps between token-market performance and partnership value through issuer-level error analysis."));
  const stem = stripMarkup(await routeHtml("/past-experience/stem-academic-competitions-and-training/"));
  assert.ok(stem.includes("Coached multiple students participating in USAPhO and the U.S. Physics Team selection process"));
});

test("law papers preserve article identity, chapter navigation, and bidirectional footnotes", async () => {
  for (const [slug, title, subtitle, expectedFootnotes] of ARTICLES) {
    const route = `${LAW_ROUTE}${slug}/`;
    const html = await routeHtml(route);
    const text = stripMarkup(html);
    const titleMatch = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/iu);
    assert.ok(titleMatch, `${route} is missing its article title`);
    assert.equal(stripMarkup(titleMatch[1]), title);
    if (subtitle) assert.ok(text.includes(subtitle), `${route} lost its original subtitle`);
    assert.ok(text.includes("Letao Ouyang"), `${route} lost its original author name`);
    assert.ok(text.includes("December 2024"), `${route} lost its original date`);
    assert.ok(text.includes("Abstract"), `${route} is missing its abstract`);
    assert.equal(openingTags(html, "article").length, 1, `${route} must have one article reading region`);
    assert.ok(openingTags(html, "a").some((tag) => attribute(tag, "href") === `${LAW_ROUTE}#${slug}`), `${route} is missing its return link`);

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
      { href: "#abstract-heading", text: "Abstract" },
      ...source.blocks.filter(({ type }) => type === "heading").map(({ id, text }) => ({ href: `#${id}`, text: normalizeSpace(text) })),
      { href: "#footnotes", text: "Footnotes" },
    ];
    assert.deepEqual(links, expectedLinks, `${slug} must link the abstract, every source heading, and footnotes in reading order`);
    const targets = [...openingTags(html, "h2"), ...openingTags(html, "h3"), ...openingTags(html, "section")];
    for (const { href } of expectedLinks) {
      assert.ok(targets.some((tag) => attribute(tag, "id") === href.slice(1)), `${slug} has a contents target that needs JavaScript: ${href}`);
    }

    const frontmatter = html.match(/<article\b[^>]*>[\s\S]*?<header\b[^>]*>([\s\S]*?)<\/header>/iu);
    assert.ok(frontmatter, `${slug} lost its article frontmatter`);
    const metadata = [...frontmatter[1].matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/giu)].map((match) => inlineText(match[1]));
    assert.deepEqual(metadata, [
      "Research paper",
      ...(source.subtitle ? [normalizeSpace(source.subtitle)] : []),
      `${source.author}${source.acknowledgment ? "*" : ""}`,
      ...(source.date ? [normalizeSpace(source.date)] : []),
    ], `${slug} must preserve source publication details without adding journal claims`);
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
    const abstractParagraphs = [...abstract[2].matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/giu)].map((match) => inlineText(match[1]));
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

test("Education presents both degrees, 49 courses, and the advisor record", async () => {
  const html = await routeHtml("/education/");
  assert.equal(elementsWithClass(html, "article", "education-entry").length, 2);
  const lists = elementsWithClass(html, "ul", "course-list");
  assert.equal(lists.length, 4);
  assert.equal(lists.reduce((total, list) => total + (list[2].match(/<li\b/giu) ?? []).length, 0), 49);
  assert.match(html, /Mark Borsuk, Ph\.D\./u);
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
  assert.deepEqual(routes, [...ROUTES].sort());
});

test("the production design contract is restrained and dependency-light", async () => {
  const globals = await readFile(path.join(ROOT, "app", "globals.css"), "utf8");
  const home = await readFile(path.join(ROOT, "app", "home.module.css"), "utf8");
  const entrance = await readFile(path.join(ROOT, "app", "components", "dithered-entrance", "DitheredEntrance.module.css"), "utf8");
  const navigation = await readFile(path.join(ROOT, "app", "components", "SiteNavigation.tsx"), "utf8");
  const structuralGrid = await readFile(path.join(ROOT, "app", "components", "StructuralGrid.tsx"), "utf8");
  const layout = await readFile(path.join(ROOT, "app", "layout.tsx"), "utf8");
  const packageJson = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  for (const token of ["--page: #f7f6f5", "--ink: #0b0b0b", "--muted: #70706c", "--accent: #2200ff", "repeat(15, minmax(0, 1fr))"]) assert.ok(globals.includes(token));
  assert.doesNotMatch(globals, /box-shadow|backdrop-filter/u);
  assert.doesNotMatch(home, /box-shadow|backdrop-filter|linear-gradient/u);
  assert.match(entrance, /min\(76vw, 72dvh, 720px\)/u);
  assert.match(entrance, /min\(92vw, 68dvh, 380px\)/u);
  assert.match(entrance, /aspect-ratio:\s*1/u);
  assert.match(entrance, /\.scrollCue\s*\{[\s\S]*?color:\s*var\(--muted\)[\s\S]*?font-size:\s*var\(--type-label\)/u);
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
  assert.match(entrance, /\.fallback\s*\{[^}]*opacity:\s*1/u);
  assert.match(entrance, /\.entrance\[data-state="ready"\] \.fallback\s*\{\s*opacity:\s*0/u);
  assert.match(navigation, /wordmark-lockup[\s\S]*?wordmark-mark[\s\S]*?wordmark-name[\s\S]*?>Theodore Ouyang<\/span>/u);
  assert.match(layout, /assets\/brand\/lo-mark\.svg/u);
  assert.match(globals, /\.entry-metadata\s*\{[\s\S]*?grid-template-columns:\s*1fr/u);
  assert.match(globals, /\.entry-project\s*\{[\s\S]*?color:\s*var\(--ink\)/u);
  assert.match(globals, /\.archive-bullets li::before\s*\{[\s\S]*?width:\s*3px[\s\S]*?content:\s*""/u);
  assert.deepEqual(Object.keys(packageJson.dependencies).sort(), ["next", "react", "react-dom"]);
});
