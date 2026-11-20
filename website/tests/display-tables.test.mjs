import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  RESEARCH_MATH_ROW_SPACING_EM, RESEARCH_TABLE_ABOVE_RULE_EM, RESEARCH_TABLE_BELOW_RULE_EM, RESEARCH_TABLE_COLUMN_GAP_EM, RESEARCH_TABLE_RULED_GAP_EM,
  parseResearchDisplayTable, renderResearchDisplayTable,
} from "../app/lib/content/research-math.ts";

// A display that is one array is a table of mathematics. The page keeps every
// cell's TeX, its row and column, the equation number and the sentence it ends,
// and sets it as a formal table: no vertical rules, a firm rule under the row
// that heads the columns, rows one line of mathematics apart.
const ROOT = fileURLToPath(new URL("../", import.meta.url));
const MANUSCRIPTS = [
  ["selected-research", "critical-dependence-stress-for-diversification-gains-under-fixed-marginals", 1],
  ["selected-research", "certified-valuation-of-arithmetic-asian-options", 2],
  ["selected-research", "certified-joint-pricing-errors-in-rough-heston", 0],
  ["artificial-intelligence", "large-scale-domain-expert-feedback-governance-and-adaptive-review", 0],
  ["artificial-intelligence", "financial-task-design-and-synthetic-data-engineering", 0],
  ["artificial-intelligence", "general-reasoning-evaluation-and-layered-verification", 0],
  ["artificial-intelligence", "evidence-verification-and-robust-comparison-in-investment-research", 0],
];
const DISPLAY = /```math\n([\s\S]*?)\n```|\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/gu;

async function displays(group, slug) {
  const { markdown } = JSON.parse(await readFile(path.join(ROOT, "content", group, `${slug}.json`), "utf8"));
  return [...markdown.matchAll(DISPLAY)].map((match) => match[1] ?? match[2] ?? match[3]);
}

function decodeHtml(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|quot);/giu, (match, entity) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"' }[entity] ?? match;
  });
}

test("the manuscripts hold three tabular displays, each set as a formal table with its cells' TeX", async () => {
  const tables = [];
  for (const [group, slug, expected] of MANUSCRIPTS) {
    const found = (await displays(group, slug)).filter((tex) => parseResearchDisplayTable(tex));
    assert.equal(found.length, expected, `${slug} holds ${expected} tabular displays`);
    tables.push(...found);
  }
  const [regimes, displacement, quantiles] = tables.map((tex) => ({ tex, table: parseResearchDisplayTable(tex) }));
  const layout = ({ table }) => table.columns.map(({ align, gapEm }) => `${align}${gapEm}`).join(" ");

  // Dependence §2.3: the four regimes head the columns; the manuscript's rule after the
  // row labels becomes space, and the regime row stands over the firm rule.
  assert.equal(layout(regimes), `c${RESEARCH_TABLE_RULED_GAP_EM} r${RESEARCH_TABLE_COLUMN_GAP_EM} r1 r1 r0`);
  assert.deepEqual(regimes.table.rows.map((row) => row.rule), ["header", undefined, undefined]);
  assert.deepEqual(regimes.table.rows[0].cells, [String.raw`(1_{\{B>u\}},1_{\{A_\varepsilon>t\}})`, "(0,0)", "(1,0)", "(0,1)", "(1,1)"]);
  assert.deepEqual(regimes.table.rows[1].cells, [String.raw`\partial_{x_1}h_{u,t}`, "0", "1", String.raw`-(1+\varepsilon)`, String.raw`-\varepsilon`]);
  // The sentence's period after the last cell is not drawn; the assistive expression keeps the TeX whole.
  assert.deepEqual(regimes.table.rows[2].cells, [String.raw`\partial_{x_1}(h_{u,t}+\varepsilon H/2)`, String.raw`\varepsilon/2`, String.raw`1+\varepsilon/2`, String.raw`-1-\varepsilon/2`, String.raw`-\varepsilon/2`]);
  assert.match(regimes.tex, /-\\varepsilon\/2\.\s*\\end\{array\}/u);
  const regimesMarkup = renderResearchDisplayTable(regimes.tex);
  assert.equal(decodeHtml(regimesMarkup.mathml.match(/<annotation\b[^>]*>([\s\S]*?)<\/annotation>/u)[1]), regimes.tex);
  assert.equal(regimesMarkup.number, undefined);
  assert.doesNotMatch(regimesMarkup.rows[2].cells[4].svg, /data-c="2E"/u, "The last cell draws no sentence period");

  // Asian (7.8): every column rule becomes space; the \hline under the heading row is the firm rule.
  assert.equal(layout(displacement), "c2 c2 c0");
  assert.deepEqual(displacement.table.rows.map((row) => row.rule), ["header", undefined, undefined]);
  assert.deepEqual(displacement.table.rows.map((row) => row.cells[0]), [String.raw`\text{Case}`, String.raw`\text{Single quote}`, String.raw`\text{Nine quotes}`]);
  assert.deepEqual(displacement.table.rows.map((row) => row.cells[2]), [String.raw`\sup_{0\lt p\lt 1}|q_Q(p)-q_P(p)|`, String.raw`\le.008018821658`, String.raw`\le.012716404217`]);
  assert.equal(renderResearchDisplayTable(displacement.tex).number, "7.8", "The equation number stays with its table");

  // Asian §7.3 quantiles: no rules in the manuscript, so none on the page and no heading row.
  assert.equal(layout(quantiles), "l1 c1 c1 c0");
  assert.deepEqual(quantiles.table.rows.map((row) => row.rule), [undefined, undefined]);
  assert.deepEqual(quantiles.table.rows.map((row) => row.cells.join(" & ")), [
    String.raw`\text{one quote:} & [.0307690,.0307764] & [.0444067,.0444141] & [.0590917,.0590992]`,
    String.raw`\text{nine quotes:} & [.0308203,.0308350] & [.0435131,.0435425] & [.0587182,.0587256]`,
  ]);

  for (const { tex, table } of [regimes, displacement, quantiles]) {
    const markup = renderResearchDisplayTable(tex);
    // Each cell is typeset in text style, as TeX sets an array's cells, and is drawn alone.
    for (const [rowIndex, row] of markup.rows.entries()) {
      for (const [column, cell] of row.cells.entries()) {
        assert.ok(cell, `${tex.slice(0, 30)}: cell ${rowIndex},${column} is drawn`);
        assert.match(cell.svg, /^<svg\b[^>]*data-research-svg="cell"/u);
        assert.doesNotMatch(cell.svg, /<line\b|data-line=/u, "A cell draws no rule");
        assert.equal(decodeHtml(cell.mathml.match(/<annotation\b[^>]*>([\s\S]*?)<\/annotation>/u)[1]), table.rows[rowIndex].cells[column]);
        assert.match(cell.mathml, /data-research-math="inline"/u);
      }
    }
  }
});

