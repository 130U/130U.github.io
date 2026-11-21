import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { formulasOf, numbersOf, passageTablesFor, placePassageTables, wordsOf } from "../app/lib/content/passage-tables.ts";
import { parseResearchMarkdown } from "../app/lib/content/research-markdown.ts";

// A manuscript passage that reports a list of results reads as a research
// table. The table restates its passage: the passage's formulas, whole and in
// order; every number the passage writes; only the passage's words in its title,
// heads and labels; a display's number in the row that presents it. The page
// keeps the words before and after the table as paragraphs, the figure that
// followed the passage follows the table, and the display's anchor moves to its row.

const read = (relative) => readFile(new URL(`../${relative}`, import.meta.url), "utf8");
const decode = (text) => text.replace(/&#x27;|&#39;/gu, "'").replace(/&quot;/gu, '"').replace(/&amp;/gu, "&").replace(/&lt;/gu, "<").replace(/&gt;/gu, ">");
const ASIAN = "certified-valuation-of-arithmetic-asian-options";
const PAPERS = [ASIAN, "certified-joint-pricing-errors-in-rough-heston", "critical-dependence-stress-for-diversification-gains-under-fixed-marginals"];

async function article(slug) {
  const { markdown } = JSON.parse(await read(`content/selected-research/${slug}.json`));
  return { markdown, blocks: parseResearchMarkdown(markdown, { joinSoftLines: true }) };
}

/** The visible text of markup: drawn formulas, assistive MathML and hidden marks aside. */
function visible(markup) {
  return decode(markup
    .replace(/<script\b[\s\S]*?<\/script>/gu, " ")
    .replace(/<math\b[\s\S]*?<\/math>/gu, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gu, " ")
    .replace(/<!--[\s\S]*?-->/gu, "")
    .replace(/<span\b[^>]*\bdata-digit-group=""[^>]*>([^<]*)<\/span>/gu, "$1")
    .replace(/<[^>]+>/gu, " ")).replace(/\s+/gu, " ").trim();
}

test("every passage table restates its passage and resolves to one run of blocks", async () => {
  const expected = { [ASIAN]: ["asian-certificate", "asian-coefficient-estimates"] };
  for (const slug of PAPERS) {
    const { markdown, blocks } = await article(slug);
    const tables = placePassageTables(slug, blocks, markdown);
    assert.deepEqual(tables.map((table) => table.id), expected[slug] ?? []);
    for (const table of tables) {
      // Every block of the passage keeps exactly one marker: the head paragraph's, the table's or a row's.
      const marked = [...table.blockRows.keys(), ...(table.head ? [table.start] : [])].sort((a, b) => a - b);
      assert.deepEqual(marked, Array.from({ length: table.end - table.start + 1 }, (_, index) => table.start + index));
    }
  }
});

test("the build refuses a passage table that invents, drops or reorders what its passage states", async () => {
  const { markdown, blocks } = await article(ASIAN);
  const [certificate] = passageTablesFor(ASIAN);
  const place = (change) => () => placePassageTables(ASIAN, blocks, markdown, [change(structuredClone(certificate))]);
  assert.doesNotThrow(place((spec) => spec));
  assert.throws(place((spec) => { spec.rows[1].cells[1] = "$`[6.507844281,\\;6.519014107]`$"; return spec; }), /formulas whole and in order/u, "A changed digit is refused.");
  assert.throws(place((spec) => { spec.rows.splice(2, 1); return spec; }), /formulas whole and in order/u, "A dropped interval is refused.");
  assert.throws(place((spec) => { spec.rows.reverse(); return spec; }), /formulas whole and in order|displays in a row|presents no row/u, "Reordered rows are refused.");
  assert.throws(place((spec) => { spec.title = "The certificate for the 95–120 call spread"; return spec; }), /writes 120/u, "An invented number is refused.");
  assert.throws(place((spec) => { spec.rows[2].cells[0] = "Euler error"; return spec; }), /"error"/u, "A word the passage does not use is refused.");
  assert.throws(place((spec) => { delete spec.rows[0].display; spec.rows[0].cells[1] = "$`[6.508371733,\\;6.518868974]`$"; return spec; }), /displays in a row/u, "A display must keep its row and number.");
  assert.throws(place((spec) => { spec.at = "The continuous price"; spec.from = "Nothing opens with this"; return spec; }), /exactly one block/u);
  assert.throws(place((spec) => { spec.form = "Table 99."; return spec; }), /does not hold/u);
});

test("the evidence helpers read formulas, numbers and words as the manuscript writes them", () => {
  assert.deepEqual(formulasOf("lies in $`h=1/768`$ and\n\n$$\n\\begin{gathered} x \\end{gathered} \\tag{1.3}\n$$"), [{ tex: "h=1/768", display: false }, { tex: "\n\\begin{gathered} x \\end{gathered} \\tag{1.3}\n", display: true }]);
  assert.deepEqual(numbersOf("a 95–110 call spread with 2,097,152 vectors, $`0.03`$ aside"), ["95", "110", "2,097,152"]);
  assert.deepEqual(wordsOf("Standard errors of the Estimate"), ["standard", "error", "of", "the", "estimate"]);
});

test("Section 1.2 sets the certificate as a framed table: (1.3) in its row, the figure after it", async () => {
  const { markdown, blocks } = await article(ASIAN);
  const html = await read(`out/${ASIAN}/index.html`);
  const start = html.indexOf('data-passage-table="asian-certificate"');
  assert.ok(start > 0);
  const frameStart = html.lastIndexOf("<div", html.lastIndexOf("data-table-frame", start));
  const frame = html.slice(frameStart, html.indexOf("</table>", start));
  assert.equal(visible(/<p\b[^>]*data-table-title[^>]*>([\s\S]*?)<\/p>/u.exec(frame)?.[1] ?? ""), "The certificate for the 95–110 call spread");
  assert.match(frame, /data-table-zoom/u, "The table carries the magnifier of every research table.");
  const rows = [...frame.matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/gu)].map(([, attributes, markup]) => ({ attributes, text: visible(markup), markup }));
  assert.deepEqual(rows.map((row) => row.text), [
    "Quantity Enclosure",
    "Continuous price (1.3) [6.508371733, 6.518868974]",
    "Price under absorbed Euler, [6.507844281, 6.519014106]",
    "Difference [−0.011024692273, 0.010642371599]",
  ]);
  // The row of (1.3) is the display's place on the page: its anchor, its number, its TeX.
  const display = blocks.findIndex((block) => block.type === "equation" && block.tex.includes("\\tag{1.3}"));
  assert.match(rows[1].attributes, new RegExp(`data-research-block="${display}"`, "u"));
  assert.match(rows[1].attributes, /\bid="equation-1-3"/u);
  assert.match(rows[1].attributes, /data-equation-row="1\.3"/u);
  assert.match(rows[1].markup, /data-equation-number[^>]*>\(1\.3\)</u);
  assert.ok(rows[1].markup.includes(`data-research-math="display"`) && decode(rows[1].markup).includes(blocks[display].tex), "The row carries the display's TeX whole.");
  assert.match(rows[2].markup, /annotation[^>]*>h=1\/768</u, "h = 1/768 stays the manuscript's formula.");
  // The sentence before the table ends cleanly, and the replaced words are gone from the page.
  const head = html.slice(html.lastIndexOf("<p", frameStart), frameStart);
  assert.ok(visible(head).endsWith("with projection, tails, periodization and rounding inside the budget."), visible(head).slice(-80));
  assert.ok(!visible(html).includes("The continuous price lies in"));
  assert.ok(!visible(html).includes("and their difference in"));
  // The figure that followed the passage follows the table, and the anchor of (1.3) is its row's alone.
  const figure = html.indexOf('data-article-figure="asian-interval"');
  assert.ok(figure > start && !html.slice(start, figure).includes("<p "), "The interval figure follows the table directly.");
  assert.equal(html.match(/\bid="equation-1-3"/gu).length, 1);
  assert.ok(markdown.includes("The continuous price lies in"), "The manuscript itself is unchanged.");
});

test("Section 6.3 sets the sampling estimates as a table between Tables 9 and 10, and the paragraph resumes after it", async () => {
  const html = await read(`out/${ASIAN}/index.html`);
  const start = html.indexOf('data-passage-table="asian-coefficient-estimates"');
  assert.ok(start > 0 && start > html.indexOf("Table 9. Enclosures") && start < html.indexOf("Table 10. Sampling"));
  const table = html.slice(start, html.indexOf("</table>", start));
  const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gu)].map(([, markup]) => visible(markup));
  assert.deepEqual(rows, [
    "Initial variance 0.03 0.04 0.05 0.06",
    "Estimate −0.041015 −0.011364 0.008329 0.019917",
    "Standard error 0.002079 0.000566 0.000483 0.001274",
  ]);
  const after = html.slice(html.indexOf("</table>", start));
  assert.ok(visible(after).startsWith("The coefficient changes sign between"), visible(after).slice(0, 60));
  assert.ok(!visible(html).includes("in increasing order of initial variance, with standard errors"));
});
