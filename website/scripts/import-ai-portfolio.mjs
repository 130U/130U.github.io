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
const showcasePath = path.join(root, "content/experience-showcase.json");
const showcase = JSON.parse(readFileSync(showcasePath, "utf8"));
const beforeOtherEntries = JSON.stringify(showcase.entries.slice(4));
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
  writeFileSync(articlePath, `${JSON.stringify(article, null, 2)}\n`);
}
assert.equal(JSON.stringify(showcase.entries.slice(4)), beforeOtherEntries, "Only the four AI entries may change");
writeFileSync(showcasePath, `${JSON.stringify(showcase, null, 2)}\n`);
console.log("Imported four AI briefs, disclosures, contributions, architectural contexts, and complete manuscripts.");
