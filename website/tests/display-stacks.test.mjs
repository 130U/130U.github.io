import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  RESEARCH_MATH_GUTTER_EM, RESEARCH_MATH_LINE_EM, RESEARCH_MATH_ROW_SPACING_EM, renderResearchDisplayStack, researchDisplayRows,
} from "../app/lib/content/research-math.ts";

// One formula to a display line: a display whose outer level sets two or more formulas side by
// side is set as rows, one formula to a row, at every width. A qualifier stays with its formula,
// a connecting word opens the row it introduces, and a single relation continued after a space
// stays one formula. Each row is drawn from its own slice of the TeX; one assistive expression
// carries the whole display.
const ROOT = fileURLToPath(new URL("../", import.meta.url));
// Each page with mathematics, the displays it sets as rows, and their rows.
const MANUSCRIPTS = [
  ["selected-research", "critical-dependence-stress-for-diversification-gains-under-fixed-marginals", 46, 117],
  ["selected-research", "certified-valuation-of-arithmetic-asian-options", 46, 116],
  ["selected-research", "certified-joint-pricing-errors-in-rough-heston", 19, 45],
  ["artificial-intelligence", "evidence-verification-and-robust-comparison-in-investment-research", 8, 16],
  ["artificial-intelligence", "financial-task-design-and-synthetic-data-engineering", 9, 18],
  ["artificial-intelligence", "general-reasoning-evaluation-and-layered-verification", 9, 21],
  ["artificial-intelligence", "large-scale-domain-expert-feedback-governance-and-adaptive-review", 9, 24],
];
const DISPLAY = /```math\n([\s\S]*?)\n```|\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/gu;

async function displays(group, slug) {
  const { markdown } = JSON.parse(await readFile(path.join(ROOT, "content", group, `${slug}.json`), "utf8"));
  return [...markdown.matchAll(DISPLAY)].map((match) => match[1] ?? match[2] ?? match[3]);
}

async function numbered(group, slug, number) {
  const found = (await displays(group, slug)).filter((tex) => tex.includes(`\\tag{${number}}`));
  assert.equal(found.length, 1, `${slug} holds (${number}) once`);
  return found[0];
}

const rowsOf = (tex) => researchDisplayRows(tex)?.map((row) => row.tex);

function decodeHtml(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|quot);/giu, (match, entity) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"' }[entity] ?? match;
  });
}

test("the seven pages set their displays of formulas side by side as rows, each row a slice of the TeX holding one formula", async () => {
  for (const [group, slug, stacks, rows] of MANUSCRIPTS) {
    const stacked = (await displays(group, slug)).map((tex) => [tex, researchDisplayRows(tex)]).filter(([, found]) => found);
    assert.equal(stacked.length, stacks, `${slug} sets ${stacks} displays as rows`);
    assert.equal(stacked.reduce((sum, [, found]) => sum + found.length, 0), rows, `${slug} sets ${rows} rows`);
    for (const [tex, found] of stacked) {
      assert.ok(found.length > 1);
      found.forEach((row, index) => {
        assert.equal(tex.slice(row.start, row.end), row.tex, "A row is a slice of the display's TeX");
        assert.ok(index === 0 || row.start >= found[index - 1].end, "Rows keep the manuscript's order");
        assert.doesNotMatch(row.tex, /\\tag\b/u, "The equation number stands beside the rows, not in one");
        assert.equal(researchDisplayRows(row.tex), undefined, `A row holds one formula: ${row.tex}`);
      });
    }
  }
});

