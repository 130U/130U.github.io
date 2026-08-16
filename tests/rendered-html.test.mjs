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

const EXPECTED_ROUTES = [
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

const DOMAIN_ROUTES = [
  {
    name: "Artificial Intelligence",
    route: "/past-experience/artificial-intelligence/",
    entries: 4,
    bullets: 23,
  },
  {
    name: "Data Science",
    route: "/past-experience/data-science/",
    entries: 3,
    bullets: 19,
  },
  {
    name: "Environmental, Social, and Governance",
    route: "/past-experience/environmental-social-and-governance/",
    entries: 4,
    bullets: 8,
  },
  {
    name: "Finance",
    route: "/past-experience/finance/",
    entries: 3,
    bullets: 28,
  },
  {
    name: "STEM Academic Competitions and Training",
    route: "/past-experience/stem-academic-competitions-and-training/",
    entries: 2,
    bullets: 14,
  },
];

const PROTECTED_SOURCE_HASHES = new Map([
  [
    "app/education/page.tsx",
    "23846a79f9bd6e4f5978932db2a50c4402b2e0136fd61efd63af864b2b8bddac",
  ],
  [
    "app/now/page.tsx",
    "d7d92116e56afc9f708fdac57030e91eb15d94769d414a2f9d29fbdcba842f8f",
  ],
  [
    "app/past-experience/page.tsx",
    "c22ffecb129567be473ce2230103fd80d954faeaa6ebae171c9418085e6769e9",
  ],
  [
    "app/past-experience/[slug]/page.tsx",
    "a89b781c0a6a74b9295635d5495c4e2cc2cf2d890cc879578ebfd04a9f6db84b",
  ],
  [
    "app/past-experience/components/ExperienceDomainPage.tsx",
    "6350ae5dffd06111562455deea826af7373e88aba3a73b1e5a823c5a0f60288f",
  ],
  [
    "app/lib/content/experience.ts",
    "2bedced152edabc7fe56071b50d43f288f1011f427bd60288df392cfc00f06f8",
  ],
  [
    "content/past-experience/archive-through-2026-06-30.md",
    "8a016cedb94a308c43b553d79aaeecec0640024314336734ff7bdb2ef535f64c",
  ],
]);

const IMMUTABLE_ASSET_HASHES = new Map([
  [
    "public/assets/brand/og.png",
    "1a61b1b492dae028b031bf020f1a2c57b6ce2887f2f6ca7aeae154b085f3ec98",
  ],
  [
    "public/assets/brand/og-1774.jpg",
    "c625f0372d40bfcf392c4c8b15f3f24c48db4ea211879b25d7ae6db6a7972343",
  ],
  [
    "public/assets/profile/theodore-avatar-warm.png",
    "2954ec837ca31b13c377c6f2539406822b4ab94b1be6ca11abb146f2df016d1e",
  ],
  [
    "public/assets/brand/lo-monogram.png",
    "20474cd1dee3d5ea952b69285850901d362a7608b1d7ca69a959f2076a69923b",
  ],
  [
    "public/assets/brand/icon-512.png",
    "b156cb141e7b2ee85328327e80ea62e83bf8f15900e1248b0c0165070f66687f",
  ],
  [
    "public/assets/brand/apple-touch-icon.png",
    "47a27e85107cbbd7f8704831f6ad6d004037e173c9bf2ab4a3d0622910c45651",
  ],
  [
    "public/assets/brand/favicon-32.png",
    "a5fe45fe007eb0103e71cf08b2b2b08eae50e9d843552fb04277755e5b8b0868",
  ],
  [
    "public/assets/brand/favicon-16.png",
    "fa3201dd3ebb63431ac12bb6c1fc12feef73d971645fa2b85c6f17dda5a41f05",
  ],
  [
    "public/assets/brand/favicon.ico",
    "5cc3ddb877b25d814dcb20a5707acd0cb25902e8732b047e2a1bad5a1182af18",
  ],
]);

const RETIRED_MARKERS = [
  ["world", "model"].join(" "),
  ["world", "-model"].join(""),
  ["world", "-action"].join(""),
  ["personal", "posts"].join(" "),
  ["/personal-", "posts/"].join(""),
  ["uni", "corn"].join(""),
  ["present", "work"].join(" "),
  ["personal", "writing"].join(" "),
  ["fast", "-wam"].join(""),
  ["vlm", "-to-vla"].join(""),
];

const htmlCache = new Map();

function decodeHtml(value) {
  const named = new Map([
    ["amp", "&"],
    ["apos", "'"],
    ["gt", ">"],
    ["lt", "<"],
    ["nbsp", " "],
    ["quot", '"'],
  ]);
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
  return normalizeSpace(
    value
      .replace(/<script\b[\s\S]*?<\/script>/giu, " ")
      .replace(/<style\b[\s\S]*?<\/style>/giu, " ")
      .replace(/<svg\b[\s\S]*?<\/svg>/giu, " ")
      .replace(/<[^>]+>/gu, " "),
  );
}

function attribute(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = tag.match(
    new RegExp(`(?:^|\\s)${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "iu"),
  );
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3] ?? "") : undefined;
}

function openingTags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, "giu")) ?? [];
}

function pairedElementsWithClass(html, tagName, className) {
  const matches = [...html.matchAll(new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\/${tagName}>`, "giu"))];
  return matches.filter((match) =>
    (attribute(match[1], "class") ?? "").split(/\s+/u).includes(className),
  );
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function normalizedTextBytes(bytes) {
  return Buffer.from(bytes.toString("utf8").replace(/\r\n?/gu, "\n"), "utf8");
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
  if (route === "/") return path.join(OUT, "index.html");
  return path.join(OUT, ...route.split("/").filter(Boolean), "index.html");
}

async function routeHtml(route) {
  if (!htmlCache.has(route)) htmlCache.set(route, await readFile(routeFile(route), "utf8"));
  return htmlCache.get(route);
}

async function exportedRoutes() {
  return (await walk(OUT))
    .filter((file) => path.basename(file) === "index.html")
    .filter((file) => !file.includes(`${path.sep}_next${path.sep}`))
    .map((file) => {
      const relative = path.relative(OUT, path.dirname(file)).split(path.sep).join("/");
      return relative ? `/${relative}/` : "/";
    })
    .filter((route) => route !== "/404/" && route !== "/_not-found/")
    .sort();
}

function canonicalUrl(html) {
  const tag = openingTags(html, "link").find((candidate) =>
    (attribute(candidate, "rel") ?? "").split(/\s+/u).includes("canonical"),
  );
  return tag ? attribute(tag, "href") : undefined;
}

function metaContent(html, key, value) {
  const tag = openingTags(html, "meta").find(
    (candidate) => attribute(candidate, key)?.toLowerCase() === value.toLowerCase(),
  );
  return tag ? attribute(tag, "content") : undefined;
}

function primaryNavigation(html) {
  const nav = [...html.matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/giu)].find(
    (match) => attribute(match[1], "aria-label") === "Primary navigation",
  );
  assert.ok(nav, "Primary navigation is missing");
  return [...nav[2].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/giu)].map((match) => [
    stripMarkup(match[2]),
    attribute(match[1], "href"),
  ]);
}

