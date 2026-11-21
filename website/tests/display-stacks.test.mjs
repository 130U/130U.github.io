import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  RESEARCH_MATH_GUTTER_EM, RESEARCH_MATH_LINE_EM, RESEARCH_MATH_ROW_SPACING_EM, renderResearchDisplayStack, renderResearchMath,
  researchDisplayRows, researchDisplayStackRows, researchNumberDropEm,
} from "../app/lib/content/research-math.ts";

// One formula to a display line: a display whose outer level sets two or more formulas side by
// side is set as rows, one formula to a row, at every width. A qualifier stays with its formula,
// a connecting word opens the row it introduces, and a single relation continued after a space
// stays one formula. Each row is drawn from its own slice of the TeX; one assistive expression
// carries the whole display. Where a row would otherwise scroll, its qualifier and its connecting
// word may each take a line of their own (the row's parts).
const ROOT = fileURLToPath(new URL("../", import.meta.url));
// Each page with mathematics, the displays it sets as rows and their rows, the displays on one
// line whose qualifier may take a line of its own, and the rows that may part.
const MANUSCRIPTS = [
  ["selected-research", "critical-dependence-stress-for-diversification-gains-under-fixed-marginals", 46, 117, 5, 11],
  ["selected-research", "certified-valuation-of-arithmetic-asian-options", 46, 116, 5, 7],
  ["selected-research", "certified-joint-pricing-errors-in-rough-heston", 19, 45, 1, 8],
  ["artificial-intelligence", "evidence-verification-and-robust-comparison-in-investment-research", 8, 16, 1, 2],
  ["artificial-intelligence", "financial-task-design-and-synthetic-data-engineering", 9, 18, 1, 2],
  ["artificial-intelligence", "general-reasoning-evaluation-and-layered-verification", 9, 21, 1, 2],
  ["artificial-intelligence", "large-scale-domain-expert-feedback-governance-and-adaptive-review", 9, 24, 0, 2],
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
  assert.match(tsx, /"--row-space": row\.spaceEm \? em\(row\.spaceEm\)/u);
  const css = await readFile(path.join(ROOT, "app", "components", "research", "ResearchMath.module.css"), "utf8");
  const rule = (selector) => css.match(new RegExp(`(?:^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\s*\\{([^}]*)\\}`, "u"))?.[1] ?? "";
  assert.match(rule(".stackRow + .stackRow"), /padding-top:\s*var\(--row-space\)/u);
  assert.match(rule(".stack"), /padding:\s*var\(--math-gutter\)/u, "The stack keeps a drawing's gutter, so its ink starts on the manuscript inset");
  assert.match(rule(".rowMath"), /margin:\s*calc\(-1 \* var\(--math-gutter\)\)/u, "A row's canvas gutters lie in negative margins");
});

test("the published pages draw every stacked display as rows of its own TeX, with one assistive expression", async () => {
  for (const [group, slug, stacks, rowCount, oneLine] of MANUSCRIPTS) {
    const route = group === "artificial-intelligence" ? path.join("experience", slug) : slug;
    const html = await readFile(path.join(ROOT, "out", route, "index.html"), "utf8");
    const formulas = [];
    for (let at = html.indexOf('data-research-formula="display"'); at >= 0; at = html.indexOf('data-research-formula="display"', at + 1)) {
      const end = html.indexOf("</math>", at);
      formulas.push(html.slice(at, end + "</math>".length));
    }
    const stacked = formulas.filter((formula) => formula.includes("data-display-stack"));
    assert.equal(stacked.length, stacks + oneLine, `${slug} draws ${stacks} displays as rows and ${oneLine} on one line as a row that may part`);
    let drawn = 0;
    for (const formula of stacked) {
      const tex = decodeHtml(formula.match(/<annotation\b[^>]*>([\s\S]*?)<\/annotation>/u)[1]);
      const expected = researchDisplayStackRows(tex);
      const rows = [...formula.matchAll(/data-stack-row="(\d+) (\d+)"/gu)].map((match) => tex.slice(Number(match[1]), Number(match[2])));
      assert.deepEqual(rows, expected.map((row) => row.tex), "Each drawn row names its slice of the display's TeX");
      const parts = [...formula.matchAll(/data-row-part="(\w+)" data-part="(\d+) (\d+)"/gu)].map((match) => [match[1], tex.slice(Number(match[2]), Number(match[3]))]);
      assert.deepEqual(parts, expected.flatMap((row) => (row.parts ?? []).map((part) => [part.kind, tex.slice(part.start, part.end)])), "Each drawn part names its slice of the display's TeX");
      assert.equal((formula.match(/<math\b/gu) ?? []).length, 1, "One assistive expression carries the whole display");
      const drawings = expected.reduce((sum, row) => sum + (row.parts?.length ?? 1), 0);
      assert.equal((formula.match(/data-research-svg="row"/gu) ?? []).length, drawings, "Each row, or each part of a row that may part, is drawn once");
      assert.doesNotMatch(formula, /data-research-svg="display"/u, "Nothing is drawn twice");
      if (researchDisplayRows(tex)) drawn += rows.length;
    }
    assert.equal(drawn, rowCount);
  }
});

