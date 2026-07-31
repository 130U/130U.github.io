import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const OUT = path.join(ROOT, "out");
const SITE_ORIGIN = "https://www.theodoreoy.com";
const BASELINE_PATH = path.join(ROOT, "tests", "fixtures", "content-baseline.json");
const ACCESSIBLE_LABEL_BASELINE_PATH = path.join(
  ROOT,
  "tests",
  "fixtures",
  "accessible-label-baseline.json",
);
const ACCESSIBLE_LABELLEDBY_BASELINE_PATH = path.join(
  ROOT,
  "tests",
  "fixtures",
  "accessible-labelledby-baseline.json",
);
const PUBLISHED_COPY_DIR = path.join(ROOT, "tests", "fixtures", "published-copy");
const ARCHIVE_PATH = path.join(
  ROOT,
  "content",
  "past-experience",
  "archive-through-2026-06-30.md",
);

const baseline = JSON.parse(await readFile(BASELINE_PATH, "utf8"));
const accessibleLabelBaseline = JSON.parse(
  await readFile(ACCESSIBLE_LABEL_BASELINE_PATH, "utf8"),
);
const accessibleLabelledByBaseline = JSON.parse(
  await readFile(ACCESSIBLE_LABELLEDBY_BASELINE_PATH, "utf8"),
);
const publishedCopySnapshots = await Promise.all(
  (await readdir(PUBLISHED_COPY_DIR))
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map(async (file) => ({
      file,
      snapshot: JSON.parse(await readFile(path.join(PUBLISHED_COPY_DIR, file), "utf8")),
    })),
);
const frozenBaselineRoutes = Object.keys(baseline.routes);
const htmlCache = new Map();

