import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { formatArticleHeading, formatArticleHeadings, buildArticleHeadingMap, linkArticleSectionReferences } from "../app/lib/content/article-headings.ts";
import { parseResearchMarkdown } from "../app/lib/content/research-markdown.ts";

const ASIAN = "certified-valuation-arithmetic-asian-options";
const ROUGH = "certified-rough-heston-valuation";
function manuscript(slug) {
  const source = JSON.parse(readFileSync(new URL(`../content/selected-research/${slug}.json`, import.meta.url), "utf8"));
  return parseResearchMarkdown(source.markdown, { joinSoftLines: true });
}
function text(inlines) {
  return inlines.map((inline) => inline.inlines ? text(inline.inlines) : inline.text ?? inline.tex ?? "").join("");
}
function links(inlines) {
  return inlines.flatMap((inline) => inline.type === "link" ? [inline] : inline.inlines ? links(inline.inlines) : []);
}

test("heading presentation converts existing identities to Roman chapters and letter subsections", () => {
  for (const [source, expected, number, label] of [
    ["## 1 AI method", "I. AI method", "1", "I."],
    ["## 10. Conclusion", "X. Conclusion", "10", "X."],
    ["### 7.3. Prespecified candidates", "C. Prespecified candidates", "7.3", "VII.C."],
    ["### 8.8 Posterior grid refinement", "H. Posterior grid refinement", "8.8", "VIII.H."],
  ]) {
    const heading = parseResearchMarkdown(source)[0];
    const snapshot = JSON.stringify(heading);
    const formatted = formatArticleHeading(heading);
    assert.equal(formatted.text, expected);
    assert.equal(formatted.sourceNumber, number);
    assert.equal(formatted.referenceLabel, label);
    assert.equal(formatted.id, heading.id);
    assert.equal(JSON.stringify(heading), snapshot);
  }
  for (const source of ["## Abstract", "## References", "### Strict computation of the dissipative pricing kernel", "## IV. Existing law", "### A. Legal principle"]) {
    const heading = parseResearchMarkdown(source)[0];
    assert.deepEqual(formatArticleHeading(heading).displayInlines, heading.inlines);
    assert.equal(formatArticleHeading(heading).sourceNumber, undefined);
  }
});

test("formatting a mathematical heading preserves every non-prefix inline and its exact TeX", () => {
  const heading = parseResearchMarkdown("### 2.2 The common Gaussian structure $`\\mathsf H_s`$")[0];
  const formatted = formatArticleHeading(heading);
  assert.equal(formatted.displayInlines[0].text, "B. The common Gaussian structure ");
  assert.equal(formatted.displayInlines[1], heading.inlines[1]);
  assert.equal(formatted.displayInlines[1].tex, String.raw`\mathsf H_s`);
  assert.equal(formatted.text, "B. The common Gaussian structure Hₛ");
});

test("all actual mathematical heading labels are readable without exposing or dropping TeX", () => {
  const expected = ["Hₛ", "Hᵥ", "A ⇒ H", "C ⇒ H"];
  const headings = manuscript(ASIAN).filter((block) => block.type === "heading" && block.inlines.some((inline) => inline.type === "math"));
  assert.equal(headings.length, expected.length);
  headings.forEach((heading, index) => {
    const formatted = formatArticleHeading(heading);
    assert.ok(formatted.text.endsWith(expected[index]));
    assert.doesNotMatch(formatted.text, /\\|\$|[{}]/u);
    assert.deepEqual(formatted.displayInlines.filter((inline) => inline.type === "math"), heading.inlines.filter((inline) => inline.type === "math"));
  });
  const unknown = parseResearchMarkdown("### 2.4 An expression $`\\frac{a}{b}`$")[0];
  assert.throws(() => formatArticleHeading(unknown), /reviewed plain-text label/u, "Unreviewed notation must not silently lose its mathematical structure in the directory.");
});

