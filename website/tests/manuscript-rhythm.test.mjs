import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { argumentUnit, closesProof } from "../app/lib/content/argument-units.ts";
import { parseResearchMarkdown } from "../app/lib/content/research-markdown.ts";
import { RESEARCH_MANUSCRIPT_LEADING } from "../app/lib/content/research-math.ts";

const source = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

function declarations(css, selector) {
  const result = new Map();
  for (const rule of css.replace(/\/\*[\s\S]*?\*\//gu, "").matchAll(/([^{}]+)\{([^{}]*)\}/gu)) {
    if (!rule[1].split(",").map((part) => part.trim().replace(/\s+/gu, " ")).includes(selector)) continue;
    for (const declaration of rule[2].split(";")) {
      const separator = declaration.indexOf(":");
      if (separator > 0) result.set(declaration.slice(0, separator).trim(), declaration.slice(separator + 1).trim().replace(/\s+/gu, " "));
    }
  }
  return result;
}

test("manuscripts with mathematics read at their own leading and measure their spaces in its line", async () => {
  const globals = await source("app/globals.css");
  // A line that carries a formula keeps the white a line of prose keeps at the reading
  // leading: nine in ten such lines reach at most 2px past the face's own ink (26.4px + 2px ≈ 28px).
  assert.equal(Number(globals.match(/--reading-leading:\s*([\d.]+);/u)?.[1]), 1.65);
  assert.equal(Number(globals.match(/--manuscript-leading:\s*([\d.]+);/u)?.[1]), 1.75);
  assert.equal(RESEARCH_MANUSCRIPT_LEADING, 1.75);
  assert.match(globals, /--manuscript-line:\s*calc\(var\(--manuscript-leading\) \* var\(--type-reading\)\);/u);

  const article = await source("app/components/research/ResearchArticle.module.css");
  assert.equal(declarations(article, ".body").get("line-height"), "var(--manuscript-leading)");
  assert.equal(declarations(article, ".manuscript [data-article-overview] > p").get("line-height"), "var(--manuscript-leading)");
  // A paragraph break is one line; a unit of the argument opens after a line and a half.
  assert.equal(declarations(article, ".manuscript .body > p + p").get("margin-top"), "var(--manuscript-line)");
  assert.equal(declarations(article, ".manuscript [data-article-overview] > p + p").get("margin-top"), "var(--manuscript-line)");
  for (const selector of [".manuscript .body > p + p[data-unit]", ".manuscript .body > p[data-proof-close] + p"]) {
    assert.equal(declarations(article, selector).get("margin-top"), "calc(1.5 * var(--manuscript-line))", selector);
  }
  // A subsection opens after more white than a display stands in.
  assert.equal(declarations(article, ".manuscript .body h3").get("margin-top"), "calc(3 * var(--manuscript-line))");

  // A display stands in two and a half lines of white: two lines of margin less the room
  // its padding, canvas and the neighboring line box keep (the layout check measures it).
  const math = await source("app/components/research/ResearchMath.module.css");
  const equation = declarations(math, ".equation");
  assert.equal(equation.get("padding-block"), "0.75rem");
  assert.equal(equation.get("margin-block"), "calc(2 * var(--manuscript-line) - 0.5625rem) calc(2 * var(--manuscript-line) - 1.0625rem)");
  assert.equal(declarations(math, ".equation:has(+ .equation)").get("margin-block-end"), "calc(2.5 * var(--manuscript-line) - 2.375rem)");
  assert.equal(declarations(math, ".equation + .equation").get("margin-block-start"), "calc(2.5 * var(--manuscript-line) - 2.375rem)");
});

test("an inline formula stands at the word space", async () => {
  const component = await source("app/components/research/ResearchMath.tsx");
  assert.match(component, /marginInline: `\$\{-RESEARCH_MATH_GUTTER_EM\}em`/u, "The canvas gutters lie wholly in negative margins.");
  const math = await source("app/components/research/ResearchMath.module.css");
  assert.equal(declarations(math, ".inline").get("max-width"), "calc(100% + 2 * var(--math-gutter))");
});

test("statements, proofs and run-in heads open units of the argument", async () => {
  const counts = {};
  const folders = [["content/selected-research", (file) => !file.includes("figures")], ["content/artificial-intelligence", () => true]];
  for (const [folder, keep] of folders) {
    for (const file of (await readdir(new URL(`../${folder}`, import.meta.url))).filter(keep)) {
      const { markdown } = JSON.parse(await source(`${folder}/${file}`));
      const tally = { statement: 0, proof: 0, head: 0, close: 0 };
      for (const block of parseResearchMarkdown(markdown, { joinSoftLines: true })) {
        const unit = argumentUnit(block);
        if (unit) tally[unit] += 1;
        if (closesProof(block)) tally.close += 1;
      }
      counts[file.replace(/\.json$/u, "")] = tally;
    }
  }
  assert.deepEqual(counts["critical-dependence-stress-for-diversification-gains-under-fixed-marginals"], { statement: 13, proof: 8, head: 19, close: 6 });
  assert.deepEqual(counts["certified-valuation-of-arithmetic-asian-options"], { statement: 12, proof: 11, head: 3, close: 11 });
  assert.deepEqual(counts["certified-joint-pricing-errors-in-rough-heston"], { statement: 15, proof: 8, head: 3, close: 8 });
  assert.deepEqual(counts["large-scale-domain-expert-feedback-governance-and-adaptive-review"], { statement: 0, proof: 0, head: 14, close: 0 });

  const paragraph = (text) => parseResearchMarkdown(text, { joinSoftLines: true })[0];
  assert.equal(argumentUnit(paragraph("**Theorem 4.1 (strip quadrature).** Let \\(S\\) be a positive martingale.")), "statement");
  assert.equal(argumentUnit(paragraph("**Definition (Marginal flux and effective energy)**  On bounded windows the source converges.")), "statement");
  assert.equal(argumentUnit(paragraph("*Proof.* For part (i), the coefficients are positive.")), "proof");
  assert.equal(argumentUnit(paragraph("**Proof.** By Fubini's theorem the left side is finite.")), "proof");
  assert.equal(argumentUnit(paragraph("*The fixed-marginal Lipschitz bound.* We next establish the bound.")), "head");
  assert.equal(argumentUnit(paragraph("**One event certifies every pair.** The guarantee is a statement about events.")), "head");
  assert.equal(argumentUnit(paragraph("*On the Lewis contour, a residual stays small.*")), undefined, "A paragraph set wholly in italics opens no unit.");
  assert.equal(argumentUnit(paragraph("The theorem in *Section 3.* holds.")), undefined);
  assert.equal(closesProof(paragraph("Appendix C.2 supplies the regularity. ∎")), true);
  assert.equal(closesProof(paragraph("Hence the bound holds. $`\\square`$")), true);
  assert.equal(closesProof(paragraph("Hence the bound holds.")), false);
});