const domainRoutes = [
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

const immutableFiles = new Map([
  [
    "content/past-experience/archive-through-2026-06-30.md",
    "8a016cedb94a308c43b553d79aaeecec0640024314336734ff7bdb2ef535f64c",
  ],
  [
    "public/assets/brand/og.png",
    "7422f52bed63b85953f5065c6c5de4bfdea57e5143917d1e120c6b04ce6fca7c",
  ],
  [
    "public/assets/posts/wam-vla-two-paths-en.png",
    "09af8d758163a74c78d52bcdf4be18066ba5e4f4ee933d5fe6e7fd22efe6dc80",
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

function decodeHtml(value) {
  const named = {
    amp: "&",
    apos: "'",
    copy: "©",
    gt: ">",
    larr: "←",
    ldquo: "“",
    lsquo: "‘",
    lt: "<",
    mdash: "—",
    middot: "·",
    nbsp: " ",
    ndash: "–",
    pi: "π",
    quot: '"',
    rarr: "→",
    rdquo: "”",
    rsquo: "’",
  };

  return value.replace(
    /&(?:#(\d+)|#x([\da-f]+)|([a-z][\da-z]+));/gi,
    (entity, decimal, hexadecimal, name) => {
      if (decimal) return String.fromCodePoint(Number(decimal));
      if (hexadecimal) return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
      return named[name.toLowerCase()] ?? entity;
    },
  );
}

function normalizeText(value) {
  return decodeHtml(value).normalize("NFC").replace(/\s+/gu, " ").trim();
}

function textContent(fragment) {
  return normalizeText(
    fragment
      .replace(/<!--[\s\S]*?-->/gu, " ")
      .replace(/<(script|style|template|noscript)\b[\s\S]*?<\/\1\s*>/giu, " ")
      .replace(/<[^>]+>/gu, " "),
  );
}

function visibleBodyText(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/iu)?.[1];
  assert.ok(body, "Exported HTML must contain a body element");
  return textContent(body);
}

function mainMarkup(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/iu)?.[1];
  assert.notEqual(main, undefined, "Exported page must contain a main element");
  return main;
}

function tokenize(value) {
  return (
    normalizeText(value).match(
      /[\p{L}\p{M}\p{N}]+|[^\s\p{L}\p{M}\p{N}]/gu,
    ) ?? []
  );
}

function assertTokenSubsequence(expectedText, actualText, message) {
  const expected = tokenize(expectedText);
  const actual = tokenize(actualText);
  let cursor = 0;

  for (let index = 0; index < expected.length; index += 1) {
    const token = expected[index];
    while (cursor < actual.length && actual[cursor] !== token) cursor += 1;
    if (cursor === actual.length) {
      const context = expected.slice(Math.max(0, index - 8), index + 9).join(" ");
      assert.fail(
        `${message}: original token ${JSON.stringify(token)} at index ${index} ` +
          `is missing or out of order (baseline context: ${context})`,
      );
    }
    cursor += 1;
  }
}

function attribute(attributes, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = attributes.match(
    new RegExp(
      `(?:^|\\s)${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
      "iu",
    ),
  );
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3] ?? "") : undefined;
}

function hasClass(attributes, className) {
  return (attribute(attributes, "class") ?? "")
    .split(/\s+/u)
    .includes(className);
}

function extractHeadings(html) {
  const result = [];
  const elements = html.matchAll(/<(h[1-6]|p)\b([^>]*)>([\s\S]*?)<\/\1\s*>/giu);

  for (const match of elements) {
    const [tag, attributes, inner] = match.slice(1);
    if (tag.toLowerCase() === "p" && !hasClass(attributes, "profile-name")) continue;
    result.push({
      level: tag.toLowerCase() === "p" ? 2 : Number(tag.slice(1)),
      text: textContent(inner),
      id: attribute(attributes, "id"),
    });
  }

  return result;
}

function extractLinks(html) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/giu)].map(
    ([, attributes, inner]) => ({
      label: textContent(inner),
      href: attribute(attributes, "href"),
      ariaLabel: attribute(attributes, "aria-label"),
      target: attribute(attributes, "target"),
    }),
  );
}

function extractImages(html) {
  return [...html.matchAll(/<img\b([^>]*)>/giu)].map(([, attributes]) => ({
    src: attribute(attributes, "src"),
    alt: attribute(attributes, "alt") ?? "",
    width: attribute(attributes, "width"),
    height: attribute(attributes, "height"),
  }));
}

function extractTimes(html) {
  return [...html.matchAll(/<time\b([^>]*)>([\s\S]*?)<\/time\s*>/giu)].map(
    ([, attributes, inner]) => ({
      text: textContent(inner),
      dateTime: attribute(attributes, "datetime"),
    }),
  );
}

function extractIds(html) {
  return [...html.matchAll(/\sid\s*=\s*(?:"([^"]*)"|'([^']*)')/giu)].map(
    (match) => decodeHtml(match[1] ?? match[2] ?? ""),
  );
}

function extractTitle(html) {
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/iu)?.[1];
  assert.notEqual(title, undefined, "Exported page must contain a title");
  return textContent(title);
}

function extractDescription(html) {
  for (const [, attributes] of html.matchAll(/<meta\b([^>]*)>/giu)) {
    if ((attribute(attributes, "name") ?? "").toLowerCase() === "description") {
      return normalizeText(attribute(attributes, "content") ?? "");
    }
  }
  assert.fail("Exported page must contain a meta description");
}

function extractAriaLabels(html) {
  const markup = html.replace(
    /<(script|style|template|noscript)\b[\s\S]*?<\/\1\s*>/giu,
    " ",
  );
  const result = [];

  for (const [, tag, attributes] of markup.matchAll(
    /<([a-z][\w:-]*)\b([^>]*)>/giu,
  )) {
    const value = attribute(attributes, "aria-label");
    if (value === undefined) continue;
    result.push({
      tag: tag.toLowerCase(),
      role: attribute(attributes, "role") ?? null,
      value,
    });
  }

  return result;
}

function extractAriaLabelledBy(html) {
  const markup = html.replace(
    /<(script|style|template|noscript)\b[\s\S]*?<\/\1\s*>/giu,
    " ",
  );
  const result = [];

  for (const [, tag, attributes] of markup.matchAll(
    /<([a-z][\w:-]*)\b([^>]*)>/giu,
  )) {
    const value = attribute(attributes, "aria-labelledby");
    if (value === undefined) continue;
    result.push({
      tag: tag.toLowerCase(),
      role: attribute(attributes, "role") ?? null,
      value,
    });
  }

  return result;
}

function extractAriaAttributes(html) {
  const markup = html.replace(
    /<(script|style|template|noscript)\b[\s\S]*?<\/\1\s*>/giu,
    " ",
  );
  const result = [];

  for (const [, tag, attributes] of markup.matchAll(
    /<([a-z][\w:-]*)\b([^>]*)>/giu,
  )) {
    for (const name of ["aria-label", "aria-labelledby"]) {
      const value = attribute(attributes, name);
      if (value !== undefined) result.push({ tag: tag.toLowerCase(), name, value });
    }
  }

  return result;
}

function extractCanonicalUrls(html) {
  const result = [];
  for (const [, attributes] of html.matchAll(/<link\b([^>]*)>/giu)) {
    const rel = (attribute(attributes, "rel") ?? "").toLowerCase().split(/\s+/u);
    if (rel.includes("canonical")) result.push(attribute(attributes, "href"));
  }
  return result;
}

function extractOpenGraphUrls(html) {
  const result = [];
  for (const [, attributes] of html.matchAll(/<meta\b([^>]*)>/giu)) {
    if ((attribute(attributes, "property") ?? "").toLowerCase() === "og:url") {
      result.push(attribute(attributes, "content"));
    }
  }
  return result;
}

function canonicalUrl(route) {
  return new URL(route, SITE_ORIGIN).toString();
}

function recordMatches(expected, actual, tokenFields = new Set()) {
  if (typeof expected !== "object" || expected === null) return actual === expected;
  return Object.entries(expected).every(([key, value]) => {
    if (tokenFields.has(key)) {
      try {
        assertTokenSubsequence(value, actual[key] ?? "", `${key} changed`);
        return true;
      } catch {
        return false;
      }
    }
    return actual[key] === value;
  });
}

function assertRecordSubsequence(
  expectedRecords,
  actualRecords,
  message,
  tokenFields = new Set(),
) {
  let cursor = 0;
  for (const expected of expectedRecords) {
    while (
      cursor < actualRecords.length &&
      !recordMatches(expected, actualRecords[cursor], tokenFields)
    ) {
      cursor += 1;
    }
    if (cursor === actualRecords.length) {
      assert.fail(`${message}: missing or reordered ${JSON.stringify(expected)}`);
    }
    cursor += 1;
  }
}

async function routeHtml(route) {
  if (!htmlCache.has(route)) {
    const relative = route === "/" ? ["index.html"] : [
      ...route.replace(/^\/+|\/+$/gu, "").split("/"),
      "index.html",
    ];
    const file = path.join(OUT, ...relative);
    htmlCache.set(route, await readFile(file, "utf8"));
  }
  return htmlCache.get(route);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function pngDimensions(bytes) {
  assert.equal(
    bytes.subarray(1, 4).toString("ascii"),
    "PNG",
    "Expected a PNG source image",
  );
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(absolute)));
    else result.push(absolute);
  }
  return result;
}

function localReference(reference, pageRoute) {
  if (!reference || /^(?:data|mailto|tel|javascript):/iu.test(reference)) return null;
  const url = new URL(reference, new URL(pageRoute, `${SITE_ORIGIN}/`));
  if (!["http:", "https:"].includes(url.protocol)) return null;
  if (!["www.theodoreoy.com", "theodoreoy.com"].includes(url.hostname)) return null;
  return url;
}

function artifactCandidates(url) {
  const pathname = decodeURIComponent(url.pathname);
  const relative = pathname.replace(/^\/+/, "").split("/").filter(Boolean);

  if (pathname === "/") return [path.join(OUT, "index.html")];
  if (pathname.endsWith("/")) return [path.join(OUT, ...relative, "index.html")];

  const direct = path.join(OUT, ...relative);
  if (path.extname(pathname)) return [direct];
  return [direct, path.join(direct, "index.html"), `${direct}.html`];
}

async function assertReferenceResolves(reference, pageRoute, source) {
  const url = localReference(reference, pageRoute);
  if (!url) return;

  assert.notEqual(
    url.pathname,
    "/_next/image",
    `${source} uses the runtime Next image optimizer, which cannot serve a static export`,
  );

  const candidates = artifactCandidates(url);
  const resolved = candidates.find((candidate) => existsSync(candidate));
  assert.ok(
    resolved,
    `${source} references ${reference}, but no exported artifact exists (${candidates.join(", ")})`,
  );

  if (url.hash && resolved.endsWith(".html")) {
    const targetHtml = await readFile(resolved, "utf8");
    const targetId = decodeURIComponent(url.hash.slice(1));
    assert.ok(
      extractIds(targetHtml).includes(targetId),
      `${source} references missing fragment #${targetId}`,
    );
  }
}

function htmlReferences(html) {
  const references = [];
  for (const match of html.matchAll(/<(a|link|img|script|source)\b([^>]*)>/giu)) {
    const tag = match[1].toLowerCase();
    const attributes = match[2];
    for (const name of ["href", "src"]) {
      const value = attribute(attributes, name);
      if (value) references.push({ value, source: `<${tag} ${name}>` });
    }
    const srcset = attribute(attributes, "srcset");
    if (srcset) {
      for (const candidate of srcset.split(",")) {
        const value = candidate.trim().split(/\s+/u)[0];
        if (value) references.push({ value, source: `<${tag} srcset>` });
      }
    }
  }

  for (const [, attributes] of html.matchAll(/<meta\b([^>]*)>/giu)) {
    const key = (
      attribute(attributes, "property") ?? attribute(attributes, "name") ?? ""
    ).toLowerCase();
    if (["og:image", "twitter:image"].includes(key)) {
      const value = attribute(attributes, "content");
      if (value) references.push({ value, source: `<meta ${key}>` });
    }
  }

  return references;
}

function elementsWithClass(html, tagName, className) {
  const expression = new RegExp(
    `<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}\\s*>`,
    "giu",
  );
  return [...html.matchAll(expression)].filter((match) => hasClass(match[1], className));
}

function elementsWithAnyClass(html, tagName, classNames) {
  const matches = classNames.flatMap((className) =>
    elementsWithClass(html, tagName, className),
  );
  return [...new Map(matches.map((match) => [match.index, match])).values()].sort(
    (left, right) => left.index - right.index,
  );
}

function normalizeRoute(value) {
  const pathname = new URL(value, SITE_ORIGIN).pathname;
  return pathname === "/" ? "/" : `${pathname.replace(/\/+$/u, "")}/`;
}

async function exportedPublicRoutes() {
  const routes = [];

  for (const file of await walk(OUT)) {
    if (path.basename(file) !== "index.html") continue;
    const relativeDirectory = path
      .relative(OUT, path.dirname(file))
      .split(path.sep)
      .filter(Boolean);
    if (["404", "_not-found"].includes(relativeDirectory[0])) continue;
    routes.push(relativeDirectory.length === 0 ? "/" : `/${relativeDirectory.join("/")}/`);
  }

  return routes.sort();
}

async function sitemapRoutes() {
  const sitemap = await readFile(path.join(OUT, "sitemap.xml"), "utf8");
  return [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/giu)]
    .map((match) => normalizeRoute(decodeHtml(match[1].trim())))
    .sort();
}

test("the preservation fixture is immutable and covers exactly 11 public routes", () => {
  assert.equal(baseline.schemaVersion, 1);
  assert.equal(baseline.baselineCommit, "69d6e7134132da51f4961dbe5509fc6adb657284");
  assert.equal(accessibleLabelBaseline.schemaVersion, 1);
  assert.equal(
    accessibleLabelBaseline.baselineCommit,
    "69d6e7134132da51f4961dbe5509fc6adb657284",
  );
  assert.equal(accessibleLabelledByBaseline.schemaVersion, 1);
  assert.equal(
    accessibleLabelledByBaseline.baselineCommit,
    "69d6e7134132da51f4961dbe5509fc6adb657284",
  );
  assert.equal(frozenBaselineRoutes.length, 11);
  assert.deepEqual(frozenBaselineRoutes, [
    "/",
    "/education/",
    "/now/",
    "/past-experience/",
    "/past-experience/artificial-intelligence/",
    "/past-experience/data-science/",
    "/past-experience/environmental-social-and-governance/",
    "/past-experience/finance/",
    "/past-experience/stem-academic-competitions-and-training/",
    "/personal-posts/",
    "/personal-posts/from-vision-and-instructions-to-robot-actions/",
  ]);
  assert.deepEqual(Object.keys(accessibleLabelBaseline.routes), frozenBaselineRoutes);

  for (const [route, record] of Object.entries(baseline.routes)) {
    const expectedFile = route === "/" ? "index.html" : `${route.slice(1)}index.html`;
    assert.equal(record.file, expectedFile, `${route} baseline file mapping is inconsistent`);
    const text = gunzipSync(Buffer.from(record.visibleTextGzipBase64, "base64")).toString(
      "utf8",
    );
    assert.equal(
      sha256(Buffer.from(text)),
      record.visibleTextSha256,
      `${route} baseline payload does not match its recorded hash`,
    );
  }

  for (const domain of domainRoutes) {
    const record = baseline.routes[domain.route];
    assert.equal(record.headings[1]?.text, domain.name);
    assert.equal(
      record.title,
      `${domain.name} | Past Experience | Theodore Ouyang`,
      `${domain.route} baseline title does not match its route`,
    );
  }
});

test("the official Next export contains all public routes and the custom 404", async () => {
  const output = await stat(OUT);
  assert.ok(output.isDirectory(), "Run the official Next static build before the tests");

  const currentRoutes = await exportedPublicRoutes();
  assert.ok(currentRoutes.length >= frozenBaselineRoutes.length);
  for (const route of currentRoutes) {
    const html = await routeHtml(route);
    assert.match(html, /^<!doctype html>/iu, `${route} must be a complete static HTML document`);
    assert.deepEqual(
      extractCanonicalUrls(html),
      [canonicalUrl(route)],
      `${route} must have exactly one self-referencing canonical URL`,
    );
    assert.deepEqual(
      extractOpenGraphUrls(html),
      [canonicalUrl(route)],
      `${route} must have exactly one matching Open Graph URL`,
    );
  }

  const notFoundPath = [path.join(OUT, "404.html"), path.join(OUT, "404", "index.html")].find(
    (candidate) => existsSync(candidate),
  );
  assert.ok(notFoundPath, "The export must include a static 404 page");
  const notFoundText = visibleBodyText(await readFile(notFoundPath, "utf8"));
  assert.match(notFoundText, /(?:\b404\b|page not found|not found)/iu);
});

test("every post-baseline route has an append-only published-copy snapshot", async () => {
  const currentRoutes = await exportedPublicRoutes();
  const snapshotRoutes = publishedCopySnapshots.map(({ file, snapshot }) => {
    assert.equal(snapshot.schemaVersion, 1, `${file} has an unsupported schema`);
    assert.equal(typeof snapshot.route, "string", `${file} must declare a route`);
    return snapshot.route;
  });

  assert.equal(
    new Set(snapshotRoutes).size,
    snapshotRoutes.length,
    "Published-copy snapshot routes must be unique",
  );
  assert.deepEqual(
    [...snapshotRoutes].sort(),
    currentRoutes.filter((route) => !frozenBaselineRoutes.includes(route)).sort(),
    "Every route added after the frozen baseline must have exactly one snapshot",
  );

  for (const { file, snapshot } of publishedCopySnapshots) {
    const html = await routeHtml(snapshot.route);
    const main = mainMarkup(html);
    assertTokenSubsequence(
      snapshot.mainText,
      textContent(main),
      `${file} published main copy changed`,
    );
    assert.equal(extractTitle(html), snapshot.title, `${file} title changed`);
    assert.equal(
      extractDescription(html),
      snapshot.description,
      `${file} description changed`,
    );
    assertRecordSubsequence(
      snapshot.headings,
      extractHeadings(main),
      `${file} headings changed`,
      new Set(["text"]),
    );
    assertRecordSubsequence(
      snapshot.links,
      extractLinks(main),
      `${file} links changed`,
      new Set(["label", "ariaLabel"]),
    );
    assertRecordSubsequence(
      snapshot.images,
      extractImages(main),
      `${file} images changed`,
      new Set(["alt"]),
    );
    assertRecordSubsequence(snapshot.ids, extractIds(main), `${file} IDs changed`);
    assertRecordSubsequence(snapshot.times, extractTimes(main), `${file} times changed`);
    assertRecordSubsequence(
      snapshot.ariaAttributes,
      extractAriaAttributes(main),
      `${file} accessible names changed`,
      new Set(["value"]),
    );
  }
});

test("no original rendered copy or public structure is deleted", async () => {
  for (const [route, record] of Object.entries(baseline.routes)) {
    const html = await routeHtml(route);
    const oldText = gunzipSync(Buffer.from(record.visibleTextGzipBase64, "base64")).toString(
      "utf8",
    );

    assertTokenSubsequence(oldText, visibleBodyText(html), `${route} rendered copy changed`);
    assert.equal(extractTitle(html), record.title, `${route} title changed`);
    assert.equal(extractDescription(html), record.description, `${route} description changed`);

    assertRecordSubsequence(
      record.headings,
      extractHeadings(html),
      `${route} headings changed`,
      new Set(["text"]),
    );
    assertRecordSubsequence(
      record.links,
      extractLinks(html),
      `${route} link labels or destinations changed`,
      new Set(["label", "ariaLabel"]),
    );
    assertRecordSubsequence(
      record.images.map(({ alt }) => ({ alt })),
      extractImages(html),
      `${route} image alternative text changed`,
      new Set(["alt"]),
    );
    assertRecordSubsequence(record.times, extractTimes(html), `${route} time metadata changed`);
    assertRecordSubsequence(
      accessibleLabelBaseline.routes[route],
      extractAriaLabels(html),
      `${route} accessible labels changed`,
      new Set(["value"]),
    );
    assertRecordSubsequence(
      accessibleLabelledByBaseline.routes[route] ?? [],
      extractAriaLabelledBy(html),
      `${route} accessible label references changed`,
      new Set(["value"]),
    );

    // _R_ was the obsolete Vinext bootstrap script ID, not authored page content.
    const authoredIds = record.ids.filter((id) => id !== "_R_");
    assertRecordSubsequence(authoredIds, extractIds(html), `${route} authored IDs changed`);
  }
});

test("all internal links, image sources, scripts, styles, and responsive sources resolve", async () => {
  const pages = await exportedPublicRoutes();
  if (existsSync(path.join(OUT, "404.html"))) pages.push("/404.html");

  for (const route of pages) {
    const html =
      route === "/404.html"
        ? await readFile(path.join(OUT, "404.html"), "utf8")
        : await routeHtml(route);
    for (const reference of htmlReferences(html)) {
      await assertReferenceResolves(reference.value, route, `${route} ${reference.source}`);
    }
  }

  for (const file of (await walk(OUT)).filter((candidate) => candidate.endsWith(".css"))) {
    const css = await readFile(file, "utf8");
    const route = `/${path.relative(OUT, file).split(path.sep).join("/")}`;
    for (const match of css.matchAll(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^)'"\s]+))\s*\)/giu)) {
      const reference = match[1] ?? match[2] ?? match[3];
      await assertReferenceResolves(reference, route, `${route} CSS url()`);
    }
  }
});

test("the exported runtime is free of Vinext and Cloudflare scaffolding", async () => {
  const textExtensions = new Set([
    ".css",
    ".html",
    ".js",
    ".json",
    ".map",
    ".mjs",
    ".txt",
    ".xml",
  ]);
  const forbiddenPath =
    /(?:__VINEXT|_vinext|\bvinext\b|vite-rsc|\bcloudflare\b|\bwrangler\b)/iu;
  const forbiddenContent =
    /(?:__VINEXT|_vinext|\bvinext\b|vite-rsc|\bwrangler\b|@cloudflare\/vite-plugin)/iu;

  for (const file of await walk(OUT)) {
    const relative = path.relative(OUT, file).split(path.sep).join("/");
    assert.doesNotMatch(relative, forbiddenPath, `Forbidden runtime artifact: ${relative}`);
    if (!textExtensions.has(path.extname(file).toLowerCase())) continue;
    assert.doesNotMatch(
      await readFile(file, "utf8"),
      forbiddenContent,
      `Forbidden runtime reference in ${relative}`,
    );
  }
});

test("robots, sitemap, and exported HTML publish the same canonical route manifest", async () => {
  const robotsPath = path.join(OUT, "robots.txt");
  const sitemapPath = path.join(OUT, "sitemap.xml");
  assert.ok(existsSync(robotsPath), "robots.txt must be part of the static export");
  assert.ok(existsSync(sitemapPath), "sitemap.xml must be part of the static export");

  const robots = await readFile(robotsPath, "utf8");
  assert.match(robots, /^User-agent:\s*\*/imu);
  assert.match(robots, /^Allow:\s*\/$/imu);
  assert.match(robots, /^Sitemap:\s*https:\/\/www\.theodoreoy\.com\/sitemap\.xml$/imu);

  const locations = await sitemapRoutes();
  assert.equal(new Set(locations).size, locations.length, "Sitemap routes must be unique");
  assert.deepEqual(
    locations,
    await exportedPublicRoutes(),
    "Sitemap and exported HTML routes must match exactly",
  );
  for (const route of frozenBaselineRoutes) {
    assert.ok(locations.includes(route), `Sitemap is missing ${route}`);
  }
});

test("canonical archive text and original source assets remain intact", async () => {
  for (const [relative, expected] of immutableFiles) {
    const source = path.join(ROOT, ...relative.split("/"));
    const sourceBytes = await readFile(source);
    const bytesForHash = relative.endsWith(".md")
      ? Buffer.from(sourceBytes.toString("utf8").replace(/\r\n?/gu, "\n"), "utf8")
      : sourceBytes;
    assert.equal(sha256(bytesForHash), expected, `${relative} changed`);

    if (relative === "public/assets/posts/wam-vla-two-paths-en.png") {
      assert.deepEqual(
        pngDimensions(sourceBytes),
        { width: 2880, height: 1620 },
        `${relative} intrinsic dimensions changed`,
      );
    }

    if (relative.startsWith("public/")) {
      const exported = path.join(OUT, ...relative.slice("public/".length).split("/"));
      assert.equal(
        sha256(await readFile(exported)),
        expected,
        `${relative} was not copied intact into the static export`,
      );
    }
  }
});

test("the Past Experience archive keeps its five-domain, 16-entry, 92-bullet structure", async () => {
  const source = await readFile(ARCHIVE_PATH, "utf8");
  const domainSection = source.split(/^## Domain Experience\s*$/mu)[1];
  assert.ok(domainSection, "Domain Experience is missing from the archive");

  const sourceDomains = [...domainSection.matchAll(/^###\s+(.+)$/gmu)].map((match) =>
    match[1].trim(),
  );
  assert.deepEqual(sourceDomains, domainRoutes.map(({ name }) => name));
  assert.equal((domainSection.match(/^####\s+/gmu) ?? []).length, 16);
  assert.equal((domainSection.match(/^\*\*Project:\*\*/gmu) ?? []).length, 16);
  assert.equal((domainSection.match(/^-\s+/gmu) ?? []).length, 92);

  let renderedEntries = 0;
  let renderedBullets = 0;
  for (const domain of domainRoutes) {
    const html = await routeHtml(domain.route);
    const entries = elementsWithAnyClass(html, "article", [
      "archive-entry",
      "experience-entry",
    ]);
    const bullets = entries.reduce(
      (count, entry) => count + (entry[2].match(/<li\b/giu) ?? []).length,
      0,
    );
    assert.equal(entries.length, domain.entries, `${domain.name} entry count changed`);
    assert.equal(bullets, domain.bullets, `${domain.name} bullet count changed`);
    renderedEntries += entries.length;
    renderedBullets += bullets;
  }
  assert.equal(renderedEntries, 16);
  assert.equal(renderedBullets, 92);

  const artificialIntelligence = visibleBodyText(
    await routeHtml("/past-experience/artificial-intelligence/"),
  );
  assert.match(
    artificialIntelligence,
    /Designed graduate-level, computation-heavy scientific reasoning benchmarks to probe the capability boundaries of a frontier large language model, prioritizing substance over trick wording/u,
    "The formerly unrendered Alignerr summary must now appear without replacing any bullets",
  );
});

test("Education retains all 31 selected courses", async () => {
  const html = await routeHtml("/education/");
  const coursework = elementsWithClass(html, "section", "coursework");
  assert.equal(coursework.length, 1, "Selected Coursework section must render exactly once");
  assert.equal((coursework[0][2].match(/<li\b/giu) ?? []).length, 31);
  assert.equal(elementsWithClass(coursework[0][2], "ul", "course-list").length, 4);
});

test("the research note retains its 10 sections and five primary-source citations", async () => {
  const route = "/personal-posts/from-vision-and-instructions-to-robot-actions/";
  const html = await routeHtml(route);
  const authoredSectionIds = baseline.routes[route].ids.filter((id) => id !== "_R_");
  const actualSectionIds = [...html.matchAll(/<section\b([^>]*)>/giu)]
    .map((match) => attribute(match[1], "id"))
    .filter(Boolean);

  assert.equal(authoredSectionIds.length, 10);
  assert.deepEqual(actualSectionIds, authoredSectionIds);

  const primaryStart = html.search(/<section\b[^>]*\bid=["']primary-sources["'][^>]*>/iu);
  assert.notEqual(primaryStart, -1, "Primary sources section is missing");
  const primaryEnd = html.indexOf("</section>", primaryStart);
  assert.notEqual(primaryEnd, -1, "Primary sources section is not closed");
  const primarySources = html.slice(primaryStart, primaryEnd);
  assert.equal((primarySources.match(/<li\b/giu) ?? []).length, 5);
  assert.equal(extractLinks(primarySources).length, 5);
});