const partTexs = (tex) => researchDisplayStackRows(tex)?.map((row) => row.parts?.map((part) => [part.kind, tex.slice(part.start, part.end)]));

test("where a row would otherwise scroll, its qualifier or its connecting word may take a line of its own", async () => {
  const dependence = ["selected-research", "critical-dependence-stress-for-diversification-gains-under-fixed-marginals"];
  const asian = ["selected-research", "certified-valuation-of-arithmetic-asian-options"];
  const rough = ["selected-research", "certified-joint-pricing-errors-in-rough-heston"];
  const reasoning = ["artificial-intelligence", "general-reasoning-evaluation-and-layered-verification"];
  const feedback = ["artificial-intelligence", "large-scale-domain-expert-feedback-governance-and-adaptive-review"];
  for (const [group, slug, , , oneLine, parting] of MANUSCRIPTS) {
    const all = (await displays(group, slug)).map((tex) => [tex, researchDisplayStackRows(tex)]).filter(([, rows]) => rows);
    assert.equal(all.filter(([tex]) => !researchDisplayRows(tex)).length, oneLine, `${slug}: ${oneLine} displays on one line may part`);
    assert.equal(all.reduce((sum, [, rows]) => sum + rows.filter((row) => row.parts).length, 0), parting, `${slug}: ${parting} rows may part`);
    for (const [tex, rows] of all) {
      for (const row of rows.filter((entry) => entry.parts)) {
        // Parts are slices of their row, in order, around the row's one formula.
        assert.ok(row.parts.every((part, index) => part.start >= row.start && part.end <= row.end && (index === 0 || part.start >= row.parts[index - 1].end)), tex);
        assert.equal(row.parts[0].start, row.start);
        assert.equal(row.parts.at(-1).end, row.end);
        assert.equal(row.parts.filter((part) => part.kind === "formula").length, 1, tex);
      }
    }
  }
  // A display on one line keeps its qualifier on its line, and may part it: Asian (7.7), (7.3), (5.3).
  assert.equal(researchDisplayRows(await numbered(...asian, "7.7")), undefined);
  assert.deepEqual(partTexs(await numbered(...asian, "7.7")), [[["formula", String.raw`|q_Q(p)-q_P(p)| \le \varepsilon_0+e_{P,J}+e_{Q,J}+L_0\delta_u`], ["qualifier", String.raw`(0\lt p\lt 1).`]]], "The sentence's period stays in the slice; the drawing leaves it out");
  const [formula73, qualifier73] = partTexs(await numbered(...asian, "7.3"))[0];
  assert.deepEqual([formula73[0], formula73[1].endsWith(String.raw`\right),`), qualifier73], ["formula", true, ["qualifier", String.raw`\ell=P,Q.`]]);
  assert.deepEqual(partTexs(await numbered(...asian, "5.3"))[0].map(([kind]) => kind), ["formula", "qualifier"]);
  // A connecting word set off by quads opens its row and may take a line above its formula.
  assert.deepEqual(partTexs(await numbered(...asian, "3.13"))[1].map(([kind, part]) => kind === "word" ? [kind, part] : [kind]), [["word", String.raw`\text{where it equals}`], ["formula"]]);
  assert.deepEqual(partTexs(await numbered(...rough, "5.3"))[1][0], ["word", String.raw`\text{so that}`]);
  assert.deepEqual(partTexs(await numbered(...rough, "3.3"))[1][0], ["word", String.raw`\text{equivalently}`]);
  // "for x<y" may take its own line under m_i\ge0; after "s.t." the constraints keep their hang.
  assert.deepEqual(partTexs(await numbered(...dependence, "4.15")).slice(2), [
    [["formula", String.raw`m_i\ge0`], ["qualifier", String.raw`\text{for}\ x<y,`]],
    [["formula", String.raw`m_i\le0`], ["qualifier", String.raw`\text{for}\ x>y.`]],
  ]);
  assert.ok(researchDisplayStackRows(await numbered(...feedback, "3.3")).every((row) => !row.parts), "s.t. keeps its constraint");
  // A qualifier that a statement goes on from stays: theta_A > theta_B for every grader \iff ....
  assert.ok(researchDisplayStackRows(await numbered(...reasoning, "1.2")).every((row) => !row.parts));
  // Unit cases.
  assert.deepEqual(partTexs(String.raw`f(x)=x^2\qquad(x>0) \tag{1}`), [[["formula", "f(x)=x^2"], ["qualifier", "(x>0)"]]]);
  assert.deepEqual(partTexs(String.raw`F(s)=s^2,\qquad s\ge0`), [[["formula", "F(s)=s^2,"], ["qualifier", String.raw`s\ge0`]]]);
  assert.deepEqual(partTexs(String.raw`a=b,\qquad\text{so that}\qquad c=d \quad (x>0)`)[1], [["word", String.raw`\text{so that}`], ["formula", "c=d"], ["qualifier", "(x>0)"]]);
  assert.equal(researchDisplayStackRows(String.raw`a\quad\Longleftrightarrow\quad b=c`), undefined, "A continued relation has no part to take a line");
  assert.equal(researchDisplayStackRows("f(x)=x^2"), undefined);
  assert.equal(researchDisplayStackRows(String.raw`\begin{gathered} f(x)=x^2\qquad(x>0)\\ g=1 \end{gathered}`), undefined, "Rows an environment sets keep their form");
});

