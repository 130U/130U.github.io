import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// The papers number their equations by section, and readers follow a page with
// the paper beside it: each number on the page stands beside the equation that
// carries it in the manuscript, and every section's numbers run without a gap.
const PAPERS = [
  ["critical-dependence-stress-for-portfolio-diversification", 52],
  ["certified-valuation-arithmetic-asian-options", 72],
  ["certified-rough-heston-valuation", 40],
];
const NUMBER = /\\tag\{([^{}]+)\}\s*$/u;

function decodeHtml(value) {
  return value.replace(/&(amp|lt|gt|quot|apos|#39|#x27);/gu, (_, name) => ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'", "#x27": "'" })[name]);
}

for (const [slug, numbered] of PAPERS) {
  test(`${slug}: every equation number stands beside the equation that carries it in the manuscript`, async () => {
    const { markdown } = JSON.parse(await readFile(new URL(`../content/selected-research/${slug}.json`, import.meta.url), "utf8"));
    const html = await readFile(new URL(`../out/${slug}/index.html`, import.meta.url), "utf8");
    const manuscript = [...markdown.matchAll(/```math\n([\s\S]*?)\n```|\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/gu)].map((match) => match[1] ?? match[2] ?? match[3]);
    const page = [...html.matchAll(/<div\b[^>]*data-research-block-type="equation"[^>]*>([\s\S]*?)<\/annotation>/gu)].map(([, block]) => ({
      shown: block.match(/data-equation-number[^>]*>([^<]*)</u)?.[1],
      tex: decodeHtml(block.match(/<annotation\b[^>]*>([\s\S]*)$/u)[1]),
    }));

    assert.equal(page.length, manuscript.length, "The page shows every displayed equation of the manuscript.");
    page.forEach(({ shown, tex }, index) => {
      assert.equal(tex, manuscript[index], `Displayed equation ${index + 1} keeps its TeX.`);
      const number = tex.match(NUMBER)?.[1];
      assert.equal(shown, number === undefined ? undefined : `(${number})`, `Displayed equation ${index + 1} shows the number its own TeX carries, and no other.`);
    });

    const shown = page.flatMap((equation) => equation.shown ?? []);
    assert.equal(shown.length, numbered);
    assert.equal(new Set(shown).size, shown.length, "No number appears twice.");
    const sections = new Map();
    for (const number of shown) {
      const [section, index] = number.slice(1, -1).split(".").map(Number);
      sections.set(section, [...(sections.get(section) ?? []), index]);
    }
    assert.deepEqual([...sections.keys()], [...sections.keys()].sort((a, b) => a - b), "Sections appear in the paper's order.");
    for (const [section, indices] of sections) {
      assert.deepEqual(indices, indices.map((_, position) => position + 1), `Section ${section} shows its equation numbers in order, without a gap.`);
    }
  });
}
