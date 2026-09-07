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
  "/past-experience/",
  "/past-experience/artificial-intelligence/",
  "/past-experience/data-science/",
  "/past-experience/environmental-social-and-governance/",
  "/past-experience/finance/",
  "/past-experience/stem-academic-competitions-and-training/",
  "/now/",
];

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

function visibleText(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/iu)?.[1] ?? "";
  const withoutNonVisibleContainers = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, " ")
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/giu, " ")
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
  const text = visibleText(html);
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/iu)?.[1] ?? "";
  return {
    textSha256: sha256(text),
    characterCount: [...text].length,
    wordCount: text ? text.split(" ").length : 0,
    preview: text.slice(0, 160),
    altTexts: attributeValues(body, "alt"),
    ariaLabels: attributeValues(body, "aria-label"),
    metadata: metadataSnapshot(html),
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
    for (const field of ["textSha256", "characterCount", "wordCount", "altTexts", "ariaLabels", "metadata"]) {
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