test("a row's parts stand where the whole row's drawing sets them, and part as rows do", async () => {
  const extent = (markup) => [markup.heightEm - markup.depthEm - RESEARCH_MATH_GUTTER_EM, markup.depthEm - RESEARCH_MATH_GUTTER_EM];
  const pitch = (above, below, extra = 0) => Math.max(extent(above)[1], 0.25) + RESEARCH_MATH_ROW_SPACING_EM + extra + Math.max(extent(below)[0], 0.75);
  for (const [group, slug] of MANUSCRIPTS) {
    for (const tex of (await displays(group, slug)).filter((entry) => researchDisplayStackRows(entry))) {
      const stack = renderResearchDisplayStack(tex);
      const rows = researchDisplayStackRows(tex);
      stack.rows.forEach((row, index) => {
        const above = stack.rows[index - 1];
        const extra = rows[index].extraEm ?? 0;
        if (row.parts) {
          // Side by side, the parts and the spaces between them fill the whole row's width.
          const width = row.parts.reduce((sum, part) => sum + part.widthEm - 2 * RESEARCH_MATH_GUTTER_EM + part.joinEm, 0);
          assert.ok(Math.abs(width - (row.widthEm - 2 * RESEARCH_MATH_GUTTER_EM)) < 2e-3, tex);
          assert.equal(row.parts[0].joinEm, 0);
          // Parted, each part stands a line of mathematics below the one before.
          row.parts.slice(1).forEach((part, at) => {
            assert.ok(Math.abs(extent(row.parts[at])[1] + part.spaceEm + extent(part)[0] - pitch(row.parts[at], part)) < 1e-3, tex);
          });
          if (index) {
            const line = above.parts?.at(-1) ?? above;
            const space = above.parts ? row.partedSpaceAfterPartedEm : row.partedSpaceEm;
            assert.ok(Math.abs(extent(line)[1] + space + extent(row.parts[0])[0] - pitch(line, row.parts[0], extra)) < 1e-3, tex);
          }
        }
        if (index && above.parts) {
          assert.ok(Math.abs(extent(above.parts.at(-1))[1] + row.spaceAfterPartedEm + extent(row)[0] - pitch(above.parts.at(-1), row, extra)) < 1e-3, tex);
        }
      });
      // The number's line beneath the display is one more row, a line of mathematics below the last:
      // the drawing's gutter, the drop, and the strut the number's line keeps above its baseline.
      const last = stack.rows.at(-1);
      const strut = { heightEm: 0.75 + RESEARCH_MATH_GUTTER_EM, depthEm: RESEARCH_MATH_GUTTER_EM };
      for (const [line, drop] of [[last, stack.numberDropEm], ...(last.parts ? [[last.parts.at(-1), stack.numberDropPartedEm]] : [])]) {
        assert.ok(Math.abs(extent(line)[1] + RESEARCH_MATH_GUTTER_EM + drop + 0.75 - pitch(line, strut)) < 1e-3, tex);
      }
    }
  }
  const flat = renderResearchMath(String.raw`x=1 \tag{9}`, true);
  assert.equal(researchNumberDropEm(flat), Number((Math.max(0, 0.25 - (flat.depthEm - RESEARCH_MATH_GUTTER_EM)) + RESEARCH_MATH_ROW_SPACING_EM - RESEARCH_MATH_GUTTER_EM).toFixed(4)));
  const css = await readFile(path.join(ROOT, "app", "components", "research", "ResearchMath.module.css"), "utf8");
  const rule = (selector) => css.match(new RegExp(`(?:^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\s*\\{([^}]*)\\}`, "u"))?.[1] ?? "";
  assert.match(rule(".rowPart + .rowPart"), /margin-inline-start:\s*var\(--join\)/u);
  assert.match(rule(".stackRow[data-row-parted] > .rowPart + .rowPart"), /padding-top:\s*var\(--part-space\)/u);
  assert.match(rule('.stackRow[data-row-parted] > [data-row-part="qualifier"]'), /padding-inline-start:\s*calc\(2em \+ var\(--hang, 0em\)\)/u, "A qualifier on a line of its own stands a quad's width twice in");
  assert.match(rule(".stackRow[data-row-parted] + .stackRow"), /var\(--row-space-after-parted\)/u);
  assert.match(rule(".stackRow + .stackRow[data-row-parted]"), /var\(--parted-row-space\)/u);
  assert.match(rule(".stackRow[data-row-parted] + .stackRow[data-row-parted]"), /var\(--parted-row-space-after-parted\)/u);
});