test("contextual subsection letters include both unnumbered rough-Heston headings without inventing source numbers", () => {
  const blocks = manuscript(ROUGH);
  const contextual = formatArticleHeadings(blocks);
  const sourceMap = buildArticleHeadingMap(blocks);
  const first = contextual.get(blocks.find((block) => block.source === "### Strict computation of the dissipative pricing kernel").id);
  assert.equal(first.text, "A. Strict computation of the dissipative pricing kernel");
  assert.equal(first.referenceLabel, "III.A.");
  assert.equal(first.sourceNumber, undefined);
  const second = contextual.get(blocks.find((block) => block.source === "### Verification scope and mathematical work").id);
  assert.equal(second.text, "F. Verification scope and mathematical work");
  assert.equal(second.referenceLabel, "VII.F.");
  assert.equal(second.sourceNumber, undefined);
  assert.equal(sourceMap.has("3.1"), false, "Theorem 3.1 must not become an invented Section 3.1 alias.");
  assert.equal(sourceMap.get("7.3").referenceLabel, "VII.C.");
  assert.equal(sourceMap.get("7.5").referenceLabel, "VII.E.");
  assert.equal(sourceMap.get("7.6").referenceLabel, "VII.G.");
  assert.equal(sourceMap.get("7.7").referenceLabel, "VII.H.");
  assert.equal(contextual.size, blocks.filter((block) => block.type === "heading").length);
  const asian = manuscript(ASIAN);
  const asianContext = formatArticleHeadings(asian);
  for (const heading of asian.filter((block) => block.type === "heading")) {
    assert.deepEqual(asianContext.get(heading.id), formatArticleHeading(heading), "Asian headings already follow their source subsection sequence.");
  }
});

test("compound internal references retain original numbers and link each precise endpoint", () => {
  const blocks = manuscript(ROUGH);
  const map = buildArticleHeadingMap(blocks);
  const introduction = blocks.find((block) => block.type === "paragraph" && block.source.startsWith("Sections 2–5 develop"));
  const linked = linkArticleSectionReferences(introduction.inlines, ROUGH, map);
  assert.equal(text(linked), text(introduction.inlines));
  assert.deepEqual(links(linked).map((link) => text(link.inlines)), ["2", "5", "7.1", "7.5", "7.6", "6"]);
  for (const link of links(linked)) assert.equal(link.href, `#${map.get(text(link.inlines)).id}`);
  assert.equal(links(linked)[2].title, "Section 7.1; web heading VII.A.");
  assert.equal(links(linked)[4].title, "Section 7.6; web heading VII.G.");
  assert.equal(map.get("7.3").displayNumber, "C.");
  assert.equal(map.get("7.3").id, blocks.find((block) => block.type === "heading" && block.source.startsWith("### 7.3.")).id);
});

test("external sections, existing citation labels, equation and theorem numbers remain untouched", () => {
  for (const slug of [ASIAN, ROUGH]) {
    const blocks = manuscript(slug);
    const map = buildArticleHeadingMap(blocks);
    const external = blocks.filter((block) => block.type === "paragraph" && /^(?:Fusai and Kyriakou|Ben Hammouda et al\.|15\. \*\*BL2025|16\. \*\*BenHammouda2026)/u.test(block.source));
    assert.ok(external.length > 0);
    for (const block of external) assert.deepEqual(linkArticleSectionReferences(block.inlines, slug, map), block.inlines);
    const specimen = parseResearchMarkdown("Theorem 4.1 and equation (4.1); Section 7.3 of an unspecified paper. $`x_{7.3}=1`$ [Section 3.3](https://example.com/paper)")[0].inlines;
    assert.deepEqual(linkArticleSectionReferences(specimen, slug, map), specimen);
  }
});

test("linking is limited to audited article contexts and never changes mathematical tokens", () => {
  const blocks = manuscript(ASIAN);
  const map = buildArticleHeadingMap(blocks);
  const paragraph = blocks.find((block) => block.type === "paragraph" && block.source.startsWith("Here $`\\mathcal S`$"));
  const linked = linkArticleSectionReferences(paragraph.inlines, ASIAN, map);
  assert.equal(text(linked), text(paragraph.inlines));
  assert.deepEqual(links(linked).map((link) => text(link.inlines)), ["2", "3", "5", "6", "7", "8", "9"]);
  assert.deepEqual(linked.filter((inline) => inline.type === "math"), paragraph.inlines.filter((inline) => inline.type === "math"));
  assert.deepEqual(linkArticleSectionReferences(paragraph.inlines, "unreviewed-source", map), paragraph.inlines);
  const incomplete = new Map(map); incomplete.delete("5");
  const partial = linkArticleSectionReferences(paragraph.inlines, ASIAN, incomplete);
  assert.ok(!links(partial).some((link) => text(link.inlines) === "3"), "An unresolved range must remain entirely unlinked.");
});
