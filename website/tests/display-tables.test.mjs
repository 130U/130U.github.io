import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parseResearchMarkdown } from "../app/lib/content/research-markdown.ts";
import { groupDecimalDigits, parseResearchDisplayTable, renderResearchDisplayTable } from "../app/lib/content/research-math.ts";
import { MATH_TABLE_TITLES, mathTableTitle } from "../app/lib/content/math-tables.ts";

// A display that is one array is a table of mathematics. The page keeps every
// cell's TeX, its row and column, the equation number and the sentence it ends,
// and sets it as a research table: frame, title, header band, hairline rows,
// magnifier, every cell drawn at the table's size.
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

async function manuscript(group, slug) {
  return JSON.parse(await readFile(path.join(ROOT, "content", group, `${slug}.json`), "utf8")).markdown;
}

async function displays(group, slug) {
  return [...(await manuscript(group, slug)).matchAll(DISPLAY)].map((match) => match[1] ?? match[2] ?? match[3]);
}

function decodeHtml(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|quot);/giu, (match, entity) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"' }[entity] ?? match;
  });
}

const annotation = (mathml) => decodeHtml(mathml.match(/<annotation\b[^>]*>([\s\S]*?)<\/annotation>/u)[1]);

test("the manuscripts hold three tables of mathematics, each keeping its cells' TeX, rows and columns", async () => {
  const tables = [];
  for (const [group, slug, expected] of MANUSCRIPTS) {
    const found = (await displays(group, slug)).filter((tex) => parseResearchDisplayTable(tex));
    assert.equal(found.length, expected, `${slug} holds ${expected} tables of mathematics`);
    tables.push(...found);
  }
  const [regimes, displacement, quantiles] = tables.map((tex) => ({ tex, table: parseResearchDisplayTable(tex), markup: renderResearchDisplayTable(tex) }));
  const aligns = ({ table }) => table.columns.map(({ align }) => align).join("");
  const framed = ({ markup }) => markup.columns.map(({ align, numeric }) => `${align}${numeric ? "#" : ""}`).join(" ");

  // Dependence §2.3: the manuscript rules off its row labels, so the regime row heads the columns.
  assert.equal(aligns(regimes), "crrrr");
  assert.deepEqual(regimes.table.rows.map((row) => row.rule), ["header", undefined, undefined]);
  assert.deepEqual(regimes.table.rows[0].cells, [String.raw`(1_{\{B>u\}},1_{\{A_\varepsilon>t\}})`, "(0,0)", "(1,0)", "(0,1)", "(1,1)"]);
  assert.deepEqual(regimes.table.rows[1].cells, [String.raw`\partial_{x_1}h_{u,t}`, "0", "1", String.raw`-(1+\varepsilon)`, String.raw`-\varepsilon`]);
  // The sentence's period after the last cell is not drawn; the assistive expression keeps the TeX whole.
  assert.deepEqual(regimes.table.rows[2].cells, [String.raw`\partial_{x_1}(h_{u,t}+\varepsilon H/2)`, String.raw`\varepsilon/2`, String.raw`1+\varepsilon/2`, String.raw`-1-\varepsilon/2`, String.raw`-\varepsilon/2`]);
  assert.match(regimes.tex, /-\\varepsilon\/2\.\s*\\end\{array\}/u);
  assert.equal(annotation(regimes.markup.mathml), regimes.tex);
  assert.equal(regimes.markup.number, undefined);
  assert.equal(regimes.markup.header, true);
  // Row labels align left; the slopes keep the manuscript's right alignment.
  assert.equal(framed(regimes), "l r r r r");
  assert.doesNotMatch(regimes.markup.rows[2][4].svg, /data-c="2E"/u, "The last cell draws no sentence period");

  // Asian (7.8): the \hline under the heading row makes it the header band; its text cells are text.
  assert.equal(aligns(displacement), "ccc");
  assert.deepEqual(displacement.table.rows.map((row) => row.rule), ["header", undefined, undefined]);
  assert.deepEqual(displacement.table.rows.map((row) => row.cells[2]), [String.raw`\sup_{0\lt p\lt 1}|q_Q(p)-q_P(p)|`, String.raw`\le.008018821658`, String.raw`\le.012716404217`]);
  assert.deepEqual(displacement.markup.rows.map((row) => row[0]), [{ kind: "text", text: "Case" }, { kind: "text", text: "Single quote" }, { kind: "text", text: "Nine quotes" }]);
  // Its columns of numbers align right, as in every research table.
  assert.equal(framed(displacement), "l r# r#");
  assert.equal(displacement.markup.number, "7.8", "The equation number stays with its table");

  // Asian §7.3 quantiles: no rules in the manuscript, so no header band; the row labels' colons,
  // which in the sentence introduced the intervals, are not drawn.
  assert.equal(aligns(quantiles), "lccc");
  assert.deepEqual(quantiles.table.rows.map((row) => row.rule), [undefined, undefined]);
  assert.deepEqual(quantiles.table.rows.map((row) => row.cells.join(" & ")), [
    String.raw`\text{one quote:} & [.0307690,.0307764] & [.0444067,.0444141] & [.0590917,.0590992]`,
    String.raw`\text{nine quotes:} & [.0308203,.0308350] & [.0435131,.0435425] & [.0587182,.0587256]`,
  ]);
  assert.equal(quantiles.markup.header, false);
  assert.deepEqual(quantiles.markup.rows.map((row) => row[0]), [{ kind: "text", text: "one quote" }, { kind: "text", text: "nine quotes" }]);
  assert.equal(framed(quantiles), "l r# r# r#");

  for (const { tex, table, markup } of [regimes, displacement, quantiles]) {
    assert.equal(annotation(markup.mathml), tex, "One assistive expression carries the whole display's TeX");
    for (const [rowIndex, row] of markup.rows.entries()) {
      for (const [column, cell] of row.entries()) {
        const source = table.rows[rowIndex].cells[column];
        assert.ok(cell, `${tex.slice(0, 30)}: cell ${rowIndex},${column} is set`);
        if (cell.kind === "text") {
          assert.match(source, /^\\text\{/u);
          continue;
        }
        // Each cell is drawn alone, in text style as TeX sets an array's cells, and carries no MathML of its own.
        assert.match(cell.svg, /^<svg\b[^>]*data-research-svg="cell"/u);
        assert.doesNotMatch(cell.svg, /<line\b|data-line=|<math\b/u, "A cell draws no rule and holds no second expression");
        assert.ok(Number.isFinite(cell.depthEm));
      }
    }
  }
});

test("only a display that is one array is a table, and its header follows the manuscript's rules", () => {
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
  assert.equal(rules(String.raw`\begin{array}{|c||cc}x&0&1\\f&a&b\end{array}`), "header -");
  // An \hline under the first row does too; with neither, no row heads the columns.
  assert.equal(rules(String.raw`\begin{array}{ccc}x&0&1\\\hline f&a&b\\g&c&d\end{array}`), "header - -");
  assert.equal(rules(String.raw`\begin{array}{ccc}x&0&1\\f&a&b\\g&c&d\end{array}`), "- - -");
  assert.equal(rules(String.raw`\begin{array}{cc|c}x&0&1\\f&a&b\end{array}`), "- -", "A rule after a later column heads nothing");
  assert.equal(rules(String.raw`\begin{array}{cc}\hline x&0\\\hline f&a\\\hline g&c\\\hline\end{array}`), "header row -");
  assert.equal(rules(String.raw`\begin{array}{cc}x&0\\f&a\\\hline g&c\end{array}`), "- row -");
  // A row break's own space is kept; a trailing break and a short row are completed.
  const spaced = parseResearchDisplayTable(String.raw`\begin{array}{cc}a&b\\[4pt]c\\\end{array}\tag{2.1}`);
  assert.deepEqual(spaced.rows.map((row) => row.extraEm ?? 0), [0, 0.4]);
  assert.deepEqual(spaced.rows[1].cells, ["c", ""]);
  // Nested groups and environments keep their own breaks.
  assert.deepEqual(parseResearchDisplayTable(String.raw`\begin{array}{cc}\text{a\&b}&\begin{matrix}1&2\\3&4\end{matrix}\end{array}.`).rows[0].cells, [String.raw`\text{a\&b}`, String.raw`\begin{matrix}1&2\\3&4\end{matrix}`]);

  for (const tex of [String.raw`\begin{array}{p{2cm}c}a&b\end{array}`, String.raw`\begin{array}{cc}a&b\\\cline{1-2}c&d\end{array}`, String.raw`\begin{array}{c}a&b\end{array}`]) {
    assert.throws(() => parseResearchDisplayTable(tex), /tabular display/u, tex);
  }

  // Row labels align left, columns of numbers right, any other column as the manuscript sets it;
  // an empty cell stays empty, and text that is not wholly text stays mathematics.
  const markup = renderResearchDisplayTable(String.raw`\begin{array}{c|ccl}x&a&b&c\\f&\ge 3.5&x+1&\text{and }y\\g&[1,2]&&\text{so:}\end{array}`);
  assert.deepEqual(markup.columns.map(({ align, numeric }) => `${align}${numeric ? "#" : ""}`), ["l", "r#", "c", "l"]);
  assert.equal(markup.rows[2][2], null);
  assert.equal(markup.rows[1][3].kind, "math");
  assert.deepEqual(markup.rows[2][3], { kind: "text", text: "so" });
});

test("digits after a decimal point are grouped in threes in the drawing only", () => {
  assert.equal(groupDecimalDigits(String.raw`\le.008018821658`), String.raw`\le.008\,018\,821\,658`);
  assert.equal(groupDecimalDigits(String.raw`[.0307690,.0307764]`), String.raw`[.030\,7690,.030\,7764]`);
  assert.equal(groupDecimalDigits("0.12345"), String.raw`0.123\,45`);
  assert.equal(groupDecimalDigits("213.792201829985"), String.raw`213.792\,201\,829\,985`);
  // Four digits or fewer, integers, fractions and equation numbers are left as written.
  for (const tex of ["1.2345", ".0444", "3/204800", String.raw`\tag{7.8}`, String.raw`1.5\cdot10^{-5}`]) assert.equal(groupDecimalDigits(tex), tex);
  // The drawn cell is grouped; the assistive TeX is the manuscript's.
  const tex = String.raw`\begin{array}{c|c}\text{Case}&b\\\hline x&\le.008018821658\end{array}`;
  const markup = renderResearchDisplayTable(tex);
  assert.equal(annotation(markup.mathml), tex);
  assert.equal((markup.rows[1][1].svg.match(/data-mml-node="mspace"/gu) ?? []).length, 3, "Three thin spaces part four groups");
});

test("a table of mathematics takes as its title the words of its sentence that name it", async () => {
  const sentenceVerb = /\s(?:are|is|lie in|lies in)$/u;
  for (const [group, slug] of MANUSCRIPTS.filter(([, , count]) => count > 0)) {
    const blocks = parseResearchMarkdown(await manuscript(group, slug), { joinSoftLines: true });
    const keys = new Set(Object.keys(MATH_TABLE_TITLES[slug] ?? {}));
    for (const [index, block] of blocks.entries()) {
      if (block.type !== "equation" || !parseResearchDisplayTable(block.tex)) continue;
      // The words that introduce the table: the paragraph before it, or before the displays that lead to it.
      let before = index - 1;
      while (blocks[before]?.type === "equation") before -= 1;
      const lead = blocks[before].source.trim();
      const title = mathTableTitle(slug, parseResearchDisplayTable(block.tex));
      const first = parseResearchDisplayTable(block.tex).rows[0].cells[0];
      keys.delete(first);
      if (title === undefined) {
        assert.doesNotMatch(lead, sentenceVerb, `${slug}: a table its sentence names takes a title`);
        continue;
      }
      const words = MATH_TABLE_TITLES[slug][first];
      assert.equal(title, words[0].toUpperCase() + words.slice(1), "The title is set in sentence case");
      assert.equal(before, index - 1, "A titled table follows the sentence that names it");
      assert.match(words, /^the /u, "The title is the subject the sentence names");
      assert.ok(sentenceVerb.test(lead) && lead.replace(sentenceVerb, "").endsWith(` ${words}`), `${slug}: "${words}" is the subject of the sentence the table ends: …${lead.slice(-90)}`);
    }
    assert.deepEqual([...keys], [], `${slug}: every title belongs to a table of the manuscript`);
  }
  assert.equal(mathTableTitle("certified-valuation-of-arithmetic-asian-options", parseResearchDisplayTable(String.raw`\begin{array}{c|c|c} \text{Case}&\delta_u&x\\ \hline a&b&c \end{array} \tag{7.8}`)), undefined, "(7.8) follows \"Then\", which names nothing");
});

test("the published pages set each table of mathematics as a framed research table and keep its TeX, number and sentence", async () => {
  for (const [group, slug, expected] of MANUSCRIPTS) {
    const route = group === "artificial-intelligence" ? path.join("experience", slug) : slug;
    const html = await readFile(path.join(ROOT, "out", route, "index.html"), "utf8");
    // Each manuscript block is the markup from its marker to the next one.
    const starts = [...html.matchAll(/<[a-z]+\b[^>]*\bdata-research-block="\d+"/gu)].map((match) => match.index);
    const blocks = starts.map((start, index) => html.slice(start, starts[index + 1] ?? html.indexOf("</article>", start)));
    const tables = blocks.filter((block) => /^<div\b[^>]*\bdata-math-table=""/u.test(block));
    assert.equal(tables.length, expected, `${slug} sets ${expected} tables of mathematics`);
    const sources = (await displays(group, slug)).filter((tex) => parseResearchDisplayTable(tex));
    for (const [index, block] of tables.entries()) {
      const tex = sources[index];
      const markup = renderResearchDisplayTable(tex);
      assert.match(block, /^<div\b[^>]*\bdata-research-block-type="equation"/u, "The block stays the manuscript's display");
      assert.match(block, /<div\b[^>]*\bdata-table-frame=""/u, "It stands in a research table's frame");
      assert.match(block, /<button\b[^>]*\bdata-table-zoom\b[^>]*\baria-label="Zoom in"[^>]*\bhidden=""/u, "It carries the magnifier");
      assert.match(block, /<div\b[^>]*\btabindex="0"[^>]*\brole="region"[^>]*\baria-label="Table of mathematics"/u);
      assert.match(block, /<table\b[^>]*\bdata-research-table=""[^>]*\baria-hidden="true"/u, "The drawing is decorative");
      assert.doesNotMatch(block, /data-research-svg="display"|<line\b/u, "No drawn array and no rules in SVG");
      const annotations = [...block.matchAll(/<annotation\b[^>]*>([\s\S]*?)<\/annotation>/gu)].map((match) => decodeHtml(match[1]));
      assert.deepEqual(annotations, [tex], "One assistive expression holds the whole display's TeX");
      assert.equal((block.match(/<thead>/gu) ?? []).length, markup.header ? 1 : 0, "The row the manuscript rules off is the header band");
      for (const [, head] of block.matchAll(/<th\b([^>]*)>/gu)) assert.match(head, /\bscope="col"/u);
      const cells = markup.rows.flat().filter(Boolean);
      assert.equal((block.match(/data-research-svg="cell"/gu) ?? []).length, cells.filter((cell) => cell.kind === "math").length);
      assert.equal((block.match(/data-cell="text"/gu) ?? []).length, cells.filter((cell) => cell.kind === "text").length);
      const title = block.match(/<p\b[^>]*data-table-title=""[^>]*>([^<]*)<\/p>/u)?.[1];
      assert.equal(title && decodeHtml(title), mathTableTitle(slug, parseResearchDisplayTable(tex)));
      // A numbered table stands its number beneath its frame, in the reading face of equation numbers.
      const number = block.match(/<\/table>[\s\S]*<span\b[^>]*data-equation-number="true"[^>]*aria-hidden="true"[^>]*>([^<]*)<\/span>/u)?.[1];
      assert.equal(number, markup.number && `(${markup.number})`);
    }
  }
});

test("cells take the table's size and baseline, and the CSS draws no vertical rule", async () => {
  const css = await readFile(path.join(ROOT, "app", "components", "research", "ResearchMath.module.css"), "utf8");
  const rule = (selector) => css.match(new RegExp(`(?:^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\s*\\{([^}]*)\\}`, "u"))?.[1] ?? "";
  // The header band's mathematics is set at the reading size, where its x-height meets the label type's.
  assert.match(rule(".mathTable thead .cellMath"), /font-size:\s*calc\(var\(--type-reading\) \* var\(--zoom, 1\)\)/u);
  assert.match(rule(".mathTable table .mathCell.mathCell"), /vertical-align:\s*baseline/u);
  assert.match(rule(".tableNumber"), /font-family:\s*var\(--font-prose\)/u);
  assert.match(rule(".tableNumber"), /text-align:\s*end/u);
  assert.doesNotMatch(css, /border-(?:left|right|inline)[^;]*solid/u, "No vertical rules");
});
