import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const REPOSITORY_ROOT = path.dirname(ROOT.replace(/[\\/]$/u, ""));
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
  ["STEM Academic Competitions and Training", "/past-experience/stem-academic-competitions-and-training/", 2, 13],
];
const EXPECTED_PUBLIC_ASSETS = [
  "assets/brand/apple-touch-icon.png",
  "assets/brand/favicon-16.png",
  "assets/brand/favicon-32.png",
  "assets/brand/favicon.ico",
  "assets/brand/lo-mark.svg",
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

test("the static export contains nine website routes and the architecture viewer", async () => {
  assert.deepEqual(await exportedRoutes(), [...ROUTES, "/architecture/"].sort());
  assert.ok(existsSync(path.join(OUT, "404.html")));
});

test("the architecture viewer is published directly from its repository source", async () => {
  const source = await readFile(path.join(REPOSITORY_ROOT, "architecture", "index.html"));
  const published = await readFile(path.join(OUT, "architecture", "index.html"));
  assert.deepEqual(published, source);
  assert.match(published.toString("utf8"), /<!doctype html>/iu);
  assert.match(published.toString("utf8"), /<svg\b/iu);
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
  assert.match(nowHtml, /class="page-intro-support">Exploring AI in everyday life\.<\/p>/u);
  assert.match(now, /Exploring AI in everyday life\./u);
  assert.match(now, /Theodore Ouyang is exploring how artificial intelligence/u);
  assert.match(now, /practical applications that solve real problems/u);
  assert.match(now, /expand human capability/u);
});

test("Past Experience presents five domains, 16 entries, and 92 bullets", async () => {
  const directory = await routeHtml("/past-experience/");
  assert.match(directory, /<h1>Past Experience<\/h1>/u);
  assert.match(directory, /class="page-intro-support">Theodore before July 1st, 2026\.<\/p>/u);
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
  assert.equal(entries, 16);
  assert.equal(bullets, 92);
});

test("Education presents both degrees, 31 courses, and the advisor record", async () => {
  const html = await routeHtml("/education/");
  assert.equal(elementsWithClass(html, "article", "education-entry").length, 2);
  const lists = elementsWithClass(html, "ul", "course-list");
  assert.equal(lists.length, 4);
  assert.equal(lists.reduce((total, list) => total + (list[2].match(/<li\b/giu) ?? []).length, 0), 31);
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
  assert.match(entrance, /\.scrollCue\s*\{[\s\S]*?color:\s*var\(--muted\)[\s\S]*?font-size:\s*11px/u);
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
  assert.match(globals, /\.entry-project\s*\{[\s\S]*?color:\s*var\(--muted\)/u);
  assert.match(globals, /\.archive-bullets li::before\s*\{[\s\S]*?width:\s*3px[\s\S]*?content:\s*""/u);
  assert.deepEqual(Object.keys(packageJson.dependencies).sort(), ["next", "react", "react-dom"]);
});