test("an equation number never shares a line with an expression that scrolls: the expression has a box of its own", async () => {
  const css = await readFile(path.join(ROOT, "app", "components", "research", "ResearchMath.module.css"), "utf8");
  const rule = (selector) => css.match(new RegExp(`(?:^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\s*\\{([^}]*)\\}`, "u"))?.[1] ?? "";
  // The formula's line wraps the number beneath the expression where it has no room beside it,
  // a line of mathematics below the last row; only the expression's box scrolls.
  assert.match(rule(".display"), /flex-wrap:\s*wrap/u);
  assert.match(rule(".display"), /row-gap:\s*calc\(var\(--number-drop\) \* var\(--equation-fit, 1\)\)/u);
  assert.match(rule(".equationEdge::before"), /height:\s*calc\(0\.75 \* var\(--type-math\) \* var\(--equation-fit, 1\)\)/u, "The number's line keeps a strut's height");
  assert.match(rule(".equationEdge"), /margin-block-end:\s*calc\(0\.375 \* var\(--type-math\) \* var\(--equation-fit, 1\)\)/u, "and a drawing's gutter below it");
  assert.match(rule(".equationScroll"), /overflow-x:\s*auto/u);
  assert.doesNotMatch(rule(".equation"), /overflow/u, "The display's block does not scroll");
  for (const [group, slug] of MANUSCRIPTS) {
    const route = group === "artificial-intelligence" ? path.join("experience", slug) : slug;
    const html = await readFile(path.join(ROOT, "out", route, "index.html"), "utf8");
    const blocks = [...html.matchAll(/<div\b([^>]*\bdata-research-block-type="equation"[^>]*)>/gu)].filter((match) => !/\bdata-math-table\b/u.test(match[1]));
    assert.ok(blocks.length > 0);
    for (const block of blocks) {
      assert.doesNotMatch(block[1], /\brole=|\btabindex=/u, "The block is no scroll region");
      const at = block.index + block[0].length;
      const close = html.indexOf("</math>", at);
      const formula = html.slice(at, close);
      const box = formula.match(/<span\b([^>]*\bdata-equation-scroll=""[^>]*)>/u);
      assert.ok(box, "The expression stands in a box of its own");
      assert.match(box[1], /\btabindex="0"/u);
      assert.match(box[1], /\brole="region"/u);
      assert.match(box[1], /\baria-label="Mathematical equation"/u);
      // The number follows the box, outside it.
      assert.doesNotMatch(formula, /data-equation-number/u, "The number stands outside the box that scrolls");
      const after = html.slice(close, html.indexOf("</div>", close));
      const tagged = /\\tag\{/u.test(decodeHtml(formula.match(/<annotation\b[^>]*>([\s\S]*?)<\/annotation>/u)[1]));
      assert.equal(/data-equation-number="true"/u.test(after), tagged, "A numbered display shows its number after its box, an unnumbered one none");
    }
  }
});