test("formulas side by side become rows; a qualifier stays on its formula's row; a continued relation stays one formula", async () => {
  const dependence = ["selected-research", "critical-dependence-stress-for-diversification-gains-under-fixed-marginals"];
  const asian = ["selected-research", "certified-valuation-of-arithmetic-asian-options"];
  const rough = ["selected-research", "certified-joint-pricing-errors-in-rough-heston"];
  const synthetic = ["artificial-intelligence", "financial-task-design-and-synthetic-data-engineering"];
  const reasoning = ["artificial-intelligence", "general-reasoning-evaluation-and-layered-verification"];
  const feedback = ["artificial-intelligence", "large-scale-domain-expert-feedback-governance-and-adaptive-review"];
  assert.deepEqual(rowsOf(await numbered(...dependence, "2.6")), [String.raw`t_\varepsilon-v=o(\varepsilon),`, String.raw`m_\varepsilon=\frac Jp\varepsilon^2+o(\varepsilon^2).`]);
  assert.deepEqual(rowsOf(await numbered(...feedback, "4.2")), [
    String.raw`B_{\text{optimal}}(\tau^2) = \frac{S^2}{N^2 \tau^2 + M},`,
    String.raw`B_{\text{uniform}}(\tau^2) = \frac{C M}{N^2 \tau^2 + M},`,
    String.raw`\frac{B_{\text{optimal}}}{B_{\text{uniform}}} = \kappa := \frac{S^2}{C M}`,
  ]);
  assert.deepEqual(rowsOf(await numbered(...synthetic, "6.1")).map((row) => row.split(" =")[0]), [String.raw`\mathrm{Coverage}`, String.raw`\mathrm{Efficiency}`]);
  // A condition in parentheses, or a range a symbol of the row keeps, qualifies the formula before it.
  assert.equal(rowsOf(await numbered(...dependence, "2.10"))[1].replace(/\s+/gu, " "), String.raw`D_\varepsilon(\rho)=-m_\varepsilon+K_\varepsilon\rho \quad(0\le\rho\le r_\varepsilon).`);
  assert.equal(rowsOf(await numbered(...reasoning, "3.1"))[2], String.raw`Z^\top H Z \succeq \mu I, \quad \mu > 0`);
  assert.equal(rowsOf(await numbered(...rough, "6.1")).length, 3);
  for (const [manuscript, number] of [[dependence, "2.12"], [dependence, "2.13"], [dependence, "3.3"], [dependence, "3.9"], [dependence, "4.6"], [rough, "3.7"], [asian, "5.3"], [asian, "7.3"], [asian, "7.7"], [reasoning, "4.1"]]) {
    assert.equal(researchDisplayRows(await numbered(...manuscript, number)), undefined, `(${number}) is one formula with its qualifier`);
  }
  // A relation continued after a space is one formula, however long: an equivalence, a chain, a limit.
  for (const [manuscript, number] of [[dependence, "2.2"], [dependence, "4.9"], [rough, "5.10"], [reasoning, "5.5"], [feedback, "5.2"], [asian, "4.4"]]) {
    assert.equal(researchDisplayRows(await numbered(...manuscript, number)), undefined, `(${number}) is one formula`);
  }
  // A connecting word set off by quads opens the row it introduces; after "s.t." each constraint is a row.
  assert.match(rowsOf(await numbered(...rough, "3.3"))[1], /^\\text\{equivalently\}\\qquad/u);
  assert.deepEqual(rowsOf(await numbered(...feedback, "3.3")), [
    String.raw`\min_{\pi} \sum_{i=1}^N \frac{m_i}{\pi_i}`,
    String.raw`\text{s.t.} \quad \sum_{i=1}^N c_i \pi_i \le B,`,
    String.raw`\pi_{\min} \le \pi_i \le 1`,
  ]);
  // A constraint after the first hangs under it, behind the invisible width of "s.t." and its quad.
  assert.deepEqual(researchDisplayRows(await numbered(...feedback, "5.4")).map((row) => row.hang), [undefined, undefined, String.raw`\text{s.t.} \quad`]);
  assert.match(renderResearchDisplayStack(await numbered(...feedback, "5.4")).rows[2].svg, /data-mml-node="mphantom"/u);
  // A word that leads into its condition keeps it: m_i\ge0 for x<y is one row, m_i\le0 for x>y the next.
  assert.deepEqual(rowsOf(await numbered(...dependence, "4.15")).slice(2), [String.raw`m_i\ge0\quad\text{for}\ x<y,`, String.raw`m_i\le0\quad\text{for}\ x>y.`]);
  // A display whose rows an environment aligns at a relation keeps its alignment; so does every
  // display of the Asian manuscript's results passage (Section 1.2).
  for (const [manuscript, number] of [[dependence, "4.1"], [asian, "5.1"], [asian, "1.1"], [asian, "1.2"], [asian, "1.3"]]) {
    assert.equal(researchDisplayRows(await numbered(...manuscript, number)), undefined, `(${number}) keeps its form`);
  }
});

