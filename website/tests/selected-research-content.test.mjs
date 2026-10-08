import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseResearchMarkdown } from "../app/lib/content/research-markdown.ts";
import { renderResearchMath } from "../app/lib/content/research-math.ts";

const PROJECTS = [
  { key: "asian", slug: "certified-valuation-arithmetic-asian-options", commit: "846bbe6acbaa4eaac07e20d5d2c566b3abc5456d", blob: "970c7fe3449a3a44fb32f6ae68d21c28d3cde3df", sections: 10, tables: 11, formulas: 349 },
  { key: "rough", slug: "certified-rough-heston-valuation", commit: "8d7264ce2f269a2e01f0b9dd80680bf70e50dcee", blob: "e1185699a3e0b5dc9a95a02f190cb4f52c715e49", sections: 8, tables: 13, formulas: 262 },
];

function sourceFormulas(markdown) {
  return [...markdown.matchAll(/```math\r?\n([\s\S]*?)\r?\n```|\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$`([^`]*?)`\$|(?<!\\)\$([^$\r\n]+?)(?<!\\)\$/gu)].map((match) => ({
    tex: match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5] ?? match[6],
    display: match[1] !== undefined || match[2] !== undefined || match[3] !== undefined,
  }));
}

function parsedFormulas(blocks) {
  const formulas = [];
  function visit(inline) {
    if (inline.type === "math") formulas.push({ tex: inline.tex, display: false });
    else if (inline.inlines) inline.inlines.forEach(visit);
  }
  for (const block of blocks) {
    if (block.type === "equation") formulas.push({ tex: block.tex, display: true });
    else if (block.inlines) block.inlines.forEach(visit);
    else block.rows.flat().forEach((cell) => cell.inlines.forEach(visit));
  }
  return formulas;
}

function decodeHtml(value) {
  return value.replace(/&(amp|lt|gt|quot|apos);/gu, (_, name) => ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" })[name]);
}

for (const expected of PROJECTS) {
  test(`${expected.key} main text and references are complete and match the frozen GitHub source`, async () => {
    const bytes = await readFile(new URL(`../../docs/audits/selected-research-2026-10-08/${expected.key}-source.md`, import.meta.url));
    assert.equal(createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex"), expected.blob);
    const upstream = bytes.toString("utf8");
    const article = JSON.parse(await readFile(new URL(`../content/selected-research/${expected.slug}.json`, import.meta.url), "utf8"));
    assert.equal(article.sourceCommit, expected.commit);
    assert.equal(article.sourceBlob, expected.blob);
    assert.equal(article.title, upstream.match(/^# (.+)$/mu)[1]);
    const main = upstream.slice(upstream.indexOf("\n") + 1, upstream.indexOf("\n## Appendix A.")).trim()
      .replace(/\]\((\.\.\/[^\s)]+)\)/gu, (_, relative) => `](https://github.com/130U/${expected.slug}/blob/${expected.commit}/${relative.slice(3)})`);
    const references = upstream.slice(upstream.indexOf("\n## References")).trim();
    assert.ok(article.markdown.startsWith(main + "\n\n## Appendices and supporting material\n"), "Every main-text character must survive import, except resolved relative link targets.");
    assert.ok(article.markdown.endsWith(references + "\n"), "The complete bibliography must survive import.");
    assert.doesNotMatch(article.markdown, /^## Appendix [A-Z]\./mu);
    const blocks = parseResearchMarkdown(article.markdown, { joinSoftLines: true });
    assert.equal(blocks.filter((block) => block.type === "heading" && /^## \d+\./u.test(block.source)).length, expected.sections);
    assert.equal(blocks.filter((block) => block.type === "table").length, expected.tables);
    const formulas = sourceFormulas(article.markdown);
    assert.equal(formulas.length, expected.formulas);
    assert.deepEqual(parsedFormulas(blocks), formulas, "All mathematical inputs must retain their exact TeX, order and display mode.");
    for (const { tex, display } of formulas) {
      const result = renderResearchMath(tex, display);
      assert.doesNotMatch(result.svg + result.mathml, /data-mjx-error|<merror\b|<foreignObject\b|\b(?:NaN|Infinity)\b/iu);
      assert.ok(result.widthEm > 0 && result.heightEm > 0);
    }
  });

  test(`${expected.key} published article retains every equation and all section links`, async () => {
    const article = JSON.parse(await readFile(new URL(`../content/selected-research/${expected.slug}.json`, import.meta.url), "utf8"));
    const html = await readFile(new URL(`../out/education/${expected.slug}/index.html`, import.meta.url), "utf8");
    const rendered = [...html.matchAll(/<math\b[^>]*data-research-math="(inline|display)"[^>]*>[\s\S]*?<annotation\b[^>]*encoding="application\/x-tex"[^>]*>([\s\S]*?)<\/annotation>[\s\S]*?<\/math>/gu)].map((match) => ({ tex: decodeHtml(match[2]), display: match[1] === "display" }));
    assert.deepEqual(rendered, sourceFormulas(article.markdown));
    const blocks = parseResearchMarkdown(article.markdown, { joinSoftLines: true });
    const markers = [...html.matchAll(/data-research-block="(\d+)"/gu)].map((match) => Number(match[1]));
    assert.deepEqual(markers, blocks.map((_, index) => index), "Every article block must appear once, in source order.");
    const contents = html.match(/<nav\b[^>]*aria-label="Article contents"[^>]*>([\s\S]*?)<\/nav>/u);
    assert.ok(contents);
    assert.doesNotMatch(contents[1], /data-research-block/u, "Only navigation, never manuscript content, belongs in the disclosure.");
    const firstHeading = blocks.findIndex((block) => block.type === "heading");
    const firstChapter = blocks.findIndex((block, index) => index > firstHeading && block.type === "heading");
    assert.ok(contents.index > html.indexOf(`data-research-block="${firstChapter - 1}"`), "The complete abstract must precede the contents in reading order.");
    assert.ok(contents.index < html.indexOf(`data-research-block="${firstChapter}"`), "Contents must precede the first body chapter in reading order.");
    for (const heading of blocks.filter((block) => block.type === "heading")) {
      assert.ok(html.includes(`href="#${heading.id}"`));
      assert.ok(html.includes(`id="${heading.id}"`));
    }
    const ids = [...html.matchAll(/\bid="([^"]+)"/gu)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length);
  });
}
