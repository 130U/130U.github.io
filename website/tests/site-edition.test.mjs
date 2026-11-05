import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseResearchMarkdown } from "../app/lib/content/research-markdown.ts";

const SLUGS = [
  "critical-dependence-stress-for-portfolio-diversification",
  "certified-valuation-arithmetic-asian-options",
  "certified-rough-heston-valuation",
];
const FORMAL = /^\*\*(?:Definition|Assumption|Lemma|Proposition|Theorem|Corollary) \d/u;

function formulas(markdown) {
  return [...markdown.matchAll(/```math\n([\s\S]*?)\n```|\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$`([^`]*?)`\$|(?<!\\)\$([^$\n]+?)(?<!\\)\$/gu)].map((match) => ({
    tex: match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5] ?? match[6],
    display: match[1] !== undefined || match[2] !== undefined || match[3] !== undefined,
  }));
}
function paragraphs(markdown) { return markdown.split("\n\n").map((text) => text.trim()); }
function tableRows(markdown) { return markdown.split("\n").filter((line) => line.startsWith("|") || line.startsWith("<tr>")); }

for (const slug of SLUGS) {
  test(`${slug}: the site edition keeps the frozen mathematics, statements, tables and references`, async () => {
    const frozen = JSON.parse(await readFile(new URL(`../content/selected-research/${slug}.json`, import.meta.url), "utf8")).markdown;
    const source = (await readFile(new URL(`../content/selected-research/site-edition/${slug}.md`, import.meta.url), "utf8")).replace(/\r\n?/gu, "\n");
    const header = source.match(/^---\ndescription: (.+)\n---\n\n/u);
    assert.ok(header, "A site edition starts with its one-line description.");
    const edition = source.slice(header[0].length);

    const display = (markdown) => formulas(markdown).filter((formula) => formula.display).map((formula) => formula.tex);
    assert.deepEqual(display(edition), display(frozen), "Display mathematics keeps every TeX byte, in order.");
    const inline = (markdown) => [...new Set(formulas(markdown).filter((formula) => !formula.display).map((formula) => formula.tex))].sort();
    assert.deepEqual(inline(edition), inline(frozen), "Inline mathematics keeps the same expressions.");

    const published = new Set(paragraphs(edition));
    for (const statement of paragraphs(frozen).filter((text) => FORMAL.test(text))) assert.ok(published.has(statement), `Formal statement changed: ${statement.slice(0, 80)}`);
    assert.deepEqual(tableRows(edition), tableRows(frozen), "Tables stay verbatim.");
    assert.equal(edition.slice(edition.indexOf("\n## References")).trim(), frozen.slice(frozen.indexOf("\n## References")).trim(), "References stay verbatim.");

    const headings = (markdown) => parseResearchMarkdown(markdown, { joinSoftLines: true }).filter((block) => block.type === "heading").map((block) => block.source);
    assert.deepEqual(headings(edition), headings(frozen), "The chapter structure stays intact.");
  });
}