test("the rule reads a display's outer level only", () => {
  assert.deepEqual(rowsOf(String.raw`a=1,\qquad b=2 \tag{1}`), ["a=1,", "b=2"]);
  assert.deepEqual(rowsOf(String.raw`a=1,\quad b=2,\ c=3,\;\; d=4.`), ["a=1,", "b=2,", "c=3,", "d=4."]);
  assert.equal(rowsOf(String.raw`f(x)=x^2\qquad(x>0)`), undefined);
  assert.equal(rowsOf(String.raw`F(s)=s^2,\qquad s\ge0`), undefined);
  assert.equal(rowsOf(String.raw`f(x)=1\quad\text{when } x>0`), undefined);
  assert.equal(rowsOf(String.raw`f(x)=1\quad\forall x`), undefined);
  assert.deepEqual(rowsOf(String.raw`x\ge0,\qquad x\le1`), [String.raw`x\ge0,`, String.raw`x\le1`], "A range of the row's own subject is a second statement");
  assert.deepEqual(rowsOf(String.raw`H=X_1-X_2,\qquad \beta>0`), ["H=X_1-X_2,", String.raw`\beta>0`], "A range of a symbol the row does not hold stands on its own");
  assert.equal(rowsOf(String.raw`a\quad\Longleftrightarrow\quad b=c`), undefined);
  assert.equal(rowsOf(String.raw`a\ \le\ b\ \le\ c`), undefined);
  assert.equal(rowsOf(String.raw`\left( a=1,\quad b=2 \right)`), undefined, "Spaces inside delimiters join nothing");
  assert.equal(rowsOf(String.raw`\{a=1,\quad b=2\}`), undefined);
  assert.equal(rowsOf(String.raw`x_{a=1,\quad b=2}=0`), undefined);
  assert.equal(rowsOf(String.raw`-.1,\qquad -.2\qquad\text{at }h=1`), undefined, "Values without relations are one row");
  assert.deepEqual(rowsOf(String.raw`a=b,\qquad\text{so that}\qquad c=d`), ["a=b,", String.raw`\text{so that}\qquad c=d`]);
  // A gathered display is read row by row, and a row break's space stays above the row after it.
  const gathered = researchDisplayRows(String.raw`\begin{gathered} a=1,\qquad b=2,\\[2pt] c=3 \end{gathered} \tag{2}`);
  assert.deepEqual(gathered.map((row) => [row.tex, row.extraEm ?? 0]), [["a=1,", 0], ["b=2,", 0], ["c=3", 0.2]]);
  assert.equal(rowsOf(String.raw`\begin{gathered} a=1\\ b=2 \end{gathered}`), undefined, "Rows that already hold one formula each stay as they are");
  assert.deepEqual(rowsOf(String.raw`\begin{aligned} &a=1,\qquad b=2\\ &c=3 \end{aligned}`), ["a=1,", "b=2", "c=3"]);
  assert.equal(rowsOf(String.raw`\begin{aligned} a&=1,\qquad b=2\\ c&=3 \end{aligned}`), undefined);
});

test("a stacked display draws each row from its slice and keeps one assistive expression", async () => {
  const tex = await numbered("selected-research", "critical-dependence-stress-for-diversification-gains-under-fixed-marginals", "2.6");
  const stack = renderResearchDisplayStack(tex);
  assert.equal(stack.number, "2.6");
  assert.equal(decodeHtml(stack.mathml.match(/<annotation\b[^>]*>([\s\S]*?)<\/annotation>/u)[1]), tex);
  assert.equal((stack.mathml.match(/<math\b/gu) ?? []).length, 1);
  assert.equal(stack.rows.length, 2);
  for (const row of stack.rows) assert.match(row.svg, /^<svg\b[^>]*data-research-svg="row"[^>]*aria-hidden="true"|^<svg\b[^>]*aria-hidden="true"[^>]*data-research-svg="row"/u);
  const glyphs = (svg, code) => (svg.match(new RegExp(`data-c="${code}"`, "gu")) ?? []).length;
  assert.equal(glyphs(stack.rows[0].svg, "2C"), 1, "The comma that closes a row stays with it");
  assert.equal(glyphs(stack.rows[1].svg, "2E"), 0, "The sentence's period after the last row is not drawn");
  // A gathered row's closing comma stays too, so every row but the last closes alike; the commas
  // inside \max\{\ell,q_--r\} and \min\{r,q_+-\ell\} are the formulas' own.
  const gathered = (await displays("selected-research", "critical-dependence-stress-for-diversification-gains-under-fixed-marginals")).find((tex) => tex.includes(String.raw`q_-=v-\beta r_3`));
  const rows = renderResearchDisplayStack(gathered).rows;
  assert.deepEqual(rows.map((row) => glyphs(row.svg, "2C")), [1, 1, 2, 2, 0]);
});

