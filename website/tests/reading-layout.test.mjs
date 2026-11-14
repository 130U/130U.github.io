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
  assert.equal(inlineMath.get("max-width"), "none", "A cell must accommodate the whole formula before the outer table scrolls.");
  assert.equal(inlineMath.get("overflow"), "visible", "Do not create a second horizontal scroller inside a table cell.");
});

test("all research tables retain native table semantics inside named keyboard-accessible scroll regions", async () => {
  const routes = [
    ["critical-dependence-stress-for-portfolio-diversification", 0],
    ["certified-valuation-of-arithmetic-asian-options", 11],
    ["certified-joint-pricing-errors-in-rough-heston", 10],
    ["experience/statistical-inference-and-resource-allocation-in-expert-data-production", 1],
    ["experience/task-validity-in-financial-synthetic-data", 2],
    ["experience/verification-and-supervision-in-scientific-reasoning-tasks", 1],
    ["experience/evidence-uncertainty-and-decision-guarantees-in-investment-research", 1],
  ];
  for (const [route, count] of routes) {
    const html = await readFile(new URL(`../out/${route}/index.html`, import.meta.url), "utf8");
    const regions = [...html.matchAll(/<div\b([^>]*)>\s*<table\b([^>]*)>/gu)];
    assert.equal(regions.length, count, `${route}: every table needs its own scroll region.`);
    for (const [, region, table] of regions) {
      assert.match(region, /\brole="region"/u);
      assert.match(region, /\btabindex="0"/u);
      assert.match(region, /\baria-label="[^"]+"/u);
      assert.match(table, /\bdata-research-block-type="table"/u);
    }
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
    assert.equal([...html.matchAll(/<dialog\b/gu)].length, count + figures > 0 ? 1 : 0, `${route}: one stage serves all of a page's tables and figures.`);
  }
});

test("a table of values never wraps its rows, and a table of sentences wraps only those columns", async () => {
  const html = await readFile(new URL("../out/certified-joint-pricing-errors-in-rough-heston/index.html", import.meta.url), "utf8");
  const tables = [...html.matchAll(/<table\b[\s\S]*?<\/table>/gu)].map(([table]) => table);
  const sentenceCells = (table) => [...table.matchAll(/<t[dh]\b[^>]*class="([^"]*)"/gu)].filter(([, classes]) => /sentence/u.test(classes)).length;
  assert.equal(sentenceCells(tables[0]), 0, "Quotes hold only values.");
  assert.ok(sentenceCells(tables[1]) > 0, "The descriptions of the certificates are set in sentences.");
});
