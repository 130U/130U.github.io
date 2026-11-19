import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { formatArticleHeading, formatArticleHeadings, buildArticleHeadingMap, linkArticleSectionReferences } from "../app/lib/content/article-headings.ts";
import { parseResearchMarkdown } from "../app/lib/content/research-markdown.ts";

const ASIAN = "certified-valuation-of-arithmetic-asian-options";
const ROUGH = "certified-joint-pricing-errors-in-rough-heston";
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

test("heading presentation shows the manuscript's own chapter and subsection numbers", () => {
  for (const [source, expected, number, display] of [
    ["## 1 AI method", "1. AI method", "1", "1."],
    ["## 10. Conclusion", "10. Conclusion", "10", "10."],
    ["### 7.3. Prespecified candidates", "7.3. Prespecified candidates", "7.3", "7.3."],
    ["### 8.8 Posterior grid refinement", "8.8 Posterior grid refinement", "8.8", "8.8"],
  ]) {
    const heading = parseResearchMarkdown(source)[0];
    const snapshot = JSON.stringify(heading);
    const formatted = formatArticleHeading(heading);
    assert.equal(formatted.text, expected);
    assert.equal(formatted.sourceNumber, number);
    assert.equal(formatted.displayNumber, display);
    assert.equal(formatted.id, heading.id);
    assert.equal(JSON.stringify(heading), snapshot);
  }
  for (const source of ["## Abstract", "## References", "### Verification scope and mathematical work", "## IV. Existing law", "### A. Legal principle"]) {
    const heading = parseResearchMarkdown(source)[0];
    assert.deepEqual(formatArticleHeading(heading).displayInlines, heading.inlines);
    assert.equal(formatArticleHeading(heading).sourceNumber, undefined);
  }
});

test("every manuscript heading reads as plain text, and heading mathematics stops the build until it has a reviewed label", () => {
  for (const slug of [ASIAN, ROUGH]) {
    for (const heading of manuscript(slug).filter((block) => block.type === "heading")) {
      assert.ok(heading.inlines.every((inline) => inline.type !== "math"), `${slug}: ${heading.source}`);
      assert.doesNotMatch(formatArticleHeading(heading).text, /\\|\$|[{}]/u);
    }
  }
  const mathematical = parseResearchMarkdown("### 2.4 An expression $`\\frac{a}{b}`$")[0];
  assert.throws(() => formatArticleHeading(mathematical), /reviewed plain-text label/u, "Notation must not silently lose its mathematical structure in the directory.");
});

test("subsections keep their source numbers, an unnumbered subsection stays unnumbered, and a misplaced number stops the build", () => {
  const unnumbered = parseResearchMarkdown("## 7. Evidence\n\n### 7.1. Data\n\n### Verification duties\n\n### 7.2. Results");
  const contextual = formatArticleHeadings(unnumbered);
  const [, data, duties, results] = unnumbered;
  assert.equal(contextual.get(data.id).text, "7.1. Data");
  assert.equal(contextual.get(duties.id).text, "Verification duties");
  assert.equal(contextual.get(duties.id).sourceNumber, undefined);
  assert.equal(contextual.get(results.id).text, "7.2. Results");
  assert.equal(buildArticleHeadingMap(unnumbered).get("7.2").id, results.id);
  assert.throws(() => formatArticleHeadings(parseResearchMarkdown("## 7. Evidence\n\n### 6.1. Data")), /does not belong to its preceding chapter/u);
  const rough = manuscript(ROUGH);
  const sourceMap = buildArticleHeadingMap(rough);
  assert.equal(sourceMap.get("3.1").id, rough.find((block) => block.type === "heading" && block.source.startsWith("### 3.1.")).id);
  assert.equal(sourceMap.get("3.1").text, "3.1. A martingale that fails to be one");
  assert.equal(sourceMap.get("7").text, "7. Evidence from S&P 500 options");
  assert.equal(sourceMap.get("7.7").displayNumber, "7.7.");
  const asian = buildArticleHeadingMap(manuscript(ASIAN));
  assert.equal(asian.get("5.4").text, "5.4 The certificate");
  assert.equal(asian.get("5").text, "5. A proved price interval under Heston");
  for (const slug of [ASIAN, ROUGH]) {
    const blocks = manuscript(slug);
    const context = formatArticleHeadings(blocks);
    assert.equal(context.size, blocks.filter((block) => block.type === "heading").length);
    for (const heading of blocks.filter((block) => block.type === "heading")) {
      assert.deepEqual(context.get(heading.id), formatArticleHeading(heading), `${slug}: headings follow their source subsection sequence.`);
    }
  }
});