test("rows stand one line of mathematics apart, each as tall as an array row's strut or its drawing", async () => {
  assert.equal(RESEARCH_MATH_LINE_EM, 1.8217);
  const extent = (row) => [row.heightEm - row.depthEm - RESEARCH_MATH_GUTTER_EM, row.depthEm - RESEARCH_MATH_GUTTER_EM];
  for (const [group, slug] of MANUSCRIPTS) {
    for (const tex of (await displays(group, slug)).filter((tex) => researchDisplayRows(tex))) {
      const { rows } = renderResearchDisplayStack(tex);
      assert.equal(rows[0].spaceEm, 0, "The stack keeps its first drawing's own extent above it");
      rows.slice(1).forEach((row, index) => {
        const [above, below] = [extent(rows[index]), extent(row)];
        const extra = researchDisplayRows(tex)[index + 1].extraEm ?? 0;
        // Baseline to baseline: the row above's depth or the strut's, the row gap, and this row's height or the strut's.
        const pitch = above[1] + row.spaceEm + below[0];
        assert.ok(Math.abs(pitch - (Math.max(above[1], 0.25) + RESEARCH_MATH_ROW_SPACING_EM + extra + Math.max(below[0], 0.75))) < 1e-3, tex);
        assert.ok(pitch >= RESEARCH_MATH_LINE_EM - 1e-3, "Rows stand at least one line of mathematics apart");
      });
    }
  }
  const tsx = await readFile(path.join(ROOT, "app", "components", "research", "ResearchMath.tsx"), "utf8");
  assert.match(tsx, /"--row-space": `\$\{row\.spaceEm\}em`/u);
  const css = await readFile(path.join(ROOT, "app", "components", "research", "ResearchMath.module.css"), "utf8");
  const rule = (selector) => css.match(new RegExp(`(?:^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\s*\\{([^}]*)\\}`, "u"))?.[1] ?? "";
  assert.match(rule(".stackRow + .stackRow"), /padding-top:\s*var\(--row-space\)/u);
  assert.match(rule(".stack"), /padding:\s*var\(--math-gutter\)/u, "The stack keeps a drawing's gutter, so its ink starts on the manuscript inset");
  assert.match(rule(".rowMath"), /margin:\s*calc\(-1 \* var\(--math-gutter\)\)/u, "A row's canvas gutters lie in negative margins");
});

test("the published pages draw every stacked display as rows of its own TeX, with one assistive expression", async () => {
  for (const [group, slug, stacks, rowCount] of MANUSCRIPTS) {
    const route = group === "artificial-intelligence" ? path.join("experience", slug) : slug;
    const html = await readFile(path.join(ROOT, "out", route, "index.html"), "utf8");
    const formulas = [];
    for (let at = html.indexOf('data-research-formula="display"'); at >= 0; at = html.indexOf('data-research-formula="display"', at + 1)) {
      const end = html.indexOf("</math>", at);
      formulas.push(html.slice(at, end + "</math>".length));
    }
    const stacked = formulas.filter((formula) => formula.includes("data-display-stack"));
    assert.equal(stacked.length, stacks, `${slug} draws ${stacks} displays as rows`);
    let drawn = 0;
    for (const formula of stacked) {
      const tex = decodeHtml(formula.match(/<annotation\b[^>]*>([\s\S]*?)<\/annotation>/u)[1]);
      const rows = [...formula.matchAll(/data-stack-row="(\d+) (\d+)"/gu)].map((match) => tex.slice(Number(match[1]), Number(match[2])));
      assert.deepEqual(rows, researchDisplayRows(tex).map((row) => row.tex), "Each drawn row names its slice of the display's TeX");
      assert.equal((formula.match(/<math\b/gu) ?? []).length, 1, "One assistive expression carries the whole display");
      assert.equal((formula.match(/data-research-svg="row"/gu) ?? []).length, rows.length, "Each row is drawn once");
      assert.doesNotMatch(formula, /data-research-svg="display"/u, "Nothing is drawn twice");
      drawn += rows.length;
    }
    assert.equal(drawn, rowCount);
  }
});
