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