test("internal references retain original numbers and link each precise endpoint", () => {
  const blocks = manuscript(ROUGH);
  const map = buildArticleHeadingMap(blocks);
  const introduction = blocks.find((block) => block.type === "paragraph" && block.source.startsWith("Section 2 states the pricing problem."));
  const linked = linkArticleSectionReferences(introduction.inlines, ROUGH, map);
  assert.equal(text(linked), text(introduction.inlines));
  assert.deepEqual(links(linked).map((link) => text(link.inlines)), ["2", "3", "4", "5", "6", "7"]);
  for (const link of links(linked)) assert.equal(link.href, `#${map.get(text(link.inlines)).id}`);
  // The heading a reference opens shows the number the reference names, so the link needs no explanation.
  for (const link of links(linked)) assert.equal(link.title, undefined);
  for (const link of links(linked)) assert.ok(map.get(text(link.inlines)).text.startsWith(`${text(link.inlines)}.`));
  assert.equal(map.get("7.3").displayNumber, "7.3.");
  assert.equal(map.get("7.3").id, blocks.find((block) => block.type === "heading" && block.source.startsWith("### 7.3.")).id);
});

test("external sections, existing citation labels, equation and theorem numbers remain untouched", () => {
  for (const slug of [ASIAN, ROUGH]) {
    const blocks = manuscript(slug);
    const map = buildArticleHeadingMap(blocks);
    const external = blocks.filter((block) => block.type === "paragraph" && /^(?:Geometric conditioning starts with Curran|The setting is one that supervisors already describe in portfolio terms)/u.test(block.source));
    assert.ok(external.length > 0);
    for (const block of external) assert.deepEqual(linkArticleSectionReferences(block.inlines, slug, map), block.inlines);
    const specimen = parseResearchMarkdown("Theorem 4.1 and equation (4.1); Section 7.3 of an unspecified paper. $`x_{7.3}=1`$ [Section 3.3](https://example.com/paper)")[0].inlines;
    assert.deepEqual(linkArticleSectionReferences(specimen, slug, map), specimen);
  }
});

test("linking is limited to audited article contexts and never changes mathematical tokens", () => {
  const blocks = manuscript(ASIAN);
  const map = buildArticleHeadingMap(blocks);
  const roadmap = blocks.find((block) => block.type === "paragraph" && block.source.startsWith("Section 7 carries the fixed-parameter bounds"));
  const linked = linkArticleSectionReferences(roadmap.inlines, ASIAN, map);
  assert.equal(text(linked), text(roadmap.inlines));
  assert.deepEqual(links(linked).map((link) => text(link.inlines)), ["7", "8"]);
  assert.deepEqual(linkArticleSectionReferences(roadmap.inlines, "unreviewed-source", map), roadmap.inlines);
  const rough = manuscript(ROUGH);
  const outline = rough.find((block) => block.type === "paragraph" && block.source.startsWith("Section 2 states the pricing problem."));
  const incomplete = buildArticleHeadingMap(rough); incomplete.delete("4");
  const partial = linkArticleSectionReferences(outline.inlines, ROUGH, incomplete);
  assert.deepEqual(links(partial).map((link) => text(link.inlines)), ["2", "3", "5", "6", "7"], "A reference to a section the page lacks stays plain text.");
  const dispersion = blocks.find((block) => block.type === "paragraph" && block.source.includes("(Section 4), so"));
  const dispersionLinked = linkArticleSectionReferences(dispersion.inlines, ASIAN, map);
  assert.deepEqual(links(dispersionLinked).map((link) => text(link.inlines)), ["4", "5"]);
  assert.deepEqual(dispersionLinked.filter((inline) => inline.type === "math"), dispersion.inlines.filter((inline) => inline.type === "math"));
});
