import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const OUT = path.join(ROOT, "out");
const SITE_ORIGIN = "https://www.theodoreoy.com";
const ROUTES = [
  "/",
  "/education/",
  "/now/",
  "/past-experience/",
  "/past-experience/artificial-intelligence/",
  "/past-experience/data-science/",
  "/past-experience/environmental-social-and-governance/",
  "/past-experience/finance/",
  "/past-experience/stem-academic-competitions-and-training/",
];
const NAVIGATION = [
  ["Home", "/"],
  ["Education", "/education/"],
  ["Past Experience", "/past-experience/"],
  ["Current Chapter", "/now/"],
];
const DOMAINS = [
  ["Artificial Intelligence", "/past-experience/artificial-intelligence/", 4, 24],
  ["Data Science", "/past-experience/data-science/", 3, 19],
  ["Environmental, Social, and Governance", "/past-experience/environmental-social-and-governance/", 4, 8],
  ["Finance", "/past-experience/finance/", 3, 28],
  ["STEM Academic Competitions and Training", "/past-experience/stem-academic-competitions-and-training/", 2, 14],
];
const PROTECTED_SOURCE_HASHES = new Map([
  ["app/education/page.tsx", "ce3c34631d07d9e8f546670761392d9d9372cec9103970f8aa849267c795f28d"],
  ["app/now/page.tsx", "c410e1c9109889f018983698bd3cf276e4d34aa2db1e96d56f96cefb34adb7e6"],
  ["app/past-experience/page.tsx", "c22ffecb129567be473ce2230103fd80d954faeaa6ebae171c9418085e6769e9"],
  ["app/past-experience/[slug]/page.tsx", "a89b781c0a6a74b9295635d5495c4e2cc2cf2d890cc879578ebfd04a9f6db84b"],
  ["app/past-experience/components/ExperienceDomainPage.tsx", "098da21aa9d56f0ad56c4dd96997419988a0c51557507fe7748bbccb5913f3e0"],
  ["app/lib/content/experience.ts", "01875681354d96713bf3025ce48e7f56febf3616ef3c8d921e48fb9f09846d72"],
  ["content/past-experience/archive-through-2026-06-30.md", "8f810e9ac91b58ea9dd57aeebc425c6db488c99ce8507e94978c9cdccda0fcf4"],
]);
const EXPECTED_PUBLIC_ASSETS = [
  "assets/brand/apple-touch-icon.png",
  "assets/brand/favicon-16.png",
  "assets/brand/favicon-32.png",
  "assets/brand/favicon.ico",
  "assets/brand/og-1774.jpg",
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

function attribute(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = tag.match(new RegExp(`(?:^|\\s)${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "iu"));
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3] ?? "") : undefined;
}

function openingTags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, "giu")) ?? [];
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

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function normalizedTextBytes(bytes) {
  return Buffer.from(bytes.toString("utf8").replace(/\r\n?/gu, "\n"), "utf8");
}

test("the static export contains exactly the approved nine public routes", async () => {
  assert.deepEqual(await exportedRoutes(), [...ROUTES].sort());
  assert.ok(existsSync(path.join(OUT, "404.html")));
});

test("every route keeps canonical metadata, CSP, and the same navigation", async () => {
  const requiredCsp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "script-src-attr 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
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

test("Home alone has the enlarged Balanced dither before the preserved profile copy", async () => {
  const home = await routeHtml("/");
  assert.equal(openingTags(home, "canvas").length, 1);
  assert.match(home, /data-state="loading"/u);
  assert.match(home, /data-visible-copy-role="visual-identity"/u);
  assert.match(home, /<button\b[^>]*type="button"[^>]*>[\s\S]*?<canvas/u);
  assert.match(home, /THEODORE[\s\S]*?OUYANG/u);
  assert.match(home, /id="home-profile"/u);
  assert.match(stripMarkup(home), /genuinely useful in everyday life/u);
  assert.equal(openingTags(home, "img").length, 0);
  assert.equal(elementsWithClass(home, "aside", "profile-sidebar").length, 0);
  for (const route of ROUTES.slice(1)) assert.equal(openingTags(await routeHtml(route), "canvas").length, 0);
});

test("inner routes keep the rail concise and retain approved page content", async () => {
  for (const route of ["/education/", "/past-experience/", "/now/"]) {
    const html = await routeHtml(route);
    const sidebar = elementsWithClass(html, "aside", "profile-sidebar");
    assert.equal(sidebar.length, 0, `${route} retained the redundant profile sidebar`);
    assert.equal(openingTags(html, "img").length, 0, `${route} retained the portrait`);
  }
  const now = stripMarkup(await routeHtml("/now/"));
  assert.match(now, /Exploring AI in everyday life\./u);
  assert.match(now, /Theodore Ouyang is exploring how artificial intelligence/u);
  assert.match(now, /practical applications that solve real problems/u);
  assert.match(now, /expand human capability/u);
  assert.doesNotMatch(now, /\bI am\b|As an AI enthusiast/u);
});

test("Past Experience keeps five domains, 16 entries, and 93 bullets", async () => {
  const directory = await routeHtml("/past-experience/");
  assert.equal(elementsWithClass(directory, "a", "domain-directory-link").length, 5);
  let entries = 0;
  let bullets = 0;
  for (const [name, route, expectedEntries, expectedBullets] of DOMAINS) {
    const html = await routeHtml(route);
    assert.match(stripMarkup(html), new RegExp(name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));
    const routeEntries = elementsWithClass(html, "article", "archive-entry");
    const routeBullets = elementsWithClass(html, "ul", "archive-bullets").reduce((total, list) => total + (list[2].match(/<li\b/giu) ?? []).length, 0);
    assert.equal(routeEntries.length, expectedEntries);
    assert.equal(routeBullets, expectedBullets);
    entries += routeEntries.length;
    bullets += routeBullets;
  }
  assert.equal(entries, 16);
  assert.equal(bullets, 93);
  for (const [, route] of DOMAINS) {
    const html = await routeHtml(route);
    assert.equal(elementsWithClass(html, "p", "entry-summary").length, 0);
  }
});

test("Education retains both degrees, 31 courses, and the advisor record", async () => {
  const html = await routeHtml("/education/");
  assert.equal(elementsWithClass(html, "article", "education-entry").length, 2);
  const lists = elementsWithClass(html, "ul", "course-list");
  assert.equal(lists.length, 4);
  assert.equal(lists.reduce((total, list) => total + (list[2].match(/<li\b/giu) ?? []).length, 0), 31);
  assert.match(html, /Mark Borsuk, Ph\.D\./u);
});

test("protected page and content sources remain byte-for-byte equivalent", async () => {
  for (const [relative, expected] of PROTECTED_SOURCE_HASHES) {
    assert.equal(sha256(normalizedTextBytes(await readFile(path.join(ROOT, ...relative.split("/"))))), expected, `${relative} changed`);
  }
});

test("the static export contains only approved local runtime assets", async () => {
  const assets = (await walk(path.join(OUT, "assets"))).map((file) => path.relative(OUT, file).replaceAll("\\", "/")).sort();
  assert.deepEqual(assets, EXPECTED_PUBLIC_ASSETS);
  for (const route of ROUTES) {
    const html = await routeHtml(route);
    for (const tag of [...openingTags(html, "script"), ...openingTags(html, "img"), ...openingTags(html, "source")]) {
      for (const name of ["src", "srcset"]) assert.doesNotMatch(attribute(tag, name) ?? "", /^https?:/iu);
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
  const layout = await readFile(path.join(ROOT, "app", "layout.tsx"), "utf8");
  const packageJson = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  for (const token of ["--page: #f7f6f5", "--ink: #0b0b0b", "--muted: #70706c", "--accent: #2200ff", "repeat(15, minmax(0, 1fr))"]) assert.ok(globals.includes(token));
  assert.doesNotMatch(globals, /box-shadow|backdrop-filter/u);
  assert.doesNotMatch(home, /box-shadow|backdrop-filter|linear-gradient/u);
  assert.match(entrance, /min\(76vw, 72dvh, 720px\)/u);
  assert.match(entrance, /min\(92vw, 68dvh, 380px\)/u);
  assert.match(entrance, /aspect-ratio:\s*1/u);
  for (const contract of ["aria-controls=\"site-menu\"", "aria-expanded={menuOpen}", 'event.key === "Escape"', 'document.body.classList.add("menu-open")', 'querySelectorAll<HTMLElement>']) assert.ok(navigation.includes(contract));
  assert.match(navigation, /wordmark-lockup[\s\S]*?>Theodore<\/span>[\s\S]*?>Ouyang<\/span>/u);
  assert.doesNotMatch(navigation, /profile-sidebar|theodore-avatar/u);
  assert.doesNotMatch(home, /portrait/u);
  assert.match(globals, /\.entry-metadata\s*\{[\s\S]*?grid-template-columns:\s*1fr/u);
  assert.match(globals, /\.entry-project\s*\{[\s\S]*?color:\s*var\(--muted\)/u);
  assert.match(globals, /\.archive-bullets li::before\s*\{[\s\S]*?width:\s*3px[\s\S]*?content:\s*""/u);
  assert.doesNotMatch(layout, /data-design-contract|ParticleBackground|shantell-sans/u);
  assert.equal(existsSync(path.join(ROOT, "postcss.config.mjs")), false);
  assert.equal(packageJson.dependencies.three, undefined);
  assert.equal(packageJson.devDependencies["@types/three"], undefined);
  assert.equal(packageJson.devDependencies.tailwindcss, undefined);
  assert.equal(packageJson.devDependencies["@tailwindcss/postcss"], undefined);
});
