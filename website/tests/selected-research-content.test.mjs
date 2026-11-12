import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseResearchMarkdown } from "../app/lib/content/research-markdown.ts";
import { renderResearchMath } from "../app/lib/content/research-math.ts";

// Article figures restate manuscript values in their own captions and labels,
// and natively drawn manuscript figures label their drawings; manuscript checks
// read the article without those, keeping each manuscript figure's caption.
function withoutArticleFigures(html) {
  return html
    .replace(/<figure\b[^>]*\bdata-article-figure="[^"]*"[^>]*>[\s\S]*?<\/figure>/gu, "")
    .replace(/(<figure\b[^>]*\bdata-manuscript-figure="[^"]*"[^>]*>)[\s\S]*?(<figcaption\b)/gu, "$1$2");
}

const PROJECTS = [
  { key: "asian", slug: "certified-valuation-arithmetic-asian-options", commit: "8d3b2f32c79731e150ee46bafc44fca590aa516a", blob: "39176e13c1a5fcbf8b054e8c6145201fc721b3a0", sections: 10, tables: 11, formulas: 355 },
  { key: "rough", slug: "certified-rough-heston-valuation", commit: "861c81c27b3516fa3eae29fd446ebbc10aca1d85", blob: "fe04fcbcd3da4c35dd202b835324218d202b35ef", sections: 8, tables: 13, formulas: 306 },
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

async function siteEdition(slug) {
  const source = await readFile(new URL(`../content/selected-research/site-edition/${slug}.md`, import.meta.url), "utf8");
  return source.replace(/\r\n?/gu, "\n").replace(/^---\n[\s\S]*?\n---\n\n/u, "");
}

function decodeHtml(value) {
  return value.replace(/&(amp|lt|gt|quot|apos);/gu, (_, name) => ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" })[name]);
}

for (const expected of PROJECTS) {
  test(`${expected.key} main text and references are complete and match the frozen GitHub source`, async () => {
    const bytes = await readFile(new URL(`../content/sources/selected-research/${expected.key}-source.md`, import.meta.url));
    assert.equal(createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex"), expected.blob);
    const upstream = bytes.toString("utf8").replace(/\r\n/gu, "\n");
    const article = JSON.parse(await readFile(new URL(`../content/selected-research/${expected.slug}.json`, import.meta.url), "utf8"));
    assert.equal(article.sourceCommit, expected.commit);
    assert.equal(article.sourceBlob, expected.blob);
    assert.equal(article.title, upstream.match(/^# (.+)$/mu)[1]);
    const main = upstream.slice(upstream.indexOf("\n") + 1, upstream.indexOf("\n## Appendix A.")).trim()
      .replace(/\]\((\.\.\/[^\s)]+)\)/gu, (_, relative) => `](https://github.com/130U/${expected.slug}/blob/${expected.commit}/${relative.slice(3)})`);
    const references = upstream.slice(upstream.indexOf("\n## References")).trim();
    assert.ok(article.markdown.startsWith(main + "\n\n## Appendices and Supporting Material\n"), "Every main-text character must survive import, except resolved relative link targets.");
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
    const markdown = await siteEdition(expected.slug);
    const html = withoutArticleFigures(await readFile(new URL(`../out/${expected.slug}/index.html`, import.meta.url), "utf8"));
    const rendered = [...html.matchAll(/<math\b[^>]*data-research-math="(inline|display)"[^>]*>[\s\S]*?<annotation\b[^>]*encoding="application\/x-tex"[^>]*>([\s\S]*?)<\/annotation>[\s\S]*?<\/math>/gu)].map((match) => ({ tex: decodeHtml(match[2]), display: match[1] === "display" }));
    assert.deepEqual(rendered, sourceFormulas(markdown));
    const blocks = parseResearchMarkdown(markdown, { joinSoftLines: true });
    const abstractIndex = blocks.findIndex((block) => block.type === "heading" && block.source.trim() === "## Abstract");
    assert.ok(abstractIndex >= 0, "Selected Research must begin its reading content at Abstract.");
    const markers = [...html.matchAll(/data-research-block="(\d+)"/gu)].map((match) => Number(match[1]));
    assert.deepEqual(markers, blocks.slice(abstractIndex).map((_, index) => abstractIndex + index), "Every block from Abstract onward must appear once, in source order; pre-abstract front matter stays in the source.");
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
