import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceFile = "content/sources/ai-portfolio/theodore_ouyang_ai_portfolio_optimized.md";
const sourceBytes = readFileSync(path.join(root, sourceFile));
const source = sourceBytes.toString("utf8").replace(/\r\n?/gu, "\n");
const links = JSON.parse(readFileSync(path.join(root, "content/sources/ai-portfolio/citation-links.json"), "utf8"));
const revisions = JSON.parse(readFileSync(path.join(root, "content/sources/ai-portfolio/editorial-revisions.json"), "utf8"));
assert.equal(revisions.schemaVersion, 1, "Unsupported AI editorial revision schema");
assert.equal(revisions.sourceFile, sourceFile, "Revisions must target the frozen AI manuscript");
assert.equal(createHash("sha256").update(source).digest("hex"), revisions.sourceSha256, "The frozen manuscript changed");
const showcasePath = path.join(root, "content/experience-showcase.json");
const showcase = JSON.parse(readFileSync(showcasePath, "utf8"));
const beforeOtherEntries = JSON.stringify(showcase.entries.slice(4));
const generated = new Map([["content/experience-showcase.json", showcase]]);
const sourceDocument = {
  fileName: path.basename(sourceFile),
  path: sourceFile,
  sha256: createHash("sha256").update(sourceBytes).digest("hex"),
};

function capture(text, expression, label) {
  const match = text.match(expression);
  assert.ok(match, `Missing ${label}`);
  return match[1].trim();
}

