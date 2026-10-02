import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { AI_MATH_GUTTER_EM, renderAiResearchMath } from "../app/lib/content/ai-math.ts";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const PROJECTS = [
  ["statistical-inference-and-resource-allocation-in-expert-data-production", 79],
  ["task-validity-in-financial-synthetic-data", 61],
  ["verification-and-supervision-in-scientific-reasoning-tasks", 58],
  ["evidence-uncertainty-and-decision-guarantees-in-investment-research", 79],
];

function decodeXml(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|quot);/giu, (match, entity) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"' }[entity] ?? match;
  });
}

function originalTex(mathml) {
  const annotation = mathml.match(/<annotation\b[^>]*encoding="application\/x-tex"[^>]*>([\s\S]*?)<\/annotation>/iu);
  assert.ok(annotation, "Accessible formulas must retain the original TeX annotation");
  return decodeXml(annotation[1]);
}

function tagCount(value, tag) {
  return (value.match(new RegExp(`<${tag}\\b`, "giu")) ?? []).length;
}

function visualText(svg) {
  return [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/giu)]
    .map((match) => decodeXml(match[1].replace(/<[^>]*>/gu, "")).trim())
    .filter(Boolean);
}

function assertCompleteFormula(rendered, tex) {
  assert.match(rendered.svg, /^<svg\b/iu);
  assert.match(rendered.mathml, /^<math\b/iu);
  assert.equal(originalTex(rendered.mathml), tex);
  assert.ok(tagCount(rendered.svg, "path") > 0, "Formula glyphs must have embedded vector paths");
  assert.deepEqual(visualText(rendered.svg), [], "Math glyphs must not use browser font fallback");
  assert.doesNotMatch(rendered.svg + rendered.mathml, /data-mjx-error|<merror\b|<foreignObject\b|\b(?:NaN|Infinity|undefined)\b/iu);
  assert.doesNotMatch(rendered.svg, /<(?:use|image)\b[^>]*(?:href|xlink:href)="(?!#)/iu);
  for (const name of ["widthEm", "heightEm", "depthEm"]) {
    assert.ok(Number.isFinite(rendered[name]) && rendered[name] >= 0, `${name} must be a finite positive layout measurement`);
  }
  assert.ok(rendered.widthEm > 0 && rendered.heightEm > 0);
  const ids = [...rendered.svg.matchAll(/\bid="([^"]+)"/giu)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, "One formula must not contain colliding glyph IDs");
  for (const semantic of ["mfrac", "msqrt", "mover", "munder", "msup", "msubsup", "mtable", "mlabeledtr"]) {
    const visualCount = (rendered.svg.match(new RegExp(`data-mml-node="${semantic}"`, "gu")) ?? []).length;
    assert.equal(visualCount, tagCount(rendered.mathml, semantic), `${tex} must preserve every ${semantic} in its visible geometry`);
  }
}

test("all 277 approved formulas have complete vector glyphs and exact accessible TeX", async () => {
  let total = 0;
  for (const [slug, expected] of PROJECTS) {
    const source = JSON.parse(await readFile(path.join(ROOT, "content", "artificial-intelligence", `${slug}.json`), "utf8"));
    const formulas = [...source.markdown.matchAll(/\$\$([\s\S]*?)\$\$|\$\x60([\s\S]*?)\x60\$/gu)];
    assert.equal(formulas.length, expected, `${slug} must retain its approved formula count`);
    for (const formula of formulas) {
      const tex = formula[1] ?? formula[2];
      const rendered = await renderAiResearchMath(tex, formula[1] !== undefined);
      assertCompleteFormula(rendered, tex);
      assert.equal(tagCount(rendered.mathml, "mfrac"), (tex.match(/\\(?:t|d)?frac(?![A-Za-z])/gu) ?? []).length, `${slug} must preserve each fraction`);
      assert.equal(tagCount(rendered.mathml, "msqrt"), (tex.match(/\\sqrt(?![A-Za-z])/gu) ?? []).length, `${slug} must preserve each square root`);
      assert.equal(tagCount(rendered.mathml, "mover"), (tex.match(/\\(?:bar|overline|widehat|widetilde)(?![A-Za-z])/gu) ?? []).length, `${slug} must preserve each source accent`);
      assert.equal(tagCount(rendered.mathml, "mlabeledtr"), (tex.match(/\\tag(?![A-Za-z])/gu) ?? []).length, `${slug} must preserve each equation number`);
    }
    total += formulas.length;
  }
  assert.equal(total, 277);
});

test("Greek symbols, accents, primes, and fractions retain distinct mathematical geometry", async () => {
  const fixtures = [
    [String.raw`\Delta`, "mi", /\u0394/u],
    [String.raw`\frac{x}{y}`, "mfrac"],
    [String.raw`\bar{x}`, "mover"],
    [String.raw`\overline{x}`, "mover"],
    [String.raw`\underline{x}`, "munder"],
    [String.raw`\widehat{x+y}`, "mover"],
    [String.raw`\widetilde{x+y}`, "mover"],
    [String.raw`x'`, "msup", /\u2032/u],
  ];
  for (const [tex, semantic, symbol] of fixtures) {
    const rendered = await renderAiResearchMath(tex, false);
    assertCompleteFormula(rendered, tex);
    assert.equal(tagCount(rendered.mathml, semantic), 1, `${tex} must retain its ${semantic} structure`);
    assert.match(rendered.svg, new RegExp(`data-mml-node="${semantic}"`, "u"), `${tex} must have matching visual geometry`);
    if (symbol) assert.match(decodeXml(rendered.mathml), symbol);
  }
  const delta = await renderAiResearchMath(String.raw`\Delta`, false);
  const latin = await renderAiResearchMath("D", false);
  assert.match(delta.svg, /data-c="394"/u);
  assert.doesNotMatch(delta.svg, /data-c="44"/u);
  assert.notEqual(delta.svg.match(/<path\b[^>]*\bd="([^"]+)"/u)?.[1], latin.svg.match(/<path\b[^>]*\bd="([^"]+)"/u)?.[1]);
});

test("aligned equations preserve rows, fractions, and all nine science equation numbers", async () => {
  const alignedTex = String.raw`\begin{aligned}x&=\frac{1}{2}\\y&=3\end{aligned}`;
  const aligned = await renderAiResearchMath(alignedTex, true);
  assertCompleteFormula(aligned, alignedTex);
  assert.equal(tagCount(aligned.mathml, "mtable"), 1);
  assert.equal(tagCount(aligned.mathml, "mtr"), 2);
  assert.equal(tagCount(aligned.mathml, "mfrac"), 1);
  assert.match(aligned.svg, /data-mml-node="mtable"/u);
  for (let number = 1; number <= 9; number += 1) {
    const tex = String.raw`x=\frac{1}{2}\tag{${number}}`;
    const rendered = await renderAiResearchMath(tex, true);
    assertCompleteFormula(rendered, tex);
    assert.equal(tagCount(rendered.mathml, "mlabeledtr"), 1, "Equation labels must be associated with their expression");
    const label = rendered.mathml.match(/<mlabeledtr\b[^>]*>\s*<mtd\b[^>]*>([\s\S]*?)<\/mtd>/iu)?.[1] ?? "";
    const labelText = [...label.matchAll(/<mtext\b[^>]*>([\s\S]*?)<\/mtext>/giu)].map((match) => decodeXml(match[1])).join("");
    assert.equal(labelText, `(${number})`, "Equation labels must retain the correct numeral and parentheses");
    assert.match(rendered.svg, /data-mml-node="mlabeledtr"/u);
  }
});

test("unsupported and malformed TeX fail explicitly instead of producing error artwork", async () => {
  for (const tex of [String.raw`\unknownCommand{x}`, String.raw`\frac{x}{`, String.raw`\href{javascript:alert(1)}{x}`]) {
    await assert.rejects(async () => renderAiResearchMath(tex, false), /.+/u);
  }
});

test("SVG canvases preserve natural glyph scale and baselines with room for accents and labels", async () => {
  assert.equal(AI_MATH_GUTTER_EM, 0.375);
  const fixtures = [
    {
      slug: "verification-and-supervision-in-scientific-reasoning-tasks", index: 32,
      widthEm: 24.403704, heightEm: 3.836118, depthEm: 1.668108,
      viewBox: [0, 0, 390.459264, 61.377888], numbered: true,
      pathCount: 72, pathGeometrySha256: "26d2a2dfff25e04a590fa0c1ca99b039fd46bb01e50725100a5515dfabd38cb5",
    },
    {
      slug: "evidence-uncertainty-and-decision-guarantees-in-investment-research", index: 26,
      widthEm: 28.781272, heightEm: 2.20116, depthEm: 1.168206,
      viewBox: [0, -1033, 28781.3, 2201.1], numbered: false,
      pathCount: 64, pathGeometrySha256: "68380a661369ea18ab602a99dd8eda98e4f090ae2fd014fd58030ec65c7c9f57",
    },
    {
      slug: "evidence-uncertainty-and-decision-guarantees-in-investment-research", index: 27,
      widthEm: 3.361852, heightEm: 1.07627, depthEm: 0.36023,
      viewBox: [0, -716, 3361.9, 1076.1], numbered: false,
      pathCount: 6, pathGeometrySha256: "8af038a117b5a0595e72f3f92338d7b7337e442ee08c26206f15020ecb559975",
    },
  ];
  const close = (actual, expected, message, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) <= tolerance, message);
  for (const fixture of fixtures) {
    const source = JSON.parse(await readFile(path.join(ROOT, "content", "artificial-intelligence", `${fixture.slug}.json`), "utf8"));
    const formula = [...source.markdown.matchAll(/\$\$([\s\S]*?)\$\$|\$\x60([\s\S]*?)\x60\$/gu)][fixture.index];
    const rendered = await renderAiResearchMath(formula[1] ?? formula[2], formula[1] !== undefined);
    assertCompleteFormula(rendered, formula[1] ?? formula[2]);
    close(rendered.widthEm, fixture.widthEm + 0.75, "Canvas must leave 0.375em on each horizontal side");
    close(rendered.heightEm, fixture.heightEm + 0.75, "Canvas must leave 0.375em above and below the expression");
    close(rendered.depthEm, fixture.depthEm + 0.375, "The vertical alignment must compensate for the lower canvas gutter");
    close(rendered.heightEm - rendered.depthEm - 0.375, fixture.heightEm - fixture.depthEm, "The original expression must retain its distance above the text baseline");
    const root = rendered.svg.match(/^<svg\b[^>]*>/iu)?.[0] ?? "";
    const viewBox = (root.match(/\bviewBox="([^"]+)"/u)?.[1] ?? "").split(/\s+/u).map(Number);
    assert.equal(viewBox.length, 4);
    const gutter = fixture.numbered ? 6 : 375;
    assert.deepEqual(viewBox, [fixture.viewBox[0] - gutter, fixture.viewBox[1] - gutter, fixture.viewBox[2] + 2 * gutter, fixture.viewBox[3] + 2 * gutter]);
    close(rendered.widthEm / viewBox[2], fixture.widthEm / fixture.viewBox[2], "Canvas space must not rescale equation glyphs horizontally", 1e-7);
    close(rendered.heightEm / viewBox[3], fixture.heightEm / fixture.viewBox[3], "Canvas space must not rescale equation glyphs vertically", 1e-7);
    const paths = [...rendered.svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/gu)].map((match) => match[1]);
    assert.equal(paths.length, fixture.pathCount);
    assert.equal(createHash("sha256").update(JSON.stringify(paths)).digest("hex"), fixture.pathGeometrySha256, "Original mathematical glyph paths must remain exact");
    for (const svg of rendered.svg.matchAll(/<svg\b[^>]*>/giu)) assert.match(svg[0], /style="[^"]*overflow:\s*visible/iu, "Nested accent and equation canvases must expose their full ink");
    if (fixture.numbered) {
      const inner = rendered.svg.slice(root.length).match(/^<svg\b[^>]*>/iu)?.[0] ?? "";
      close(Number(inner.match(/\bwidth="([^"]+)"/u)?.[1]), fixture.viewBox[2], "Numbered equation width must retain its original native pixel coordinates");
      close(Number(inner.match(/\bheight="([^"]+)"/u)?.[1]), fixture.viewBox[3], "Numbered equation height must retain its original native pixel coordinates");
      assert.match(rendered.svg, /transform="scale\(0\.016,-0\.016\) translate\(0, -2168\)"/u);
    }
  }
});
