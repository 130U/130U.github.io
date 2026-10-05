import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const OUT = path.join(ROOT, "out");
const MANIFEST_PATH = path.join(ROOT, "content", "visible-copy-manifest.json");
const IGNORED_INTERFACE_STRINGS = ["Menu", "Close"];
const ROUTES = [
  "/",
  "/education/",
  "/education/certified-valuation-arithmetic-asian-options/",
  "/past-experience/",
  "/past-experience/artificial-intelligence/",
  "/past-experience/artificial-intelligence/statistical-inference-and-resource-allocation-in-expert-data-production/",
  "/past-experience/artificial-intelligence/task-validity-in-financial-synthetic-data/",
  "/past-experience/artificial-intelligence/verification-and-supervision-in-scientific-reasoning-tasks/",
  "/past-experience/artificial-intelligence/evidence-uncertainty-and-decision-guarantees-in-investment-research/",
  "/past-experience/data-science/",
  "/past-experience/legal-research-and-policy-analysis/",
  "/past-experience/finance/",
  "/past-experience/stem-academic-competitions-and-training/",
  "/past-experience/legal-research-and-policy-analysis/autonomous-authority-in-space/",
  "/past-experience/legal-research-and-policy-analysis/small-states-and-strategic-space-dependence/",
  "/past-experience/legal-research-and-policy-analysis/solar-geoengineering-comparison-and-continuity/",
  "/past-experience/legal-research-and-policy-analysis/mangrove-restoration-and-compensatory-mitigation/",
  "/now/",
];
const AI_PROJECT_ROUTES = new Set(ROUTES.filter((route) => /^\/past-experience\/artificial-intelligence\/[^/]+\/$/u.test(route)));
AI_PROJECT_ROUTES.add("/education/certified-valuation-arithmetic-asian-options/");

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&nbsp;", " ")
    .replace(/&#(\d+);/gu, (_, digits) => String.fromCodePoint(Number(digits)))
    .replace(/&#x([\da-f]+);/giu, (_, digits) => String.fromCodePoint(Number.parseInt(digits, 16)));
}

function normalizeWhitespace(value) {
  return decodeHtml(value).replace(/\s+/gu, " ").trim();
}

function stripInterfaceStrings(value) {
  let result = value;
  for (const label of IGNORED_INTERFACE_STRINGS) {
    result = result.replace(new RegExp(`\\b${label}\\b`, "gu"), " ");
  }
  return normalizeWhitespace(result);
}

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function routeHtmlPath(route) {
  return route === "/"
    ? path.join(OUT, "index.html")
    : path.join(OUT, ...route.split("/").filter(Boolean), "index.html");
}

function firstMatch(html, pattern) {
  return normalizeWhitespace(html.match(pattern)?.[1] ?? "");
}

function metaContent(html, attribute, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const patterns = [
    new RegExp(`<meta\\b[^>]*${attribute}=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`, "iu"),
    new RegExp(`<meta\\b[^>]*content=["']([^"']*)["'][^>]*${attribute}=["']${escaped}["'][^>]*>`, "iu"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtml(match[1]);
  }
  return "";
}

function linkHref(html, rel) {
  const escaped = rel.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const patterns = [
    new RegExp(`<link\\b[^>]*rel=["']${escaped}["'][^>]*href=["']([^"']*)["'][^>]*>`, "iu"),
    new RegExp(`<link\\b[^>]*href=["']([^"']*)["'][^>]*rel=["']${escaped}["'][^>]*>`, "iu"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtml(match[1]);
  }
  return "";
}

function attributeValues(html, attribute) {
  const values = [];
  const pattern = new RegExp(`\\b${attribute}=["']([^"']*)["']`, "giu");
  for (const match of html.matchAll(pattern)) values.push(decodeHtml(match[1]));
  return values;
}

function withoutSvg(html) {
  const ranges = [];
  let depth = 0;
  let start = 0;
  for (const tag of html.matchAll(/<\/?svg\b[^>]*>/giu)) {
    if (tag[0].startsWith("</")) {
      depth -= 1;
      if (depth < 0) throw new Error("SVG elements must have balanced closing tags.");
      if (depth === 0) ranges.push([start, tag.index + tag[0].length]);
    } else if (!tag[0].endsWith("/>")) {
      if (depth === 0) start = tag.index;
      depth += 1;
    } else if (depth === 0) {
      ranges.push([tag.index, tag.index + tag[0].length]);
    }
  }
  if (depth !== 0) throw new Error("SVG elements must be complete.");
  for (const [from, to] of ranges.reverse()) html = html.slice(0, from) + " " + html.slice(to);
  return html;
}

function formulaSnapshot(html) {
  const formulas = [...html.matchAll(/<math\b([^>]*)>([\s\S]*?)<\/math>/giu)].map((match) => {
    const mode = match[1].match(/\bdata-ai-math="(inline|display)"/u)?.[1];
    const annotation = match[2].match(/<annotation\b[^>]*encoding="application\/x-tex"[^>]*>([\s\S]*?)<\/annotation>/iu)?.[1];
    if (!mode || annotation === undefined) throw new Error("AI formulas must preserve an exact TeX annotation and display mode.");
    return { mode, tex: decodeHtml(annotation) };
  });
  return { mathSourceSha256: sha256(JSON.stringify(formulas)), formulaCount: formulas.length };
}

function visibleText(html, preserveFormulaPositions = false) {
  let body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/iu)?.[1] ?? "";
  if (preserveFormulaPositions) {
    let formulaIndex = 0;
    body = withoutSvg(body).replace(/<math\b[\s\S]*?<\/math>/giu, () => ` MATH_${formulaIndex++} `);
  }
  const withoutNonVisibleContainers = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, " ")
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/giu, " ")
    .replace(/<annotation\b[^>]*>[\s\S]*?<\/annotation>/giu, " ")
    .replace(/<([a-z][\w:-]*)\b[^>]*data-visible-copy-role=["']visual-identity["'][^>]*>[\s\S]*?<\/\1>/giu, " ")
    .replace(/<([a-z][\w:-]*)\b[^>]*aria-hidden=["']true["'][^>]*>[\s\S]*?<\/\1>/giu, " ")
    .replace(/<!--([\s\S]*?)-->/gu, " ");
  return stripInterfaceStrings(withoutNonVisibleContainers.replace(/<[^>]+>/gu, " "));
}

function metadataSnapshot(html) {
  return {
    title: firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/iu),
    description: metaContent(html, "name", "description"),
    canonical: linkHref(html, "canonical"),
    openGraphTitle: metaContent(html, "property", "og:title"),
    openGraphDescription: metaContent(html, "property", "og:description"),
    openGraphUrl: metaContent(html, "property", "og:url"),
    twitterTitle: metaContent(html, "name", "twitter:title"),
    twitterDescription: metaContent(html, "name", "twitter:description"),
  };
}

async function routeSnapshot(route) {
  const html = await readFile(routeHtmlPath(route), "utf8");
  const isAiProject = AI_PROJECT_ROUTES.has(route);
  const text = visibleText(html, isAiProject);
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/iu)?.[1] ?? "";
  return {
    textSha256: sha256(text),
    characterCount: [...text].length,
    wordCount: text ? text.split(" ").length : 0,
    preview: text.slice(0, 160),
    altTexts: attributeValues(body, "alt"),
    ariaLabels: attributeValues(body, "aria-label"),
    metadata: metadataSnapshot(html),
    ...(isAiProject ? formulaSnapshot(body) : {}),
  };
}

async function createManifest() {
  const routes = {};
  for (const route of ROUTES) routes[route] = await routeSnapshot(route);
  return {
    version: 1,
    ignoredInterfaceStrings: IGNORED_INTERFACE_STRINGS,
    routes,
  };
}

function stableJson(value) {
  return JSON.stringify(value, null, 2);
}

async function verify() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  if (
    manifest.version !== 1 ||
    stableJson(Object.keys(manifest.routes ?? {}).sort()) !== stableJson([...ROUTES].sort())
  ) {
    throw new Error("The visible-copy manifest must cover exactly the registered website routes.");
  }
  if (stableJson(manifest.ignoredInterfaceStrings) !== stableJson(IGNORED_INTERFACE_STRINGS)) {
    throw new Error("The ignored interface strings must be Menu and Close.");
  }

  const failures = [];
  for (const route of ROUTES) {
    const expected = manifest.routes?.[route];
    if (!expected) {
      failures.push(`${route}: missing from visible-copy manifest`);
      continue;
    }
    const actual = await routeSnapshot(route);
    const fields = ["textSha256", "characterCount", "wordCount", "altTexts", "ariaLabels", "metadata"];
    if (AI_PROJECT_ROUTES.has(route)) fields.push("mathSourceSha256", "formulaCount");
    for (const field of fields) {
      if (stableJson(actual[field]) !== stableJson(expected[field])) {
        failures.push(
          `${route}: ${field} changed\nexpected ${stableJson(expected[field])}\nactual   ${stableJson(actual[field])}`,
        );
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(`Visible copy does not match its content manifest:\n\n${failures.join("\n\n")}`);
  }
  console.log("Visible text, metadata, alt text, and aria-label copy match the content manifest.");
}

if (process.argv.includes("--emit")) {
  console.log(stableJson(await createManifest()));
} else {
  await verify();
}