test("only a display that is one array is a table, and its rules follow the table's structure", () => {
  for (const tex of [
    String.raw`\begin{aligned}a&=b\\c&=d\end{aligned}`,
    String.raw`\begin{cases}a,&x\\b,&y\end{cases}`,
    String.raw`\begin{pmatrix}a&b\\c&d\end{pmatrix}`,
    // In an augmented matrix the rule is part of the notation, and the delimiters make it a formula.
    String.raw`\left[\begin{array}{cc|c}1&0&2\\0&1&3\end{array}\right]`,
    String.raw`\begin{array}{c}a\\b\end{array}+c`,
    String.raw`x=\begin{array}{cc}a&b\end{array}`,
  ]) assert.equal(parseResearchDisplayTable(tex), undefined, tex);

  const rules = (tex) => parseResearchDisplayTable(tex).rows.map((row) => row.rule ?? "-").join(" ");
  // A ruled first column makes the first row the one that heads the columns.
  assert.equal(rules(String.raw`\begin{array}{c|cc}x&0&1\\f&a&b\\g&c&d\end{array}`), "header - -");
  // An \hline under the first row does too; with neither, no row heads the columns.
  assert.equal(rules(String.raw`\begin{array}{ccc}x&0&1\\\hline f&a&b\\g&c&d\end{array}`), "header - -");
  assert.equal(rules(String.raw`\begin{array}{ccc}x&0&1\\f&a&b\\g&c&d\end{array}`), "- - -");
  // A rule between later rows is a hairline; above the first row or below the last it is left to the white space.
  assert.equal(rules(String.raw`\begin{array}{cc}\hline x&0\\\hline f&a\\\hline g&c\\\hline\end{array}`), "header row -");
  assert.equal(rules(String.raw`\begin{array}{cc}x&0\\f&a\\\hline g&c\end{array}`), "- row -");
  // Outer rules add no space; inner ones become a second em between their columns.
  assert.deepEqual(parseResearchDisplayTable(String.raw`\begin{array}{|l||c|r|}a&b&c\end{array}`).columns.map(({ gapEm }) => gapEm), [2, 2, 0]);
  // A row break's own space is kept; a trailing break and a short row are completed.
  const spaced = parseResearchDisplayTable(String.raw`\begin{array}{cc}a&b\\[4pt]c\\\end{array}\tag{2.1}`);
  assert.deepEqual(spaced.rows.map((row) => row.extraEm ?? 0), [0, 0.4]);
  assert.deepEqual(spaced.rows[1].cells, ["c", ""]);
  // Nested groups and environments keep their own breaks.
  assert.deepEqual(parseResearchDisplayTable(String.raw`\begin{array}{cc}\text{a\&b}&\begin{matrix}1&2\\3&4\end{matrix}\end{array}.`).rows[0].cells, [String.raw`\text{a\&b}`, String.raw`\begin{matrix}1&2\\3&4\end{matrix}`]);

  for (const tex of [String.raw`\begin{array}{p{2cm}c}a&b\end{array}`, String.raw`\begin{array}{cc}a&b\\\cline{1-2}c&d\end{array}`, String.raw`\begin{array}{c}a&b\end{array}`]) {
    assert.throws(() => parseResearchDisplayTable(tex), /tabular display/u, tex);
  }
});

