import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sentenceTables } from "../app/lib/content/table-sentences.ts";

// Every row of a table holds one line: values, intervals, numbers, row labels
// and names never wrap, and only a column of sentences does, which its page
// names as such. A table wider than its column scrolls rather than wrapping a
// row (the browser layout check measures the lines at every width and on the
// stage).

const read = (relative) => readFile(new URL(`../${relative}`, import.meta.url), "utf8");
const decode = (text) => text.replace(/&#x27;|&#39;/gu, "'").replace(/&quot;/gu, '"').replace(/&amp;/gu, "&").replace(/&lt;/gu, "<").replace(/&gt;/gu, ">");
const text = (markup) => decode(markup.replace(/<math\b[\s\S]*?<\/math>/gu, "").replace(/<!--[\s\S]*?-->/gu, "").replace(/<[^>]+>/gu, "")).replace(/\s+/gu, " ").trim();
const ROUTES = [
  ["certified-valuation-of-arithmetic-asian-options", ""],
  ["critical-dependence-stress-for-diversification-gains-under-fixed-marginals", ""],
  ["certified-joint-pricing-errors-in-rough-heston", ""],
  ["large-scale-domain-expert-feedback-governance-and-adaptive-review", "experience/"],
  ["financial-task-design-and-synthetic-data-engineering", "experience/"],
  ["general-reasoning-evaluation-and-layered-verification", "experience/"],
  ["evidence-verification-and-robust-comparison-in-investment-research", "experience/"],
  ["mangrove-restoration-and-the-limits-of-compensatory-mitigation", "experience/"],
  ["small-states-and-the-governance-of-strategic-space-dependence", "experience/"],
];

/** Each table of a page: its first header cell's text, and for each body row the columns marked as sentences. */
function tables(html) {
  return [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gu)].map(([, inner]) => {
    const head = /<th\b[^>]*>([\s\S]*?)<\/th>/u.exec(inner);
    const rows = [...inner.matchAll(/<tbody>([\s\S]*?)<\/tbody>/gu)].flatMap(([, body]) => [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gu)]).map(([, row]) => [...row.matchAll(/<td\b([^>]*)>/gu)].map(([, cell]) => /\bdata-sentence=""/u.test(cell)));
    return { first: head ? text(head[1]) : "", rows };
  });
}

test("only the columns a page names as sentences wrap; every other cell holds one line", async () => {
  const named = sentenceTables();
  const found = new Set();
  for (const [slug, prefix] of ROUTES) {
    const html = await read(`out/${prefix}${slug}/index.html`);
    for (const table of tables(html)) {
      const entry = named.find((item) => item.slug === slug && item.firstCell === table.first);
      if (entry) found.add(`${slug}|${table.first}`);
      for (const row of table.rows) {
        const marked = row.flatMap((sentence, column) => (sentence ? [column] : []));
        assert.deepEqual(marked, entry ? [...entry.columns] : [], `${slug}, the table headed "${table.first}": the columns of sentences are the named ones.`);
      }
    }
  }
  assert.deepEqual([...found].sort(), named.map(({ slug, firstCell }) => `${slug}|${firstCell}`).sort(), "Every named table is a table of the site.");
});

test("on screen a cell wraps only in a column of sentences or as a heading", async () => {
  const css = await read("app/components/research/ResearchArticle.module.css");
  // Paper sets its own rule for wrapping, after the screen's.
  const screen = css.replace(/@media print\s*\{[\s\S]*$/u, "");
  const wrapping = [...screen.matchAll(/([^{}]+)\{[^}]*white-space:\s*normal[^}]*\}/gu)].map(([, selector]) => selector.replace(/\/\*[\s\S]*?\*\//gu, "").trim());
  assert.ok(wrapping.some((selector) => /\.sentence/u.test(selector)), "A column of sentences wraps.");
  for (const selector of wrapping) assert.match(selector, /\.sentence|thead \.cell|\.tableTitle/u, `Only a column of sentences or a heading wraps: ${selector}`);
});
