import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function declarations(css, selector) {
  const result = new Map();
  for (const rule of css.replace(/\/\*[\s\S]*?\*\//gu, "").matchAll(/([^{}]+)\{([^{}]*)\}/gu)) {
    if (!rule[1].split(",").map((part) => part.trim()).includes(selector)) continue;
    for (const declaration of rule[2].split(";")) {
      const separator = declaration.indexOf(":");
      if (separator > 0) result.set(declaration.slice(0, separator).trim(), declaration.slice(separator + 1).trim());
    }
  }
  return result;
}

test("research tables hold each row of values on one line and scroll natively before folding", async () => {
  const css = await readFile(new URL("../app/components/research/ResearchArticle.module.css", import.meta.url), "utf8");
  // The surrounding reading layout permits emergency word breaks; tables
  // override that inheritance so their labels stay whole.
  for (const selector of [".cell", ".cell code"]) {
    const rule = declarations(css, selector);
    assert.equal(rule.get("overflow-wrap"), "normal", `${selector} must not inherit anywhere wrapping.`);
    assert.equal(rule.get("word-break"), "normal", `${selector} must preserve complete words.`);
  }
  assert.equal(declarations(css, ".cell").get("white-space"), "nowrap", "A value or label holds one line.");
  const sentence = declarations(css, ".sentence");
  assert.equal(sentence.get("white-space"), "normal", "Only a column of sentences wraps.");
  const minimum = /^(\d+(?:\.\d+)?)(rem|em|ch)$/u.exec(sentence.get("min-width") ?? "");
  assert.ok(minimum && Number(minimum[1]) >= (minimum[2] === "ch" ? 24 : 12), "A column of sentences needs a readable font-relative measure.");
  assert.equal(declarations(css, ".table").get("font"), "inherit", "Table readability must not depend on shrinking its type.");
  const region = declarations(css, ".tableRegion");
  assert.ok(["auto", "scroll"].includes(region.get("overflow-x")), "Wide tables must remain natively scrollable.");
  assert.notEqual(region.get("scrollbar-width"), "none", "Do not conceal the table's horizontal scroll affordance.");
  const inlineMath = declarations(css, '.cell [data-research-formula="inline"]');
  assert.equal(inlineMath.get("max-width"), "none", "A cell must accommodate the whole formula before the outer table scrolls, so the formula never scrolls inside it.");
  // An inline-block with hidden overflow takes its lower margin edge as its baseline, which
  // sets the formula's own baseline on the text's.
  assert.ok(!inlineMath.has("overflow") && !inlineMath.has("overflow-x") && !inlineMath.has("overflow-y"), "A formula in a cell keeps the overflow, and so the baseline, it has in prose.");
});

test("all research tables retain native table semantics inside named keyboard-accessible scroll regions", async () => {
  // Counts include the tables of mathematics (the dependence paper's one, the Asian paper's two)
  // and the passages set as tables (the Asian paper's two).
  const routes = [
    ["critical-dependence-stress-for-diversification-gains-under-fixed-marginals", 1],
    ["certified-valuation-of-arithmetic-asian-options", 15],
    ["certified-joint-pricing-errors-in-rough-heston", 10],
    ["experience/large-scale-domain-expert-feedback-governance-and-adaptive-review", 6],
    ["experience/financial-task-design-and-synthetic-data-engineering", 4],
    ["experience/general-reasoning-evaluation-and-layered-verification", 3],
    ["experience/evidence-verification-and-robust-comparison-in-investment-research", 2],
    ["experience/small-states-and-the-governance-of-strategic-space-dependence", 1, 1],
    ["experience/mangrove-restoration-and-the-limits-of-compensatory-mitigation", 1, 1],
  ];
  // A legal paper also holds its footnote preview dialog.
  for (const [route, count, noteDialogs = 0] of routes) {
    const html = await readFile(new URL(`../out/${route}/index.html`, import.meta.url), "utf8");
    const regions = [...html.matchAll(/<div\b([^>]*)>\s*<table\b([^>]*)>/gu)];
    assert.equal(regions.length, count, `${route}: every table needs its own scroll region.`);
    for (const [, region, table] of regions) {
      assert.match(region, /\brole="region"/u);
      assert.match(region, /\btabindex="0"/u);
      assert.match(region, /\baria-label="[^"]+"/u);
      // A manuscript table carries its block; a table of mathematics is the drawing of a display,
      // whose block holds it beside the one assistive expression that reads the whole display.
      if (!/\bdata-research-block-type="table"/u.test(table)) assert.match(table, /\bdata-research-table=""[^>]*\baria-hidden="true"/u);
    }
    assert.equal(regions.filter(([, , table]) => !/\bdata-research-block-type="table"/u.test(table)).length, (html.match(/\bdata-math-table=""/gu) ?? []).length);
    for (const [, header] of html.matchAll(/<th\b([^>]*)>/gu)) assert.match(header, /\bscope="col"/u);
    const controls = [...html.matchAll(/<button\b([^>]*\bdata-table-zoom\b[^>]*)>/gu)];
    assert.equal(controls.length, count, `${route}: every table carries one zoom control.`);
    for (const [, control] of controls) {
      assert.match(control, /\baria-label="Zoom in"/u);
      assert.match(control, /\baria-haspopup="dialog"/u);
      assert.match(control, /\bhidden\b/u, "The control appears only once the page's script can open the stage.");
    }
    const figures = [...html.matchAll(/<figure\b[^>]*\bdata-figure="/gu)].length;
    const figureControls = [...html.matchAll(/<button\b([^>]*\bdata-figure-zoom\b[^>]*)>/gu)];
    assert.equal(figureControls.length, figures, `${route}: every figure carries one zoom control.`);
    for (const [, control] of figureControls) {
      assert.match(control, /\baria-label="Zoom in"/u);
      assert.match(control, /\baria-haspopup="dialog"/u);
      assert.match(control, /\bhidden\b/u, "The control appears only once the page's script can open the stage.");
    }
    assert.equal([...html.matchAll(/<dialog\b/gu)].length - noteDialogs, count + figures > 0 ? 1 : 0, `${route}: one stage serves all of a page's tables and figures.`);
  }
});

test("a table of values and names never wraps its rows, and a table of sentences wraps only those columns", async () => {
  const sentenceCells = (table) => [...table.matchAll(/<t[dh]\b[^>]*class="([^"]*)"/gu)].filter(([, classes]) => /sentence/u.test(classes)).length;
  const rough = await readFile(new URL("../out/certified-joint-pricing-errors-in-rough-heston/index.html", import.meta.url), "utf8");
  const roughTables = [...rough.matchAll(/<table\b[\s\S]*?<\/table>/gu)].map(([table]) => table);
  assert.equal(sentenceCells(roughTables[0]), 0, "Quotes hold only values.");
  assert.equal(sentenceCells(roughTables[1]), 0, "A certificate's name (H3: six months, reference through 128, upper band global) is a name, on one line.");
  const staged = await readFile(new URL("../out/experience/financial-task-design-and-synthetic-data-engineering/index.html", import.meta.url), "utf8");
  const design = [...staged.matchAll(/<table\b[\s\S]*?<\/table>/gu)].map(([table]) => table).find((table) => table.includes("Comparison stage"));
  assert.ok(sentenceCells(design) > 0, "The stages, methods and measures of the staged design are sentences.");
});
