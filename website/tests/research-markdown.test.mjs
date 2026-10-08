import assert from "node:assert/strict";
import test from "node:test";
import { parseResearchMarkdown } from "../app/lib/content/research-markdown.ts";

test("research parsing preserves mathematical comparisons, stars, and line breaks", () => {
  const source = 'Text $`x^* < y`$<br>next line.\n\n$$x > 0$$';
  const blocks = parseResearchMarkdown(source);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].source, source.split("\n")[0]);
  assert.deepEqual(blocks[0].inlines, [
    { type: "text", text: "Text " },
    { type: "math", tex: "x^* < y" },
    { type: "line-break" },
    { type: "text", text: "next line." },
  ]);
  assert.deepEqual(blocks[1], { type: "equation", source: "$$x > 0$$", tex: "x > 0" });
});

test("research parsing rejects equations outside supported block boundaries", () => {
  for (const source of ["", "$$ $$", "Before $$x$$ after", "@@RESEARCH-MATH-0@@", "# Unsupported title"]) {
    assert.throws(() => parseResearchMarkdown(source), undefined, source);
  }
});

test("research parsing rejects incomplete and nonrectangular tables", () => {
  for (const source of [
    "<table><tr><td>open",
    "<table><tr><td>a</td></tr><tr><td>b</td><td>c</td></tr></table>",
    "<table><tr>stray<td>a</td></tr></table>",
    "<table><tr><td>a</td></tr>stray</table>",
  ]) assert.throws(() => parseResearchMarkdown(source), undefined, source);
});

test("manuscript math delimiters, mathematical table pipes, and rich inline structure survive parsing", () => {
  const markdown = [
    "**Lemma $`x`$.** See [reference](#ref-1) and `field.json`.",
    "",
    "\\[\\lvert x\\rvert < y\\]",
    "",
    "```math", "x=1", "```", "",
    "| Input | Bound |", "| --- | --- |", "| \\(x\\) | $|x|$ |",
    "", '<a id="ref-1"></a>', "1. Reference.",
  ].join("\n");
  const blocks = parseResearchMarkdown(markdown);
  assert.deepEqual(blocks[0].inlines[0], { type: "strong", inlines: [{ type: "text", text: "Lemma " }, { type: "math", tex: "x" }, { type: "text", text: "." }] });
  assert.deepEqual(blocks[0].inlines[2], { type: "link", href: "#ref-1", inlines: [{ type: "text", text: "reference" }] });
  assert.equal(blocks[1].tex, String.raw`\lvert x\rvert < y`);
  assert.equal(blocks[2].tex, "x=1");
  assert.equal(blocks[3].type, "table");
  assert.equal(blocks[3].rows.length, 2);
  assert.deepEqual(blocks[3].rows[1][1].inlines, [{ type: "math", tex: "|x|" }]);
  assert.equal(blocks[4].id, "ref-1");
});

test("manuscript tables and reference anchors fail closed when incomplete", () => {
  for (const source of ["| A | B |\n| one | two |", "| A | B |\n| --- | --- |\n| one |", '<a id="ref-1"></a>']) {
    assert.throws(() => parseResearchMarkdown(source));
  }
});

test("manuscript soft wrapping joins prose while preserving mathematical and structural boundaries", () => {
  const source = [
    "The objective uses", "$`x+y`$ with **all five**", "candidates retained.",
    "\\[", "x+y=1", "\\]", "A second paragraph", "continues here.",
    "### Details", "A table follows.", "| Name | Bound |", "| --- | --- |", "| x | $`x`$ |",
    "1. First condition.", "2. Second condition.", '<a id="ref-1"></a>', "1. Source reference.",
  ].join("\n");
  const blocks = parseResearchMarkdown(source, { joinSoftLines: true });
  assert.equal(blocks[0].type, "paragraph");
  assert.equal(blocks[0].source, "The objective uses\n$`x+y`$ with **all five**\ncandidates retained.");
  assert.deepEqual(blocks[0].inlines, [
    { type: "text", text: "The objective uses " }, { type: "math", tex: "x+y" },
    { type: "text", text: " with " }, { type: "strong", inlines: [{ type: "text", text: "all five" }] },
    { type: "text", text: " candidates retained." },
  ]);
  assert.equal(blocks[1].tex, "\nx+y=1\n");
  assert.equal(blocks[2].source, "A second paragraph\ncontinues here.");
  assert.deepEqual(blocks.map((block) => block.type), ["paragraph", "equation", "paragraph", "heading", "paragraph", "table", "paragraph", "paragraph", "paragraph"]);
  assert.equal(blocks.at(-1).id, "ref-1");
  assert.equal(parseResearchMarkdown("First line.\nSecond line.").length, 2, "Existing line-based research sources retain their approved structure.");
});