test("a tabular display keeps the line of mathematics and booktabs' rule spacing", async () => {
  // booktabs sets \aboverulesep = 0.4ex and \belowrulesep = 0.65ex; the math font's ex is 0.442em.
  assert.equal(RESEARCH_TABLE_ABOVE_RULE_EM, 0.1768);
  assert.equal(RESEARCH_TABLE_BELOW_RULE_EM, 0.2873);
  assert.equal(RESEARCH_TABLE_COLUMN_GAP_EM, 1);
  assert.equal(RESEARCH_TABLE_RULED_GAP_EM, 2);
  const css = await readFile(path.join(ROOT, "app", "components", "research", "ResearchMath.module.css"), "utf8");
  const rule = (selector) => css.match(new RegExp(`(?:^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\s*\\{([^}]*)\\}`, "u"))?.[1] ?? "";
  assert.match(rule(".row + .row > .cell"), /padding-top:\s*calc\(var\(--row-gap\) \+ var\(--row-extra, 0em\)\)/u);
  assert.match(rule(".row[data-rule] > .cell"), /padding-bottom:\s*calc\(var\(--row-gap\) \/ 2 \+ var\(--above-rule\)\)/u);
  assert.match(rule(".row[data-rule=\"header\"] > .cell"), /border-bottom-color:\s*var\(--rule-strong\)/u);
  assert.doesNotMatch(css, /border-(?:left|right|inline)[^;]*solid/u, "No vertical rules");
  const tsx = await readFile(path.join(ROOT, "app", "components", "research", "ResearchMath.tsx"), "utf8");
  assert.match(tsx, /"--row-gap": `\$\{RESEARCH_MATH_ROW_SPACING_EM\}em`/u, "Rows stand one line of mathematics apart");
  assert.equal(RESEARCH_MATH_ROW_SPACING_EM, 0.8217);
});

test("the published pages draw each tabular display as a table and keep its TeX, number and sentence", async () => {
  for (const [group, slug, expected] of MANUSCRIPTS) {
    const route = group === "artificial-intelligence" ? path.join("experience", slug) : slug;
    const html = await readFile(path.join(ROOT, "out", route, "index.html"), "utf8");
    const blocks = [...html.matchAll(/<div\b[^>]*data-research-block-type="equation"[^>]*>([\s\S]*?)<\/math><\/span><\/span><\/div>/gu)].map((match) => match[1]);
    const tabular = blocks.filter((block) => block.includes("data-display-table"));
    assert.equal(tabular.length, expected, `${slug} draws ${expected} tabular displays`);
    const sources = (await displays(group, slug)).filter((tex) => parseResearchDisplayTable(tex));
    for (const [index, block] of tabular.entries()) {
      assert.match(block, /<span\b[^>]*data-display-table=""[^>]*aria-hidden="true"/u, "The drawing is decorative");
      assert.doesNotMatch(block, /data-research-svg="display"|<line\b/u, "No drawn array and no rules in SVG");
      const annotations = [...block.matchAll(/<annotation\b[^>]*>([\s\S]*?)<\/annotation>/gu)].map((match) => decodeHtml(match[1]));
      assert.deepEqual(annotations, [sources[index]], "One assistive expression holds the whole display's TeX");
      const table = parseResearchDisplayTable(sources[index]);
      assert.equal((block.match(/data-research-svg="cell"/gu) ?? []).length, table.rows.flatMap((row) => row.cells).filter(Boolean).length);
      assert.equal((block.match(/data-rule="header"/gu) ?? []).length, table.rows.filter((row) => row.rule === "header").length);
      const number = renderResearchDisplayTable(sources[index]).number;
      assert.equal(block.match(/data-equation-number="true"[^>]*>([^<]*)</u)?.[1], number && `(${number})`);
    }
  }
});