function pathForInternalReference(reference, pageRoute) {
  const decoded = decodeHtml(reference).trim();
  if (!decoded || /^(?:#|data:|mailto:|tel:|javascript:|blob:)/iu.test(decoded)) return undefined;
  const url = new URL(decoded, `${SITE_ORIGIN}${pageRoute}`);
  if (url.origin !== SITE_ORIGIN) return undefined;
  return decodeURIComponent(url.pathname);
}

function exportedPathForUrl(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (pathname === "/") return path.join(OUT, "index.html");
  if (pathname.endsWith("/")) return path.join(OUT, ...segments, "index.html");
  const direct = path.join(OUT, ...segments);
  if (existsSync(direct)) return direct;
  return path.join(direct, "index.html");
}

function assertInsideExport(file) {
  const relative = path.relative(OUT, file);
  assert.ok(relative && !relative.startsWith("..") && !path.isAbsolute(relative), `${file} escaped out/`);
}

function htmlReferences(html) {
  const references = [];
  for (const tag of html.match(/<[a-z][^>]*>/giu) ?? []) {
    for (const name of ["href", "src"]) {
      const value = attribute(tag, name);
      if (value) references.push(value);
    }
    const srcset = attribute(tag, "srcset");
    if (srcset) {
      references.push(...srcset.split(",").map((part) => part.trim().split(/\s+/u)[0]));
    }
  }
  return references;
}

test("the static export contains exactly the approved nine public routes", async () => {
  assert.deepEqual(await exportedRoutes(), [...EXPECTED_ROUTES].sort());
  assert.ok(existsSync(path.join(OUT, "404.html")), "404.html is missing");
});

test("every route has canonical metadata and the same four-item navigation", async () => {
  for (const route of EXPECTED_ROUTES) {
    const html = await routeHtml(route);
    const expectedUrl = new URL(route, SITE_ORIGIN).toString();
    assert.equal(canonicalUrl(html), expectedUrl, `${route} canonical changed`);
    assert.equal(metaContent(html, "property", "og:url"), expectedUrl, `${route} og:url changed`);
    assert.deepEqual(primaryNavigation(html), NAVIGATION, `${route} navigation changed`);
  }
});

test("every route carries the same secure personal-brand boundary", async () => {
  const requiredDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ];

  for (const route of EXPECTED_ROUTES) {
    const html = await routeHtml(route);
    const contentSecurityPolicy = metaContent(html, "http-equiv", "Content-Security-Policy");

    assert.equal(metaContent(html, "name", "application-name"), "Theodore Ouyang");
    assert.equal(metaContent(html, "name", "author"), "Theodore Ouyang");
    assert.equal(metaContent(html, "name", "creator"), "Theodore Ouyang");
    assert.equal(metaContent(html, "name", "publisher"), "Theodore Ouyang");
    assert.equal(metaContent(html, "name", "referrer"), "strict-origin-when-cross-origin");
    assert.equal(metaContent(html, "name", "theme-color"), "#012169");
    assert.ok(contentSecurityPolicy, `${route} content security policy is missing`);
    for (const directive of requiredDirectives) {
      assert.ok(
        contentSecurityPolicy.includes(directive),
        `${route} content security policy lost ${directive}`,
      );
    }

    for (const tag of [
      ...openingTags(html, "script"),
      ...openingTags(html, "img"),
      ...openingTags(html, "source"),
    ]) {
      for (const name of ["src", "srcset"]) {
        assert.doesNotMatch(attribute(tag, name) ?? "", /^https?:/iu, `${route} has a remote ${name}`);
      }
    }
  }
});

test("Home gives the particle stage visual priority and moves identity details below it", async () => {
  const html = await routeHtml("/");
  const body = stripMarkup(html);
  const title = stripMarkup(html.match(/<title>([\s\S]*?)<\/title>/iu)?.[1] ?? "");
  assert.equal(title, "Theodore Ouyang | Duke Alum");
  assert.equal(
    metaContent(html, "name", "description"),
    "Theodore Ouyang is a Duke University graduate and Sequoia Scholar in Cohort 8, exploring how artificial intelligence can become useful in everyday life.",
  );
  assert.doesNotMatch(body, /Quis ego sum\?/u);
  assert.doesNotMatch(body, /Identity emerges from possibility\./u);
  assert.match(body, /Exploring practical AI use cases/u);
  assert.match(body, /He is a Sequoia Scholar in Cohort 8\./u);
  assert.match(body, /genuinely useful in everyday life/u);
  assert.match(body, /Beijing \| Boston/u);
  assert.match(body, /10@alumni\.duke\.edu/u);

  const credentials = [...html.matchAll(/<ul\b([^>]*)>([\s\S]*?)<\/ul>/giu)].filter(
    (match) => attribute(match[1], "aria-label") === "Profile summary",
  );
  assert.equal(credentials.length, 1);
  assert.deepEqual(
    [...credentials[0][2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/giu)].map((match) =>
      stripMarkup(match[1]),
    ),
    ["Exploring practical AI use cases", "Sequoia Scholar, Cohort 8"],
  );

  const heading = [...html.matchAll(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/giu)].find(
    (match) => attribute(match[1], "id") === "home-heading",
  );
  assert.equal(stripMarkup(heading?.[2] ?? ""), "Theodore Ouyang");
  assert.equal(pairedElementsWithClass(html, "aside", "profile-sidebar").length, 0);
  assert.match(html, /id="home-profile"/u);
  const canvas = openingTags(html, "canvas");
  assert.equal(canvas.length, 1);
  assert.equal(attribute(canvas[0], "aria-hidden"), "true");
  assert.match(html, /data-state="checking"/u, "server-rendered fallback state is missing");
});

test("protected routes retain the shared profile sidebar", async () => {
  for (const route of ["/education/", "/past-experience/", "/now/"]) {
    const html = await routeHtml(route);
    const sidebars = pairedElementsWithClass(html, "aside", "profile-sidebar");
    assert.equal(
      sidebars.length,
      1,
      `${route} profile sidebar changed`,
    );
    const sidebarText = stripMarkup(sidebars[0][2]);
    assert.match(sidebarText, /Exploring practical AI use cases/u);
    assert.doesNotMatch(sidebarText, /Duke B\.S\. & M\.Eng\./u);
    assert.match(sidebarText, /Sequoia Scholar, Cohort 8/u);
  }
});

test("Current Chapter is concise and limited to practical everyday AI use cases", async () => {
  const html = await routeHtml("/now/");
  const body = stripMarkup(html);
  assert.match(body, /Exploring AI in everyday life\./u);
  assert.match(
    body,
    /As an AI enthusiast, I am exploring how artificial intelligence can become genuinely useful in everyday life\./u,
  );
  assert.match(body, /practical use cases that solve real problems/u);
  assert.equal(pairedElementsWithClass(html, "article", "current-chapter-brief").length, 1);
});

test("retired routes, assets, and current-role language are absent from the export", async () => {
  const searchable = (await walk(OUT)).filter((file) =>
    /\.(?:css|html|js|json|txt|xml)$/iu.test(file),
  );
  const combined = (await Promise.all(searchable.map((file) => readFile(file, "utf8"))))
    .join("\n")
    .toLowerCase();
  for (const marker of RETIRED_MARKERS) {
    assert.ok(!combined.includes(marker), `Retired marker remains in out/: ${marker}`);
  }

  const retiredDirectory = ["personal-", "posts"].join("");
  assert.ok(!existsSync(path.join(OUT, retiredDirectory)), "Retired route directory was exported");
  assert.ok(!existsSync(path.join(OUT, "assets", "posts")), "Retired asset directory was exported");
  assert.ok(
    !existsSync(path.join(OUT, "README.md")),
    "Internal public-assets note must not be exported",
  );
});

test("all internal HTML and CSS references resolve inside the static export", async () => {
  for (const route of EXPECTED_ROUTES) {
    const html = await routeHtml(route);
    for (const reference of htmlReferences(html)) {
      const pathname = pathForInternalReference(reference, route);
      if (!pathname) continue;
      const target = exportedPathForUrl(pathname);
      assertInsideExport(target);
      assert.ok(existsSync(target), `${route} references missing ${pathname}`);
    }
  }

  for (const cssFile of (await walk(OUT)).filter((file) => file.endsWith(".css"))) {
    const css = await readFile(cssFile, "utf8");
    for (const match of css.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/giu)) {
      const reference = match[2].trim();
      if (!reference || /^(?:data:|#|https?:)/iu.test(reference)) continue;
      const clean = decodeURIComponent(reference.split(/[?#]/u)[0]);
      const target = clean.startsWith("/")
        ? path.join(OUT, ...clean.split("/").filter(Boolean))
        : path.resolve(path.dirname(cssFile), clean);
      assertInsideExport(target);
      assert.ok(existsSync(target), `${path.relative(OUT, cssFile)} references missing ${clean}`);
    }
  }
});

test("robots, sitemap, and HTML share the exact route manifest", async () => {
  const robots = await readFile(path.join(OUT, "robots.txt"), "utf8");
  assert.match(robots, /^User-agent:\s*\*/imu);
  assert.match(robots, /^Allow:\s*\/$/imu);
  assert.match(robots, /^Sitemap:\s*https:\/\/www\.theodoreoy\.com\/sitemap\.xml$/imu);

  const sitemap = await readFile(path.join(OUT, "sitemap.xml"), "utf8");
  const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/giu)]
    .map((match) => new URL(decodeHtml(match[1])).pathname)
    .sort();
  assert.deepEqual(routes, [...EXPECTED_ROUTES].sort());
  assert.equal(new Set(routes).size, routes.length, "Sitemap routes must be unique");
});

test("Education, Past Experience, and Current Chapter protected sources remain byte-for-byte equivalent", async () => {
  for (const [relative, expected] of PROTECTED_SOURCE_HASHES) {
    const source = path.join(ROOT, ...relative.split("/"));
    assert.equal(sha256(normalizedTextBytes(await readFile(source))), expected, `${relative} changed`);
  }
});

test("Past Experience keeps its five-domain, 16-entry, 92-bullet structure", async () => {
  const archive = await readFile(
    path.join(ROOT, "content", "past-experience", "archive-through-2026-06-30.md"),
    "utf8",
  );
  const domainSection = archive.split(/^## Domain Experience\s*$/mu)[1];
  assert.ok(domainSection, "Domain Experience is missing from the archive");
  assert.deepEqual(
    [...domainSection.matchAll(/^###\s+(.+)$/gmu)].map((match) => match[1].trim()),
    DOMAIN_ROUTES.map(({ name }) => name),
  );
  assert.equal((domainSection.match(/^####\s+/gmu) ?? []).length, 16);
  assert.equal((domainSection.match(/^\*\*Project:\*\*/gmu) ?? []).length, 16);
  assert.equal((domainSection.match(/^-\s+/gmu) ?? []).length, 92);

  let entryTotal = 0;
  let bulletTotal = 0;
  for (const domain of DOMAIN_ROUTES) {
    const html = await routeHtml(domain.route);
    const entries = pairedElementsWithClass(html, "article", "archive-entry");
    const bullets = entries.reduce(
      (total, entry) => total + (entry[2].match(/<li\b/giu) ?? []).length,
      0,
    );
    assert.equal(entries.length, domain.entries, `${domain.name} entry count changed`);
    assert.equal(bullets, domain.bullets, `${domain.name} bullet count changed`);
    entryTotal += entries.length;
    bulletTotal += bullets;
  }
  assert.equal(entryTotal, 16);
  assert.equal(bulletTotal, 92);

  assert.match(
    stripMarkup(await routeHtml("/past-experience/artificial-intelligence/")),
    /Designed graduate-level, computation-heavy scientific reasoning benchmarks to probe the capability boundaries of a frontier large language model, prioritizing substance over trick wording/u,
  );
});

test("Education retains all 31 selected courses and the approved advisor record", async () => {
  const html = await routeHtml("/education/");
  const entries = pairedElementsWithClass(html, "article", "education-entry");
  assert.equal(entries.length, 2);
  const graduateEntry = stripMarkup(entries[0][2]);
  assert.match(graduateEntry, /2025[\s\S]*Duke University[\s\S]*Durham, USA/u);
  assert.doesNotMatch(graduateEntry, /Kunshan, China/u);
  assert.match(
    graduateEntry,
    /Financial Risk Concentration[\s\S]*Academic Advisor: Mark Borsuk, Ph\.D\.[\s\S]*Pratt School of Engineering Merit Scholarship/u,
  );
  assert.doesNotMatch(
    graduateEntry,
    /James L\. and Elizabeth M\. Vincent Professor of Civil and Environmental Engineering/u,
  );
  assert.match(
    entries[0][2],
    /<a\b[^>]*href="https:\/\/cee\.duke\.edu\/people\/mark-borsuk\/"[^>]*>[\s\S]*?Mark Borsuk, Ph\.D\.[\s\S]*?<\/a>/u,
  );
  assert.match(
    stripMarkup(entries[1][2]),
    /2023[\s\S]*Duke University[\s\S]*Durham, USA & Kunshan, China/u,
  );

  const lists = pairedElementsWithClass(html, "ul", "course-list");
  assert.equal(lists.length, 4);
  assert.equal(
    lists.reduce((total, list) => total + (list[2].match(/<li\b/giu) ?? []).length, 0),
    31,
  );
});

test("README stays a concise public introduction", async () => {
  const readme = await readFile(path.join(ROOT, "README.md"), "utf8");
  assert.match(
    readme,
    /<a href="https:\/\/www\.theodoreoy\.com\/">[\s\S]*?<img src="\.github\/assets\/readme-cover\.jpg" alt="Visit Theodore Ouyang’s personal website"[^>]*>[\s\S]*?<\/a>/u,
  );
  assert.ok(
    existsSync(path.join(ROOT, ".github", "assets", "readme-cover.jpg")),
    "README cover is missing",
  );
  assert.match(readme, /href="https:\/\/www\.theodoreoy\.com\/"/u);
  assert.doesNotMatch(readme, /public\/assets\/brand\/og-1774\.jpg/u);
  assert.doesNotMatch(
    readme,
    /<!--|<details|The archive|A note on the design|Repository note|deliberately\s+unfinished|npm run|Next(?:\.js)?\s+static export|GitHub Pages/imu,
  );

  const normalized = readme.toLowerCase();
  for (const marker of RETIRED_MARKERS) {
    assert.ok(!normalized.includes(marker), `Retired marker remains in README: ${marker}`);
  }
});

test("the protected-source guard covers every protected source, including Current Chapter", async () => {
  const guard = await readFile(
    path.join(ROOT, "scripts", "check-protected-sources.mjs"),
    "utf8",
  );
  for (const relative of PROTECTED_SOURCE_HASHES.keys()) {
    assert.ok(
      guard.includes(`:(literal)${relative}`),
      `Protected-source guard is missing protected source: ${relative}`,
    );
  }
});

test("original identity assets remain intact in source and export", async () => {
  for (const [relative, expected] of IMMUTABLE_ASSET_HASHES) {
    const source = path.join(ROOT, ...relative.split("/"));
    assert.equal(sha256(await readFile(source)), expected, `${relative} changed`);
    const exported = path.join(OUT, ...relative.slice("public/".length).split("/"));
    assert.equal(sha256(await readFile(exported)), expected, `${relative} export changed`);
  }
});

test("the shared visual module reveals one stable particle composition before motion", async () => {
  const packageJson = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  assert.equal(packageJson.dependencies.three, "0.160.0");
  assert.equal(packageJson.devDependencies["@types/three"], "0.160.0");

  const config = await readFile(
    path.join(ROOT, "app", "components", "particle-background", "particle-config.ts"),
    "utf8",
  );
  assert.match(config, /initialShape:\s*"theodore"/u);
  assert.match(config, /desktopParticles:\s*5_000/u);
  assert.match(config, /wideDesktopParticles:\s*9_000/u);
  assert.match(config, /mobileParticles:\s*2_800/u);
  assert.match(config, /reducedMotionParticles:\s*1_600/u);
  assert.match(config, /wideDesktopBreakpoint:\s*1_600/u);
  for (const parameter of [
    /size:\s*2\.8/u,
    /sizeMinimum:\s*1\.5/u,
    /sizeMaximum:\s*4\.25/u,
    /brightSize:\s*6\.8/u,
    /depthExponent:\s*1\.35/u,
    /sizeDepthExponent:\s*1\.45/u,
    /sizeVariationMinimum:\s*0\.78/u,
    /sizeVariationMaximum:\s*1\.35/u,
    /scatterOpacity:\s*0\.68/u,
    /wordOpacity:\s*0\.98/u,
    /ambientAnchorRatio:\s*0\.17/u,
    /brightStarRatio:\s*0\.022/u,
    /ambientOpacityMinimum:\s*0\.08/u,
    /ambientOpacityMaximum:\s*0\.38/u,
    /ambientAnchorBoost:\s*0\.18/u,
    /ink:\s*"#f4faff"/u,
    /colorBlend:\s*0\.64/u,
    /sizeBlend:\s*0\.46/u,
    /alphaBoost:\s*0\.1/u,
    /anchorOpacityAtWord:\s*0\.86/u,
    /anchorOpacityAtScatter:\s*0\.96/u,
    /targetJitterRatio:\s*0\.018/u,
    /far:\s*"#78b9e2"/u,
    /middle:\s*"#b4dcf3"/u,
    /near:\s*"#f5fbff"/u,
    /ice:\s*"#78e3ff"/u,
    /warm:\s*"#ffd28a"/u,
    /lavender:\s*"#c9c4ff"/u,
    /wordDepth:\s*8/u,
    /yawSoftLimit:\s*3\.5/u,
    /yawHardLimit:\s*4\.2/u,
    /pitchSoftLimit:\s*2/u,
    /pitchHardLimit:\s*2\.4/u,
    /draggingRepulsionGain:\s*0\.64/u,
    /scatterPoseGain:\s*0\.24/u,
    /ambientPoseGain:\s*0\.08/u,
    /transitionResponse:\s*1\.35/u,
    /semanticResponse:\s*0\.34/u,
    /driftX:\s*1\.9/u,
    /driftY:\s*1\.35/u,
    /driftSpeedMinimum:\s*0\.18/u,
    /driftSpeedMaximum:\s*0\.42/u,
    /twinkleSpeedMinimum:\s*0\.65/u,
    /twinkleSpeedMaximum:\s*1\.35/u,
    /heroAnchorMotionGain:\s*0\.92/u,
    /heroAnchorTwinkleGain:\s*0\.9/u,
    /heroWordTwinkleGain:\s*0\.18/u,
  ]) {
    assert.match(config, parameter);
  }
  assert.match(
    config,
    /PARTICLE_TIMELINE:[\s\S]*?\{ kind: "hold", shape: "theodore", duration: [\d.]+ \}/u,
  );
  const morphs = [...config.matchAll(/\{ kind: "morph", to: "([^"]+)", duration: ([\d.]+) \}/gu)];
  assert.deepEqual(morphs.map((match) => match[1]), ["scatter", "ouyang", "scatter", "theodore"]);
  assert.ok(
    morphs.every((match) => Number(match[2]) === 2.8),
    "Every morph must last 2.8 seconds",
  );

  const engine = await readFile(
    path.join(ROOT, "app", "components", "particle-background", "particle-engine.ts"),
    "utf8",
  );
  for (const contract of [
    "visibilitychange",
    "webglcontextlost",
    "handleMotionPreferenceChange",
    "maxPixelRatio",
    "DynamicDrawUsage",
    "requestAnimationFrame",
    "setDrawRange",
    "IntersectionObserver",
    "ResizeObserver",
    "handleViewportIntersection",
    "handleElementResize",
    "viewportVisible",
    "renderCurrentFrame",
    "activate()",
    "activated",
    "syncAnimationState",
    "resetToInitialShape",
    "PARTICLE_CONFIG.initialShape",
    "setMode(mode: ParticleMode)",
    "HeroReturnKind",
    "heroReturnBase",
    "semanticSuppression",
    "ambientBlend",
    "new THREE.ShaderMaterial",
    'setAttribute("aSize"',
    'setAttribute("aAlpha"',
    "points.scatterOpacity",
    "points.wordOpacity",
    "wideDesktopParticles",
    "wideDesktopBreakpoint",
    "core + halo",
    "uWordAmount",
    "uWordInk",
    "uWordColorBlend",
    "uWordSizeBlend",
    "clamp(uWordAmount * uWordSizeBlend",
    "clamp(uWordAmount * uWordColorBlend",
    "max(0.0, uWordAlphaBoost)",
    "anchorOpacityAtWord",
    "anchorOpacityAtScatter",
    "heroAnchorMotionGain",
    "heroAnchorTwinkleGain",
    "heroWordTwinkleGain",
    "this.canvas.getBoundingClientRect()",
    "detachRuntimeListeners",
    "resizeObserver?.disconnect()",
    "viewportObserver?.disconnect()",
    "renderer?.dispose()",
  ]) {
    assert.ok(engine.includes(contract), `Particle lifecycle contract is missing: ${contract}`);
  }
  const initializeBody = engine.match(
    /async initialize\(\)\s*\{([\s\S]*?)\r?\n\s*\}\r?\n\r?\n\s*activate\(\)/u,
  )?.[1];
  assert.ok(initializeBody, "Particle initialize() body is missing");
  assert.match(initializeBody, /this\.renderCurrentFrame\(\)/u);
  assert.doesNotMatch(
    initializeBody,
    /this\.syncAnimationState\(\)/u,
    "Initialization must not advance the timeline behind the reveal",
  );
  assert.match(
    engine,
    /activate\(\)\s*\{[\s\S]*?this\.activated \|\|[\s\S]*?this\.activated = true[\s\S]*?this\.syncAnimationState\(\)/u,
  );
  assert.match(
    engine,
    /private syncAnimationState\(\)[\s\S]*?!this\.activated[\s\S]*?this\.reducedMotion[\s\S]*?!this\.viewportVisible[\s\S]*?this\.stop\(\)/u,
  );
  assert.match(
    engine,
    /setMode\(mode: ParticleMode\)[\s\S]*?if \(!this\.activated\)[\s\S]*?resetForMode\(mode\)[\s\S]*?renderCurrentFrame\(\)[\s\S]*?return/u,
  );
  assert.match(
    engine,
    /handleMotionPreferenceChange[\s\S]*?resetForMode\(this\.desiredMode\)[\s\S]*?this\.reducedMotion[\s\S]*?this\.stop\(\)[\s\S]*?this\.renderCurrentFrame\(\)/u,
  );
  assert.match(
    engine,
    /handleContextLost[\s\S]*?this\.unavailable = true[\s\S]*?detachRuntimeListeners\(\)[\s\S]*?this\.onUnavailable\(\)/u,
  );
  assert.match(
    engine,
    /const bounds = this\.canvas\.getBoundingClientRect\(\)[\s\S]*?event\.clientX - bounds\.left[\s\S]*?event\.clientY - bounds\.top/u,
  );
  for (const spatialContract of [
    "this.spatialGroup = new THREE.Group()",
    "projectionCompensation",
    "this.wordDepth[index]",
    "this.localRay.copy(this.raycaster.ray).applyMatrix4",
    "window.addEventListener(\"pointerdown\", this.handlePointerDown)",
    "mapDragAngle",
    "phaseInteractionGain",
    "advanceCriticalSpring",
    "PARTICLE_CONFIG.spatial.draggingRepulsionGain",
    "PARTICLE_CONFIG.spatial.scatterPoseGain",
  ]) {
    assert.ok(engine.includes(spatialContract), `Spatial particle contract is missing: ${spatialContract}`);
  }

  const spatialMotion = await readFile(
    path.join(ROOT, "app", "components", "particle-background", "spatial-motion.ts"),
    "utf8",
  );
  assert.match(spatialMotion, /export function mapDragAngle/u);
  assert.match(spatialMotion, /Math\.exp\(-excess \/ range\)/u);
  assert.match(spatialMotion, /export function advanceCriticalSpring/u);
  assert.match(spatialMotion, /4\.6 \/ response/u);
  assert.match(spatialMotion, /must never cross its target/u);
  assert.match(spatialMotion, /export function phaseInteractionGain/u);

  const component = await readFile(
    path.join(ROOT, "app", "components", "particle-background", "ParticleBackground.tsx"),
    "utf8",
  );
  assert.match(component, /await import\("\.\/particle-engine"\)/u);
  assert.match(component, /usePathname\(\)/u);
  assert.match(component, /particleModeForPathname\(pathname\)/u);
  assert.match(component, /engineRef\.current\?\.setMode\(mode\)/u);
  assert.match(component, /initialMode:\s*modeRef\.current/u);
  assert.match(component, /engine\?\.dispose\(\)/u);
  assert.match(component, /onUnavailable:\s*\(\)\s*=>\s*\{\s*if \(!cancelled\)/u);
  assert.match(component, /const ready = await engine\.initialize\(\)/u);
  assert.match(component, /addEventListener\("transitionend", revealListener\)/u);
  assert.match(component, /particleEngine\.activate\(\)/u);
  assert.match(component, /if \(ready\) reveal\(canvas, engine\)/u);
  assert.doesNotMatch(component, /setState\(ready \? "ready" : "fallback"\)/u);
  assert.match(component, /<span[^>]*className=\{styles\.fallbackName\}[^>]*>[\s\S]*?Theodore[\s\S]*?<\/span>/u);
  assert.doesNotMatch(component, /Theodore Ouyang/u);

  const sampler = await readFile(
    path.join(ROOT, "app", "components", "particle-background", "shape-samplers.ts"),
    "utf8",
  );
  assert.match(sampler, /system-ui/u);
  assert.doesNotMatch(sampler, /document\.fonts/u);

  const styles = await readFile(
    path.join(ROOT, "app", "components", "particle-background", "ParticleBackground.module.css"),
    "utf8",
  );
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/u);
  assert.match(styles, /\.root\[data-mode="hero"\]\[data-state="fallback"\] \.fallbackName/u);
  assert.match(styles, /\.root\[data-mode="ambient"\] \.readingVeil/u);
  assert.match(styles, /background-image:[\s\S]*?radial-gradient/u);
  assert.match(styles, /#012169/u);
  assert.match(styles, /#00539b/iu);
  assert.match(styles, /\.root\[data-state="checking"\] \.ambientFallback\s*\{[\s\S]*?opacity:\s*0\.58/u);
  assert.match(styles, /\.fallbackName\s*\{[\s\S]*?opacity:\s*0;/u);
  assert.match(styles, /data-mode="hero"\]\[data-state="fallback"\] \.ambientFallback/u);
  assert.match(styles, /(?:-webkit-)?background-clip:\s*text/u);
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.root\[data-state="ready"\] \.canvas\s*\{[\s\S]*?opacity:\s*1;[\s\S]*?\.root\[data-state="ready"\] \.fallbackName\s*\{[\s\S]*?opacity:\s*0;/u,
  );

  const homeStyles = await readFile(path.join(ROOT, "app", "home.module.css"), "utf8");
  assert.match(homeStyles, /@media \(hover: hover\) and \(pointer: fine\)/u);
  assert.match(homeStyles, /\.particleStage\s*\{[\s\S]*?cursor:\s*grab/u);
  assert.match(homeStyles, /\.particleStage:active\s*\{[\s\S]*?cursor:\s*grabbing/u);
  assert.match(
    homeStyles,
    /\.profileSection\s*\{[\s\S]*?--profile-blend-height:\s*clamp\(460px, 34vw, 560px\)[\s\S]*?--profile-blend-overlap:\s*clamp\(220px, 19vw, 300px\)[\s\S]*?--profile-breathing-room:\s*clamp\(56px, 5vw, 84px\)[\s\S]*?--profile-content-inset:\s*calc\(/u,
  );
  for (const surfaceTone of [/#d9e7f2/u, /#e5eff7/u, /#edf5fa/u]) {
    assert.match(homeStyles, surfaceTone);
  }
  assert.match(homeStyles, /rgba\(0, 83, 155, 0\.055\)/u);
  assert.match(
    homeStyles,
    /var\(--profile-blend-height\) - var\(--profile-blend-overlap\) \+\s*var\(--profile-breathing-room\)/u,
  );
  assert.match(
    homeStyles,
    /\.profileSection::before\s*\{[\s\S]*?top:\s*calc\(0px - var\(--profile-blend-overlap\)\)[\s\S]*?height:\s*var\(--profile-blend-height\)/u,
  );
  for (const gradientStop of [
    /rgba\(0, 18, 45, 0\) 0%/u,
    /#092f56 42%/u,
    /#bdcfde 78%/u,
    /rgba\(217, 231, 242, 0\) 100%/u,
  ]) {
    assert.match(homeStyles, gradientStop);
  }
  assert.match(
    homeStyles,
    /\.profileInner\s*\{[\s\S]*?padding:\s*var\(--profile-content-inset\) 0 128px/u,
  );
  assert.match(
    homeStyles,
    /@media \(max-width: 720px\)[\s\S]*?--profile-breathing-room:\s*48px[\s\S]*?\.profileInner\s*\{[\s\S]*?padding:\s*var\(--profile-content-inset\) 0 92px/u,
  );
  assert.match(
    homeStyles,
    /@media \(prefers-contrast: more\)[\s\S]*?\.profileSection::before\s*\{[\s\S]*?display:\s*none/u,
  );

  const layout = await readFile(path.join(ROOT, "app", "layout.tsx"), "utf8");
  const home = await readFile(path.join(ROOT, "app", "page.tsx"), "utf8");
  assert.match(layout, /<ParticleBackground\s*\/>/u);
  assert.doesNotMatch(home, /ParticleBackground/u);
});

test("the typography system uses two local families with explicit roles", async () => {
  const globals = await readFile(path.join(ROOT, "app", "globals.css"), "utf8");
  const homeStyles = await readFile(path.join(ROOT, "app", "home.module.css"), "utf8");
  const layout = await readFile(path.join(ROOT, "app", "layout.tsx"), "utf8");

  assert.match(globals, /font-family:\s*"Newsreader Variable"[\s\S]*?font-style:\s*normal/u);
  assert.match(globals, /font-family:\s*"Newsreader Variable"[\s\S]*?font-style:\s*italic/u);
  assert.match(globals, /font-family:\s*"Shantell Sans Variable"[\s\S]*?font-style:\s*normal/u);
  assert.match(globals, /--font-editorial:\s*"Newsreader Variable"/u);
  assert.match(globals, /--font-interface:\s*"Shantell Sans Variable"/u);
  assert.match(globals, /--font-signature:\s*var\(--font-editorial\)/u);
  assert.match(globals, /\.wordmark\s*\{[\s\S]*?font-family:\s*var\(--font-signature\)[\s\S]*?font-style:\s*italic/u);
  assert.match(globals, /\.primary-nav a\s*\{[\s\S]*?font-family:\s*var\(--font-interface\)/u);
  assert.match(
    homeStyles,
    /:global\(\.site-shell--particle \.wordmark\)\s*\{[\s\S]*?font-family:\s*var\(--font-signature\)/u,
  );
  assert.match(
    homeStyles,
    /:global\(\.site-shell--particle \.primary-nav a\)\s*\{[\s\S]*?font-family:\s*var\(--font-interface\)/u,
  );
  assert.doesNotMatch(globals, /Instrument Sans/u);
  assert.doesNotMatch(homeStyles, /font-family:\s*system-ui/u);

  for (const font of [
    "newsreader-variable-latin.woff2",
    "newsreader-variable-italic-latin.woff2",
    "shantell-sans-variable-latin.woff2",
  ]) {
    assert.match(layout, new RegExp(`/assets/fonts/${font.replace(".", "\\.")}`, "u"));
    assert.ok(existsSync(path.join(ROOT, "public", "assets", "fonts", font)));
    assert.ok(existsSync(path.join(OUT, "assets", "fonts", font)));
  }

  assert.ok(existsSync(path.join(ROOT, "public", "assets", "fonts", "licenses", "newsreader-OFL.txt")));
  assert.ok(existsSync(path.join(ROOT, "public", "assets", "fonts", "licenses", "shantell-sans-OFL.txt")));
  assert.ok(!existsSync(path.join(ROOT, "public", "assets", "fonts", "instrument-sans-variable-latin.woff2")));
});

test("legacy alternate runtimes stay out of the production artifact", async () => {
  const code = (await Promise.all(
    (await walk(OUT))
      .filter((file) => /\.(?:html|js|json)$/iu.test(file))
      .map((file) => readFile(file, "utf8")),
  )).join("\n").toLowerCase();
  for (const marker of [["vin", "ext"].join(""), ["wrang", "ler"].join(""), "vite-rsc"]) {
    assert.ok(!code.includes(marker), `Legacy runtime marker remains: ${marker}`);
  }
});