function restoreLinks(markdown, definitions) {
  const escaped = definitions.map(({ text }) => text.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"));
  const byText = new Map(definitions.map(({ text, href }) => [text, href]));
  // One replacement pass prevents a short label from matching inside a longer link.
  return markdown.replace(new RegExp(escaped.join("|"), "gu"), (text) => `[${text}](${byText.get(text)})`);
}

function manuscript(markdown, definitions) {
  const numerals = ["I", "II", "III", "IV", "V", "VI", "VII"];
  let result = restoreLinks(markdown, definitions)
    .replace(/^## ([IVX]+)\. /gmu, (_, numeral) => `## ${numerals.indexOf(numeral) + 1} `)
    .replace(/^\s*\* /gmu, "• ");
  // Use the site's existing equation syntax while retaining every TeX expression.
  result = result.replace(/\$\$([\s\S]*?)\$\$|(?<!\\)\$([^$\r\n]+?)(?<!\\)\$/gu,
    (_, display, inline) => display === undefined ? `$\`${inline}\`$` : `$$\n${display.trim()}\n$$`);
  result = result.replace(/^\|[^\n]+\|\n\|[ :|-]+\|\n(?:\|[^\n]+\|(?:\n|$))+/gmu, (table) => {
    const rows = table.trim().split("\n").map((row) => row.slice(1, -1).split("|").map((cell) => cell.trim()));
    assert.ok(rows[1].every((cell) => /^:?-+:?$/u.test(cell)), "Expected table header separator");
    rows.splice(1, 1);
    assert.ok(rows.every((row) => row.length === rows[0].length), "Expected rectangular table");
    return `<table header-row="true">\n${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("\n")}\n</table>\n`;
  });
  return result.trim();
}

function contributionDetails(contributions) {
  const details = {};
  let parent = -1;
  for (const line of contributions.split("\n")) {
    if (line.startsWith("* ")) parent += 1;
    const child = line.match(/^ {2}(\*|\d+\.) (.+)$/u);
    if (!child) continue;
    assert.ok(parent >= 0, "Nested contributions require a parent contribution");
    const ordered = child[1] !== "*";
    details[parent] ??= { ordered, items: [] };
    assert.equal(details[parent].ordered, ordered, "A contribution detail list cannot mix list types");
    if (ordered) assert.equal(Number.parseInt(child[1], 10), details[parent].items.length + 1, "Ordered details must retain their source sequence");
    details[parent].items.push(child[2]);
  }
  return details;
}

function applyEditorialRevisions() {
  const ids = new Set();
  for (const revision of revisions.revisions) {
    assert.ok(!ids.has(revision.id), `Duplicate revision ${revision.id}`);
    ids.add(revision.id);
    assert.ok(revision.reason && revision.sourceRefs.length, `Revision ${revision.id} requires a reason and source references`);
    assert.ok(revision.before && revision.after && revision.before !== revision.after, `Empty revision ${revision.id}`);
    const target = generated.get(revision.file);
    assert.ok(target, `Revision ${revision.id} is outside the four AI articles and showcase`);
    if (revision.file === "content/experience-showcase.json") {
      assert.match(revision.jsonPointer, /^\/entries\/[0-3]\/(?:summary|keyContributions\/\d+|architecturalContext\/(?:title|text)|keyContributionDetails\/\d+\/items\/\d+)$/u, `Revision ${revision.id} targets unapproved entry fields`);
    } else {
      assert.equal(revision.jsonPointer, "/markdown", "Article revisions may change manuscript text only");
    }
    const keys = revision.jsonPointer.slice(1).split("/");
    let parent = target;
    for (const key of keys.slice(0, -1)) {
      assert.ok(Object.hasOwn(parent, key), `Revision ${revision.id} targets a missing field`);
      parent = parent[key];
    }
    const key = keys.at(-1);
    assert.ok(Object.hasOwn(parent, key) && typeof parent[key] === "string", `Revision ${revision.id} must target text`);
    assert.equal(parent[key].split(revision.before).length - 1, 1, `Revision ${revision.id} must match exactly once`);
    parent[key] = parent[key].replace(revision.before, () => revision.after);
    assert.equal(parent[key].split(revision.after).length - 1, 1, `Revision ${revision.id} must produce one exact reviewed fragment`);
  }
}

showcase.aiSourceDocument = sourceDocument;
showcase.categories.find(({ id }) => id === "01").disclosure = {
  title: "Confidentiality & Disclosure Note",
  text: capture(source, /^> (The following[^\n]+)$/mu, "index disclosure"),
};
const briefs = [...source.slice(source.indexOf("# PART 1:"), source.indexOf("# PART 2 & PART 3:")).matchAll(/^### ([^\n]+)\n([^\n]+)\n\n\[Read More >\]/gmu)];
const pages = source.split(/^# SUBPAGE \d{2}: [^\n]+\n/gmu).slice(1);
assert.equal(briefs.length, 4);
assert.equal(pages.length, 4);
for (let index = 0; index < 4; index += 1) {
  const page = pages[index];
  const url = capture(page, /\*\*URL\*\*: `([^`]+)`/u, "page URL");
  const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1);
  const articlePath = path.join(root, "content/artificial-intelligence", `${slug}.json`);
  const article = JSON.parse(readFileSync(articlePath, "utf8"));
  const entry = showcase.entries[index];
  entry.organization = briefs[index][1];
  entry.summary = briefs[index][2];
  entry.detailTitle = capture(page, /^## Duke University[^:\n]+: ([^\n]+)$/mu, "page title");
  for (const field of ["Position", "Location", "Dates"]) {
    entry.metadata[field.toLowerCase()] = capture(page, new RegExp(`\\*\\*${field}\\*\\*\\n([^\\n]+)`, "u"), field);
  }
  entry.disclosure = {
    title: "Confidentiality & Scope Disclosure",
    text: capture(page, /\*\*Confidentiality & Scope Disclosure\*\*\n([^\n]+)/u, "page disclosure"),
  };
  const contributions = capture(page, /## Key Contributions\n([\s\S]+?)\n## Architectural Context:/u, "contributions");
  entry.keyContributions = contributions.split("\n").filter((line) => line.startsWith("* ")).map((line) => line.slice(2));
  assert.ok(entry.keyContributions.length >= 5);
  const details = contributionDetails(contributions);
  if (Object.keys(details).length) entry.keyContributionDetails = details;
  else delete entry.keyContributionDetails;
  entry.architecturalContext = {
    title: capture(page, /^## (Architectural Context:[^\n]+)$/mu, "architectural title"),
    text: capture(page, /^## Architectural Context:[^\n]+\n([\s\S]+?)\n## Contents/mu, "architectural context"),
  };
  entry.notes = [];
  let body = page.slice(page.indexOf("## I. "));
  assert.ok(body.startsWith("## I. "));
  if (index === 3) {
    // Retain these two definitions from the preceding published manuscript.
    body = body.replace("For smooth nonlinear models where", String.raw`Set $m_f=\Delta_f(0)$ and $a_f=\nabla\Delta_f(0)$.

For smooth nonlinear models where`);
  }
  article.markdown = manuscript(body, links[slug]);
  article.sourceUrl = `https://github.com/130U/130U.github.io/blob/main/website/${sourceFile}`;
  article.sourceEditedAt = "2026-10-27";
  article.sourceDocument = sourceDocument;
  generated.set(`content/artificial-intelligence/${slug}.json`, article);
}
applyEditorialRevisions();
assert.equal(JSON.stringify(showcase.entries.slice(4)), beforeOtherEntries, "Only the four AI entries may change");
// Validate every revision before writing any generated content.
for (const [file, document] of generated) writeFileSync(path.join(root, file), `${JSON.stringify(document, null, 2)}\n`);
console.log(`Imported four AI manuscripts and all nested contributions; applied ${revisions.revisions.length} reviewed editorial revisions.`);
