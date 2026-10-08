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

test("research tables protect words and formula widths before using native horizontal scrolling", async () => {
  const css = await readFile(new URL("../app/components/research/ResearchArticle.module.css", import.meta.url), "utf8");
  // The surrounding reading layout permits emergency word breaks. Tables must
  // override that inheritance, or a label such as Object can become Objec / t.
  for (const selector of [".cell", ".cell code"]) {
    const rule = declarations(css, selector);
    assert.equal(rule.get("overflow-wrap"), "normal", `${selector} must not inherit anywhere wrapping.`);
    assert.equal(rule.get("word-break"), "normal", `${selector} must preserve complete words.`);
  }
  const cell = declarations(css, ".cell");
  const minimum = /^(\d+(?:\.\d+)?)(rem|em|ch)$/u.exec(cell.get("min-width") ?? "");
  assert.ok(minimum && Number(minimum[1]) >= (minimum[2] === "ch" ? 12 : 8), "Columns need a readable font-relative minimum width, not merely freedom from page overflow.");
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
    ["education/certified-valuation-arithmetic-asian-options", 11],
    ["education/certified-rough-heston-valuation", 13],
    ["past-experience/artificial-intelligence/statistical-inference-and-resource-allocation-in-expert-data-production", 1],
    ["past-experience/artificial-intelligence/task-validity-in-financial-synthetic-data", 2],
    ["past-experience/artificial-intelligence/verification-and-supervision-in-scientific-reasoning-tasks", 1],
    ["past-experience/artificial-intelligence/evidence-uncertainty-and-decision-guarantees-in-investment-research", 1],
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
  }
});
